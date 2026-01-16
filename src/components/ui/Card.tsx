import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'default' | 'elevated' | 'subtle' | 'stat' | 'process' | 'accent';
  style?: React.CSSProperties;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(({ 
  children, 
  className = '', 
  onClick,
  variant = 'default',
  style
}, ref) => {
  const variantClasses = {
    default: 'glass-card',
    elevated: 'glass-card-elevated',
    subtle: 'glass-card-subtle',
    stat: 'glass-card',
    process: 'glass-card-elevated',
    accent: 'glass-card-accent',
  };

  const baseClasses = `${variantClasses[variant]} rounded-3xl p-6 md:p-8`;
  const interactiveClasses = onClick 
    ? 'cursor-pointer' 
    : '';

  return (
    <div
      ref={ref}
      className={`${baseClasses} ${interactiveClasses} ${className}`}
      onClick={onClick}
      style={style}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

