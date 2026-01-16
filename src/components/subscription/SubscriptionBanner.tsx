import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { hasActiveSubscription } from '../../lib/wixPayments';

interface SubscriptionBannerProps {
  className?: string;
}

export function SubscriptionBanner({ className = '' }: SubscriptionBannerProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSubscription() {
      if (!user) {
        setLoading(false);
        return;
      }

      const active = await hasActiveSubscription();
      setIsActive(active);
      setLoading(false);
    }

    checkSubscription();
  }, [user]);

  if (loading || isActive === null || isActive) {
    return null; // Don't show banner if loading, no user, or subscription is active
  }

  return (
    <Card variant="accent" className={`mb-6 ${className}`}>
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-xl md:text-2xl font-bold text-teal mb-2">
            Acceso Premium Requerido
          </h3>
          <p className="text-gray-700">
            Suscríbete por $20/mes para acceder a todo el programa de entrenamiento del Camino de Santiago.
          </p>
        </div>
        <Button
          variant="primary"
          size="lg"
          onClick={() => navigate('/subscription')}
          className="whitespace-nowrap"
        >
          Suscribirse Ahora
        </Button>
      </div>
    </Card>
  );
}
