import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SectionHeader } from '../components/ui/SectionHeader';
import { SubscriptionStatus } from '../components/subscription/SubscriptionStatus';
import { useAuth } from '../contexts/AuthContext';
import { hasActiveSubscription } from '../lib/wixPayments';

export function SubscriptionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [isActive, setIsActive] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check for success/error params from Wix redirect
  useEffect(() => {
    const success = searchParams.get('success');
    const errorParam = searchParams.get('error');

    if (success === 'true') {
      // Payment successful - refresh subscription status
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }

    if (errorParam === 'true') {
      setError('Hubo un error al procesar el pago. Por favor, intenta de nuevo.');
    }
  }, [searchParams]);

  useEffect(() => {
    async function loadData() {
      if (!user) {
        navigate('/');
        return;
      }

      const active = await hasActiveSubscription();
      setIsActive(active);
    }

    loadData();
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-cream pb-24 md:pb-6 pt-10 md:pt-12">
      <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
        <SectionHeader label="Suscripción" icon="💳" />

        <div className="space-y-8">
          {/* Current Status */}
          <SubscriptionStatus />

          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {searchParams.get('success') === 'true' && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
              <p className="text-green-800 text-sm">
                ¡Pago exitoso! Tu suscripción está siendo activada...
              </p>
            </div>
          )}

          {isActive && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
              <p className="text-green-800 font-semibold">
                ¡Tienes una suscripción activa! Disfruta de todo el contenido.
              </p>
            </div>
          )}

          {/* Plans */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Plan Básico */}
            <Card className="flex flex-col">
              <div className="flex-1 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-teal mb-2">
                    Plan Básico
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Acceso completo a todas las funciones
                  </p>
                </div>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <svg
                      className="w-6 h-6 text-teal flex-shrink-0 mt-0.5 mr-2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Todo lo de Gratis</span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="w-6 h-6 text-teal flex-shrink-0 mt-0.5 mr-2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Acceso al Tablero</span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="w-6 h-6 text-teal flex-shrink-0 mt-0.5 mr-2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Entrenamiento completo</span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="w-6 h-6 text-teal flex-shrink-0 mt-0.5 mr-2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Equipos y comunidad</span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="w-6 h-6 text-teal flex-shrink-0 mt-0.5 mr-2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Senderos y galería</span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="w-6 h-6 text-teal flex-shrink-0 mt-0.5 mr-2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Insignias</span>
                  </li>
                </ul>
              </div>
              <div className="mt-6">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => {
                    window.open('https://www.magnoliasusa.org/pricing-plans/planes', '_blank');
                  }}
                  className="w-full min-h-[56px] text-lg font-bold"
                >
                  Actualizar a Básico
                </Button>
              </div>
            </Card>

            {/* Plan Completo */}
            <Card className="flex flex-col">
              <div className="flex-1 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-teal mb-2">
                    Plan Completo
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Acceso completo incluyendo Caminatas Magnolias
                  </p>
                </div>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <svg
                      className="w-6 h-6 text-teal flex-shrink-0 mt-0.5 mr-2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Todo lo de Básico</span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="w-6 h-6 text-teal flex-shrink-0 mt-0.5 mr-2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Caminatas Magnolias</span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="w-6 h-6 text-teal flex-shrink-0 mt-0.5 mr-2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Acceso completo a todas las funciones</span>
                  </li>
                </ul>
              </div>
              <div className="mt-6">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => {
                    window.open('https://www.magnoliasusa.org/pricing-plans/planes', '_blank');
                  }}
                  className="w-full min-h-[56px] text-lg font-bold"
                >
                  Actualizar a Completo
                </Button>
              </div>
            </Card>
          </div>

          {/* FAQ */}
          <Card variant="subtle">
            <h3 className="text-xl font-bold text-teal mb-4">Preguntas Frecuentes</h3>
            <div className="space-y-4 text-gray-700">
              <div>
                <p className="font-semibold mb-1">¿Puedo cancelar en cualquier momento?</p>
                <p className="text-sm">
                  Sí, puedes cancelar tu suscripción en cualquier momento. Tu acceso continuará hasta el final del período de facturación actual.
                </p>
              </div>
              <div>
                <p className="font-semibold mb-1">¿Cómo se renueva mi suscripción?</p>
                <p className="text-sm">
                  Tu suscripción se renueva automáticamente cada mes. Se te cobrará $20 al inicio de cada período de facturación.
                </p>
              </div>
              <div>
                <p className="font-semibold mb-1">¿Qué métodos de pago aceptan?</p>
                <p className="text-sm">
                  Aceptamos todas las tarjetas de crédito y débito principales a través de Wix Payments.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
