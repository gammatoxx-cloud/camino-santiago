import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import type { Product } from '../../lib/productsData';

interface ProductCardProps {
  product: Product;
  category?: string;
  index?: number;
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

// Helper function to get category border color
function getCategoryBorderColor(category: string): string {
  const colors: Record<string, string> = {
    'Calzado Técnico': 'border-l-4 border-teal-400',
    'Mochila y Protección': 'border-l-4 border-blue-400',
    'Cuidado del Pie': 'border-l-4 border-green-400',
    'Ropa Técnica y Capas': 'border-l-4 border-amber-400',
    'Equipo de Apoyo y Descanso': 'border-l-4 border-rose-400',
    'Hidratación': 'border-l-4 border-indigo-400',
    'Tecnología y Seguridad': 'border-l-4 border-purple-400',
    'Salud e Higiene': 'border-l-4 border-pink-400',
    'Nutrición en Ruta': 'border-l-4 border-orange-400',
  };
  return colors[category] || 'border-l-4 border-teal-400';
}

export function ProductCard({ product, category = '', index = 0 }: ProductCardProps) {
  const hasDualLinks = product.amazonLinkMen && product.amazonLinkWomen;
  const hasSingleLink = !!product.amazonLink;
  const categoryIcon = getCategoryIcon(category);
  const borderColor = getCategoryBorderColor(category);

  const handleAmazonClick = (link: string) => {
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="animate-fade-in-up"
      style={{ animationDelay: `${index * 100}ms` } as React.CSSProperties}
    >
      <Card 
        variant="elevated" 
        className={`h-full flex flex-col relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg p-0 ${borderColor}`}
      >
        {/* Category Icon Badge */}
        {category && (
          <div className="absolute top-4 right-4 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-xl md:text-2xl shadow-sm z-10">
            {categoryIcon}
          </div>
        )}

        <div className="flex-1 flex flex-col px-5 py-6 md:px-6 md:py-8">
          {/* Dual Options Badge */}
          {hasDualLinks && (
            <div className="mb-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50/80 text-teal-700 text-xs font-semibold border border-teal-200/60 backdrop-blur-sm w-fit">
              <span>👥</span>
              <span>Opciones Hombre/Mujer</span>
            </div>
          )}

          <h3 className="text-heading-3 text-teal mb-4 md:mb-5 leading-tight font-bold pr-12">
            {product.title}
          </h3>
          
          <p className="text-gray-700 mb-5 md:mb-6 leading-relaxed md:leading-relaxed flex-1 text-[15px] md:text-base">
            {product.description}
          </p>

          <div className="pt-4 border-t border-gray-200/70">
            {hasDualLinks ? (
              <div className="space-y-3">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => handleAmazonClick(product.amazonLinkMen!)}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <span>👨 Ver en Amazon (Hombre)</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => handleAmazonClick(product.amazonLinkWomen!)}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <span>👩 Ver en Amazon (Mujer)</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </Button>
              </div>
            ) : hasSingleLink ? (
              <Button
                variant="primary"
                size="md"
                onClick={() => handleAmazonClick(product.amazonLink!)}
                className="w-full flex items-center justify-center gap-2"
              >
                <span>🛒 Ver en Amazon</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
              </Button>
            ) : null}
          </div>
        </div>
      </Card>
    </div>
  );
}

