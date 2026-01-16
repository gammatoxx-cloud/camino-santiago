import type { Insignia } from '../types';

export const insignias: Insignia[] = [
  {
    etapa: 1,
    km: 45,
    title: 'El camino ya comenzó',
    description: 'Marca el inicio. Tomaste la decisión y diste los primeros pasos.',
    image: '/insignia_etapa1.png',
  },
  {
    etapa: 2,
    km: 109,
    title: 'La constancia se entrena',
    description: 'Aquí el hábito ya se formó. Caminar se volvió parte de tu rutina.',
    image: '/insignia_etapa2.png',
  },
  {
    etapa: 3,
    km: 196,
    title: 'Tu cuerpo ya sabe caminar lejos',
    description: 'La resistencia apareció. Tu cuerpo aprendió a sostener el esfuerzo.',
    image: '/insignia_etapa3.png',
  },
  {
    etapa: 4,
    km: 253,
    title: 'Caminar acompañados hace el camino más fuerte',
    description: 'Logro de comunidad. Caminar en grupo hizo la experiencia más sólida.',
    image: '/insignia_etapa4.png',
  },
  {
    etapa: 5,
    km: 289,
    title: 'Estás listo para el Camino',
    description: 'Entrenamiento completo. Llegaste preparado para la gran aventura.',
    image: '/insignia_etapa5.png',
  },
];

// Helper function to get insignia by etapa
export function getInsigniaByEtapa(etapa: number): Insignia | undefined {
  return insignias.find((insignia) => insignia.etapa === etapa);
}