import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SectionHeader } from '../components/ui/SectionHeader';
import { SubscriptionStatus } from '../components/subscription/SubscriptionStatus';
import { useAuth } from '../contexts/AuthContext';
import { createPaymentLink, hasActiveSubscription } from '../lib/wixPayments';
import { supabase } from '../lib/supabase';

export function SubscriptionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isActive, setIsActive] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<{ name: string; email: string } | null>(null);

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

      // Load profile for user info
      const { data: profileData } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .maybeSingle();

      const active = await hasActiveSubscription();
      setIsActive(active);

      if (profileData) {
        setProfile({
          name: profileData.name,
          email: user.email || '',
        });
      }
    }

    loadData();
  }, [user, navigate]);

  const handleSubscribe = async () => {
    if (!user || !profile) {
      setError('Por favor, completa tu perfil primero.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await createPaymentLink(
        profile.email,
        profile.name,
        user.id
      );

      if (result.error || !result.paymentLinkUrl) {
        setError(result.error || 'No se pudo crear el enlace de pago. Por favor, intenta de nuevo.');
        setLoading(false);
        return;
      }

      // Redirect to Wix checkout
      window.location.href = result.paymentLinkUrl;
    } catch (err) {
      console.error('Error creating payment link:', err);
      setError('Ocurrió un error. Por favor, intenta de nuevo.');
      setLoading(false);
    }
  };

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

          {/* Subscription Info */}
          <Card>
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-teal mb-4">
                  Plan Mensual - $20/mes
                </h2>
                <p className="text-gray-700 mb-4">
                  Accede a todo el programa de entrenamiento del Camino de Santiago:
                </p>
                <ul className="space-y-2 text-gray-700 mb-6">
                  <li className="flex items-start">
                    <span className="text-teal mr-2">✓</span>
                    <span>Programa completo de 52 semanas de entrenamiento</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-teal mr-2">✓</span>
                    <span>Seguimiento de progreso y estadísticas</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-teal mr-2">✓</span>
                    <span>Acceso a la biblioteca de videos y recursos</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-teal mr-2">✓</span>
                    <span>Funciones de comunidad y equipos</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-teal mr-2">✓</span>
                    <span>Insignias y logros</span>
                  </li>
                </ul>
              </div>

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

              {!isActive && (
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleSubscribe}
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? 'Procesando...' : 'Suscribirse por $20/mes'}
                  </Button>
                </div>
              )}

              {isActive && (
                <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
                  <p className="text-green-800 font-semibold">
                    ¡Tienes una suscripción activa! Disfruta de todo el contenido.
                  </p>
                </div>
              )}
            </div>
          </Card>

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
