import { useState, useEffect } from 'react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { PlanRestrictedContent } from '../components/plan/PlanRestrictedContent';
import { Card } from '../components/ui/Card';
import { AlbumCard } from '../components/gallery/AlbumCard';
import { getAlbumImageCounts } from '../lib/gallery';

export function GalleryPage() {
  const [imageCounts, setImageCounts] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadImageCounts();
  }, []);

  const loadImageCounts = async () => {
    try {
      setLoading(true);
      setError(null);
      const counts = await getAlbumImageCounts();
      setImageCounts(counts);
    } catch (err: any) {
      setError(err.message || 'Error al cargar la galería');
      console.error('Error loading image counts:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream px-4 py-8 md:px-8 pt-20 md:pt-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-20">
            <div className="inline-block w-12 h-12 border-4 border-teal border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-600">Cargando galería...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PlanRestrictedContent requiredPlan="basico" upgradeToPlan="basico">
      <div className="min-h-screen bg-cream px-4 py-8 md:px-8 pt-20 md:pt-12">
        <div className="max-w-6xl mx-auto">
          <SectionHeader label="Galería" icon="📸" />
          <h1 className="text-heading-1 text-teal mb-14 md:mb-16 text-center">
            Galería de Imágenes
          </h1>

          {error && (
            <Card variant="elevated" className="mb-6 bg-red-50 border-red-200">
              <p className="text-red-700">{error}</p>
              <button
                onClick={loadImageCounts}
                className="mt-2 text-teal hover:text-teal-600 font-semibold"
              >
                Intentar de nuevo
              </button>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
              <AlbumCard
                key={month}
                month={month}
                imageCount={imageCounts[month] || 0}
              />
            ))}
          </div>
        </div>
      </div>
    </PlanRestrictedContent>
  );
}

