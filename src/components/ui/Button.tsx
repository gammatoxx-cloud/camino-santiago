import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'lg',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseClasses = 'font-semibold rounded-2xl transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-teal text-white hover:bg-teal-600 shadow-glass hover:shadow-glass-elevated hover:-translate-y-0.5',
    secondary: 'bg-white/90 text-teal hover:bg-white border-2 border-teal shadow-glass hover:shadow-glass-elevated hover:-translate-y-0.5',
    ghost: 'bg-transparent text-teal hover:bg-white/60 hover:shadow-glass-subtle',
    success: 'bg-green-600 text-white hover:bg-green-700 shadow-glass hover:shadow-glass-elevated hover:-translate-y-0.5',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm min-h-[48px] md:min-h-[36px]',
    md: 'px-6 py-3 text-base min-h-[48px] md:min-h-[44px]',
    lg: 'px-8 py-4 text-lg min-h-[52px]',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

