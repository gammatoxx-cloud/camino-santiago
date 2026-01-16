import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SectionHeader } from '../ui/SectionHeader';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ImageCard } from './ImageCard';
import { ImageUploadModal } from './ImageUploadModal';
import { ImageModal } from './ImageModal';
import { fetchAlbumImages, uploadGalleryImage } from '../../lib/gallery';
import type { GalleryImage } from '../../lib/gallery';

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

export function AlbumView() {
  const { month: monthParam } = useParams<{ month: string }>();
  const navigate = useNavigate();
  const month = monthParam ? parseInt(monthParam, 10) : 1;

  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  useEffect(() => {
    if (month < 1 || month > 12) {
      navigate('/gallery');
      return;
    }
    loadImages();
  }, [month]);

  const loadImages = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedImages = await fetchAlbumImages(month);
      setImages(fetchedImages);
    } catch (err: any) {
      setError(err.message || 'Error al cargar las imágenes');
      console.error('Error loading images:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = (uploadedImages: GalleryImage[]) => {
    setImages((prev) => [...uploadedImages, ...prev]);
    loadImages(); // Reload to ensure proper ordering
  };

  const handleImageClick = (image: GalleryImage) => {
    setSelectedImage(image);
  };

  const handleImageDelete = () => {
    loadImages();
    setSelectedImage(null);
  };

  const handleImageUpdate = (updatedImage: GalleryImage) => {
    setImages((prev) => prev.map((img) => (img.id === updatedImage.id ? updatedImage : img)));
    setSelectedImage(updatedImage);
  };

  const monthName = monthNames[month - 1];

  if (loading) {
    return (
      <div className="min-h-screen bg-cream px-4 py-8 md:px-8 pt-20 md:pt-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-20">
            <div className="inline-block w-12 h-12 border-4 border-teal border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-600">Cargando imágenes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream px-4 py-8 md:px-8 pt-20 md:pt-12">
      <div className="max-w-6xl mx-auto">
        <SectionHeader label="Galería" icon="📸" />
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div>
            <button
              onClick={() => navigate('/gallery')}
              className="mb-2 text-teal hover:text-teal-600 font-semibold flex items-center gap-2"
            >
              <span>←</span>
              <span>Volver a Galería</span>
            </button>
            <h1 className="text-heading-1 text-teal">{monthName}</h1>
          </div>
          <Button variant="primary" size="md" onClick={() => setShowUploadModal(true)}>
            📤 Subir Imagen
          </Button>
        </div>

        {error && (
          <Card variant="elevated" className="mb-6 bg-red-50 border-red-200">
            <p className="text-red-700">{error}</p>
          </Card>
        )}

        {/* Images Grid */}
        {images.length === 0 ? (
          <Card variant="elevated" className="text-center py-20">
            <div className="text-6xl mb-4">📸</div>
            <h2 className="text-2xl font-bold text-teal mb-2">No hay imágenes aún</h2>
            <p className="text-gray-600 mb-6">Sé el primero en compartir una imagen de {monthName}</p>
            <Button variant="primary" size="md" onClick={() => setShowUploadModal(true)}>
              📤 Subir Primera Imagen
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <ImageCard
                key={image.id}
                image={image}
                onClick={() => handleImageClick(image)}
              />
            ))}
          </div>
        )}

        {/* Upload Modal */}
        <ImageUploadModal
          month={month}
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onUploadSuccess={handleUploadSuccess}
        />

        {/* Image Modal */}
        {selectedImage && (
          <ImageModal
            image={selectedImage}
            isOpen={!!selectedImage}
            onClose={() => setSelectedImage(null)}
            onDelete={handleImageDelete}
            onUpdate={handleImageUpdate}
          />
        )}
      </div>
    </div>
  );
}

