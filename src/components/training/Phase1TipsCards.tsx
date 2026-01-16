import { useState, useRef, useEffect } from 'react';
import { Card } from '../ui/Card';

// Simple function to convert markdown bold to HTML
const formatDescription = (text: string) => {
  return text.split(/(\*\*.*?\*\*)/g).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

interface Tip {
  icon: string;
  title: string;
  subtitle: string;
  description: string;
}

const tips: Tip[] = [
  {
    icon: '🚶',
    title: 'Técnica Adecuada de Caminata',
    subtitle: 'Domina lo básico para caminar cómoda y eficientemente',
    description: 'Párate alta con hombros relajados. Aterriza en tu talón y rueda suavemente hacia los dedos. Deja que tus brazos se balanceen naturalmente a 90 grados, opuestos a tus piernas.\n\nMantén la mirada hacia adelante, no hacia abajo. Piensa "columna alta, hombros relajados, rodamiento suave." Este movimiento natural reduce el impacto y previene la fatiga en caminatas largas.',
  },
  {
    icon: '💨',
    title: 'Patrones de Respiración',
    subtitle: 'Encuentra tu ritmo y camina con facilidad',
    description: 'Sincroniza tu respiración con tus pasos—intenta 3-4 pasos al inhalar, 3-4 pasos al exhalar. Respira por la nariz cuando sea cómodo, por la boca cuando necesites más aire.\n\nEn subidas, baja tu ritmo y acorta a 2 pasos al inhalar, 2 pasos al exhalar. Si no puedes mantener una conversación, vas demasiado rápido. Tu respiración es tu marcador de ritmo.',
  },
  {
    icon: '🦶',
    title: 'Cuidado Básico de Pies',
    subtitle: 'Pies felices hacen peregrinas felices',
    description: 'Previene ampollas usando calcetines que absorban humedad (lana merino o sintéticos—nunca algodón). Considera calcetines interiores para protección extra. Corta las uñas de los pies en línea recta.\n\nA la primera señal de un punto caliente, detente y aplica cinta para ampollas. Después de cada caminata, ventila tus pies y revisa áreas rojas. ¡La prevención es más fácil que el tratamiento!',
  },
  {
    icon: '🎒',
    title: 'Familiarización con Equipo',
    subtitle: 'El equipo correcto, bien rodado, lo cambia todo',
    description: 'Rueda tus botas ahora—úsalas en 30-50km de caminatas antes del Camino. Prueba tu mochila en cada caminata de entrenamiento. Ajusta el cinturón de cadera para que cargue el 80% del peso.\n\nPrueba diferentes capas de ropa en varios climas. Para cuando llegues a España, tu equipo se sentirá como un compañero confiable, no una carga.',
  },
  {
    icon: '🧘',
    title: 'Rutinas Antes/Después de Caminar',
    subtitle: 'Pequeños rituales que previenen grandes problemas',
    description: '**Antes (5 min):** Calienta con una caminata a ritmo fácil, luego haz círculos de tobillo, balanceo de piernas, y círculos de brazos.\n\n**Después (10 min):** Enfría con 3-5 minutos de caminata lenta. Estira mientras estés caliente: pantorrillas, isquiotibiales, flexores de cadera, y cuádriceps—30 segundos cada uno. Mantén suavemente, respira profundo.\n\nEsta rutina simple reduce el dolor muscular y previene lesiones.',
  },
];

export function Phase1TipsCards() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const checkScrollPosition = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setShowLeftArrow(scrollLeft > 10);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    checkScrollPosition();
    container.addEventListener('scroll', checkScrollPosition);
    window.addEventListener('resize', checkScrollPosition);

    return () => {
      container.removeEventListener('scroll', checkScrollPosition);
      window.removeEventListener('resize', checkScrollPosition);
    };
  }, []);

  return (
    <div className="mb-8 overflow-x-hidden overflow-y-visible">
      <h3 className="text-lg font-semibold text-gray-700 mb-6">Aprendizajes Clave</h3>
      
      {/* Mobile: Swipeable horizontal scroll */}
      <div className="md:hidden">
        <div 
          ref={scrollContainerRef}
          className="flex gap-5 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 pl-2 pr-2"
        >
          {tips.map((tip, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-[300px] snap-start p-1"
            >
              <Card className="h-full glass-card-rose transition-all duration-300 hover:scale-[1.02] hover:shadow-glass-elevated">
                <div className="flex flex-col h-full">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex-shrink-0 w-14 h-14 rounded-full icon-bg-rose flex items-center justify-center text-3xl">
                      {tip.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-teal mb-1.5">{tip.title}</h4>
                      <p className="text-sm font-medium text-gray-600 mb-4">{tip.subtitle}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line text-sm">
                    {formatDescription(tip.description)}
                  </p>
                </div>
              </Card>
            </div>
          ))}
        </div>
        
        {/* Arrow indicators below cards */}
        {(showLeftArrow || showRightArrow) && (
          <div className="flex items-center justify-center gap-4 mt-2">
            {showLeftArrow && (
              <div className="bg-teal/80 backdrop-blur-sm rounded-full p-2 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </div>
            )}
            {showRightArrow && (
              <div className="bg-teal/80 backdrop-blur-sm rounded-full p-2 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Desktop: Grid layout */}
      <div className="hidden md:grid md:grid-cols-2 gap-5 p-1">
        {tips.map((tip, index) => (
          <Card key={index} className="h-full glass-card-rose transition-all duration-300 hover:scale-[1.02] hover:shadow-glass-elevated">
            <div className="flex flex-col h-full">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-14 h-14 rounded-full icon-bg-rose flex items-center justify-center text-3xl">
                  {tip.icon}
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-teal mb-1.5">{tip.title}</h4>
                  <p className="text-sm font-medium text-gray-600 mb-4">{tip.subtitle}</p>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line text-sm">
                {formatDescription(tip.description)}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

