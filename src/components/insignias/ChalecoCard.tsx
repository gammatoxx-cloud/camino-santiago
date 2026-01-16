import { Card } from '../ui/Card';

export function ChalecoCard() {
  return (
    <Card 
      variant="default" 
      className="relative transition-all duration-300 benefit-card-rose"
    >
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
        {/* Chaleco Image */}
        <div className="flex-shrink-0">
          <img
            src="/CHALECO.png"
            alt="Tu chaleco de logros"
            className="w-32 h-32 md:w-40 md:h-40 object-contain drop-shadow-lg"
          />
        </div>

        {/* Content */}
        <div className="flex-1 text-center md:text-left min-w-0">
          <h3 className="text-heading-3 mb-3 md:mb-4 font-bold text-teal">
            Tu chaleco de logros
          </h3>

          <p className="text-gray-700 text-base md:text-lg leading-relaxed">
            Al completar la primera etapa del entrenamiento, ganas tu chaleco Magnolias. En él irás colocando las insignias de cada logro alcanzado. Cada insignia refleja tu esfuerzo, tus kilómetros caminados y tu avance en el camino.
          </p>
        </div>
      </div>
    </Card>
  );
}
