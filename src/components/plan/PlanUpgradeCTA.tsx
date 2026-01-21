import { Button } from '../ui/Button';
import type { UserPlan } from '../../types';

interface PlanUpgradeCTAProps {
  upgradeToPlan: UserPlan;
  className?: string;
  variant?: 'button' | 'inline';
}

const PLAN_NAMES: Record<UserPlan, string> = {
  gratis: 'Gratis',
  basico: 'Básico',
  completo: 'Completo',
};

const PLAN_BENEFITS: Record<UserPlan, string[]> = {
  gratis: ['Acceso a Recursos', 'Editar perfil'],
  basico: [
    'Todo lo de Gratis',
    'Acceso al Tablero',
    'Entrenamiento completo',
    'Equipos y comunidad',
    'Senderos y galería',
    'Insignias',
  ],
  completo: [
    'Todo lo de Básico',
    'Caminatas Magnolias',
    'Acceso completo a todas las funciones',
  ],
};

export function PlanUpgradeCTA({
  upgradeToPlan,
  className = '',
  variant = 'button',
}: PlanUpgradeCTAProps) {
  const planName = PLAN_NAMES[upgradeToPlan];
  const benefits = PLAN_BENEFITS[upgradeToPlan];

  const handleUpgrade = () => {
    // Open payment link in new tab (same as Profile section)
    window.open('https://www.magnoliasusa.org/pricing-plans/planes', '_blank');
  };

  if (variant === 'inline') {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <Button variant="primary" size="sm" onClick={handleUpgrade}>
          Actualizar a {planName}
        </Button>
      </div>
    );
  }

  return (
    <div className={`glass-card-elevated rounded-3xl p-6 md:p-8 ${className}`}>
      <div className="text-center mb-6">
        <h3 className="text-2xl md:text-3xl font-bold text-teal mb-2">
          Actualiza a {planName}
        </h3>
        <p className="text-gray-600 text-base md:text-lg">
          Desbloquea todas las funciones del plan {planName}
        </p>
      </div>

      <ul className="space-y-3 mb-8">
        {benefits.map((benefit, index) => (
          <li key={index} className="flex items-start gap-3">
            <svg
              className="w-6 h-6 text-teal flex-shrink-0 mt-0.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-gray-700 text-base md:text-lg">{benefit}</span>
          </li>
        ))}
      </ul>

      <Button
        variant="primary"
        size="lg"
        onClick={handleUpgrade}
        className="w-full min-h-[56px] text-lg font-bold"
      >
        Actualizar a {planName}
      </Button>
    </div>
  );
}
