import React from 'react';
import { StepCard } from '../ui/StepCard';
import { getPhaseByNumber } from '../../lib/trainingData';

interface NextPhaseCardProps {
  nextPhaseNumber: number;
  currentPhaseNumber: number;
}

export function NextPhaseCard({ nextPhaseNumber, currentPhaseNumber }: NextPhaseCardProps) {
  const nextPhase = getPhaseByNumber(nextPhaseNumber);

  if (!nextPhase) {
    return null;
  }

  const isLocked = nextPhaseNumber > currentPhaseNumber + 1;

  const phaseIcons: Record<number, string> = {
    1: '🌱',
    2: '🌿',
    3: '🌳',
    4: '⛰️',
    5: '🏆',
  };

  const isSpanishPhase = nextPhaseNumber <= 5;

  return (
    <StepCard
      stepNumber={nextPhaseNumber}
      icon={isLocked ? '🔒' : (phaseIcons[nextPhaseNumber] || '📋')}
      title={isSpanishPhase ? `Fase ${nextPhaseNumber}: ${nextPhase.name}` : `Phase ${nextPhaseNumber}: ${nextPhase.name}`}
      description={nextPhase.description}
      className={`mb-6 ${isLocked ? 'opacity-70' : ''}`}
    >
      {isLocked && (
        <div className="mb-4">
          <p className="text-gray-600 font-semibold mb-4">
            {isSpanishPhase 
              ? `Completa la Fase ${currentPhaseNumber} para desbloquear`
              : `Complete Phase ${currentPhaseNumber} to unlock`
            }
          </p>
          <div className="bg-teal/10 border-2 border-teal/20 rounded-xl p-5">
            <p className="text-teal font-bold text-lg">
              {isSpanishPhase ? 'Próximamente: ' : 'Coming up: '}{nextPhase.goals[0]}
            </p>
          </div>
        </div>
      )}
    </StepCard>
  );
}

