import type { MagnoliasHike } from '../../types';

interface MagnoliasHikeCardProps {
  hike: MagnoliasHike;
  isCompleted: boolean;
  onToggleCompletion: (hikeId: string, completed: boolean) => void;
}

export function MagnoliasHikeCard({
  hike,
  isCompleted,
  onToggleCompletion,
}: MagnoliasHikeCardProps) {
  const handleCompletionClick = () => {
    onToggleCompletion(hike.id, !isCompleted);
  };

  return (
    <div
      className={`flex items-center justify-between p-5 md:p-6 rounded-2xl transition-all duration-300 min-h-[80px] ${
        isCompleted ? 'walk-card-completed' : 'walk-card-pending'
      }`}
    >
      <div className="flex-1">
        <div className="flex items-center gap-4 md:gap-5">
          <div
            className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center cursor-pointer transition-all ${
              isCompleted ? 'checkbox-completed' : 'checkbox-pending'
            }`}
            onClick={handleCompletionClick}
          >
            {isCompleted && (
              <span className="text-teal text-xl md:text-2xl font-bold drop-shadow-sm">
                ✓
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-lg md:text-xl text-gray-800 mb-1">
              Caminata {hike.numero}
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-1">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Distancia:</span>
                <span className="text-base md:text-lg text-gray-700 font-semibold">
                  {hike.distancia}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Duración estimada:</span>
                <span className="text-base md:text-lg text-gray-700 font-semibold">
                  {hike.duracion_estimada}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
