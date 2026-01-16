import { StepCard } from '../ui/StepCard';
import { ProgressBar } from '../ui/ProgressBar';
import { getPhaseByNumber } from '../../lib/trainingData';
import { Phase1TipsCards } from './Phase1TipsCards';
import { Phase2TipsCards } from './Phase2TipsCards';
import { Phase3TipsCards } from './Phase3TipsCards';
import { Phase4TipsCards } from './Phase4TipsCards';
import { Phase5TipsCards } from './Phase5TipsCards';

interface CurrentPhaseCardProps {
  phaseNumber: number;
  currentWeek: number;
}

export function CurrentPhaseCard({ phaseNumber, currentWeek }: CurrentPhaseCardProps) {
  const phase = getPhaseByNumber(phaseNumber);

  if (!phase) {
    return null;
  }

  const phaseStartWeek = Math.min(...phase.weeks);
  const phaseEndWeek = Math.max(...phase.weeks);
  const weeksCompleted = currentWeek - phaseStartWeek + 1;
  const totalWeeks = phaseEndWeek - phaseStartWeek + 1;
  const phaseProgress = (weeksCompleted / totalWeeks) * 100;

  const phaseIcons: Record<number, string> = {
    1: '🌱',
    2: '🌿',
    3: '🌳',
    4: '⛰️',
    5: '🏆',
  };

  return (
    <StepCard
      stepNumber={phaseNumber}
      icon={phaseIcons[phaseNumber] || '📋'}
      title={phaseNumber <= 5 ? `Fase ${phaseNumber}: ${phase.name}` : `Phase ${phaseNumber}: ${phase.name}`}
      description={phase.description}
      className="mb-6"
    >
      <div className="mb-8">
        <p className="text-sm text-gray-600 mb-6">
          {phaseNumber <= 5 ? `Semanas ${phaseStartWeek}-${phaseEndWeek}` : `Weeks ${phaseStartWeek}-${phaseEndWeek}`}
        </p>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">{phaseNumber <= 5 ? 'Objetivos' : 'Goals'}</h3>
        <ul className="space-y-3 text-gray-700 leading-relaxed">
          {phase.goals.map((goal, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-rose mt-2.5"></span>
              <span>{goal}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Visual separator */}
      <div className="mb-8 h-px bg-gradient-to-r from-transparent via-rose/20 to-transparent"></div>

      {phaseNumber === 1 ? (
        <Phase1TipsCards />
      ) : phaseNumber === 2 ? (
        <Phase2TipsCards />
      ) : phaseNumber === 3 ? (
        <Phase3TipsCards />
      ) : phaseNumber === 4 ? (
        <Phase4TipsCards />
      ) : phaseNumber === 5 ? (
        <Phase5TipsCards />
      ) : (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Key Learning</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700 leading-relaxed">
            {phase.learning.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mb-4">
        <ProgressBar
          progress={phaseProgress}
          label={phaseNumber <= 5
            ? `Progreso de Fase: ${weeksCompleted} de ${totalWeeks} semanas completadas`
            : `Phase Progress: ${weeksCompleted} of ${totalWeeks} weeks complete`}
        />
      </div>
    </StepCard>
  );
}

