import { Card } from '../ui/Card';
import { ProgressRing } from '../ui/ProgressRing';
import { getWeekByNumber, getCurrentPhase } from '../../lib/trainingData';
import type { WalkCompletion } from '../../types';

interface CurrentWeekCardProps {
  weekNumber: number;
  completions: WalkCompletion[];
  onToggleCompletion: (day: string, distance: number, completed: boolean) => Promise<void>;
}

export function CurrentWeekCard({
  weekNumber,
  completions,
  onToggleCompletion,
}: CurrentWeekCardProps) {
  const week = getWeekByNumber(weekNumber);
  const phase = getCurrentPhase(weekNumber);
  const isSpanishPhase = phase?.number ? phase.number <= 5 : false;

  if (!week) {
    return (
      <Card>
        <p className="text-gray-700">{isSpanishPhase ? 'Datos de semana no encontrados' : 'Week data not found'}</p>
      </Card>
    );
  }

  const completedDays = completions.map((c) => c.day_of_week);
  const completedCount = completedDays.length;
  const totalDays = week.days.length;
  const progress = totalDays > 0 ? (completedCount / totalDays) * 100 : 0;

  const getEncouragingMessage = () => {
    if (isSpanishPhase) {
      if (progress === 0) {
        return "¡Tú puedes! Cada paso cuenta. 🌟";
      } else if (progress < 50) {
        return "¡Gran comienzo! ¡Mantén el impulso! 💪";
      } else if (progress < 100) {
        return "¡Lo estás haciendo increíble! ¡Casi terminas! ✨";
      } else {
        return "¡Felicidades! ¡Semana completada! 🎉";
      }
    } else {
      if (progress === 0) {
        return "You've got this! Every step counts. 🌟";
      } else if (progress < 50) {
        return "Great start! Keep up the momentum! 💪";
      } else if (progress < 100) {
        return "You're doing amazing! Almost there! ✨";
      } else {
        return "Congratulations! Week complete! 🎉";
      }
    }
  };

  const isDayCompleted = (dayName: string) => {
    return completedDays.includes(dayName);
  };

  const getDayName = (dayName: string) => {
    if (!isSpanishPhase) return dayName;
    const dayMap: Record<string, string> = {
      'Monday': 'Lunes',
      'Tuesday': 'Martes',
      'Wednesday': 'Miércoles',
      'Thursday': 'Jueves',
      'Friday': 'Viernes',
      'Saturday': 'Sábado',
      'Sunday': 'Domingo'
    };
    return dayMap[dayName] || dayName;
  };

  return (
    <Card variant="accent" className="mb-6">
      <div className="mb-8">
        <h2 className="text-heading-2 text-teal mb-3">
          {isSpanishPhase ? `Semana ${weekNumber}` : `Week ${weekNumber}`}
        </h2>
        {phase && (
          <p className="text-lg text-gray-600 font-semibold">
            {phase.name}
          </p>
        )}
      </div>

      <div className="mb-10">
        <p className="text-xl text-gray-700 mb-2">
          <span className="font-bold">{isSpanishPhase ? 'Meta Semanal:' : 'Weekly Target:'}</span> {week.weeklyTotal} km
        </p>
      </div>

      {/* Visual separator */}
      <div className="mb-8 h-px bg-gradient-to-r from-transparent via-rose/20 to-transparent"></div>

      <div className="flex flex-col items-center mb-10">
        <ProgressRing progress={progress} size={120} strokeWidth={8} />
        <p className="mt-6 text-center text-gray-700 font-semibold text-lg">
          {isSpanishPhase 
            ? `${completedCount} de ${totalDays} caminatas completadas`
            : `${completedCount} of ${totalDays} walks completed`}
        </p>
      </div>

      <div className="text-center mb-10">
        <p className="text-xl font-bold text-teal">
          {getEncouragingMessage()}
        </p>
      </div>

      <div className="mb-10">
        <h3 className="text-heading-3 text-gray-700 mb-6">{isSpanishPhase ? 'Caminatas de Esta Semana' : "This Week's Walks"}</h3>
        <div className="space-y-5">
          {week.days.map((day, index) => {
            const completed = isDayCompleted(day.day);
            return (
              <div
                key={index}
                className={`flex items-center justify-between p-6 rounded-2xl transition-all duration-300 min-h-[80px] ${
                  completed
                    ? 'walk-card-completed'
                    : 'walk-card-pending'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-5">
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                        completed
                          ? 'checkbox-completed'
                          : 'checkbox-pending'
                      }`}
                      onClick={() => onToggleCompletion(day.day, day.distance, completed)}
                    >
                      {completed && (
                        <span className="text-teal text-2xl font-bold drop-shadow-sm">✓</span>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-lg text-gray-800 mb-1">{getDayName(day.day)}</p>
                      <p className="text-base text-gray-600 font-semibold mb-1">{day.distance} km</p>
                      <p className="text-sm text-gray-500">{day.focus}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

