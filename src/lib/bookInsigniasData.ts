import type { BookInsignia } from '../types';

export const bookInsignias: BookInsignia[] = [
  {
    id: 'explorador-lectura',
    title: 'Explorador de Lectura',
    description: 'Has comenzado tu viaje literario. Los primeros libros abren nuevas perspectivas sobre el Camino.',
    image: '/explorador_lectura.png',
    minBooks: 1,
    maxBooks: 2,
  },
  {
    id: 'lector-constante',
    title: 'Lector Constante',
    description: 'La lectura se ha vuelto parte de tu preparación. Cada libro enriquece tu experiencia del Camino.',
    image: '/lector_constante.png',
    minBooks: 3,
    maxBooks: 4,
  },
  {
    id: 'lector-experto',
    title: 'Lector Experto',
    description: 'Has profundizado en la literatura del Camino. Tu preparación intelectual está completa.',
    image: '/lector_experto.png',
    minBooks: 5,
  },
];

/**
 * Check if a user has earned a specific book insignia based on their book count
 * Insignias are cumulative - once you reach the minimum threshold, you keep the insignia
 * even if you exceed the maximum (e.g., if you have 3 books, you keep "Explorador de Lectura")
 */
export function hasEarnedBookInsignia(insignia: BookInsignia, bookCount: number): boolean {
  // Insignias are earned cumulatively - check if user has reached the minimum threshold
  return bookCount >= insignia.minBooks;
}

/**
 * Get all earned book insignias for a user based on their book count
 */
export function getEarnedBookInsignias(bookCount: number): BookInsignia[] {
  return bookInsignias.filter((insignia) => hasEarnedBookInsignia(insignia, bookCount));
}

/**
 * Get book insignia by ID
 */
export function getBookInsigniaById(id: string): BookInsignia | undefined {
  return bookInsignias.find((insignia) => insignia.id === id);
}

/**
 * Format the requirement text for display (e.g., "1-2 libros" or "5+ libros")
 */
export function formatBookRequirement(insignia: BookInsignia): string {
  if (insignia.maxBooks !== undefined) {
    return `${insignia.minBooks}-${insignia.maxBooks} libros`;
  }
  return `${insignia.minBooks}+ libros`;
}
