import { useState, useEffect } from 'react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { PlanRestrictedContent } from '../components/plan/PlanRestrictedContent';
import { MagnoliasHikesAccordion } from '../components/magnolias-hikes/MagnoliasHikesAccordion';
import { getHikesByEtapa } from '../lib/magnoliasHikesData';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export function MagnoliasHikesPage() {
  const { user } = useAuth();
  const [completedHikeIds, setCompletedHikeIds] = useState<Set<string>>(new Set());

  // Load completed hikes from database on mount
  useEffect(() => {
    if (!user) return;
    loadCompletedHikes();
  }, [user]);

  const loadCompletedHikes = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('magnolias_hikes_completions')
        .select('hike_id')
        .eq('user_id', user.id);

      if (error) throw error;

      const hikeIds = (data || []).map(
        (completion: { hike_id: string }) => completion.hike_id
      );
      setCompletedHikeIds(new Set(hikeIds));
    } catch (error) {
      console.error('Error loading completed hikes:', error);
    }
  };

  const handleToggleCompletion = async (hikeId: string, completed: boolean) => {
    if (!user) return;

    try {
      if (completed) {
        // Insert completion into database
        const { error } = await supabase
          .from('magnolias_hikes_completions')
          .insert({
            user_id: user.id,
            hike_id: hikeId,
          } as any);

        if (error) throw error;

        // Update local state
        setCompletedHikeIds((prev) => new Set([...prev, hikeId]));
      } else {
        // Delete completion from database
        const { error } = await supabase
          .from('magnolias_hikes_completions')
          .delete()
          .eq('user_id', user.id)
          .eq('hike_id', hikeId);

        if (error) throw error;

        // Update local state
        setCompletedHikeIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(hikeId);
          return newSet;
        });
      }
    } catch (error) {
      console.error('Error toggling hike completion:', error);
    }
  };

  // Group hikes by etapa
  const etapa1Hikes = getHikesByEtapa(1);
  const etapa2Hikes = getHikesByEtapa(2);
  const etapa3Hikes = getHikesByEtapa(3);
  const etapa4Hikes = getHikesByEtapa(4);
  const etapa5Hikes = getHikesByEtapa(5);

  return (
    <PlanRestrictedContent requiredPlan="completo" upgradeToPlan="completo">
      <div className="min-h-screen bg-cream pb-20 md:pb-6 pt-8 md:pt-12 overflow-x-hidden">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-4 md:py-8">
        <SectionHeader label="Entrenamiento Magnolias" icon="🚶" />
        <h1 className="text-heading-1 text-teal mb-6 md:mb-8 text-center">
          Caminatas Magnolias
        </h1>

        <div className="text-gray-700 text-base md:text-lg leading-relaxed mb-12 md:mb-16 text-center max-w-3xl mx-auto">
          <p className="mb-6 md:mb-8">
            Estas 26 caminatas (dos por mes) forman parte del entrenamiento oficial
            de Magnolias y se realizan en comunidad, con guía y acompañamiento. Cada
            recorrido está diseñado para ayudarte a desarrollar resistencia de forma
            progresiva, compartir el camino con otras personas y prepararte con
            seguridad para el Camino de Santiago.
          </p>
          <p className="mb-8 md:mb-10">
            Camina a tu ritmo, apóyate en el grupo y celebra cada paso que das junto
            a la comunidad Magnolias.
          </p>
          {/* Goal Badge */}
          <div className="mx-auto max-w-md px-6 py-4 md:py-5 rounded-2xl bg-gradient-to-br from-teal-50 via-white to-checklist-accent/30 border-2 border-teal-200/60 shadow-lg shadow-teal-100/50">
            <p className="text-lg md:text-xl font-bold text-teal">
              ¡Si completas todas estas caminatas habrás entrenado un total de <span className="text-2xl md:text-3xl">289 km</span>!
            </p>
          </div>
        </div>

        <div className="space-y-5 md:space-y-7">
          <MagnoliasHikesAccordion
            etapaNumber={1}
            hikes={etapa1Hikes}
            defaultExpanded={true}
            completedHikeIds={completedHikeIds}
            onToggleCompletion={handleToggleCompletion}
            dateRange="(Febrero – Abril 2026)"
            title="Etapa 1 - Inicio"
          />
          <MagnoliasHikesAccordion
            etapaNumber={2}
            hikes={etapa2Hikes}
            defaultExpanded={false}
            completedHikeIds={completedHikeIds}
            onToggleCompletion={handleToggleCompletion}
            dateRange="(Mayo – Julio 2026)"
            title="Etapa 2 - Constancia"
          />
          <MagnoliasHikesAccordion
            etapaNumber={3}
            hikes={etapa3Hikes}
            defaultExpanded={false}
            completedHikeIds={completedHikeIds}
            onToggleCompletion={handleToggleCompletion}
            dateRange="(Agosto – Octubre 2026)"
            title="Etapa 3 - Resistencia"
          />
          <MagnoliasHikesAccordion
            etapaNumber={4}
            hikes={etapa4Hikes}
            defaultExpanded={false}
            completedHikeIds={completedHikeIds}
            onToggleCompletion={handleToggleCompletion}
            dateRange="(Noviembre 2026 – Enero 2027)"
            title="Etapa 4 - Consolidación"
          />
          <MagnoliasHikesAccordion
            etapaNumber={5}
            hikes={etapa5Hikes}
            defaultExpanded={false}
            completedHikeIds={completedHikeIds}
            onToggleCompletion={handleToggleCompletion}
            dateRange="(Febrero 2027)"
            title="Etapa 5 - Afinación final"
          />
        </div>
        </div>
      </div>
    </PlanRestrictedContent>
  );
}
