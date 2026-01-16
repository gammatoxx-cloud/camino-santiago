import { useState } from 'react';
import { Card } from '../ui/Card';
import { VideoCard } from './VideoCard';
import type { VideoSection, Video } from '../../lib/videoData';
import type { VideoCompletion } from '../../types';

interface VideoAccordionProps {
  section: VideoSection;
  onPlayVideo: (video: Video) => void;
  defaultExpanded?: boolean;
  videoCompletions?: VideoCompletion[];
  onToggleCompletion?: (videoId: string) => void;
  togglingVideoId?: string | null;
}

// Helper function to get phase-based accent color
function getPhaseAccentColor(sectionId: string) {
  const accents: Record<string, string> = {
    'semanas-1-4': 'from-teal-50/60 to-white/40',
    'semanas-5-10': 'from-blue-50/60 to-white/40',
    'semanas-11-24': 'from-green-50/60 to-white/40',
    'semanas-25-36': 'from-amber-50/60 to-white/40',
    'semanas-37-52': 'from-rose-50/60 to-white/40',
  };
  return accents[sectionId] || 'from-teal-50/60 to-white/40';
}

// Helper function to get phase-based badge color
function getPhaseBadgeColor(sectionId: string) {
  const badges: Record<string, string> = {
    'semanas-1-4': 'bg-teal-100/80 text-teal-700 border-teal-200/60',
    'semanas-5-10': 'bg-blue-100/80 text-blue-700 border-blue-200/60',
    'semanas-11-24': 'bg-green-100/80 text-green-700 border-green-200/60',
    'semanas-25-36': 'bg-amber-100/80 text-amber-700 border-amber-200/60',
    'semanas-37-52': 'bg-rose-100/80 text-rose-700 border-rose-200/60',
  };
  return badges[sectionId] || 'bg-teal-100/80 text-teal-700 border-teal-200/60';
}

export function VideoAccordion({ 
  section, 
  onPlayVideo, 
  defaultExpanded = false,
  videoCompletions = [],
  onToggleCompletion,
  togglingVideoId = null
}: VideoAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const hasVideos = section.videos.length > 0;
  const accentGradient = getPhaseAccentColor(section.id);
  const badgeColor = getPhaseBadgeColor(section.id);

  return (
    <Card variant="default" className="overflow-hidden">
      {/* Accordion Header - Touch-friendly */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full px-4 md:px-6 py-4 md:py-5 flex items-center justify-between text-left transition-all duration-300 rounded-3xl relative overflow-hidden ${
          hasVideos 
            ? `hover:bg-gradient-to-r ${accentGradient} active:bg-white/50` 
            : 'opacity-60 cursor-not-allowed'
        }`}
        aria-expanded={isExpanded}
        disabled={!hasVideos}
      >
        {/* Subtle background accent */}
        <div className={`absolute inset-0 bg-gradient-to-r ${accentGradient} opacity-0 transition-opacity duration-300 ${isExpanded ? 'opacity-100' : ''}`} />
        
        <div className="flex-1 min-w-0 pr-4 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:gap-3 mb-2">
            <span className="text-base md:text-lg font-bold text-teal mb-1 md:mb-0">
              {section.weekRange}
            </span>
            <span className="text-sm md:text-base text-gray-700 font-semibold">
              {section.title}
            </span>
          </div>
          {hasVideos && (
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border backdrop-blur-sm ${badgeColor}`}>
                {section.videos.length} video{section.videos.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {/* Chevron Icon */}
        {hasVideos ? (
          <div
            className={`flex-shrink-0 w-9 h-9 md:w-11 md:h-11 rounded-full bg-teal/15 flex items-center justify-center transition-all duration-300 relative z-10 ${
              isExpanded ? 'rotate-180 bg-teal/20' : 'hover:bg-teal/20'
            }`}
          >
            <svg
              className="w-5 h-5 text-teal transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        ) : (
          <span className="text-xs text-gray-400 flex-shrink-0 relative z-10">Próximamente</span>
        )}
      </button>

      {/* Accordion Content - Animated */}
      {hasVideos && (
        <div
          className={`overflow-hidden transition-all duration-500 ease-in-out ${
            isExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="pt-6 pb-4 md:pb-6 px-2 md:px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {section.videos.map((video, index) => {
                const isCompleted = videoCompletions.some(completion => completion.video_id === video.id);
                const isLoading = togglingVideoId === video.id;
                return (
                  <div 
                    key={video.id}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <VideoCard 
                      video={video} 
                      onPlay={onPlayVideo}
                      isCompleted={isCompleted}
                      onToggleCompletion={onToggleCompletion}
                      isLoading={isLoading}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

