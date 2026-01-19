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
    icon: '🏃',
    title: 'Ritmo de Larga Distancia',
    subtitle: 'Domina el ritmo que puedes mantener todo el día',
    description: 'Tu ritmo de todo el día es más lento de lo que piensas—y eso es perfecto. Comienza cada caminata larga a un ritmo que se sienta casi demasiado fácil. Deberías poder platicar cómodamente durante la primera hora.\n\nRevisa regularmente: "¿Puedo mantener esto por 3 horas más?" Si tu respuesta vacila, baja el ritmo inmediatamente. Pequeños ajustes de ritmo al principio te salvan de agotarte después. El Camino recompensa la paciencia y la constancia.',
  },
  {
    icon: '🧘',
    title: 'Resistencia Mental',
    subtitle: 'Entrena tu mente para el largo camino',
    description: 'Caminatas de varias horas son un juego mental. Rota entre estrategias: comienza con música para energía, cambia a podcasts para distraerte, luego abraza el silencio para conectar con tu entorno.\n\nCuando lleguen pensamientos negativos, reconócelos y déjalos pasar. Enfócate en el siguiente kilómetro, no en la distancia total. Practica la gratitud—nota tres cosas hermosas a tu alrededor. Tu herramienta mental es tan importante como tu fuerza física.',
  },
  {
    icon: '🍎',
    title: 'Nutrición Avanzada',
    subtitle: 'Aliméntate inteligentemente para energía sostenida',
    description: 'Para caminatas de más de 12km, consume 30-60 gramos de carbohidratos por hora: un plátano, barra energética, o un puñado de frutos secos. Combina comida con hidratación regular—nunca una sin la otra.\n\nDentro de los 30 minutos de terminar, come proteína y carbohidratos juntos: yogurt con granola, un sándwich, o licuado de proteína. Esta ventana de recuperación repara músculos y restaura energía. Experimenta ahora para encontrar qué tolera tu cuerpo mientras caminas.',
  },
  {
    icon: '📅',
    title: 'Simulación de Múltiples Días',
    subtitle: 'Prepárate para días largos consecutivos en el Camino',
    description: 'Caminatas largas consecutivas enseñan a tu cuerpo a recuperarse rápido. Intenta 12km el sábado seguido de 10km el domingo. El día dos se sentirá más difícil—ese es el punto. Estás entrenando piernas cansadas para seguir adelante.\n\nEscucha tu cuerpo: tómalo con calma el día dos si es necesario. Prioriza la recuperación entre días: estira, hidrátate, come bien, y duerme. El Camino significa caminar con fatiga—esta simulación construye la resistencia que necesitarás.',
  },
  {
    icon: '🎒',
    title: 'Equipo Completo del Camino',
    subtitle: 'Entrena con el peso que llevarás en España',
    description: 'Carga tu mochila a 5-7kg: ropa, agua, snacks, botiquín, impermeable. Esta es tu realidad del Camino. Camina con ella en cada caminata larga de entrenamiento de ahora en adelante.\n\nAjusta las correas para que el 80% del peso se asiente en tus caderas, no en los hombros. Empaca artículos más pesados cerca de tu espalda. Nota cualquier roce o incomodidad ahora y corrígelo. Una mochila bien ajustada y familiar se vuelve una extensión de tu cuerpo.',
  },
  {
    icon: '🌦️',
    title: 'Resistencia al Clima',
    subtitle: 'Entrena en todas las condiciones—el Camino no espera clima perfecto',
    description: 'No te saltes caminatas por el clima. Lluvia, viento y calor son tus compañeros de entrenamiento ahora. Prueba tu equipo para lluvia—¿te mantiene seca? Acalórate bajo el sol—aprende a ajustar capas y ritmo.\n\nCamina bajo lluvia ligera para entender qué significa realmente "impermeable". Prueba el frío de la mañana temprano y el calor del mediodía. Descubre cómo responde tu cuerpo a diferentes condiciones. La resistencia al clima construye confianza—sabrás que puedes manejar lo que España traiga.',
  },
];

export function Phase4TipsCards() {
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

