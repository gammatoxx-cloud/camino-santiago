import React, { useState, useEffect } from 'react';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { LikeButton } from './LikeButton';
import { CommentSection } from './CommentSection';
import { deleteGalleryImage, updateGalleryImageCaption } from '../../lib/gallery';
import type { GalleryImage } from '../../lib/gallery';
import { useAuth } from '../../contexts/AuthContext';

interface ImageModalProps {
  image: GalleryImage;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: () => void;
  onUpdate?: (updatedImage: GalleryImage) => void;
}

export function ImageModal({ image, isOpen, onClose, onDelete, onUpdate }: ImageModalProps) {
  const { user } = useAuth();
  const [imageError, setImageError] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [editingCaption, setEditingCaption] = useState(false);
  const [captionText, setCaptionText] = useState(image.caption || '');
  const [savingCaption, setSavingCaption] = useState(false);
  const [currentImage, setCurrentImage] = useState<GalleryImage>(image);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setCurrentImage(image);
      setCaptionText(image.caption || '');
      setEditingCaption(false);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, image]);

  const handleDownload = async () => {
    try {
      const response = await fetch(image.image_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `imagen-${image.id}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading image:', error);
      alert('Error al descargar la imagen');
    }
  };

  const handleDelete = async () => {
    if (!user || user.id !== image.user_id) return;
    if (!confirm('¿Estás seguro de que quieres eliminar esta imagen? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setDeleting(true);
      await deleteGalleryImage(currentImage.id);
      if (onDelete) {
        onDelete();
      }
      onClose();
    } catch (error: any) {
      console.error('Error deleting image:', error);
      alert(error.message || 'Error al eliminar la imagen');
    } finally {
      setDeleting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSaveCaption = async () => {
    if (!isOwner) return;

    try {
      setSavingCaption(true);
      const updatedImage = await updateGalleryImageCaption(
        currentImage.id,
        captionText.trim() || null
      );
      setCurrentImage(updatedImage);
      setEditingCaption(false);
      if (onUpdate) {
        onUpdate(updatedImage);
      }
    } catch (error: any) {
      console.error('Error updating caption:', error);
      alert(error.message || 'Error al actualizar la descripción');
    } finally {
      setSavingCaption(false);
    }
  };

  const handleCancelEditCaption = () => {
    setCaptionText(currentImage.caption || '');
    setEditingCaption(false);
  };

  if (!isOpen) return null;

  const isOwner = user && user.id === currentImage.user_id;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="max-w-4xl w-full max-h-[90vh] flex flex-col bg-white rounded-3xl overflow-hidden border-2 border-gray-200 shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/20">
          <div className="flex items-center gap-3">
            <Avatar
              avatarUrl={currentImage.user?.avatar_url}
              name={currentImage.user?.name || 'Usuario'}
              size="md"
            />
            <div>
              <p className="font-semibold text-gray-800">
                {currentImage.user?.name || 'Usuario'}
              </p>
              <p className="text-xs text-gray-600">
                {new Date(currentImage.created_at).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/40 transition-all duration-200"
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

        {/* Image */}
        <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-black/10">
          {!imageError ? (
            <img
              src={currentImage.image_url}
              alt={currentImage.caption || 'Imagen de galería'}
              className="max-w-full max-h-[60vh] object-contain rounded-2xl"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-64 flex items-center justify-center bg-gradient-to-br from-teal/20 to-teal/10 rounded-2xl">
              <span className="text-6xl">📷</span>
            </div>
          )}
        </div>

        {/* Caption */}
        <div className="px-4 py-3 border-b border-white/20">
          {editingCaption && isOwner ? (
            <div className="space-y-3">
              <textarea
                value={captionText}
                onChange={(e) => setCaptionText(e.target.value)}
                placeholder="Agrega una descripción..."
                rows={3}
                disabled={savingCaption}
                className="w-full px-4 py-3 text-base rounded-xl border-2 border-gray-200 focus:border-teal focus:outline-none bg-white/90 focus:ring-2 focus:ring-teal/20 resize-none disabled:opacity-50"
                autoFocus
              />
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveCaption}
                  disabled={savingCaption}
                >
                  {savingCaption ? 'Guardando...' : 'Guardar'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelEditCaption}
                  disabled={savingCaption}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                {currentImage.caption ? (
                  <p className="text-gray-800 whitespace-pre-wrap break-words">
                    {currentImage.caption}
                  </p>
                ) : (
                  <p className="text-gray-400 italic">
                    {isOwner ? 'Sin descripción. Haz clic en "Editar" para agregar una.' : 'Sin descripción'}
                  </p>
                )}
              </div>
              {isOwner && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingCaption(true)}
                  className="flex-shrink-0"
                >
                  ✏️ {currentImage.caption ? 'Editar' : 'Agregar'}
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-4 border-b border-white/20 gap-4">
          <div className="flex items-center gap-2 flex-1">
            <LikeButton imageId={currentImage.id} />
            <Button
              variant="ghost"
              size="md"
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2"
            >
              <span>💬</span>
              <span>Comentarios</span>
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="md" onClick={handleDownload}>
              ⬇️ Descargar
            </Button>
            {isOwner && (
              <Button
                variant="ghost"
                size="md"
                onClick={handleDelete}
                disabled={deleting}
                className="text-red-600 hover:text-red-800 hover:bg-red-50"
              >
                {deleting ? 'Eliminando...' : '🗑️ Eliminar'}
              </Button>
            )}
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="p-4 border-t border-white/20 bg-white/30 max-h-96 overflow-y-auto">
            <CommentSection imageId={currentImage.id} />
          </div>
        )}
      </div>
    </div>
  );
}

