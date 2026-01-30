import React, { useState, useEffect } from 'react';
import { fetchImageComments, addComment, deleteComment } from '../../lib/gallery';
import type { GalleryComment } from '../../lib/gallery';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';

interface CommentSectionProps {
  imageId: string;
  className?: string;
}

export function CommentSection({ imageId, className = '' }: CommentSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<GalleryComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    loadComments();
  }, [imageId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedComments = await fetchImageComments(imageId);
      setComments(fetchedComments);
    } catch (err: any) {
      setError(err.message || 'Error al cargar comentarios');
      console.error('Error loading comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !commentText.trim() || submitting) return;

    try {
      setSubmitting(true);
      setError(null);
      setSuccessMessage(null);
      const newComment = await addComment(imageId, commentText);
      setComments((prev) => [...prev, newComment]);
      setCommentText('');
      setSuccessMessage('Comentario publicado correctamente.');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Error al agregar comentario');
      console.error('Error adding comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user || !confirm('¿Estás seguro de que quieres eliminar este comentario?')) {
      return;
    }

    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err: any) {
      setError(err.message || 'Error al eliminar comentario');
      console.error('Error deleting comment:', err);
    }
  };

  return (
    <div className={className}>
      <h3 className="text-lg font-bold text-teal mb-4">Comentarios ({comments.length})</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
          {successMessage}
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
        {loading ? (
          <div className="text-center py-8 text-gray-600">Cargando comentarios...</div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-gray-600">No hay comentarios aún</div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <Avatar
                avatarUrl={comment.user?.avatar_url}
                name={comment.user?.name || 'Usuario'}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <div className="glass-card-subtle rounded-2xl p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-semibold text-gray-800">
                      {comment.user?.name || 'Usuario'}
                    </span>
                    {user && user.id === comment.user_id && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap break-words">
                    {comment.content}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(comment.created_at).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Comment Form */}
      {user ? (
        <form onSubmit={handleSubmitComment} className="space-y-3">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Escribe un comentario..."
            rows={3}
            className="w-full px-4 py-3 text-base rounded-xl border-2 border-gray-200 focus:border-teal focus:outline-none bg-white/90 focus:ring-2 focus:ring-teal/20 resize-none"
            disabled={submitting}
          />
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!commentText.trim() || submitting}
            className="w-full"
          >
            {submitting ? 'Enviando...' : 'Comentar'}
          </Button>
        </form>
      ) : (
        <div className="text-center py-4 text-gray-600">
          Inicia sesión para comentar
        </div>
      )}
    </div>
  );
}

