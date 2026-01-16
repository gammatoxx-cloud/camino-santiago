import { Card } from '../ui/Card';

interface TeamStatsCardProps {
  totalDistance: number | null; // null = loading, 0 = no walks
  loading?: boolean;
  className?: string;
}

export function TeamStatsCard({ totalDistance, loading = false, className = '' }: TeamStatsCardProps) {
  // Handle loading state
  if (loading || totalDistance === null) {
    return (
      <Card variant="elevated" className={`mb-6 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="inline-block w-8 h-8 border-4 border-teal border-t-transparent rounded-full animate-spin" />
        </div>
      </Card>
    );
  }

  // Format the distance (always show at least 1 decimal place)
  const formattedDistance = totalDistance.toFixed(1);

  return (
    <Card variant="elevated" className={`mb-6 ${className}`}>
      <div className="flex flex-col items-center justify-center py-6 md:py-8">
        {/* Icon */}
        <div className="mb-4 text-4xl md:text-5xl">🚶</div>
        
        {/* Distance Number */}
        <div className="text-4xl md:text-5xl font-bold text-teal mb-2">
          {formattedDistance} km
        </div>
        
        {/* Label */}
        <div className="text-base md:text-lg font-medium text-gray-700">
          Total del Equipo
        </div>
        
        {/* Subtle description for mobile */}
        <div className="mt-2 text-sm text-gray-500 text-center max-w-xs">
          Suma de todos los kilómetros caminados por los miembros del equipo
        </div>
      </div>
    </Card>
  );
}
