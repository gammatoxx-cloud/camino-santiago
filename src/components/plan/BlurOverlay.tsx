import React from 'react';
import { Button } from '../ui/Button';
import type { UserPlan } from '../../types';

interface BlurOverlayProps {
  requiredPlan: UserPlan;
  upgradeToPlan: UserPlan;
  onUpgrade: () => void;
  className?: string;
}

const PLAN_NAMES: Record<UserPlan, string> = {
  gratis: 'Gratis',
  basico: 'Básico',
  completo: 'Completo',
};

const PLAN_DESCRIPTIONS: Record<UserPlan, string> = {
  gratis: 'Plan gratuito con acceso limitado',
  basico: 'Acceso completo a todas las funciones',
  completo: 'Acceso completo incluyendo Caminatas Magnolias',
};

export function BlurOverlay({ requiredPlan, upgradeToPlan, onUpgrade, className = '' }: BlurOverlayProps) {
  const planName = PLAN_NAMES[upgradeToPlan];
  const planDescription = PLAN_DESCRIPTIONS[upgradeToPlan];

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${className}`}
      style={{
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        backgroundColor: 'rgba(231, 227, 208, 0.85)',
      }}
    >
      <div className="relative w-full max-w-md">
        {/* Blurred content backdrop */}
        <div
          className="absolute inset-0 rounded-3xl"
          style={{
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
          }}
        />

        {/* Content card */}
        <div className="relative glass-card-elevated rounded-3xl p-6 md:p-8 text-center">
          {/* Lock icon */}
          <div className="mb-4 flex justify-center">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-teal/10 flex items-center justify-center">
              <svg
                className="w-8 h-8 md:w-10 md:h-10 text-teal"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl md:text-3xl font-bold text-teal mb-3">
            Contenido Premium
          </h2>

          {/* Description */}
          <p className="text-base md:text-lg text-gray-700 mb-6 leading-relaxed">
            Este contenido requiere el plan <span className="font-semibold text-teal">{planName}</span>.
          </p>

          <p className="text-sm md:text-base text-gray-600 mb-8">
            {planDescription}
          </p>

          {/* Upgrade CTA Button */}
          <Button
            variant="primary"
            size="lg"
            onClick={onUpgrade}
            className="w-full min-h-[56px] text-lg font-bold"
          >
            Actualizar a {planName}
          </Button>

          {/* Close hint */}
          <p className="text-xs text-gray-500 mt-4">
            Contacta al administrador para actualizar tu plan
          </p>
        </div>
      </div>
    </div>
  );
}
