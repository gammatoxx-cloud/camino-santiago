import type { VideoInsignia } from '../types';

export const videoInsignias: VideoInsignia[] = [
  {
    id: 'explorador-cultural',
    title: 'Explorador Cultural',
    description: 'Has comenzado a explorar los videos del Camino. Cada video te acerca más a esta experiencia única.',
    image: '/explorador_camino.png',
    minVideos: 1,
    maxVideos: 2,
  },
  {
    id: 'mirar-camino',
    title: 'Mirar el Camino',
    description: 'Estás viendo y aprendiendo del Camino. Cada video enriquece tu preparación y conocimiento.',
    image: '/mirar_camino.png',
    minVideos: 3,
    maxVideos: 4,
  },
  {
    id: 'cultura-camino',
    title: 'Cultura del Camino',
    description: 'Has profundizado en la cultura y sabiduría del Camino a través de los videos. Tu preparación visual está completa.',
    image: '/inspiracion_marcha.png',
    minVideos: 5,
  },
];

/**
 * Check if a user has earned a specific video insignia based on their video count
 * Insignias are cumulative - once you reach the minimum threshold, you keep the insignia
 * even if you exceed the maximum (e.g., if you have 3 videos, you keep "Explorador Cultural")
 */
export function hasEarnedVideoInsignia(insignia: VideoInsignia, videoCount: number): boolean {
  // Insignias are earned cumulatively - check if user has reached the minimum threshold
  return videoCount >= insignia.minVideos;
}

/**
 * Get all earned video insignias for a user based on their video count
 */
export function getEarnedVideoInsignias(videoCount: number): VideoInsignia[] {
  return videoInsignias.filter((insignia) => hasEarnedVideoInsignia(insignia, videoCount));
}

/**
 * Get video insignia by ID
 */
export function getVideoInsigniaById(id: string): VideoInsignia | undefined {
  return videoInsignias.find((insignia) => insignia.id === id);
}

/**
 * Format the requirement text for display (e.g., "1-2 videos" or "5+ videos")
 */
export function formatVideoRequirement(insignia: VideoInsignia): string {
  if (insignia.maxVideos !== undefined) {
    return `${insignia.minVideos}-${insignia.maxVideos} videos`;
  }
  return `${insignia.minVideos}+ videos`;
}
