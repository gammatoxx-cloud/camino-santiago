import { Link } from 'react-router-dom';
import { ProductAccordion } from '../components/resources/ProductAccordion';
import { products } from '../lib/productsData';

export function RecommendedProductsPage() {
  // Group products by category
  const productsByCategory = products.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {} as Record<string, typeof products>);

  // Convert to array and maintain order
  const categoryEntries = Object.entries(productsByCategory);

  return (
    <div className="min-h-screen bg-cream pb-20 md:pb-6 pt-8 md:pt-8 overflow-x-hidden">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-4 md:py-8">
        {/* Back Button */}
        <Link
          to="/resources"
          className="inline-flex items-center gap-2 mb-6 text-teal hover:text-teal-600 transition-colors duration-200 group"
          aria-label="Volver a Recursos"
        >
          <div className="flex-shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/80 hover:bg-white backdrop-blur-sm border border-gray-200/60 hover:border-teal/30 flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md group-hover:scale-105">
            <svg
              className="w-5 h-5 text-teal"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </div>
          <span className="text-sm md:text-base font-medium hidden sm:inline">
            Volver a Recursos
          </span>
        </Link>

        <div className="flex justify-center mb-8">
          <img
            src="/productos_icon.svg"
            alt="Productos"
            className="max-w-full h-auto w-1/4 md:w-[20%]"
          />
        </div>
        <h1 className="text-heading-1 text-teal mb-6 md:mb-8 text-center">
          Tu Equipo Esencial: Preparados para el Camino
        </h1>
        
        {/* Enhanced Intro Section with Visual Hierarchy */}
        <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 md:p-8 mb-8 md:mb-12 max-w-3xl mx-auto border border-white/60 shadow-sm">
          <p className="text-gray-700 text-base md:text-lg leading-relaxed md:leading-relaxed mb-4 text-center">
            Esta selección de productos ha sido curada bajo los estándares más altos de senderismo de larga distancia. Nos enfocamos en tres pilares fundamentales:
          </p>
          
          {/* Visual Separator */}
          <div className="h-px bg-gradient-to-r from-transparent via-teal/20 to-transparent my-5 md:my-6"></div>
          
          <div className="space-y-3 md:space-y-4 mb-4">
            <p className="text-gray-700 text-base md:text-lg leading-relaxed md:leading-relaxed text-center">
              <strong className="text-teal font-semibold">Calzado técnico</strong> para proteger tu pisada, <strong className="text-teal font-semibold">sistemas de carga ergonómicos</strong> y <strong className="text-teal font-semibold">accesorios de logística</strong> pensados para la vida en los albergues y el trayecto internacional.
            </p>
          </div>
          
          {/* Visual Separator */}
          <div className="h-px bg-gradient-to-r from-transparent via-teal/20 to-transparent my-5 md:my-6"></div>
          
          <p className="text-gray-700 text-base md:text-lg leading-relaxed md:leading-relaxed text-center">
            Equípate con la seguridad de que cada artículo ha sido elegido para ayudarte a llegar a Santiago con salud, energía y la mente puesta solo en el camino. ¡Buen Camino con Magnolias!
          </p>
        </div>

        <div className="space-y-6 md:space-y-7">
          {categoryEntries.map(([category, categoryProducts], index) => (
            <ProductAccordion
              key={category}
              category={category}
              products={categoryProducts}
              defaultExpanded={index === 0}
              index={index}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

