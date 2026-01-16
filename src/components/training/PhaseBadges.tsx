import { Card } from '../ui/Card';
import { getPhaseByNumber } from '../../lib/trainingData';

interface PhaseBadgesProps {
  completedPhaseNumbers: number[];
  isSpanishPhase?: boolean;
}

export function PhaseBadges({ 
  completedPhaseNumbers, 
  isSpanishPhase = false 
}: PhaseBadgesProps) {
  // Don't render if no badges earned
  if (completedPhaseNumbers.length === 0) {
    return null;
  }

  // Phase badge colors (Option 5 - vibrant journey colors)
  const badgeColors: Record<number, string> = {
    1: 'bg-yellow-200', // Light yellow - Phase 1: Adaptación
    2: 'bg-emerald-300', // Mint green - Phase 2: Aumento Progresivo
    3: 'bg-blue-400', // Light blue - Phase 3: Consolidación
    4: 'bg-pink-400', // Pink - Phase 4: Resistencia Avanzada
    5: 'bg-purple-400', // Purple - Phase 5: Preparación Máxima
  };

  // Sort phases to display in order
  const sortedPhases = [...completedPhaseNumbers].sort((a, b) => a - b);

  return (
    <Card variant="elevated" className="mb-6">
      <div className="text-center">
        <h2 className="text-heading-3 text-teal mb-6">
          {isSpanishPhase ? 'Conchas Ganadas' : 'Earned Shells'}
        </h2>
        
        <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6">
          {sortedPhases.map((phaseNumber) => {
            const phase = getPhaseByNumber(phaseNumber);
            const phaseName = phase ? (isSpanishPhase ? phase.name : `Phase ${phaseNumber}`) : `Phase ${phaseNumber}`;
            const bgColor = badgeColors[phaseNumber] || 'bg-gray-300';

            return (
              <div
                key={phaseNumber}
                className="group relative"
                title={phaseName}
              >
                <div
                  className={`
                    ${bgColor}
                    w-16 h-16 md:w-20 md:h-20
                    rounded-full
                    flex items-center justify-center
                    text-3xl md:text-4xl
                    shadow-md
                    transition-transform duration-200
                    hover:scale-110
                    hover:shadow-lg
                  `}
                >
                  <img 
                    src="/shell-icon.svg" 
                    alt="Shell icon" 
                    className="w-10 h-10 md:w-12 md:h-12 object-contain"
                  />
                </div>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-teal text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                  {phaseName}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                    <div className="border-4 border-transparent border-t-teal"></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-sm text-gray-600 mt-6">
          {isSpanishPhase 
            ? `${completedPhaseNumbers.length} de 5 fases completadas`
            : `${completedPhaseNumbers.length} of 5 phases completed`
          }
        </p>
      </div>
    </Card>
  );
}

