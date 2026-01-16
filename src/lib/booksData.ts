export interface Book {
  id: string;
  title: string;
  description: string;
  amazonLink: string;
}

export const books: Book[] = [
  {
    id: 'peregrino-compostela',
    title: 'El Peregrino de Compostela (Diario de un mago) – Paulo Coelho',
    description: 'Relato autobiográfico del autor sobre su experiencia caminando el Camino. Inspirador y simbólico.',
    amazonLink: 'https://amzn.to/4bemOqY',
  },
  {
    id: 'dejate-tonterias',
    title: '¡Déjate de tonterías! Y haz el Camino de Santiago – Cristina Hortal',
    description: 'Libro directo y motivador que rompe miedos y excusas comunes antes de hacer el Camino.',
    amazonLink: 'https://amzn.to/4aAvDv3',
  },
  {
    id: 'caminar-filosofia',
    title: 'Caminar: una filosofía – Frédéric Gros',
    description: 'Ensayo sobre el acto de caminar como experiencia humana y mental.',
    amazonLink: 'https://amzn.to/44TSCO2',
  },
  {
    id: 'dejate-tonterias-recomendado',
    title: '¡Déjate de tonterías! Y haz el Camino de Santiago – Cristina Hortal',
    description: 'Un libro enfocado en la transformación personal y el autodescubrimiento, ideal si buscas una lectura que te empuje a dar el primer paso.',
    amazonLink: 'https://amzn.to/4aH1wSH',
  },
  {
    id: 'guia-magica-camino',
    title: 'Guía mágica del Camino de Santiago – Francisco Contreras Gil',
    description: 'Más que una guía de etapas, explora los misterios, las leyendas y la cara más heterodoxa y sagrada de la ruta.',
    amazonLink: 'https://amzn.to/3YQ8uxt',
  },
  {
    id: 'peregrinatio',
    title: 'Peregrinatio – Matilde Asensi',
    description: 'Si prefieres algo más breve, este libro es un viaje por el Camino Francés en el siglo XIV, con un tono pedagógico pero ameno sobre la vida medieval.',
    amazonLink: 'https://amzn.to/4qETrml',
  },
  {
    id: 'iacobus',
    title: 'Iacobus – Matilde Asensi',
    description: 'Un clásico de la novela histórica española. Un caballero de la Orden del Hospital debe investigar la muerte del Papa Juan XXII y el tesoro de los Templarios siguiendo el Camino.',
    amazonLink: 'https://amzn.to/4qCDflB',
  },
  {
    id: 'ladrona-huesos',
    title: 'La ladrona de huesos – Manel Loureiro',
    description: 'Un thriller contemporáneo de gran éxito. La protagonista debe robar las reliquias del Apóstol en la Catedral de Santiago para salvar a un ser querido. Muy ágil y cinematográfico.',
    amazonLink: 'https://amzn.to/4qtodhO',
  },
  {
    id: 'alma-piedras',
    title: 'El alma de las piedras – Paloma Sánchez-Garnica',
    description: 'Una excelente novela ambientada en el siglo IX que recrea el "descubrimiento" de la tumba del apóstol y los intereses políticos tras el inicio de la peregrinación.',
    amazonLink: 'https://amzn.to/4aBLdXi',
  },
];

/**
 * Determine book category based on book ID
 * - First 2 books (indices 0-1) = 'imprescindible'
 * - Next 3 books (indices 2-4) = 'recomendado'
 * - Remaining books (indices 5+) = 'ficcion'
 */
export function getBookCategory(bookId: string): 'imprescindible' | 'recomendado' | 'ficcion' | null {
  const bookIndex = books.findIndex(book => book.id === bookId);
  if (bookIndex === -1) return null;
  
  if (bookIndex < 2) return 'imprescindible';
  if (bookIndex < 5) return 'recomendado';
  return 'ficcion';
}

