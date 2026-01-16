import { useState } from 'react';
import type { GalleryImage } from '../../lib/gallery';

interface ImageCardProps {
  image: GalleryImage;
  onClick: () => void;
}

export function ImageCard({ image, onClick }: ImageCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <button
      onClick={onClick}
      className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 group cursor-pointer transition-transform duration-200 hover:scale-105 active:scale-95"
    >
      {!imageError ? (
        <>
          <img
            src={image.image_url}
            alt={image.caption || 'Imagen de galería'}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          {image.caption && (
            <div className="absolute bottom-0 left-0 right-0 p-3 text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 line-clamp-2">
              {image.caption}
            </div>
          )}
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal/20 to-teal/10">
          <span className="text-4xl">📷</span>
        </div>
      )}
    </button>
  );
}

