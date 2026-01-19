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
    icon: '🐢',
    title: 'Ritmo Sostenido',
    subtitle: 'Encuentra tu ritmo eterno que dura por horas',
    description: 'Tu ritmo sostenible se siente fácil—puedes mantener una conversación y tu respiración se mantiene constante. Para caminatas de 8-10km, resiste la tentación de empezar rápido. Busca esfuerzo consistente, no velocidad.\n\nRevisa cada kilómetro: ¿Puedo mantener esto por otra hora? Si no, baja el ritmo. En el Camino, la tortuga le gana a la liebre siempre. Un ritmo constante y cómodo te lleva más lejos con menos fatiga.',
  },
  {
    icon: '🧠',
    title: 'Estrategias Mentales',
    subtitle: 'Mantén tu mente activa cuando los kilómetros se alargan',
    description: 'Las caminatas largas pueden sentirse monótonas—es normal. Divide la distancia en partes: "solo hasta ese árbol," luego el siguiente punto de referencia. Cuenta pasos en grupos de 100, o sincroniza la respiración con un ritmo.\n\nMantente presente notando cinco cosas que puedes ver, oír, u oler. Escucha música, podcasts, o abraza el silencio. Cambia tu enfoque cuando llegue el aburrimiento. Tu mente es un músculo—entrénala junto con tu cuerpo.',
  },
  {
    icon: '🎒',
    title: 'Peso de la Mochila',
    subtitle: 'Prepara tu cuerpo para lo real',
    description: 'Comienza a agregar peso en la semana 21—empieza con 1kg, aumentando gradualmente a 2-3kg para la semana 36. Usa botellas de agua o bolsas de arroz en tu mochila. Distribuye el peso uniformemente, manteniendo artículos más pesados cerca de tu espalda.\n\nTu cuerpo necesita tiempo para adaptarse a cargar peso. Enfócate en mantener buena postura—no te inclines hacia adelante. Ajusta las correas para que el cinturón de cadera lleve la mayor parte del peso. Para la Fase 4, una mochila cargada se sentirá natural.',
  },
  {
    icon: '🩹',
    title: 'Manejo de Ampollas',
    subtitle: 'Técnicas avanzadas para proteger tus pies',
    description: 'La prevención es clave: Aplica lubricante (Vaselina o bálsamo anti-rozaduras) en áreas propensas antes de caminar. Usa cinta para ampollas pre-cortada en puntos vulnerables como talones y dedos.\n\nSi se forma una ampolla, no la revientes a menos que sea necesario. Limpia el área, aplica un parche hidrocoloide para ampollas, y asegura con cinta médica. Cambia calcetines a la primera señal de humedad. Considera talco para pies para reducir fricción. Domina estas técnicas ahora—son esenciales para peregrinas.',
  },
];

export function Phase3TipsCards() {
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

