import { useState } from 'react';
import { Card } from '../ui/Card';
import { BookCard } from './BookCard';
import type { Book } from '../../lib/booksData';
import type { BookCompletion } from '../../types';

interface BookAccordionProps {
  title: string;
  books: Book[];
  defaultExpanded?: boolean;
  bookCompletions?: BookCompletion[];
  onToggleCompletion?: (bookId: string) => void;
  togglingBookId?: string | null;
}

// Helper function to get section-based accent color
function getSectionAccentColor(title: string) {
  if (title === 'Imprescindibles') {
    return 'from-amber-50/70 to-white/50';
  } else if (title === 'Recomendados') {
    return 'from-teal-50/60 to-white/40';
  } else {
    return 'from-indigo-50/60 to-white/40';
  }
}

// Helper function to get section-based badge color
function getSectionBadgeColor(title: string) {
  if (title === 'Imprescindibles') {
    return 'bg-amber-100/90 text-amber-800 border-amber-300/70';
  } else if (title === 'Recomendados') {
    return 'bg-teal-100/80 text-teal-700 border-teal-200/60';
  } else {
    return 'bg-indigo-100/80 text-indigo-700 border-indigo-200/60';
  }
}

export function BookAccordion({ 
  title, 
  books, 
  defaultExpanded = false,
  bookCompletions = [],
  onToggleCompletion,
  togglingBookId = null
}: BookAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const hasBooks = books.length > 0;
  const accentGradient = getSectionAccentColor(title);
  const badgeColor = getSectionBadgeColor(title);
  const isImprescindibles = title === 'Imprescindibles';

  // Determine book category based on section title
  const getBookCategory = (): 'imprescindible' | 'recomendado' | 'ficcion' | undefined => {
    if (title === 'Imprescindibles') return 'imprescindible';
    if (title === 'Recomendados') return 'recomendado';
    if (title.includes('Ficción')) return 'ficcion';
    return undefined;
  };

  const bookCategory = getBookCategory();

  return (
    <Card variant="default" className="overflow-hidden">
      {/* Accordion Header - Touch-friendly */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full px-4 md:px-6 py-4 md:py-5 flex items-center justify-between text-left transition-all duration-300 rounded-3xl relative overflow-hidden ${
          hasBooks 
            ? `hover:bg-gradient-to-r ${accentGradient} active:bg-white/50` 
            : 'opacity-60 cursor-not-allowed'
        }`}
        aria-expanded={isExpanded}
        disabled={!hasBooks}
      >
        {/* Subtle background accent */}
        <div className={`absolute inset-0 bg-gradient-to-r ${accentGradient} opacity-0 transition-opacity duration-300 ${isExpanded ? 'opacity-100' : ''}`} />
        
        <div className="flex-1 min-w-0 pr-4 relative z-10">
          <div className="flex items-center gap-3 mb-2">
            {isImprescindibles && (
              <span className="text-lg md:text-xl" title="Recomendación destacada">
                ⭐
              </span>
            )}
            <span className={`text-lg md:text-xl font-bold ${isImprescindibles ? 'text-teal' : 'text-teal'}`}>
              {title}
            </span>
            {isImprescindibles && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100/90 text-amber-800 border border-amber-300/70 backdrop-blur-sm">
                Destacado
              </span>
            )}
          </div>
          {hasBooks && (
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border backdrop-blur-sm ${badgeColor}`}>
                {books.length} libro{books.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {/* Chevron Icon */}
        {hasBooks ? (
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
      {hasBooks && (
        <div
          className={`overflow-hidden transition-all duration-500 ease-in-out ${
            isExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="pt-6 pb-4 md:pb-6 px-3 md:px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
              {books.map((book, index) => {
                const isCompleted = bookCompletions.some(completion => completion.book_id === book.id);
                const isLoading = togglingBookId === book.id;
                return (
                  <BookCard 
                    key={book.id} 
                    book={book} 
                    index={index}
                    isCompleted={isCompleted}
                    onToggleCompletion={onToggleCompletion}
                    bookCategory={bookCategory}
                    isLoading={isLoading}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

