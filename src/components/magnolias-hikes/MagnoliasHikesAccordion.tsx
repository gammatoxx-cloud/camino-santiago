import React, { useState, useMemo } from 'react';
import { Card } from '../ui/Card';
import { MagnoliasHikeCard } from './MagnoliasHikeCard';
import { ProgressRing } from '../ui/ProgressRing';
import type { MagnoliasHike } from '../../types';

// Helper function to get etapa-based accent color
function getEtapaAccentColor(etapaNumber: number): string {
  const accents: Record<number, string> = {
    1: 'from-teal-50/60 to-white/40',
    2: 'from-blue-50/60 to-white/40',
    3: 'from-green-50/60 to-white/40',
    4: 'from-amber-50/60 to-white/40',
    5: 'from-rose-50/60 to-white/40',
  };
  return accents[etapaNumber] || 'from-teal-50/60 to-white/40';
}

// Helper function to get etapa-based badge color
function getEtapaBadgeColor(etapaNumber: number): string {
  const badges: Record<number, string> = {
    1: 'bg-teal-100/90 text-teal-700 border-teal-300/80',
    2: 'bg-blue-100/90 text-blue-700 border-blue-300/80',
    3: 'bg-green-100/90 text-green-700 border-green-300/80',
    4: 'bg-amber-100/90 text-amber-700 border-amber-300/80',
    5: 'bg-rose-100/90 text-rose-700 border-rose-300/80',
  };
  return badges[etapaNumber] || 'bg-teal-100/90 text-teal-700 border-teal-300/80';
}

interface MagnoliasHikesAccordionProps {
  etapaNumber: number;
  hikes: MagnoliasHike[];
  defaultExpanded?: boolean;
  completedHikeIds: Set<string>;
  onToggleCompletion: (hikeId: string, completed: boolean) => void;
  dateRange?: string;
  title?: string; // Optional custom title, defaults to "Etapa {etapaNumber}"
}

export function MagnoliasHikesAccordion({
  etapaNumber,
  hikes,
  defaultExpanded = false,
  completedHikeIds,
  onToggleCompletion,
  dateRange,
  title,
}: MagnoliasHikesAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const hasHikes = hikes.length > 0;
  const accentGradient = getEtapaAccentColor(etapaNumber);
  const badgeColor = getEtapaBadgeColor(etapaNumber);

  // Calculate progress
  const progress = useMemo(() => {
    if (!hasHikes) return 0;
    const completedCount = hikes.filter((hike) => completedHikeIds.has(hike.id)).length;
    return (completedCount / hikes.length) * 100;
  }, [hikes, completedHikeIds, hasHikes]);

  const completedCount = useMemo(() => {
    return hikes.filter((hike) => completedHikeIds.has(hike.id)).length;
  }, [hikes, completedHikeIds]);

  const isFullyCompleted = useMemo(() => {
    return hasHikes && completedCount === hikes.length;
  }, [hasHikes, completedCount, hikes.length]);

  return (
    <Card variant="default" className="overflow-hidden">
      {/* Accordion Header - Touch-friendly */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full px-4 md:px-6 py-4 md:py-5 flex items-center justify-between text-left transition-all duration-300 rounded-3xl relative overflow-hidden ${
          hasHikes
            ? `hover:bg-gradient-to-r ${accentGradient} active:bg-white/60 hover:shadow-sm`
            : 'opacity-60 cursor-not-allowed'
        }`}
        aria-expanded={isExpanded}
        disabled={!hasHikes}
      >
        {/* Subtle background accent */}
        <div
          className={`absolute inset-0 bg-gradient-to-r ${accentGradient} opacity-0 transition-opacity duration-300 ${
            isExpanded ? 'opacity-100' : ''
          }`}
        />

        <div className="flex-1 min-w-0 pr-4 relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-lg md:text-xl font-bold text-teal">
                  {title || `Etapa ${etapaNumber}`}
                </span>
                {isFullyCompleted && (
                  <span className="flex-shrink-0 w-6 h-6 md:w-7 md:h-7 rounded-full bg-checklist-accent border-2 border-green-500/60 flex items-center justify-center shadow-sm" title="Etapa completada">
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                )}
              </div>
              {dateRange && (
                <span className="text-xs text-gray-500 mt-0.5">
                  {dateRange}
                </span>
              )}
            </div>
            {hasHikes && (
              <span className={`text-xs md:text-sm font-bold px-3 py-1.5 rounded-full border-2 backdrop-blur-sm ${badgeColor} shadow-sm`}>
                {hikes.length} caminata{hikes.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Chevron Icon */}
        {hasHikes ? (
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
          <span className="text-xs text-gray-400 flex-shrink-0 relative z-10">
            Próximamente
          </span>
        )}
      </button>

      {/* Accordion Content - Animated */}
      {hasHikes && (
        <div
          className={`overflow-hidden transition-all duration-500 ease-in-out ${
            isExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="pt-6 pb-4 md:pb-6 px-3 md:px-4">
            {/* Progress Indicator */}
            <div className="flex flex-col items-center mb-6 md:mb-8">
              <div className="scale-100 md:scale-110">
                <ProgressRing progress={progress} size={120} strokeWidth={8} />
              </div>
              <p className="mt-5 md:mt-6 text-center text-gray-700 font-semibold text-base md:text-lg">
                {completedCount} de {hikes.length} caminata{hikes.length !== 1 ? 's' : ''} completada{hikes.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Visual Separator */}
            <div className="h-px bg-gradient-to-r from-transparent via-teal-100/60 to-transparent my-6 md:my-8" />

            {/* Hike Cards */}
            <div className="space-y-4">
              {hikes.map((hike) => (
                <MagnoliasHikeCard
                  key={hike.id}
                  hike={hike}
                  isCompleted={completedHikeIds.has(hike.id)}
                  onToggleCompletion={onToggleCompletion}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
