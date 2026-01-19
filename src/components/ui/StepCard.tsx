import React from 'react';
import { Card } from './Card';

interface StepCardProps {
  stepNumber: number;
  icon?: React.ReactNode;
  title: string;
  description: string;
  className?: string;
  children?: React.ReactNode;
}

export function StepCard({
  stepNumber,
  icon,
  title,
  description,
  className = '',
  children,
}: StepCardProps) {
  return (
    <Card variant="accent" className={`relative ${className}`}>
      <div className="step-badge bg-gradient-to-br from-rose/10 to-light-pink/10 border-rose/30 text-rose font-bold">{stepNumber}</div>
      {/* Mobile: Stacked layout with centered icon */}
      <div className="md:hidden flex flex-col items-center">
        {icon && (
          <div className="w-16 h-16 rounded-2xl icon-bg-light-pink flex items-center justify-center text-4xl text-teal shadow-sm mb-4">
            {icon}
          </div>
        )}
        <div className="w-full">
          <h3 className="text-heading-3 text-teal mb-3 text-center">{title}</h3>
          <p className="text-gray-700 mb-6 leading-relaxed">{description}</p>
          {children}
        </div>
      </div>
      {/* Desktop: Horizontal layout with icon on left */}
      <div className="hidden md:flex items-start gap-5">
        {icon && (
          <div className="flex-shrink-0 w-16 h-16 rounded-2xl icon-bg-light-pink flex items-center justify-center text-4xl text-teal shadow-sm">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0 overflow-x-hidden">
          <h3 className="text-heading-3 text-teal mb-3">{title}</h3>
          <p className="text-gray-700 mb-6 leading-relaxed">{description}</p>
          {children}
        </div>
      </div>
    </Card>
  );
}

