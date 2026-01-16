import { Link } from 'react-router-dom';
import { Card } from '../ui/Card';
import { ProgressRing } from '../ui/ProgressRing';
import { ProgressBar } from '../ui/ProgressBar';
import { Button } from '../ui/Button';
import type { Phase } from '../../types';

interface DashboardTrainingCardProps {
  totalScore: number;
  walkPoints: number;
  currentWeek: number;
  currentPhase: Phase | null;
  completedWalksThisWeek: number;
  totalWalksThisWeek: number;
  phaseProgress: number;
  weekProgress: number;
}

export function DashboardTrainingCard({
  totalScore,
  walkPoints,
  currentWeek,
  currentPhase,
  completedWalksThisWeek,
  totalWalksThisWeek,
  phaseProgress,
  weekProgress,
}: DashboardTrainingCardProps) {
  return (
    <Card variant="elevated" className="!p-6 md:!p-6 relative overflow-hidden">
      {/* Decorative background accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal/5 to-transparent rounded-full blur-3xl -z-0"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-teal">
            Tu Progreso de Entrenamiento
          </h2>
          <Link to="/training">
            <Button variant="ghost" size="sm">
              Ver Todo →
            </Button>
          </Link>
        </div>

        {/* Score Summary - Redesigned with vertical mobile layout */}
        <div className="mb-6 md:mb-6 p-5 md:p-6 rounded-2xl bg-gradient-to-br from-teal/8 via-teal/5 to-teal/3 border border-teal/15">
          {/* Total Score - Prominent */}
          <div className="text-center mb-5 md:mb-6 pb-5 md:pb-6 border-b border-teal/20">
            <div className="inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-teal/15 mb-3">
              <span className="text-xl md:text-2xl">🏆</span>
            </div>
            <div className="text-4xl md:text-5xl font-bold text-teal mb-2">
              {totalScore.toLocaleString()}
            </div>
            <p className="text-sm md:text-base text-gray-700 font-semibold">Puntos Totales</p>
          </div>

          {/* Secondary Stats - Stacked on mobile, horizontal on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* Walk Points */}
            <div className="text-center p-4 rounded-xl bg-white/40 backdrop-blur-sm border border-teal/10">
              <div className="inline-flex items-center justify-center w-10 h-10 md:w-11 md:h-11 rounded-full bg-teal/10 mb-2">
                <span className="text-lg md:text-xl">🚶</span>
              </div>
              <div className="text-2xl md:text-3xl font-bold text-teal mb-1">
                {walkPoints}
              </div>
              <p className="text-xs md:text-sm text-gray-600 font-medium">km caminados</p>
            </div>

            {/* Current Phase */}
            <div className="text-center p-4 rounded-xl bg-white/40 backdrop-blur-sm border border-teal/10">
              <div className="inline-flex items-center justify-center w-10 h-10 md:w-11 md:h-11 rounded-full bg-teal/10 mb-2">
                <span className="text-lg md:text-xl">📊</span>
              </div>
              <div className="text-2xl md:text-3xl font-bold text-teal mb-1">
                {currentPhase ? `Fase ${currentPhase.number}` : '-'}
              </div>
              <p className="text-xs md:text-sm text-gray-600 font-medium">fase actual</p>
            </div>
          </div>
        </div>

        {/* Current Week Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base md:text-lg font-semibold text-gray-800">
              Semana {currentWeek}
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-sm md:text-base text-gray-700 font-medium">
                {completedWalksThisWeek}/{totalWalksThisWeek} caminatas
              </span>
              <div className="progress-ring-pulse">
                <ProgressRing progress={weekProgress} size={60} strokeWidth={6} showText={false} color="#46c738" />
              </div>
            </div>
          </div>
        </div>

        {/* Current Phase Progress */}
        {currentPhase && (
          <div>
            <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3">
              Fase {currentPhase.number}: {currentPhase.name}
            </h3>
            <ProgressBar
              progress={phaseProgress}
              label=""
            />
          </div>
        )}
      </div>
    </Card>
  );
}

