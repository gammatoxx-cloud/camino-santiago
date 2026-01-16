import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Button } from './Button';
import { Card } from './Card';
import type { Area, Point } from 'react-easy-crop';

interface ImageCropModalProps {
  imageSrc: string;
  onClose: () => void;
  onCropComplete: (croppedImageFile: File) => void;
  aspectRatio?: number;
}

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area
): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    img.onload = () => resolve(img);
    img.onerror = reject;
  });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  // Set canvas size to match the crop area
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Draw the cropped portion of the image
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Canvas is empty'));
        return;
      }
      resolve(blob);
    }, 'image/jpeg', 0.95);
  });
}

export function ImageCropModal({
  imageSrc,
  onClose,
  onCropComplete,
  aspectRatio = 1,
}: ImageCropModalProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);

  const onCropChange = useCallback((crop: Point) => {
    setCrop(crop);
  }, []);

  const onZoomChange = useCallback((zoom: number) => {
    setZoom(zoom);
  }, []);

  const onCropCompleteCallback = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleSave = async () => {
    if (!croppedAreaPixels) return;

    setProcessing(true);
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      const croppedFile = new File([croppedBlob], 'cropped-image.jpg', {
        type: 'image/jpeg',
        lastModified: Date.now(),
      });
      onCropComplete(croppedFile);
    } catch (error) {
      console.error('Error cropping image:', error);
      alert('Error al recortar la imagen. Por favor, inténtalo de nuevo.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card variant="elevated" className="max-w-2xl w-full max-h-[90vh] flex flex-col">
        <h3 className="text-heading-2 text-teal mb-4">
          Recortar Foto de Perfil
        </h3>
        
        <div className="relative w-full" style={{ height: '400px', minHeight: '300px' }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropCompleteCallback}
            style={{
              containerStyle: {
                width: '100%',
                height: '100%',
                position: 'relative',
                background: '#f5f5f5',
                borderRadius: '12px',
              },
            }}
          />
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Zoom
            </label>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="flex gap-4">
            <Button
              onClick={onClose}
              variant="ghost"
              size="md"
              className="flex-1"
              disabled={processing}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              variant="primary"
              size="md"
              className="flex-1"
              disabled={processing || !croppedAreaPixels}
            >
              {processing ? 'Procesando...' : 'Guardar'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

