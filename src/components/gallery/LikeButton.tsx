import React, { useState, useEffect } from 'react';
import { fetchImageLikes, likeImage, unlikeImage } from '../../lib/gallery';
import { useAuth } from '../../contexts/AuthContext';

interface LikeButtonProps {
  imageId: string;
  initialCount?: number;
  initialUserLiked?: boolean;
  onLikeChange?: (count: number, userLiked: boolean) => void;
  className?: string;
}

export function LikeButton({
  imageId,
  initialCount = 0,
  initialUserLiked = false,
  onLikeChange,
  className = '',
}: LikeButtonProps) {
  const { user } = useAuth();
  const [count, setCount] = useState(initialCount);
  const [userLiked, setUserLiked] = useState(initialUserLiked);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch current like status
    const loadLikes = async () => {
      try {
        const { count: likeCount, userLiked: liked } = await fetchImageLikes(imageId);
        setCount(likeCount);
        setUserLiked(liked);
        if (onLikeChange) {
          onLikeChange(likeCount, liked);
        }
      } catch (error) {
        console.error('Error loading likes:', error);
      }
    };

    loadLikes();
  }, [imageId, onLikeChange]);

  const handleToggleLike = async () => {
    if (!user || loading) return;

    const previousCount = count;
    const previousLiked = userLiked;

    try {
      setLoading(true);

      // Optimistic update
      if (userLiked) {
        setCount((prev) => Math.max(0, prev - 1));
        setUserLiked(false);
        await unlikeImage(imageId);
      } else {
        setCount((prev) => prev + 1);
        setUserLiked(true);
        await likeImage(imageId);
      }

      // Fetch actual counts to sync
      const { count: actualCount, userLiked: actualLiked } = await fetchImageLikes(imageId);
      setCount(actualCount);
      setUserLiked(actualLiked);
      if (onLikeChange) {
        onLikeChange(actualCount, actualLiked);
      }
    } catch (error) {
      // Revert on error
      setCount(previousCount);
      setUserLiked(previousLiked);
      console.error('Error toggling like:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <button
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-gray-600 cursor-not-allowed ${className}`}
        disabled
      >
        <span className="text-xl">❤️</span>
        <span className="font-semibold">{count}</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleToggleLike}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 min-h-[44px] ${
        userLiked
          ? 'text-rose bg-rose/10 hover:bg-rose/20'
          : 'text-gray-600 hover:text-rose hover:bg-white/60'
      } ${loading ? 'opacity-50 cursor-wait' : ''} ${className}`}
    >
      <span className="text-xl">{userLiked ? '❤️' : '🤍'}</span>
      <span className="font-semibold">{count}</span>
    </button>
  );
}

