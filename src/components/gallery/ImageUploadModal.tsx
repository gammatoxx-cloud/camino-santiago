import React, { useState, useRef } from 'react';
import { Button } from '../ui/Button';
import { uploadGalleryImage } from '../../lib/gallery';
import type { GalleryImage } from '../../lib/gallery';

interface ImageUploadModalProps {
  month: number;
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (images: GalleryImage[]) => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export function ImageUploadModal({
  month,
  isOpen,
  onClose,
  onUploadSuccess,
}: ImageUploadModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILES = 20;

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
  const monthName = monthNames[month - 1];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate file count
    if (files.length > MAX_FILES) {
      setError(`Puedes seleccionar máximo ${MAX_FILES} imágenes a la vez.`);
      return;
    }

    // Validate all files
    const invalidFiles: string[] = [];
    files.forEach((file) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        invalidFiles.push(file.name);
      } else if (file.size > MAX_FILE_SIZE) {
        invalidFiles.push(file.name);
      }
    });

    if (invalidFiles.length > 0) {
      setError(
        `Algunos archivos no son válidos: ${invalidFiles.slice(0, 3).join(', ')}${invalidFiles.length > 3 ? '...' : ''}. Solo se permiten archivos JPG, PNG o WebP menores a ${MAX_FILE_SIZE / 1024 / 1024}MB.`
      );
      return;
    }

    setError(null);
    setSelectedFiles(files);

    // Create previews
    const previewPromises = files.map((file) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(previewPromises).then((urls) => {
      setPreviewUrls(urls);
    });
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    try {
      setUploading(true);
      setError(null);
      setUploadProgress({ current: 0, total: selectedFiles.length });

      const uploadedImages: GalleryImage[] = [];

      // Upload files sequentially to avoid overwhelming the server
      for (let i = 0; i < selectedFiles.length; i++) {
        try {
          const image = await uploadGalleryImage(month, selectedFiles[i]);
          uploadedImages.push(image);
          setUploadProgress({ current: i + 1, total: selectedFiles.length });
        } catch (err: any) {
          console.error(`Error uploading file ${i + 1}:`, err);
          // Continue with other files even if one fails
        }
      }

      if (uploadedImages.length === 0) {
        throw new Error('Error al subir las imágenes. Por favor intenta de nuevo.');
      }

      onUploadSuccess(uploadedImages);

      // Reset form
      setSelectedFiles([]);
      setPreviewUrls([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al subir las imágenes');
      console.error('Error uploading images:', err);
    } finally {
      setUploading(false);
      setUploadProgress({ current: 0, total: 0 });
    }
  };

  const handleClose = () => {
    if (uploading) return;
    setSelectedFiles([]);
    setPreviewUrls([]);
    setError(null);
    setUploadProgress({ current: 0, total: 0 });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const isMultipleUpload = selectedFiles.length > 1;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
      <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-white border-2 border-gray-200 rounded-3xl p-6 md:p-8 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-teal">
            {isMultipleUpload ? `Subir ${selectedFiles.length} imágenes` : 'Subir imagen'} - {monthName}
          </h2>
          <button
            onClick={handleClose}
            disabled={uploading}
            className="p-2 rounded-xl hover:bg-white/40 transition-all duration-200 disabled:opacity-50"
            aria-label="Cerrar"
          >
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* File Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
              Seleccionar Imagen
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileSelect}
              disabled={uploading}
              multiple
              className="w-full px-4 py-3 text-base rounded-xl border-2 border-gray-200 focus:border-teal focus:outline-none bg-white/90 focus:ring-2 focus:ring-teal/20 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-gray-500">
              JPG, PNG o WebP, máximo {MAX_FILE_SIZE / 1024 / 1024}MB por imagen. Máximo {MAX_FILES} imágenes.
            </p>
          </div>

          {/* Previews */}
          {previewUrls.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                Vista Previa {isMultipleUpload && `(${previewUrls.length} imágenes)`}
              </label>
              <div className={`grid gap-4 ${isMultipleUpload ? 'grid-cols-2 md:grid-cols-3' : ''}`}>
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative">
                    <div className="relative w-full h-48 rounded-2xl overflow-hidden bg-white border-2 border-gray-200">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {isMultipleUpload && (
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        disabled={uploading}
                        className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors disabled:opacity-50"
                        aria-label="Eliminar imagen"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {uploading && uploadProgress.total > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">
                  Subiendo imágenes...
                </span>
                <span className="text-sm text-gray-600">
                  {uploadProgress.current} / {uploadProgress.total}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-teal h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(uploadProgress.current / uploadProgress.total) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Info message for multiple uploads */}
          {isMultipleUpload && (
            <div className="p-3 bg-teal/10 border border-teal/20 rounded-xl text-sm text-gray-700">
              <p className="font-semibold mb-1">Nota sobre múltiples imágenes:</p>
              <p>Las descripciones no se pueden agregar al subir múltiples imágenes. Puedes agregar descripciones después haciendo clic en cada imagen.</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="ghost"
              size="md"
              onClick={handleClose}
              disabled={uploading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleUpload}
              disabled={selectedFiles.length === 0 || uploading}
              className="flex-1"
            >
              {uploading
                ? `Subiendo... (${uploadProgress.current}/${uploadProgress.total})`
                : selectedFiles.length > 1
                ? `Subir ${selectedFiles.length} Imágenes`
                : 'Subir Imagen'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

