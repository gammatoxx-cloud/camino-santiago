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
    icon: '💪',
    title: 'Confía en Tu Cuerpo',
    subtitle: 'Has hecho el trabajo—tu cuerpo está listo',
    description: 'Has caminado más de 1,500 kilómetros este año. Tu cuerpo ha cambiado, se ha fortalecido, y sabe exactamente qué hacer. Confía en ese proceso. Las dudas son normales, pero los hechos hablan: completaste 22km y te recuperaste.\n\nNo necesitas probar nada más. Tu fuerza está en los músculos, en los pies que han cargado kilómetros, en los pulmones que han aprendido a respirar en subidas. Respira profundo. Estás lista para el Camino.',
  },
  {
    icon: '🧘',
    title: 'Ensayo Mental',
    subtitle: 'Visualiza tus días exitosos en el Camino',
    description: 'Cierra los ojos e imagina: te despiertas en el albergue, te pones las botas, ajustas tu mochila. Ves el camino extendiéndose frente a ti. Sientes tus piernas fuertes, tu respiración constante. Llegas a tu destino con una sonrisa.\n\nPractica esta visualización diariamente. Imagina manejar momentos difíciles—una subida empinada, pies cansados—y verlos como temporales. Tu mente cree lo que practicas. Visualiza el éxito, y tu cuerpo lo seguirá. Ya eres una peregrina en tu mente.',
  },
  {
    icon: '🎒',
    title: 'Revisión Final de Equipo',
    subtitle: 'Todo probado y listo para España',
    description: 'Revisa cada artículo en tu mochila. ¿Tus botas están bien rodadas? ¿Tu impermeable funciona? ¿Tienes suficientes calcetines y cinta para ampollas? Haz una lista de verificación y márchala ítem por ítem.\n\nEmpaca y desempaca tu mochila una última vez. Asegúrate de que nada roza, todo tiene su lugar, y puedes encontrar lo esencial rápidamente. Pesa tu mochila—debería estar entre 5-7kg. No lleves "por si acaso"—lleva solo lo necesario. Un equipo probado es un equipo confiable.',
  },
  {
    icon: '😴',
    title: 'Disciplina de Descanso',
    subtitle: 'Resiste la tentación de entrenar de más',
    description: 'En estas últimas semanas, tu cuerpo necesita descanso más que kilómetros. Resiste la urgencia de hacer "una caminata más larga" o "probar una última vez." Confía en el plan de reducción gradual—está diseñado para que llegues fresca y fuerte.\n\nEl descanso es cuando tu cuerpo se fortalece verdaderamente. Duerme bien, come nutritivo, estira suavemente. Guarda tu energía para España. Entrenar de más ahora solo arriesga lesión o fatiga. La disciplina más difícil es descansar cuando estás lista para más. Hazlo de todos modos.',
  },
];

export function Phase5TipsCards() {
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

