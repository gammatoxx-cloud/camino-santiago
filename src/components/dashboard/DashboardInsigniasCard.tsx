import { Link } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';
import type { Insignia } from '../../types';

interface DashboardInsigniasCardProps {
  earnedInsignias: Insignia[];
  totalInsignias: number;
}

export function DashboardInsigniasCard({
  earnedInsignias,
  totalInsignias,
}: DashboardInsigniasCardProps) {
  const earnedCount = earnedInsignias?.length || 0;
  const progress = totalInsignias > 0 ? (earnedCount / totalInsignias) * 100 : 0;

  return (
    <Card variant="elevated" className="!p-6 md:!p-6 relative overflow-hidden">
      {/* Decorative background accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-rose/5 to-transparent rounded-full blur-3xl -z-0"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-teal">
            Tus Insignias
          </h2>
          <Link to="/insignias">
            <Button variant="ghost" size="sm">
              Ver Todo →
            </Button>
          </Link>
        </div>

        {/* Count Display */}
        <div className="mb-6 p-5 md:p-6 rounded-2xl bg-gradient-to-br from-rose/8 via-rose/5 to-rose/3 border border-rose/15">
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-rose/15 mb-3">
              <span className="text-xl md:text-2xl">🏅</span>
            </div>
            <div className="text-3xl md:text-4xl font-bold text-teal mb-2">
              {earnedCount} de {totalInsignias}
            </div>
            <p className="text-sm md:text-base text-gray-700 font-semibold">
              Insignias ganadas
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <ProgressBar
              progress={progress}
              label=""
            />
          </div>
        </div>

        {/* Badge Gallery or Empty State */}
        {earnedCount > 0 ? (
          <div>
            <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-4">
              Insignias Ganadas
            </h3>
            
            {/* Horizontal scrollable gallery for mobile, grid for desktop */}
            <div className="overflow-x-auto md:overflow-x-visible -mx-6 md:mx-0 px-6 md:px-0">
              <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-6 min-w-max md:min-w-0">
                {earnedInsignias.map((insignia) => (
                  <Link
                    key={insignia.etapa}
                    to="/insignias"
                    className="flex-shrink-0 group"
                  >
                    <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-gradient-to-br from-white/90 to-white/70 border-2 border-rose/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:border-rose/40 flex items-center justify-center overflow-hidden">
                      <img
                        src={insignia.image}
                        alt={`Insignia Etapa ${insignia.etapa}`}
                        className="w-full h-full object-contain p-2"
                      />
                      {/* Etapa number badge */}
                      <div className="absolute top-2 right-2 w-6 h-6 md:w-7 md:h-7 rounded-full bg-teal/90 text-white text-xs md:text-sm font-bold flex items-center justify-center shadow-md">
                        {insignia.etapa}
                      </div>
                    </div>
                    {/* Tooltip on hover (desktop) */}
                    <div className="hidden md:block mt-2 text-center">
                      <p className="text-xs font-semibold text-gray-700 group-hover:text-teal transition-colors">
                        Etapa {insignia.etapa}
                      </p>
                      <p className="text-xs text-gray-500 truncate max-w-[100px]">
                        {insignia.title}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-5xl md:text-6xl mb-4 opacity-50">🏅</div>
            <p className="text-gray-700 mb-2 text-base md:text-lg font-semibold">
              Aún no has ganado insignias
            </p>
            <p className="text-gray-600 mb-6 text-sm md:text-base">
              Completa todas las caminatas de una etapa en Caminatas Magnolias para ganar una insignia
            </p>
            <Link to="/magnolias-hikes">
              <Button variant="primary" size="md">
                Ver Caminatas Magnolias
              </Button>
            </Link>
          </div>
        )}
      </div>
    </Card>
  );
}