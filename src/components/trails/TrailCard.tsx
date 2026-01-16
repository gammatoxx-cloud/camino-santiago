import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import type { Trail } from '../../lib/trailData';

interface TrailCardProps {
  trail: Trail;
  index?: number;
  isCompleted?: boolean;
  onToggleCompletion?: (trailId: string, completed: boolean) => void;
}

// Helper function to determine difficulty class
function getDifficultyClass(level: string): string {
  const lowerLevel = level.toLowerCase();
  if (lowerLevel.includes('fácil') && !lowerLevel.includes('moderado')) {
    return 'difficulty-easy';
  } else if (lowerLevel.includes('difícil') || lowerLevel.includes('extenuante')) {
    return 'difficulty-difficult';
  } else if (lowerLevel.includes('moderado')) {
    if (lowerLevel.includes('fácil')) {
      return 'difficulty-mixed';
    }
    return 'difficulty-moderate';
  }
  return 'difficulty-mixed';
}

export function TrailCard({ trail, index = 0, isCompleted = false, onToggleCompletion }: TrailCardProps) {
  const [imageError, setImageError] = useState(false);

  const handleCompletionClick = () => {
    if (onToggleCompletion) {
      onToggleCompletion(trail.id, !isCompleted);
    }
  };

  return (
    <div 
      className="trail-card-enter"
      style={{ '--animation-delay': `${index * 0.1}s` } as React.CSSProperties}
    >
      <Card 
        variant="elevated" 
        className="overflow-hidden"
      >
      <div className="flex flex-col h-full">
        {/* Trail Image with Gradient Overlay */}
        <div className="relative w-full h-52 md:h-64 mb-5 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 group shadow-lg">
          {!imageError ? (
            <>
              <img
                src={trail.imagePath}
                alt={trail.name}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                onError={() => setImageError(true)}
              />
              {/* Gradient overlay for better text contrast and depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/15 to-transparent opacity-70 group-hover:opacity-80 transition-opacity duration-500" />
              {/* Subtle top gradient for depth */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/25 to-transparent opacity-60" />
              {/* Shine effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer transition-opacity duration-500" />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal/20 to-teal/10">
              <span className="text-5xl">🏔️</span>
            </div>
          )}
        </div>

        {/* Trail Content */}
        <div className="flex-1 flex flex-col px-1">
          {/* Title and Difficulty Badge */}
          <div className="mb-4">
            <h3 className="text-heading-3 text-teal mb-3 leading-tight">{trail.name}</h3>
            <span className={`difficulty-badge ${getDifficultyClass(trail.level)}`}>
              <span>{trail.level}</span>
            </span>
          </div>
          
          {/* Description */}
          <p className="text-gray-700 mb-6 leading-relaxed flex-1 text-[15px]">
            {trail.description}
          </p>

          {/* Trail Details with Icons */}
          <div className="space-y-3.5 pt-6 border-t border-gray-200/70 mb-6">
            <div className="flex items-center gap-3.5">
              <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-teal/15 to-teal/10 flex items-center justify-center backdrop-blur-sm border border-teal/10">
                <span className="text-base">⛰️</span>
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                  Elevación
                </span>
                <span className="text-sm text-gray-800 font-semibold">
                  {trail.elevation}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3.5">
              <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-teal/15 to-teal/10 flex items-center justify-center backdrop-blur-sm border border-teal/10">
                <span className="text-base">📏</span>
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                  Distancia
                </span>
                <span className="text-sm text-gray-800 font-semibold">
                  {trail.distance}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-gray-200/70 space-y-3">
            {/* Directions Button */}
            <Button
              variant="secondary"
              size="md"
              onClick={() => window.open(trail.mapsUrl, '_blank', 'noopener,noreferrer')}
              className="w-full"
            >
              🗺️ Cómo llegar
            </Button>

            {/* Completion Button */}
            {onToggleCompletion && (
              <Button
                variant={isCompleted ? 'success' : 'primary'}
                size="md"
                onClick={handleCompletionClick}
                className="w-full"
              >
                {isCompleted ? '✓ Completado' : 'Marcar como completado'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
    </div>
  );
}

