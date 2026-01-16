import type { MagnoliasHike } from '../types';

export const magnoliasHikes: MagnoliasHike[] = [
  // Etapa 1
  {
    id: 'etapa-1-hike-1',
    numero: 1,
    etapa: 1,
    distancia: '5km',
    duracion_estimada: '1h 30min',
    points: 30,
  },
  {
    id: 'etapa-1-hike-2',
    numero: 2,
    etapa: 1,
    distancia: '6km',
    duracion_estimada: '1h 30min',
    points: 31,
  },
  {
    id: 'etapa-1-hike-3',
    numero: 3,
    etapa: 1,
    distancia: '7km',
    duracion_estimada: '1h 45min',
    points: 32,
  },
  {
    id: 'etapa-1-hike-4',
    numero: 4,
    etapa: 1,
    distancia: '8km',
    duracion_estimada: '1h',
    points: 33,
  },
  {
    id: 'etapa-1-hike-5',
    numero: 5,
    etapa: 1,
    distancia: '9km',
    duracion_estimada: '2h 15min',
    points: 34,
  },
  {
    id: 'etapa-1-hike-6',
    numero: 6,
    etapa: 1,
    distancia: '10km',
    duracion_estimada: '2h 30min',
    points: 35,
  },
  // Etapa 2
  {
    id: 'etapa-2-hike-7',
    numero: 7,
    etapa: 2,
    distancia: '9km',
    duracion_estimada: '2h 15min',
    points: 34,
  },
  {
    id: 'etapa-2-hike-8',
    numero: 8,
    etapa: 2,
    distancia: '10km',
    duracion_estimada: '2h 30min',
    points: 35,
  },
  {
    id: 'etapa-2-hike-9',
    numero: 9,
    etapa: 2,
    distancia: '10km',
    duracion_estimada: '2h 30min',
    points: 35,
  },
  {
    id: 'etapa-2-hike-10',
    numero: 10,
    etapa: 2,
    distancia: '11km',
    duracion_estimada: '2h 45min',
    points: 36,
  },
  {
    id: 'etapa-2-hike-11',
    numero: 11,
    etapa: 2,
    distancia: '12km',
    duracion_estimada: '3h',
    points: 37,
  },
  {
    id: 'etapa-2-hike-12',
    numero: 12,
    etapa: 2,
    distancia: '11km',
    duracion_estimada: '3h',
    points: 37,
  },
  // Etapa 3
  {
    id: 'etapa-3-hike-13',
    numero: 13,
    etapa: 3,
    distancia: '13km',
    duracion_estimada: '3h 15min',
    points: 38,
  },
  {
    id: 'etapa-3-hike-14',
    numero: 14,
    etapa: 3,
    distancia: '14km',
    duracion_estimada: '3h 30min',
    points: 39,
  },
  {
    id: 'etapa-3-hike-15',
    numero: 15,
    etapa: 3,
    distancia: '14km',
    duracion_estimada: '3h 30min',
    points: 39,
  },
  {
    id: 'etapa-3-hike-16',
    numero: 16,
    etapa: 3,
    distancia: '15km',
    duracion_estimada: '3h 45min',
    points: 40,
  },
  {
    id: 'etapa-3-hike-17',
    numero: 17,
    etapa: 3,
    distancia: '15km',
    duracion_estimada: '3h 45min',
    points: 40,
  },
  {
    id: 'etapa-3-hike-18',
    numero: 18,
    etapa: 3,
    distancia: '16km',
    duracion_estimada: '4h',
    points: 41,
  },
  // Etapa 4
  {
    id: 'etapa-4-hike-19',
    numero: 19,
    etapa: 4,
    distancia: '12km',
    duracion_estimada: '3h',
    points: 37,
  },
  {
    id: 'etapa-4-hike-20',
    numero: 20,
    etapa: 4,
    distancia: '14km',
    duracion_estimada: '3h 30min',
    points: 39,
  },
  {
    id: 'etapa-4-hike-21',
    numero: 21,
    etapa: 4,
    distancia: '15km',
    duracion_estimada: '3h 45min',
    points: 40,
  },
  {
    id: 'etapa-4-hike-22',
    numero: 22,
    etapa: 4,
    distancia: '16km',
    duracion_estimada: '4h',
    points: 41,
  },
  // Etapa 5
  {
    id: 'etapa-5-hike-23',
    numero: 23,
    etapa: 5,
    distancia: '12km',
    duracion_estimada: '3h',
    points: 37,
  },
  {
    id: 'etapa-5-hike-24',
    numero: 24,
    etapa: 5,
    distancia: '10km',
    duracion_estimada: '2h 30min',
    points: 35,
  },
  {
    id: 'etapa-5-hike-25',
    numero: 25,
    etapa: 5,
    distancia: '8km',
    duracion_estimada: '2h',
    points: 35,
  },
  {
    id: 'etapa-5-hike-26',
    numero: 26,
    etapa: 5,
    distancia: '6km',
    duracion_estimada: '1h 30min',
    points: 35,
  },
];

// Helper function to get hikes by etapa
export function getHikesByEtapa(etapa: number): MagnoliasHike[] {
  return magnoliasHikes.filter((hike) => hike.etapa === etapa);
}

// Helper function to get points for a hike by ID
export function getHikePoints(hikeId: string): number {
  const hike = magnoliasHikes.find((h) => h.id === hikeId);
  return hike?.points || 0;
}
