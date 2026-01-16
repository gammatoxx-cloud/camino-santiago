import { Card } from '../ui/Card';
import type { VideoInsignia } from '../../types';
import { formatVideoRequirement } from '../../lib/videoInsigniasData';

interface VideoInsigniaCardProps {
  insignia: VideoInsignia;
  isEarned: boolean;
}

export function VideoInsigniaCard({ insignia, isEarned }: VideoInsigniaCardProps) {
  const requirementText = formatVideoRequirement(insignia);

  return (
    <Card
      variant="elevated"
      className={`relative transition-all duration-300 ${
        isEarned ? '' : 'opacity-60'
      }`}
    >
      {/* Earned badge indicator */}
      {isEarned && (
        <div className="absolute top-4 right-4 w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-teal/20 to-teal/30 border-2 border-teal/50 flex items-center justify-center shadow-lg z-10">
          <span className="text-teal text-xl md:text-2xl">🏆</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
        {/* Insignia Image */}
        <div className={`flex-shrink-0 ${isEarned ? '' : 'grayscale'}`}>
          <img
            src={insignia.image}
            alt={insignia.title}
            className="w-32 h-32 md:w-40 md:h-40 object-contain drop-shadow-lg"
          />
        </div>

        {/* Content */}
        <div className="flex-1 text-center md:text-left min-w-0">
          <div className="mb-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal/10 border border-teal/20 mb-3">
              <span className="text-sm md:text-base font-bold text-teal">
                {requirementText}
              </span>
            </div>
          </div>

          <h3
            className={`text-heading-3 mb-3 md:mb-4 font-bold ${
              isEarned ? 'text-teal' : 'text-gray-500'
            }`}
          >
            {insignia.title}
          </h3>

          <p className="text-gray-700 text-base md:text-lg leading-relaxed">
            {insignia.description}
          </p>
        </div>
      </div>
    </Card>
  );
}
