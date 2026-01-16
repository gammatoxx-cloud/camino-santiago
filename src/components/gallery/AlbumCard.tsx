import React from 'react';
import { Card } from '../ui/Card';
import { useNavigate } from 'react-router-dom';

interface AlbumCardProps {
  month: number;
  imageCount: number;
  thumbnailUrl?: string;
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

export function AlbumCard({ month, imageCount, thumbnailUrl }: AlbumCardProps) {
  const navigate = useNavigate();
  const monthName = monthNames[month - 1];

  const handleClick = () => {
    navigate(`/gallery/${month}`);
  };

  return (
    <Card variant="elevated" onClick={handleClick} className="cursor-pointer overflow-hidden">
      <div className="flex flex-col h-full">
        {/* Thumbnail */}
        <div className="relative w-full h-48 md:h-56 mb-4 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={monthName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal/20 to-teal/10">
              <span className="text-6xl">📸</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
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

