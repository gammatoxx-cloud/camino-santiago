import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ReactPlayer from 'react-player';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Card } from '../components/ui/Card';
import { VideoAccordion } from '../components/videos/VideoAccordion';
import { videoSections } from '../lib/videoData';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { Video } from '../lib/videoData';
import type { VideoCompletion } from '../types';

export function VideoLibraryPage() {
  const { user } = useAuth();
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [videoCompletions, setVideoCompletions] = useState<VideoCompletion[]>([]);
  const [togglingVideoId, setTogglingVideoId] = useState<string | null>(null);

  const handlePlayVideo = (video: Video) => {
    setSelectedVideo(video);
    // Scroll to top of video player on mobile
    if (window.innerWidth < 768) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCloseVideo = () => {
    setSelectedVideo(null);
  };

  // Load video completions
  useEffect(() => {
    const loadVideoCompletions = async () => {
      if (!user) {
        return;
      }

      try {
        const { data, error } = await supabase
          .from('video_completions')
          .select('*')
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false });

        if (error) throw error;
        setVideoCompletions(data || []);
      } catch (err: any) {
        console.error('Error loading video completions:', err);
      }
    };

    loadVideoCompletions();
  }, [user]);

  // Handle toggle completion
  const handleToggleCompletion = async (videoId: string) => {
    if (!user || togglingVideoId) return;

    const isCompleted = videoCompletions.some(completion => completion.video_id === videoId);

    setTogglingVideoId(videoId);

    try {
      if (isCompleted) {
        // Delete completion
        const completion = videoCompletions.find(c => c.video_id === videoId);
        if (completion) {
          const { error } = await supabase
            .from('video_completions')
            .delete()
            .eq('id', completion.id);

          if (error) throw error;
          setVideoCompletions(prev => prev.filter(c => c.video_id !== videoId));
        }
      } else {
        // Insert completion
        const { error } = await supabase
          .from('video_completions')
          .insert({
            user_id: user.id,
            video_id: videoId,
          } as any);

        if (error) throw error;

        // Reload completions to get the new record with all fields
        const { data, error: reloadError } = await supabase
          .from('video_completions')
          .select('*')
          .eq('user_id', user.id)
          .eq('video_id', videoId)
          .maybeSingle();

        if (reloadError) throw reloadError;
        if (data) {
          setVideoCompletions(prev => [...prev, data]);
        }
      }
    } catch (err: any) {
      console.error('Error toggling video completion:', err);
      // Could show error toast here
    } finally {
      setTogglingVideoId(null);
    }
  };

  return (
    <div className="min-h-screen bg-cream pb-20 md:pb-6 pt-8 md:pt-12 overflow-x-hidden">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-4 md:py-8">
        {/* Back Button */}
        <Link
          to="/resources"
          className="inline-flex items-center gap-2 mb-6 text-teal hover:text-teal-600 transition-colors duration-200 group"
          aria-label="Volver a Recursos"
        >
          <div className="flex-shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/80 hover:bg-white backdrop-blur-sm border border-gray-200/60 hover:border-teal/30 flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md group-hover:scale-105">
            <svg
              className="w-5 h-5 text-teal"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </div>
          <span className="text-sm md:text-base font-medium hidden sm:inline">
            Volver a Recursos
          </span>
        </Link>

        <SectionHeader label="Biblioteca de Videos" icon="🎥" />
        <h1 className="text-heading-1 text-teal mb-10 md:mb-14 text-center">
          Videos de Entrenamiento
        </h1>

        {/* Selected Video Player */}
        {selectedVideo && (
          <div className="mb-10 md:mb-12 animate-fade-in-up">
            <Card variant="elevated" className="overflow-hidden border-2 border-teal/10">
              <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-t-2xl bg-black shadow-2xl">
                <ReactPlayer
                  className="absolute top-0 left-0"
                  src={selectedVideo.url}
                  width="100%"
                  height="100%"
                  controls
                  config={{
                    youtube: {
                      modestbranding: 1,
                      rel: 0,
                      enablejsapi: 1,
                    },
                  } as any}
                />
              </div>
              <div className="p-5 md:p-7">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <h2 className="text-xl md:text-2xl font-bold text-teal flex-1 leading-tight">
                    {selectedVideo.title}
                  </h2>
                  <button
                    onClick={handleCloseVideo}
                    className="flex-shrink-0 w-9 h-9 md:w-11 md:h-11 rounded-full bg-gradient-to-br from-white to-gray-50 hover:from-gray-50 hover:to-gray-100 active:scale-95 flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg border border-gray-200/50"
                    aria-label="Cerrar video"
                  >
                    <svg
                      className="w-5 h-5 md:w-6 md:h-6 text-gray-600"
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

        {/* Video Sections Accordion */}
        <div className="space-y-5 md:space-y-7">
          {videoSections.map((section, index) => (
            <div 
              key={section.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <VideoAccordion
                section={section}
                onPlayVideo={handlePlayVideo}
                defaultExpanded={index === 0}
                videoCompletions={videoCompletions}
                onToggleCompletion={user ? handleToggleCompletion : undefined}
                togglingVideoId={togglingVideoId}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

