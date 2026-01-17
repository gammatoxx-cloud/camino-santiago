import { Card } from '../ui/Card';
import { useNavigate } from 'react-router-dom';

interface AlbumCardProps {
  month: number;
  imageCount: number;
}

const monthNames = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const monthImagePaths = [
  '/enero.png',
  '/febrero.png',
  '/marzo.png',
  '/abril.png',
  '/mayo.png',
  '/junio.png',
  '/julio.png',
  '/agosto.png',
  '/septiembre.png',
  '/octubre.png',
  '/noviembre.png',
  '/diciembre.png',
];

export function AlbumCard({ month, imageCount }: AlbumCardProps) {
  const navigate = useNavigate();
  const monthName = monthNames[month - 1];
  const coverImagePath = monthImagePaths[month - 1];

  const handleClick = () => {
    navigate(`/gallery/${month}`);
  };

  return (
    <Card variant="elevated" onClick={handleClick} className="cursor-pointer overflow-hidden">
      <div className="flex flex-col h-full">
        {/* Thumbnail */}
        <div className="relative w-full h-48 md:h-56 mb-4 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300">
          <img
            src={coverImagePath}
            alt={monthName}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to emoji if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent && !parent.querySelector('.fallback')) {
                const fallback = document.createElement('div');
                fallback.className = 'fallback w-full h-full flex items-center justify-center bg-gradient-to-br from-teal/20 to-teal/10';
                const emoji = document.createElement('span');
                emoji.className = 'text-6xl';
                emoji.textContent = '📸';
                fallback.appendChild(emoji);
                parent.appendChild(fallback);
              }
            }}
          />
        </div>

        {/* Month Name and Count */}
        <div className="flex-1 flex flex-col justify-between">
          <h3 className="text-xl font-bold text-teal mb-2">{monthName}</h3>
          <p className="text-gray-600 text-sm">
            {imageCount === 0
              ? 'Sin imágenes'
              : imageCount === 1
              ? '1 imagen'
              : `${imageCount} imágenes`}
          </p>
        </div>
      </div>
    </Card>
  );
}

