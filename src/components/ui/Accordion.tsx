import React, { useState, useRef, useEffect } from 'react';
import { Card } from './Card';

interface AccordionProps {
  title: string;
  icon?: string;
  count?: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
  variant?: 'facil' | 'moderado' | 'dificil';
  className?: string;
}

export function Accordion({
  title,
  icon,
  count,
  children,
  defaultOpen = false,
  variant = 'facil',
  className = '',
}: AccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [contentHeight, setContentHeight] = useState<number>(0);
  const contentRef = useRef<HTMLDivElement>(null);

  // Measure content height when accordion state changes
  useEffect(() => {
    if (contentRef.current) {
      if (isOpen) {
        // Set to actual height when opening
        setContentHeight(contentRef.current.scrollHeight);
      } else {
        // Set to 0 when closing
        setContentHeight(0);
      }
    }
  }, [isOpen, children]);

  // Measure initial height if defaultOpen is true
  useEffect(() => {
    if (defaultOpen && contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [defaultOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  };

  // Variant-specific styling
  const variantStyles = {
    facil: {
      headerBg: 'bg-gradient-to-r from-green-50/80 to-emerald-50/60',
      borderColor: 'border-green-200/40',
      iconBg: 'bg-green-100/60',
      textColor: 'text-green-800',
    },
    moderado: {
      headerBg: 'bg-gradient-to-r from-amber-50/80 to-yellow-50/60',
      borderColor: 'border-amber-200/40',
      iconBg: 'bg-amber-100/60',
      textColor: 'text-amber-800',
    },
    dificil: {
      headerBg: 'bg-gradient-to-r from-red-50/80 to-orange-50/60',
      borderColor: 'border-red-200/40',
      iconBg: 'bg-red-100/60',
      textColor: 'text-red-800',
    },
  };

  const styles = variantStyles[variant];

  return (
    <Card variant="elevated" className={`overflow-hidden ${className}`}>
      {/* Accordion Header */}
      <button
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={`w-full flex items-center justify-between gap-4 p-4 md:p-5 min-h-[56px] md:min-h-[64px] transition-all duration-200 active:scale-[0.98] ${styles.headerBg} rounded-2xl border ${styles.borderColor} hover:shadow-md focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2`}
        aria-expanded={isOpen}
        aria-controls={`accordion-content-${title}`}
      >
        <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
          {icon && (
            <div className={`flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-xl ${styles.iconBg} flex items-center justify-center text-xl md:text-2xl`}>
              {icon}
            </div>
          )}
          <div className="flex-1 min-w-0 text-left">
            <h3 className={`text-lg md:text-xl font-bold ${styles.textColor} mb-0.5`}>
              {title}
            </h3>
            {count !== undefined && (
              <p className="text-xs md:text-sm text-gray-600 font-medium">
                {count} {count === 1 ? 'sendero' : 'senderos'}
              </p>
            )}
          </div>
        </div>
        
        {/* Chevron Icon */}
        <div
          className={`flex-shrink-0 w-6 h-6 md:w-7 md:h-7 flex items-center justify-center transition-transform duration-300 ease-in-out ${isOpen ? 'rotate-180' : ''}`}
        >
          <svg
            className="w-full h-full text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {/* Accordion Content */}
      <div
        id={`accordion-content-${title}`}
        ref={contentRef}
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: `${contentHeight}px`,
        }}
      >
        <div className="pt-6 md:pt-8">
          {children}
        </div>
      </div>
    </Card>
  );
}
