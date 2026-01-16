import React from 'react';

interface AvatarProps {
  avatarUrl?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-12 h-12 text-lg',
  lg: 'w-16 h-16 text-2xl',
};

export function Avatar({ avatarUrl, name, size = 'md', className = '' }: AvatarProps) {
  const sizeClass = sizeClasses[size];
  const initial = name?.charAt(0).toUpperCase() || '?';

  return (
    <div className={`glass-avatar ${sizeClass} rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${className}`}>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to letter if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent && !parent.querySelector('span')) {
              const fallback = document.createElement('span');
              fallback.className = 'text-teal font-bold';
              fallback.textContent = initial;
              parent.appendChild(fallback);
            }
          }}
        />
      ) : (
        <span className="text-teal font-bold">{initial}</span>
      )}
    </div>
  );
}

