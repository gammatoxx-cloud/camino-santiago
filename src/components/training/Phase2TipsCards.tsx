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
    icon: '⛰️',
    title: 'Introducción a Subidas',
    subtitle: 'Conquista las inclinaciones con confianza y técnica',
    description: 'Comenzando en la semana 12, agregarás subidas suaves (2-5% de inclinación) para desarrollar fuerza. Inclínate ligeramente hacia adelante desde los tobillos, da pasos más cortos, y mantén un ritmo constante. No te apresures—las subidas se tratan de constancia, no de velocidad.\n\nUsa tus brazos más activamente para impulso. Respira en un patrón más corto (2 pasos al inhalar, 2 pasos al exhalar). El Camino tiene subidas—practicar ahora hace que se sientan como viejas amigas después.',
  },
  {
    icon: '💧',
    title: 'Estrategia de Hidratación',
    subtitle: 'Bebe inteligentemente, camina fuerte',
    description: 'No esperes hasta tener sed—para entonces ya estás deshidratada. Bebe 150-200ml (aproximadamente 6-8 sorbos) cada 20-30 minutos durante las caminatas. Lleva al menos 500ml para caminatas menores de 5km, 1 litro para caminatas más largas.\n\nInvierte en una botella de agua cómoda o vejiga de hidratación. Practica beber mientras caminas sin romper el paso. Una buena hidratación previene fatiga, calambres y dolores de cabeza en el camino.',
  },
  {
    icon: '🤸',
    title: 'Estiramiento Dinámico',
    subtitle: 'Despierta tus músculos antes de caminar',
    description: 'Los estiramientos dinámicos preparan tu cuerpo para el movimiento. Antes de cada caminata, haz 5-10 repeticiones de: balanceo de piernas (adelante/atrás y lado a lado), círculos de tobillo en ambas direcciones, y círculos de brazos.\n\nEstos movimientos activos aumentan el flujo sanguíneo y el rango de movimiento. Mantén los movimientos controlados y suaves—sin tirones ni rebotes. Te sentirás más flexible, caminarás mejor, y reducirás el riesgo de lesiones.',
  },
  {
    icon: '🧘',
    title: 'Estiramiento Estático',
    subtitle: 'Ayuda a tus músculos a recuperarse después de cada caminata',
    description: 'Siempre estira mientras los músculos están todavía calientes. Mantén cada estiramiento por 30 segundos sin rebotar—debes sentir tensión suave, no dolor.\n\nEstiramientos esenciales post-caminata: estiramiento de pantorrilla (pierna trasera recta), estiramiento de isquiotibiales (una pierna extendida), estiramiento de flexor de cadera (posición de estocada baja), estiramiento de cuádriceps (jala el pie hacia los glúteos). Respira profundamente y relájate en cada posición. Esta rutina previene rigidez y dolor muscular.',
  },
  {
    icon: '👕',
    title: 'Capas de Ropa',
    subtitle: 'Vístete inteligentemente para condiciones cambiantes',
    description: 'Piensa en tres capas: capa base (que absorbe humedad, contra la piel), capa media (aislante como polar), capa exterior (chamarra cortavientos/impermeable). Ajustarás según te calientes o cambie el clima.\n\nComienza las caminatas ligeramente fresca—te calentarás en 10 minutos. Lleva capas en tu mochila y detente para agregar o quitar. El algodón retiene humedad—elige sintético o lana merino. Practica ahora para que usar capas se vuelva automático.',
  },
  {
    icon: '🍌',
    title: 'Momento de Nutrición',
    subtitle: 'Alimenta tu cuerpo para energía sostenida',
    description: 'Para caminatas de más de 5km, come un snack ligero 30-60 minutos antes de comenzar—un plátano, puñado de nueces, o barra energética. Tu cuerpo necesita combustible para rendir bien.\n\nEn caminatas de más de 8km, lleva un snack pequeño para comer a mitad del camino: fruta deshidratada, mezcla de frutos secos, o barra de granola. Come antes de sentir hambre. Combinar comida con hidratación mantiene la energía y previene el temido "bajón." Aprende qué funciona para tu cuerpo ahora.',
  },
];

export function Phase2TipsCards() {
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
          className="flex gap-5 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 pl-4 pr-6"
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

