import React from 'react';

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  className?: string;
  showText?: boolean; // Whether to show percentage text in center
  color?: string; // Custom color for the progress ring (hex format, e.g., "#46c738")
}

export function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 8,
  className = '',
  showText = true,
  color = '#DCF6C8', // Default light green
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  // Add padding to account for stroke width, rounded caps, and shadows
  const padding = Math.max(strokeWidth, 10);
  
  // Generate unique gradient ID based on color to avoid conflicts
  const gradientId = `progressGradient-${color.replace('#', '')}`;
  
  // Calculate background color with 30% opacity
  const getBackgroundColor = (hex: string): string => {
    if (hex === '#DCF6C8') {
      return 'rgba(220, 246, 200, 0.3)'; // Keep original background for default
    }
    // Convert hex to RGB and apply 30% opacity
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, 0.3)`;
  };
  
  const bgColor = getBackgroundColor(color);

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ padding: `${padding}px` }}>
      <svg 
        width={size} 
        height={size} 
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
        style={{ overflow: 'visible' }}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={bgColor}
          strokeWidth={strokeWidth}
          fill="none"
          className="drop-shadow-sm"
        />
        {/* Progress circle with gradient */}
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={color} />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out drop-shadow-md"
          filter="url(#glow)"
        />
      </svg>
      {/* Percentage text - only show if showText is true */}
      {showText && (
        <div className="absolute flex items-center justify-center" style={{ 
          top: `${padding}px`, 
          left: `${padding}px`, 
          width: `${size}px`, 
          height: `${size}px` 
        }}>
          <span className="text-2xl font-bold text-teal drop-shadow-sm">
            {Math.round(progress)}%
          </span>
        </div>
      )}
    </div>
  );
}

