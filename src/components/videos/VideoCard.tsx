import React from 'react';
import { Card } from '../ui/Card';
import type { Video } from '../../lib/videoData';

interface VideoCardProps {
  video: Video;
  onPlay: (video: Video) => void;
  isCompleted?: boolean;
  onToggleCompletion?: (videoId: string) => void;
  isLoading?: boolean;
}

export function VideoCard({ video, onPlay, isCompleted = false, onToggleCompletion, isLoading = false }: VideoCardProps) {
  const thumbnailUrl = `https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`;
  const showCompletionToggle = onToggleCompletion !== undefined;

  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click from triggering
    if (onToggleCompletion && !isLoading) {
      onToggleCompletion(video.id);
    }
  };

  const handleCardClick = () => {
    onPlay(video);
  };

  return (
    <Card
      className="overflow-hidden cursor-pointer group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      onClick={handleCardClick}
      variant="default"
    >
      {/* Thumbnail with play button overlay */}
      <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-t-2xl mb-4 md:mb-5 bg-gray-200">
        <img
          src={thumbnailUrl}
          alt={video.title}
          className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* Gradient overlay for better contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 active:bg-black/50 transition-all duration-300">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center shadow-2xl transform group-hover:scale-110 active:scale-95 transition-all duration-300 group-hover:shadow-teal/30">
            <svg
              className="w-8 h-8 md:w-10 md:h-10 text-teal ml-1 transition-transform duration-300 group-hover:scale-110"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Video info */}
      <div className="px-4 md:px-3 pb-4 md:pb-5">
        <h3 className="text-base md:text-lg font-bold text-teal mb-2 md:mb-3 line-clamp-2 leading-tight group-hover:text-teal-600 transition-colors">
          {video.title}
        </h3>
        {video.description && (
          <p className="text-sm md:text-base text-gray-600 line-clamp-3 leading-relaxed mb-4">
            {video.description}
          </p>
        )}

        {/* Completion Toggle Section */}
        {showCompletionToggle && (
          <div className="pt-4 border-t border-gray-200/70">
            <button
              onClick={handleToggleClick}
              disabled={isLoading}
              className={`w-full flex items-center p-4 rounded-xl transition-all duration-300 min-h-[56px] ${
                isLoading
                  ? 'opacity-60 cursor-not-allowed'
                  : 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]'
              } ${
                isCompleted
                  ? 'bg-gradient-to-r from-emerald-50/80 to-green-50/60 border-2 border-emerald-200/70'
                  : 'bg-white/80 border-2 border-gray-200/60 hover:border-teal/40'
              }`}
              aria-label={isCompleted ? `Marcar como no completado: ${video.title}` : `Marcar como completado: ${video.title}`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
                    isCompleted
                      ? 'checkbox-completed'
                      : 'checkbox-pending'
                  }`}
                >
                  {isCompleted && (
                    <span className="text-teal text-xl md:text-2xl font-bold drop-shadow-sm">✓</span>
                  )}
                </div>
                <div className="text-left pr-2 flex-1">
                  <p className="text-sm md:text-base font-semibold text-gray-800">
                    {isCompleted ? 'Completado' : 'Marcar como completado'}
                  </p>
                </div>
              </div>
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}

