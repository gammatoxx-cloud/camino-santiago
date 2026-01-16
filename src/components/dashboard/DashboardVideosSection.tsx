import { useState } from 'react';
import { Link } from 'react-router-dom';
import ReactPlayer from 'react-player';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { VideoCard } from '../videos/VideoCard';
import type { Video, VideoSection } from '../../lib/videoData';

interface DashboardVideosSectionProps {
  relevantSection: VideoSection | null;
}

export function DashboardVideosSection({
  relevantSection,
}: DashboardVideosSectionProps) {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  if (!relevantSection) {
    return null;
  }

  const videosToShow = relevantSection.videos.slice(0, 3);

  const handlePlayVideo = (video: Video) => {
    setSelectedVideo(video);
    if (window.innerWidth < 768) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCloseVideo = () => {
    setSelectedVideo(null);
  };

  return (
    <div className="relative">
      {/* Decorative background accent container */}
      <div className="absolute top-0 left-0 right-0 bottom-0 -z-10 rounded-3xl overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-light-pink/5 to-transparent rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-teal">
            Videos Recomendados
          </h2>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            Para tu fase actual ({relevantSection.weekRange})
          </p>
        </div>
        <Link to="/videos">
          <Button variant="ghost" size="sm">
            Ver Todos →
          </Button>
        </Link>
      </div>

      {/* Selected Video Player */}
      {selectedVideo && (
        <div className="mb-6 animate-fade-in-up">
          <Card variant="elevated" className="overflow-hidden border-2 border-teal/10">
            <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-t-2xl bg-black shadow-2xl">
              <ReactPlayer
                className="absolute top-0 left-0"
                src={selectedVideo.url}
                width="100%"
                height="100%"
                controls
              />
            </div>
            <div className="p-4 md:p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <h3 className="text-lg md:text-xl font-bold text-teal flex-1 leading-tight">
                  {selectedVideo.title}
                </h3>
                <button
                  onClick={handleCloseVideo}
                  className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-white to-gray-50 hover:from-gray-50 hover:to-gray-100 active:scale-95 flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg border border-gray-200/50"
                  aria-label="Cerrar video"
                >
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              {selectedVideo.description && (
                <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                  {selectedVideo.description}
                </p>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        {videosToShow.map((video) => (
          <VideoCard
            key={video.id}
            video={video}
            onPlay={handlePlayVideo}
          />
        ))}
      </div>
    </div>
  );
}

