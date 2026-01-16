import { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getSubscriptionStatus } from '../../lib/wixPayments';
import type { SubscriptionStatus as SubscriptionStatusType } from '../../lib/wixPayments';

export function SubscriptionStatus() {
  const [subscription, setSubscription] = useState<SubscriptionStatusType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSubscription() {
      const sub = await getSubscriptionStatus();
      setSubscription(sub);
      setLoading(false);
    }

    loadSubscription();
  }, []);

  if (loading) {
    return (
      <Card>
        <div className="text-center py-4">
          <div className="text-teal">Cargando estado de suscripción...</div>
        </div>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card>
        <div className="text-center py-4">
          <p className="text-gray-700 mb-4">No tienes una suscripción activa.</p>
        </div>
      </Card>
    );
  }

  const periodEnd = new Date(subscription.current_period_end);
  const isActive = subscription.status === 'active';
  const isExpiringSoon = isActive && periodEnd.getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000; // 7 days

  return (
    <Card>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-teal">Estado de Suscripción</h3>
          <span
            className={`px-4 py-2 rounded-full text-sm font-semibold ${
              isActive
                ? 'bg-green-100 text-green-800'
                : subscription.status === 'pending'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {subscription.status === 'active'
              ? 'Activa'
              : subscription.status === 'pending'
              ? 'Pendiente'
              : subscription.status === 'canceled'
              ? 'Cancelada'
              : 'Expirada'}
          </span>
        </div>

        {isActive && (
          <>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Período actual:</span>
                <span className="font-semibold text-gray-900">
                  {format(new Date(subscription.current_period_start), 'd MMM yyyy', { locale: es })} -{' '}
                  {format(periodEnd, 'd MMM yyyy', { locale: es })}
                </span>
              </div>
              {subscription.cancel_at_period_end && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Renovación:</span>
                  <span className="font-semibold text-yellow-700">Se cancelará al final del período</span>
                </div>
              )}
            </div>

            {isExpiringSoon && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                <p className="text-yellow-800 text-sm">
                  Tu suscripción expirará pronto. Renueva para continuar disfrutando del acceso completo.
                </p>
              </div>
            )}
          </>
        )}

        {subscription.status === 'pending' && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
            <p className="text-blue-800 text-sm">
              Tu pago está siendo procesado. Tu suscripción se activará una vez que se complete el pago.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
