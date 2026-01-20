import { Link } from 'react-router-dom';
import { Card } from '../ui/Card';

interface ResourceCardProps {
  to: string;
  icon: string;
  title: string;
  description?: string;
}

export function ResourceCard({ to, icon, title, description }: ResourceCardProps) {
  return (
    <Link to={to} className="block h-full">
      <Card
        variant="elevated"
        className="h-full hover:shadow-glass-elevated transition-all duration-300 hover:-translate-y-1 cursor-pointer"
      >
        <div className="flex flex-col items-center text-center h-full">
          <div className="mb-4 md:mb-6">
            {icon.endsWith('.svg') || icon.endsWith('.png') || icon.endsWith('.jpg') || icon.endsWith('.webp') ? (
              <img 
                src={icon.startsWith('/') ? icon : `/${icon}`}
                alt={title}
                className="w-16 h-16 md:w-20 md:h-20 object-contain"
              />
            ) : (
              <div className="text-6xl md:text-7xl">{icon}</div>
            )}
          </div>
          <h3 className="text-heading-3 text-teal mb-3 md:mb-4 font-bold">
            {title}
          </h3>
          {description && (
            <p className="text-gray-700 text-sm md:text-base leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </Card>
    </Link>
  );
}

