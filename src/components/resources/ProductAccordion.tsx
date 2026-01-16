import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { ProductCard } from './ProductCard';
import type { Product } from '../../lib/productsData';

interface ProductAccordionProps {
  category: string;
  products: Product[];
  defaultExpanded?: boolean;
  index?: number;
}

// Helper function to get category-based accent color
function getCategoryAccentColor(category: string) {
  const accents: Record<string, string> = {
    'Calzado Técnico': 'from-teal-50/60 to-white/40',
    'Mochila y Protección': 'from-blue-50/60 to-white/40',
    'Cuidado del Pie': 'from-green-50/60 to-white/40',
    'Ropa Técnica y Capas': 'from-amber-50/60 to-white/40',
    'Equipo de Apoyo y Descanso': 'from-rose-50/60 to-white/40',
    'Hidratación': 'from-indigo-50/60 to-white/40',
    'Tecnología y Seguridad': 'from-purple-50/60 to-white/40',
    'Salud e Higiene': 'from-pink-50/60 to-white/40',
    'Nutrición en Ruta': 'from-orange-50/60 to-white/40',
  };
  return accents[category] || 'from-teal-50/60 to-white/40';
}

// Helper function to get category-based badge color
function getCategoryBadgeColor(category: string) {
  const badges: Record<string, string> = {
    'Calzado Técnico': 'bg-teal-100/80 text-teal-700 border-teal-200/60',
    'Mochila y Protección': 'bg-blue-100/80 text-blue-700 border-blue-200/60',
    'Cuidado del Pie': 'bg-green-100/80 text-green-700 border-green-200/60',
    'Ropa Técnica y Capas': 'bg-amber-100/80 text-amber-700 border-amber-200/60',
    'Equipo de Apoyo y Descanso': 'bg-rose-100/80 text-rose-700 border-rose-200/60',
    'Hidratación': 'bg-indigo-100/80 text-indigo-700 border-indigo-200/60',
    'Tecnología y Seguridad': 'bg-purple-100/80 text-purple-700 border-purple-200/60',
    'Salud e Higiene': 'bg-pink-100/80 text-pink-700 border-pink-200/60',
    'Nutrición en Ruta': 'bg-orange-100/80 text-orange-700 border-orange-200/60',
  };
  return badges[category] || 'bg-teal-100/80 text-teal-700 border-teal-200/60';
}

// Helper function to get category icon
function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    'Calzado Técnico': '👟',
    'Mochila y Protección': '🎒',
    'Cuidado del Pie': '🧦',
    'Ropa Técnica y Capas': '👕',
    'Equipo de Apoyo y Descanso': '🛏️',
    'Hidratación': '💧',
    'Tecnología y Seguridad': '🔌',
    'Salud e Higiene': '🧴',
    'Nutrición en Ruta': '🍎',
  };
  return icons[category] || '🛍️';
}

export function ProductAccordion({ category, products, defaultExpanded = false, index = 0 }: ProductAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const hasProducts = products.length > 0;
  const accentGradient = getCategoryAccentColor(category);
  const badgeColor = getCategoryBadgeColor(category);

  return (
    <div 
      className="animate-fade-in-up"
      style={{ animationDelay: `${index * 100}ms` } as React.CSSProperties}
    >
      <Card variant="default" className="overflow-hidden">
        {/* Accordion Header - Touch-friendly */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-full px-4 md:px-6 py-4 md:py-5 min-h-[48px] flex items-center justify-between text-left transition-all duration-300 rounded-3xl relative overflow-hidden ${
            hasProducts 
              ? `hover:bg-gradient-to-r ${accentGradient} active:bg-white/50` 
              : 'opacity-60 cursor-not-allowed'
          }`}
          aria-expanded={isExpanded}
          disabled={!hasProducts}
        >
          {/* Subtle background accent */}
          <div className={`absolute inset-0 bg-gradient-to-r ${accentGradient} opacity-0 transition-opacity duration-300 ${isExpanded ? 'opacity-100' : ''}`} />
          
          <div className="flex-1 min-w-0 pr-4 relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xl md:text-2xl" aria-hidden="true">
                {getCategoryIcon(category)}
              </span>
              <span className="text-lg md:text-xl font-bold text-teal">
                {category}
              </span>
            </div>
            {hasProducts && (
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border backdrop-blur-sm transition-all duration-300 ${badgeColor} ${isExpanded ? 'animate-badge-pulse' : ''}`}>
                  {products.length} producto{products.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>

          {/* Chevron Icon */}
          {hasProducts ? (
            <div
              className={`flex-shrink-0 w-9 h-9 md:w-11 md:h-11 rounded-full bg-teal/15 flex items-center justify-center transition-all duration-300 relative z-10 ${
                isExpanded ? 'rotate-180 bg-teal/20' : 'hover:bg-teal/20'
              }`}
            >
              <svg
                className="w-5 h-5 text-teal transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          ) : (
            <span className="text-xs text-gray-400 flex-shrink-0 relative z-10">Próximamente</span>
          )}
        </button>

        {/* Accordion Content - Animated */}
        {hasProducts && (
          <div
            className={`overflow-hidden transition-all duration-500 ease-in-out ${
              isExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="pt-6 pb-4 md:pb-6 px-2 md:px-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                {products.map((product, productIndex) => (
                  <ProductCard key={product.id} product={product} category={category} index={productIndex} />
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

