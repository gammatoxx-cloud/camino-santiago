import { useState, useEffect, useMemo, useCallback } from 'react';
import { PlanRestrictedContent } from '../components/plan/PlanRestrictedContent';
import { InsigniaCard } from '../components/insignias/InsigniaCard';
import { TeamInsigniaCard } from '../components/insignias/TeamInsigniaCard';
import { BookInsigniaCard } from '../components/insignias/BookInsigniaCard';
import { VideoInsigniaCard } from '../components/insignias/VideoInsigniaCard';
import { ChalecoCard } from '../components/insignias/ChalecoCard';
import { insignias } from '../lib/insigniasData';
import { bookInsignias, hasEarnedBookInsignia } from '../lib/bookInsigniasData';
import { videoInsignias, hasEarnedVideoInsignia } from '../lib/videoInsigniasData';
import { getHikesByEtapa } from '../lib/magnoliasHikesData';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { BookCompletion, VideoCompletion } from '../types';

export function InsigniasPage() {
  const { user } = useAuth();
  const [completedHikeIds, setCompletedHikeIds] = useState<Set<string>>(new Set());
  const [bookCompletions, setBookCompletions] = useState<BookCompletion[]>([]);
  const [videoCompletions, setVideoCompletions] = useState<VideoCompletion[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCompletedHikes = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('magnolias_hikes_completions')
        .select('hike_id')
        .eq('user_id', user.id);

      if (error) throw error;

      const hikeIds = (data || []).map(
        (completion: { hike_id: string }) => completion.hike_id
      );
      setCompletedHikeIds(new Set(hikeIds));
    } catch (error) {
      console.error('Error loading completed hikes:', error);
    }
  }, [user]);

  const loadBookCompletions = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('book_completions')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setBookCompletions(data || []);
    } catch (error) {
      console.error('Error loading book completions:', error);
    }
  }, [user]);

  const loadVideoCompletions = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('video_completions')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setVideoCompletions(data || []);
    } catch (error) {
      console.error('Error loading video completions:', error);
    }
  }, [user]);

  // Load completed hikes, book completions, and video completions from database on mount
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadAllData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          loadCompletedHikes(),
          loadBookCompletions(),
          loadVideoCompletions(),
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, [user, loadCompletedHikes, loadBookCompletions, loadVideoCompletions]);

  // Check if an etapa is completed
  const isEtapaCompleted = useMemo(() => {
    const completedEtapas: Set<number> = new Set();

    for (const insignia of insignias) {
      const hikesForEtapa = getHikesByEtapa(insignia.etapa);
      const allHikesCompleted = hikesForEtapa.every((hike) =>
        completedHikeIds.has(hike.id)
      );

      if (allHikesCompleted && hikesForEtapa.length > 0) {
        completedEtapas.add(insignia.etapa);
      }
    }

    return (etapa: number) => completedEtapas.has(etapa);
  }, [completedHikeIds]);

  // Calculate book count and earned book insignias
  const bookCount = useMemo(() => {
    // Count unique book_ids
    const uniqueBookIds = new Set(bookCompletions.map((completion) => completion.book_id));
    return uniqueBookIds.size;
  }, [bookCompletions]);

  const isBookInsigniaEarned = useMemo(() => {
    return (insigniaId: string) => {
      const insignia = bookInsignias.find((bi) => bi.id === insigniaId);
      if (!insignia) return false;
      return hasEarnedBookInsignia(insignia, bookCount);
    };
  }, [bookCount]);

  // Calculate video count and earned video insignias
  const videoCount = useMemo(() => {
    // Count unique video_ids
    const uniqueVideoIds = new Set(videoCompletions.map((completion) => completion.video_id));
    return uniqueVideoIds.size;
  }, [videoCompletions]);

  const isVideoInsigniaEarned = useMemo(() => {
    return (insigniaId: string) => {
      const insignia = videoInsignias.find((vi) => vi.id === insigniaId);
      if (!insignia) return false;
      return hasEarnedVideoInsignia(insignia, videoCount);
    };
  }, [videoCount]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream pb-20 md:pb-6 pt-8 md:pt-12 overflow-x-hidden">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-4 md:py-8">
          <div className="text-center text-gray-700">Cargando...</div>
        </div>
      </div>
    );
  }

  return (
    <PlanRestrictedContent requiredPlan="basico" upgradeToPlan="basico">
      <div className="min-h-screen bg-cream pb-20 md:pb-6 pt-8 md:pt-8 overflow-x-hidden">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-4 md:py-8">
          <div className="flex justify-center mb-8">
            <img
              src="/logros_icon.svg"
              alt="Logros"
              className="max-w-full h-auto w-1/4 md:w-[20%]"
            />
          </div>
          <h1 className="text-heading-1 text-teal mb-6 md:mb-8 text-center">
            Insignias
          </h1>

        {/* Introduction Section */}
        <div className="text-gray-700 text-base md:text-lg leading-relaxed mb-12 md:mb-16 text-center max-w-3xl mx-auto">
          <p className="mb-6 md:mb-8">
            Las Insignias son reconocimientos especiales que recibes al completar
            ciertos logros en la aplicación. Son una forma de celebrar tu progreso y
            tus conquistas en el camino hacia el Camino de Santiago.
          </p>
          <p className="mb-8 md:mb-10">
            Para ganar una Insignia de Etapa, debes completar todas las caminatas
            correspondientes a esa etapa en las Caminatas Magnolias. Cada insignia
            representa un momento importante en tu entrenamiento y crecimiento.
          </p>
        </div>

        {/* Chaleco Section */}
        <div className="mb-12 md:mb-16">
          <ChalecoCard />
        </div>

        {/* Insignias List */}
        <div className="space-y-6 md:space-y-8">
          {insignias.map((insignia) => (
            <InsigniaCard
              key={insignia.etapa}
              insignia={insignia}
              isEarned={isEtapaCompleted(insignia.etapa)}
            />
          ))}
        </div>

        {/* Team Insignia Section */}
        <div className="mt-16 md:mt-20">
          {/* Section Divider */}
          <div className="section-divider mb-8 md:mb-12"></div>
          
          {/* Section Heading */}
          <div className="text-center mb-8 md:mb-10">
            <h2 className="text-heading-2 text-teal mb-2">
              Insignia Especial de Equipo
            </h2>
            <p className="text-gray-600 text-sm md:text-base">
              Reconocimiento colectivo para el equipo destacado
            </p>
          </div>

          <TeamInsigniaCard />
        </div>

        {/* Book Reading Insignias Section */}
        <div className="mt-16 md:mt-20">
          {/* Section Divider */}
          <div className="section-divider mb-8 md:mb-12"></div>
          
          {/* Section Heading */}
          <div className="text-center mb-8 md:mb-10">
            <h2 className="text-heading-2 text-teal mb-2">
              Insignias de Lectura
            </h2>
            <p className="text-gray-600 text-sm md:text-base">
              Reconoce tu dedicación a la lectura durante tu preparación
            </p>
          </div>

          {/* Book Insignias List */}
          <div className="space-y-6 md:space-y-8">
            {bookInsignias.map((insignia) => (
              <BookInsigniaCard
                key={insignia.id}
                insignia={insignia}
                isEarned={isBookInsigniaEarned(insignia.id)}
              />
            ))}
          </div>
        </div>

        {/* Video Insignias Section */}
        <div className="mt-16 md:mt-20">
          {/* Section Divider */}
          <div className="section-divider mb-8 md:mb-12"></div>
          
          {/* Section Heading */}
          <div className="text-center mb-8 md:mb-10">
            <h2 className="text-heading-2 text-teal mb-2">
              Insignias de Video
            </h2>
            <p className="text-gray-600 text-sm md:text-base">
              Reconoce tu dedicación a los videos durante tu preparación
            </p>
          </div>

          {/* Video Insignias List */}
          <div className="space-y-6 md:space-y-8">
            {videoInsignias.map((insignia) => (
              <VideoInsigniaCard
                key={insignia.id}
                insignia={insignia}
                isEarned={isVideoInsigniaEarned(insignia.id)}
              />
            ))}
          </div>
        </div>
        </div>
      </div>
    </PlanRestrictedContent>
  );
}