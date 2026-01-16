import { Card } from '../ui/Card';

export function TeamInsigniaCard() {
  return (
    <Card 
      variant="default" 
      className="relative transition-all duration-300 benefit-card-rose"
    >
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
        {/* Team Insignia Image */}
        <div className="flex-shrink-0">
          <img
            src="/mas_pasos_equipo.png"
            alt="Más pasos en equipo - Insignia especial de equipo"
            className="w-32 h-32 md:w-40 md:h-40 object-contain drop-shadow-lg"
          />
        </div>

        {/* Content */}
        <div className="flex-1 text-center md:text-left min-w-0">
          <div className="mb-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal/10 border border-teal/20 mb-3">
              <span className="text-sm md:text-base font-bold text-teal">
                Equipo
              </span>
            </div>
          </div>

          <h3 className="text-heading-3 mb-3 md:mb-4 font-bold text-teal">
            Más pasos en equipo - Insignia especial de equipo
          </h3>

          <p className="text-gray-700 text-base md:text-lg leading-relaxed">
            Esta insignia se otorga al equipo que haya acumulado la mayor cantidad de kilómetros caminados en conjunto durante todo el programa de entrenamiento.
            <br /><br />
            La contabilización final de los kilómetros de todos los equipos se realizará en febrero de 2027, al cierre oficial del programa. En ese momento se asignará esta insignia a todas las personas integrantes del equipo ganador, antes de partir al viaje del Camino de Santiago en marzo.
            <br /><br />
            Esta insignia reconoce la fuerza del trabajo en equipo, la constancia colectiva y el valor de caminar acompañados durante todo el año.
          </p>
        </div>
      </div>
    </Card>
  );
}
