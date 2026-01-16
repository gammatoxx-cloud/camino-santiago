import { useId } from 'react';
import { Card } from '../ui/Card';
import { getPhaseByNumber } from '../../lib/trainingData';

interface ScoreCardProps {
  totalScore: number;
  walkPoints: number;
  phaseCount: number;
  completedPhaseNumbers?: number[];
  isSpanishPhase?: boolean;
}

export function ScoreCard({ 
  totalScore, 
  walkPoints, 
  phaseCount,
  completedPhaseNumbers = [],
  isSpanishPhase = false 
}: ScoreCardProps) {
  // Phase badge colors (Option 5 - vibrant journey colors)
  const badgeColors: Record<number, { bg: string; glow: string; border: string }> = {
    1: { bg: 'bg-yellow-200', glow: 'shadow-yellow-300/50', border: 'border-yellow-300' }, // Phase 1: Adaptación
    2: { bg: 'bg-emerald-300', glow: 'shadow-emerald-300/50', border: 'border-emerald-300' }, // Phase 2: Aumento Progresivo
    3: { bg: 'bg-blue-400', glow: 'shadow-blue-400/50', border: 'border-blue-400' }, // Phase 3: Consolidación
    4: { bg: 'bg-pink-400', glow: 'shadow-pink-400/50', border: 'border-pink-400' }, // Phase 4: Resistencia Avanzada
    5: { bg: 'bg-purple-400', glow: 'shadow-purple-400/50', border: 'border-purple-400' }, // Phase 5: Preparación Máxima
  };

  // Sort phases to display in order
  const sortedPhases = [...completedPhaseNumbers].sort((a, b) => a - b);
  const totalPhases = 5;
  const completedCount = completedPhaseNumbers.length;
  const progressPercentage = (completedCount / totalPhases) * 100;
  const gradientId = useId();

  return (
    <Card variant="elevated" className="mb-6 score-card-enhanced !p-4 md:!p-5">
      {/* Header */}
      <h2 className="text-heading-3 text-teal mb-4 text-center">
        {isSpanishPhase ? 'Tu Puntuación' : 'Your Score'}
      </h2>
      
      {/* Three-Column Horizontal Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-4 items-center">
        {/* Left Column: Main Score */}
        <div className="text-center md:text-left min-w-0">
          <div className="text-4xl md:text-5xl font-bold bg-gradient-to-br from-teal-600 via-teal-500 to-teal-400 bg-clip-text text-transparent mb-1 animate-score-appear">
            {totalScore.toLocaleString()}
          </div>
          <p className="text-sm md:text-base text-gray-600 font-semibold">
            {isSpanishPhase ? 'puntos' : 'points'}
          </p>
        </div>

        {/* Center Column: Breakdown Badges (Horizontal Inline) */}
        <div className="flex items-center justify-center md:justify-center gap-3 md:gap-3 min-w-0">
          {/* Caminatas Badge */}
          <div className="relative group flex-1 max-w-[130px] md:max-w-[120px]">
            <div className="glass-badge-stat p-3 rounded-xl backdrop-blur-md bg-gradient-to-br from-white/70 via-white/50 to-emerald-50/30 border border-white/40 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
              <div className="flex flex-col items-center justify-center space-y-1">
                <div className="text-lg md:text-xl">🚶</div>
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                  {isSpanishPhase ? 'Caminatas' : 'Walks'}
                </p>
                <p className="text-lg md:text-xl font-bold text-teal">
                  {walkPoints.toLocaleString()} km
                </p>
              </div>
            </div>
          </div>
          
          {/* Fases Badge */}
          <div className="relative group flex-1 max-w-[130px] md:max-w-[120px]">
            <div className="glass-badge-stat p-3 rounded-xl backdrop-blur-md bg-gradient-to-br from-white/70 via-white/50 to-amber-50/30 border border-white/40 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
              <div className="flex flex-col items-center justify-center space-y-1">
                <div className="text-lg md:text-xl">🏆</div>
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                  {isSpanishPhase ? 'Fases' : 'Phases'}
                </p>
                <p className="text-lg md:text-xl font-bold text-teal">
                  {phaseCount.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Progress & Shells */}
        {sortedPhases.length > 0 ? (
          <div className="flex flex-col items-center justify-center min-w-0">
            {/* Progress Ring with Shells - Horizontal on mobile, vertical on desktop */}
            <div className="flex flex-row md:flex-col items-center gap-2 md:gap-3">
              {/* Progress Ring */}
              <div className="relative w-20 h-20 md:w-20 md:h-20 flex-shrink-0">
                <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 100 100">
                  {/* Background circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="rgba(12, 76, 109, 0.1)"
                    strokeWidth="6"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke={`url(#${gradientId})`}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 42}`}
                    strokeDashoffset={`${2 * Math.PI * 42 * (1 - progressPercentage / 100)}`}
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#0c4c6d" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#1a80a4" stopOpacity="0.6" />
                    </linearGradient>
                  </defs>
                </svg>
                {/* Center text */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-sm md:text-base font-bold text-teal leading-tight">{completedCount}</div>
                    <div className="text-[10px] md:text-[10px] text-gray-500 leading-tight">/ {totalPhases}</div>
                  </div>
                </div>
              </div>

              {/* Shell Badges - Compact Row */}
              <div className="flex items-center gap-1 md:gap-1.5">
                {[1, 2, 3, 4, 5].map((phaseNumber) => {
                  const isCompleted = sortedPhases.includes(phaseNumber);
                  const phase = getPhaseByNumber(phaseNumber);
                  const phaseName = phase ? (isSpanishPhase ? phase.name : `Phase ${phaseNumber}`) : `Phase ${phaseNumber}`;
                  const colors = badgeColors[phaseNumber] || { bg: 'bg-gray-300', glow: 'shadow-gray-300/50', border: 'border-gray-300' };

                  return (
                    <div
                      key={phaseNumber}
                      className="group relative"
                      title={phaseName}
                    >
                      <div
                        className={`
                          ${isCompleted ? colors.bg : 'bg-gray-100'}
                          ${isCompleted ? colors.border : 'border-gray-200'}
                          w-10 h-10 md:w-10 md:h-10
                          rounded-full
                          flex items-center justify-center
                          text-base md:text-base
                          border-2
                          ${isCompleted ? 'shadow-md' : 'shadow-sm'}
                          ${isCompleted ? 'opacity-100' : 'opacity-40'}
                          transition-all duration-300
                          ${isCompleted ? 'hover:scale-110 hover:shadow-lg' : ''}
                          ${isCompleted ? 'cursor-pointer' : 'cursor-default'}
                        `}
                      >
                        <img 
                          src="/shell-icon.svg" 
                          alt="Shell icon" 
                          className="w-6 h-6 md:w-6 md:h-6 object-contain"
                        />
                      </div>
                      {/* Tooltip */}
                      {isCompleted && (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-teal text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 shadow-lg">
                          {phaseName}
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                            <div className="border-4 border-transparent border-t-teal"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center min-w-0">
            <p className="text-sm text-gray-400 italic">
              {isSpanishPhase ? 'Completa fases para ver progreso' : 'Complete phases to see progress'}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}

