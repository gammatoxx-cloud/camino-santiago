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

  // Group trails by difficulty
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

    trails.forEach((trail) => {
      const category = categorizeTrailByDifficulty(trail.level);
      groups[category].push(trail);
    });

    return groups;
  }, []);

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
          <h1 className="text-heading-1 text-teal mb-14 md:mb-16 text-center">
            Senderos para Caminar
          </h1>

          <div className="space-y-3 md:space-y-4">
            {/* Fácil Section */}
            <Accordion
              title="Fácil"
              icon="🟢"
              count={groupedTrails.facil.length}
              variant="facil"
              defaultOpen={true}
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

            {/* Moderado Section */}
            <Accordion
              title="Moderado"
              icon="🟡"
              count={groupedTrails.moderado.length}
              variant="moderado"
              defaultOpen={false}
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

            {/* Difícil Section */}
            <Accordion
              title="Difícil"
              icon="🔴"
              count={groupedTrails.dificil.length}
              variant="dificil"
              defaultOpen={false}
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
          </div>
        </div>
      </div>
    </PlanRestrictedContent>
  );
}

