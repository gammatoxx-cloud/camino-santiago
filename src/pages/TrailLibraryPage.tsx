import { useState, useEffect, useMemo } from 'react';
import { PlanRestrictedContent } from '../components/plan/PlanRestrictedContent';
import { Accordion } from '../components/ui/Accordion';
import { TrailCard } from '../components/trails/TrailCard';
import { trails } from '../lib/trailData';
import type { Trail } from '../lib/trailData';
import { categorizeTrailByDifficulty } from '../lib/trailUtils';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export function TrailLibraryPage() {
  const { user } = useAuth();
  const [completedTrails, setCompletedTrails] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  // Filter trails by search (name, description, level)
  const filteredTrails = useMemo(() => {
    if (!searchQuery.trim()) return trails;
    const q = searchQuery.toLowerCase().trim();
    return trails.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.level.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Group filtered trails by difficulty
  const groupedTrails = useMemo(() => {
    const groups: {
      facil: Trail[];
      moderado: Trail[];
      dificil: Trail[];
    } = {
      facil: [],
      moderado: [],
      dificil: [],
    };

    filteredTrails.forEach((trail) => {
      const category = categorizeTrailByDifficulty(trail.level);
      groups[category].push(trail);
    });

    return groups;
  }, [filteredTrails]);

  // Load completed trails from database on mount
  useEffect(() => {
    if (!user) return;
    loadCompletedTrails();
  }, [user]);

  const loadCompletedTrails = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('trail_completions')
        .select('trail_id')
        .eq('user_id', user.id);

      if (error) throw error;

      const trailIds = (data || []).map((completion: { trail_id: string }) => completion.trail_id);
      setCompletedTrails(new Set(trailIds));
    } catch (error) {
      console.error('Error loading completed trails:', error);
    }
  };

  const handleToggleCompletion = async (trailId: string, completed: boolean) => {
    if (!user) return;

    try {
      if (completed) {
        // Insert completion into database
        const { error } = await supabase
          .from('trail_completions')
          .insert({
            user_id: user.id,
            trail_id: trailId,
          } as any);

        if (error) throw error;
        
        // Update local state
        setCompletedTrails((prev) => new Set([...prev, trailId]));
      } else {
        // Delete completion from database
        const { error } = await supabase
          .from('trail_completions')
          .delete()
          .eq('user_id', user.id)
          .eq('trail_id', trailId);

        if (error) throw error;
        
        // Update local state
        setCompletedTrails((prev) => {
          const newSet = new Set(prev);
          newSet.delete(trailId);
          return newSet;
        });
      }
    } catch (error) {
      console.error('Error toggling trail completion:', error);
    }
  };

  return (
    <PlanRestrictedContent requiredPlan="basico" upgradeToPlan="basico">
      <div className="min-h-screen bg-cream pb-20 md:pb-6 pt-8 md:pt-8 overflow-x-hidden">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-4 md:py-8">
          <div className="flex justify-center mb-8">
            <img
              src="/senderos_icon.svg"
              alt="Senderos"
              className="max-w-full h-auto w-1/4"
            />
          </div>
          <h1 className="text-heading-1 text-teal mb-6 md:mb-8 text-center">
            Senderos para Caminar
          </h1>

          {/* Search bar */}
          <div className="mb-8 md:mb-10">
            <label htmlFor="trail-search" className="sr-only">
              Buscar senderos
            </label>
            <div className="relative">
              <input
                id="trail-search"
                type="search"
                placeholder="Buscar por nombre, descripción o dificultad..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-11 rounded-xl border-2 border-gray-200 focus:border-teal focus:outline-none bg-white text-gray-800 placeholder-gray-400 min-h-[48px]"
                aria-label="Buscar senderos"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-teal"
                  aria-label="Limpiar búsqueda"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            {searchQuery && (
              <p className="mt-2 text-sm text-gray-600">
                {filteredTrails.length === 0
                  ? 'No se encontraron senderos'
                  : filteredTrails.length === 1
                    ? '1 sendero encontrado'
                    : `${filteredTrails.length} senderos encontrados`}
              </p>
            )}
          </div>

          <div className="space-y-3 md:space-y-4">
            {/* Fácil Section */}
            {(groupedTrails.facil.length > 0 || !searchQuery) && (
              <Accordion
                title="Fácil"
                icon="🟢"
                count={groupedTrails.facil.length}
                variant="facil"
                defaultOpen={!!searchQuery || true}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
                  {groupedTrails.facil.map((trail, index) => (
                    <TrailCard
                      key={trail.id}
                      trail={trail}
                      index={index}
                      isCompleted={completedTrails.has(trail.id)}
                      onToggleCompletion={handleToggleCompletion}
                    />
                  ))}
                </div>
              </Accordion>
            )}

            {/* Moderado Section */}
            {(groupedTrails.moderado.length > 0 || !searchQuery) && (
              <Accordion
                title="Moderado"
                icon="🟡"
                count={groupedTrails.moderado.length}
                variant="moderado"
                defaultOpen={!!searchQuery}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
                  {groupedTrails.moderado.map((trail, index) => (
                    <TrailCard
                      key={trail.id}
                      trail={trail}
                      index={index}
                      isCompleted={completedTrails.has(trail.id)}
                      onToggleCompletion={handleToggleCompletion}
                    />
                  ))}
                </div>
              </Accordion>
            )}

            {/* Difícil Section */}
            {(groupedTrails.dificil.length > 0 || !searchQuery) && (
              <Accordion
                title="Difícil"
                icon="🔴"
                count={groupedTrails.dificil.length}
                variant="dificil"
                defaultOpen={!!searchQuery}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
                  {groupedTrails.dificil.map((trail, index) => (
                    <TrailCard
                      key={trail.id}
                      trail={trail}
                      index={index}
                      isCompleted={completedTrails.has(trail.id)}
                      onToggleCompletion={handleToggleCompletion}
                    />
                  ))}
                </div>
              </Accordion>
            )}
          </div>
        </div>
      </div>
    </PlanRestrictedContent>
  );
}

