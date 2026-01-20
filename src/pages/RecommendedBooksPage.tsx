import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookAccordion } from '../components/resources/BookAccordion';
import { books } from '../lib/booksData';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { BookCompletion } from '../types';

export function RecommendedBooksPage() {
  const { user } = useAuth();
  const [bookCompletions, setBookCompletions] = useState<BookCompletion[]>([]);
  const [togglingBookId, setTogglingBookId] = useState<string | null>(null);

  // Split books into sections
  const imprescindibles = books.slice(0, 2); // First 2 books
  const recomendados = books.slice(2, 5); // Books 3-5
  const ficcion = books.slice(5); // Remaining books (6-9)

  // Load book completions
  useEffect(() => {
    const loadBookCompletions = async () => {
      if (!user) {
        return;
      }

      try {
        const { data, error } = await supabase
          .from('book_completions')
          .select('*')
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false });

        if (error) throw error;
        setBookCompletions(data || []);
      } catch (err: any) {
        console.error('Error loading book completions:', err);
      }
    };

    loadBookCompletions();
  }, [user]);

  // Handle toggle completion
  const handleToggleCompletion = async (bookId: string) => {
    if (!user || togglingBookId) return;

    const isCompleted = bookCompletions.some(completion => completion.book_id === bookId);

    setTogglingBookId(bookId);

    try {
      if (isCompleted) {
        // Delete completion
        const completion = bookCompletions.find(c => c.book_id === bookId);
        if (completion) {
          const { error } = await supabase
            .from('book_completions')
            .delete()
            .eq('id', completion.id);

          if (error) throw error;
          setBookCompletions(prev => prev.filter(c => c.book_id !== bookId));
        }
      } else {
        // Insert completion
        const { error } = await supabase
          .from('book_completions')
          .insert({
            user_id: user.id,
            book_id: bookId,
          } as any);

        if (error) throw error;

        // Reload completions to get the new record with all fields
        const { data, error: reloadError } = await supabase
          .from('book_completions')
          .select('*')
          .eq('user_id', user.id)
          .eq('book_id', bookId)
          .maybeSingle();

        if (reloadError) throw reloadError;
        if (data) {
          setBookCompletions(prev => [...prev, data]);
        }
      }
    } catch (err: any) {
      console.error('Error toggling book completion:', err);
      // Could show error toast here
    } finally {
      setTogglingBookId(null);
    }
  };

  return (
    <div className="min-h-screen bg-cream pb-20 md:pb-6 pt-8 md:pt-8 overflow-x-hidden">
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

        <div className="flex justify-center mb-8">
          <img
            src="/libros_icon.svg"
            alt="Libros"
            className="max-w-full h-auto w-1/4 md:w-[20%]"
          />
        </div>
        <h1 className="text-heading-1 text-teal mb-6 md:mb-8 text-center">
          Libros Recomendados
        </h1>
        
        <p className="text-gray-700 text-base md:text-lg leading-relaxed mb-10 md:mb-14 text-center max-w-3xl mx-auto">
          Esta selección de libros ha sido curada para acompañarte en tu preparación para el Camino de Santiago. Encontrarás <strong>lecturas imprescindibles</strong> que inspiran y motivan, <strong>recomendaciones especializadas</strong> sobre la experiencia del peregrino, y <strong>ficción histórica y suspense</strong> ambientada en el Camino para disfrutar durante tu viaje. Cada libro ha sido elegido para enriquecer tu experiencia física y espiritual del Camino. ¡Buen Camino con Magnolias!
        </p>

        <div className="space-y-5 md:space-y-7">
          <BookAccordion
            title="Imprescindibles"
            books={imprescindibles}
            defaultExpanded={true}
            bookCompletions={bookCompletions}
            onToggleCompletion={user ? handleToggleCompletion : undefined}
            togglingBookId={togglingBookId}
          />
          <BookAccordion
            title="Recomendados"
            books={recomendados}
            defaultExpanded={false}
            bookCompletions={bookCompletions}
            onToggleCompletion={user ? handleToggleCompletion : undefined}
            togglingBookId={togglingBookId}
          />
          <BookAccordion
            title="Ficción: Novela Histórica y Suspense"
            books={ficcion}
            defaultExpanded={false}
            bookCompletions={bookCompletions}
            onToggleCompletion={user ? handleToggleCompletion : undefined}
            togglingBookId={togglingBookId}
          />
        </div>
      </div>
    </div>
  );
}

