import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import type { Book } from '../../lib/booksData';

interface BookCardProps {
  book: Book;
  index?: number;
  isCompleted?: boolean;
  onToggleCompletion?: (bookId: string) => void;
  bookCategory?: 'imprescindible' | 'recomendado' | 'ficcion';
  isLoading?: boolean;
}

export function BookCard({ 
  book, 
  index = 0, 
  isCompleted = false,
  onToggleCompletion,
  bookCategory,
  isLoading = false
}: BookCardProps) {
  const handleAmazonClick = () => {
    window.open(book.amazonLink, '_blank', 'noopener,noreferrer');
  };

  const handleToggleClick = () => {
    if (onToggleCompletion && !isLoading) {
      onToggleCompletion(book.id);
    }
  };

  // Extract author name if title follows pattern "Title – Author"
  const titleParts = book.title.split(' – ');
  const titleText = titleParts[0];
  const authorName = titleParts.length > 1 ? titleParts[1] : null;

  // Get points based on category
  const getPoints = () => {
    if (bookCategory === 'imprescindible') return 75;
    if (bookCategory === 'recomendado') return 50;
    return 0;
  };

  const points = getPoints();
  const showCompletionToggle = onToggleCompletion !== undefined;

  return (
    <div
      className="animate-fade-in-up"
      style={{ animationDelay: `${index * 100}ms` } as React.CSSProperties}
    >
      <Card variant="elevated" className="h-full flex flex-col">
        <div className="flex-1 flex flex-col">
          <div className="mb-4 md:mb-5">
            <h3 className="text-heading-3 text-teal mb-2 leading-tight font-bold">
              {titleText}
            </h3>
            {authorName && (
              <p className="text-sm md:text-base text-gray-600 font-medium italic">
                {authorName}
              </p>
            )}
          </div>
          
          <div className="mb-6 flex-1">
            <div className="h-px bg-gradient-to-r from-transparent via-gray-200/60 to-transparent mb-4"></div>
            <p className="text-gray-700 leading-relaxed text-[15px] md:text-base">
              {book.description}
            </p>
          </div>

          {/* Completion Toggle Section */}
          {showCompletionToggle && (
            <div className="mb-4 pt-4 border-t border-gray-200/70">
              <button
                onClick={handleToggleClick}
                disabled={isLoading}
                className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-300 min-h-[56px] ${
                  isLoading
                    ? 'opacity-60 cursor-not-allowed'
                    : 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]'
                } ${
                  isCompleted
                    ? 'bg-gradient-to-r from-emerald-50/80 to-green-50/60 border-2 border-emerald-200/70'
                    : 'bg-white/80 border-2 border-gray-200/60 hover:border-teal/40'
                }`}
                aria-label={isCompleted ? `Marcar como no completado: ${titleText}` : `Marcar como completado: ${titleText}`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
                      isCompleted
                        ? 'checkbox-completed'
                        : 'checkbox-pending'
                    }`}
                  >
                    {isCompleted && (
                      <span className="text-teal text-2xl md:text-3xl font-bold drop-shadow-sm">✓</span>
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-base md:text-lg font-semibold text-gray-800">
                      {isCompleted ? 'Completado' : 'Marcar como completado'}
                    </p>
                    {isCompleted && points > 0 && (
                      <p className="text-sm md:text-base text-teal font-bold">
                        +{points} puntos
                      </p>
                    )}
                  </div>
                </div>
              </button>
            </div>
          )}

          <div className="pt-4 border-t border-gray-200/70 mt-auto">
            <Button
              variant="primary"
              size="md"
              onClick={handleAmazonClick}
              className="w-full"
            >
              📚 Ver en Amazon
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

