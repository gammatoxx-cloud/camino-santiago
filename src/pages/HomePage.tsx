import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { SectionHeader } from '../components/ui/SectionHeader';
import { useAuth } from '../contexts/AuthContext';

export function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center px-4 py-20 md:py-32 md:pt-32 overflow-hidden bg-white">
        {/* Accent gradient background with subtle colors */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to bottom right, white 0%, rgba(247, 231, 190, 0.15) 30%, rgba(253, 171, 243, 0.08) 60%, rgba(12, 76, 109, 0.1) 100%)'
        }} />
        {/* Decorative pattern overlay */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #0c4c6d 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            {/* Left side - Text and CTA */}
            <div className="flex-1 text-left w-full md:w-auto">
              <h1 className="text-display text-teal mb-6">
                Un año de entrenamiento en comunidad para llegar listos al Camino de Santiago.
              </h1>
              <p className="text-xl md:text-2xl text-gray-700 mb-10 font-medium max-w-2xl">
                Un programa integral de entrenamiento para el Camino de Santiago que combina caminatas, comunidad, cultura y bienestar, guiado por la fundación Magnolias.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                {user ? (
                  <Link to="/training">
                    <Button variant="primary" size="lg">
                      Continuar Entrenamiento
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/auth">
                      <Button variant="primary" size="lg">
                        Comienza Tu Viaje
                      </Button>
                    </Link>
                    <Link to="/auth">
                      <Button variant="secondary" size="lg">
                        Iniciar Sesión
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
            {/* Right side - Image */}
            <div className="flex-1 w-full md:w-auto">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src="/hiking1.png" 
                  alt="Camino de Santiago" 
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Description Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto w-full">
          <SectionHeader label="Acerca de" icon="📚" />
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 mt-8">
            {/* Left side - Image */}
            <div className="flex-1 w-full md:w-auto order-2 md:order-1">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl max-w-[80%] mx-auto md:mx-0">
                <img 
                  src="/hiking3.png" 
                  alt="Camino de Santiago" 
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
            {/* Right side - Text */}
            <div className="flex-1 w-full md:w-auto order-1 md:order-2">
              <div className="space-y-8 text-lg text-gray-700 leading-relaxed">
                <p className="text-heading-3 text-teal mb-8">
                  Rumbo a Santiago con Magnolias
                </p>
                <div className="callout-box">
                  <p className="mb-0">
                    "Rumbo a Santiago con Magnolias" es la herramienta central del programa de entrenamiento de la <span className="highlight-phrase">fundación Magnolias</span> para el Camino de Santiago.
                  </p>
                </div>
                <p className="text-section-accent">
                  Ofrece un plan progresivo de caminatas, recursos educativos y comunitarios que ayudan a prepararse física y mentalmente para caminar el Camino Francés, dando seguimiento a metas semanales, puntos e insignias dentro de una comunidad que avanza con constancia y propósito.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4" style={{
        background: 'linear-gradient(to bottom, white 0%, rgba(247, 231, 190, 0.1) 50%, white 100%)'
      }}>
        <div className="max-w-6xl mx-auto">
          <SectionHeader label="Beneficios" />
          <h2 className="text-heading-1 text-teal text-center mb-12">
            Beneficios de usar
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card variant="elevated" className="text-center benefit-card-teal transition-all duration-300">
              <div className="flex justify-center mb-6">
                <div className="flex-shrink-0 w-20 h-20 rounded-2xl icon-bg-teal flex items-center justify-center text-4xl">
                  📈
                </div>
              </div>
              <h3 className="text-heading-3 text-teal mb-4">
                Entrenamiento progresivo y realista
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Metas semanales diseñadas para aumentar resistencia y cuidar el cuerpo.
              </p>
            </Card>

            <Card variant="elevated" className="text-center benefit-card-rose transition-all duration-300">
              <div className="flex justify-center mb-6">
                <div className="flex-shrink-0 w-20 h-20 rounded-2xl icon-bg-rose flex items-center justify-center text-4xl">
                  🏆
                </div>
              </div>
              <h3 className="text-heading-3 text-teal mb-4">
                Motivación constante
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Sistema de puntos, insignias y ranking que premia la constancia y el compromiso.
              </p>
            </Card>

            <Card variant="elevated" className="text-center benefit-card-light-pink transition-all duration-300">
              <div className="flex justify-center mb-6">
                <div className="flex-shrink-0 w-20 h-20 rounded-2xl icon-bg-light-pink flex items-center justify-center text-4xl">
                  👥
                </div>
              </div>
              <h3 className="text-heading-3 text-teal mb-4">
                Comunidad activa
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Conexión con otras personas que entrenan para el mismo objetivo y forman equipos locales.
              </p>
            </Card>

            <Card variant="elevated" className="text-center benefit-card-green transition-all duration-300">
              <div className="flex justify-center mb-6">
                <div className="flex-shrink-0 w-20 h-20 rounded-2xl icon-bg-green flex items-center justify-center text-4xl">
                  📚
                </div>
              </div>
              <h3 className="text-heading-3 text-teal mb-4">
                Preparación integral
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Acceso a videos, lecturas y recursos sobre el Camino de Santiago, senderismo y bienestar.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Train Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto w-full">
          <h2 className="text-heading-1 text-teal text-center mb-12">
            ¿Por qué entrenar para el Camino de Santiago con fundación Magnolias?
          </h2>
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            {/* Left side - Image */}
            <div className="flex-1 w-full md:w-auto order-2 md:order-1">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl max-w-[80%] mx-auto md:mx-0">
                <img 
                  src="/hiking5.png" 
                  alt="Camino de Santiago" 
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
            {/* Right side - Text */}
            <div className="flex-1 w-full md:w-auto order-1 md:order-2">
              <div className="space-y-8 text-lg text-gray-700 leading-relaxed">
                <p className="text-section-accent">
                  Entrenar para el Camino de Santiago no es solo prepararse para caminar largas distancias; es iniciar un proceso de compromiso personal, constancia y crecimiento.
                </p>
                <div className="callout-box callout-box-rose">
                  <p className="mb-0">
                    En la <span className="highlight-phrase">fundación Magnolias</span> creemos que el Camino comienza mucho antes de llegar a España.
                  </p>
                </div>
                <p className="text-section-accent text-section-accent-rose">
                  Nuestro programa está diseñado para acompañar a personas de distintas edades y niveles físicos en un entrenamiento consciente, seguro y progresivo, integrando movimiento, aprendizaje y comunidad para que cada paso tenga sentido.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Foundation Section */}
      <section className="py-20 px-4" style={{
        background: 'linear-gradient(to bottom, white 0%, rgba(12, 76, 109, 0.05) 50%, white 100%)'
      }}>
        <div className="max-w-7xl mx-auto w-full">
          <h2 className="text-heading-1 text-teal text-center mb-12">
            Acerca de fundación Magnolias
          </h2>
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            {/* Left side - Text */}
            <div className="flex-1 w-full md:w-auto order-1">
              <div className="space-y-8 text-lg text-gray-700 leading-relaxed">
                <p className="text-section-accent">
                  La <span className="highlight-phrase">fundación Magnolias</span> es una organización sin fines de lucro dedicada a acompañar, empoderar y fortalecer a mujeres hispanohablantes a través de programas de integración, bienestar, comunidad y crecimiento personal.
                </p>
                <div className="callout-box">
                  <p className="mb-0">
                    Creamos espacios seguros donde cada persona puede desarrollarse, conectar con otras y construir una vida más plena, consciente y solidaria.
                  </p>
                </div>
              </div>
            </div>
            {/* Right side - Image */}
            <div className="flex-1 w-full md:w-auto order-2">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl max-w-[80%] mx-auto md:mx-0">
                <img 
                  src="/magnolias1.png" 
                  alt="Fundación Magnolias" 
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="relative py-20 px-4 text-white text-center overflow-hidden mb-[-6rem] md:mb-0">
          {/* Gradient background from teal to rose */}
          <div className="absolute inset-0 bg-gradient-to-br from-teal via-teal-600 to-rose-700" />
          {/* Decorative pattern overlay */}
          <div className="absolute inset-0 opacity-[0.05]" style={{
            backgroundImage: `radial-gradient(circle at 3px 3px, white 1px, transparent 0)`,
            backgroundSize: '30px 30px'
          }} />
          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl">
                ✨
              </div>
            </div>
            <h2 className="text-heading-1 mb-6 drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]">
              ¿Lista para Comenzar?
            </h2>
            <p className="text-xl mb-10 opacity-95 drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)]">
              Únete a cientos de mujeres en su viaje al Camino de Santiago
            </p>
            <Link to="/auth">
              <Button variant="secondary" size="lg" className="shadow-2xl hover:shadow-rose-500/50">
                Comienza Tu Viaje Hoy
              </Button>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}

