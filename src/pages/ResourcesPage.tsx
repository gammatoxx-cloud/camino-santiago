import { ResourceCard } from '../components/resources/ResourceCard';

export function ResourcesPage() {
  return (
      <div className="min-h-screen bg-cream pb-20 md:pb-6 pt-8 md:pt-8 overflow-x-hidden">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-4 md:py-8">
          <div className="flex justify-center mb-8">
            <img
              src="/recursos_icon.svg"
              alt="Recursos"
              className="max-w-full h-auto w-1/4"
            />
          </div>
          <h1 className="text-heading-1 text-teal mb-10 md:mb-14 text-center">
            Recursos para tu Camino
          </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <ResourceCard
            to="/resources/videos"
            icon="/videos_logo.svg"
            title="Videos"
            description="Videos de entrenamiento y preparación para el Camino"
          />
          <ResourceCard
            to="/resources/books"
            icon="/libros_icon.svg"
            title="Libros Recomendados"
            description="Libros inspiradores y motivadores sobre el Camino de Santiago"
          />
          <ResourceCard
            to="/resources/products"
            icon="/productos_icon.svg"
            title="Productos Recomendados"
            description="Equipamiento esencial seleccionado para tu Camino"
          />
        </div>
      </div>
    </div>
  );
}

