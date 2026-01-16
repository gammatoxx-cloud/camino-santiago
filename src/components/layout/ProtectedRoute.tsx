import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { hasActiveSubscription } from '../../lib/wixPayments';
import { SubscriptionBanner } from '../subscription/SubscriptionBanner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireSubscription?: boolean; // Optional: require active subscription
}

export function ProtectedRoute({ children, requireSubscription = false }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);
  const [checkingSubscription, setCheckingSubscription] = useState(false);

  useEffect(() => {
    async function checkSubscription() {
      if (!user || !requireSubscription) {
        setHasSubscription(true); // Don't block if subscription not required
        return;
      }

      setCheckingSubscription(true);
      const active = await hasActiveSubscription();
      setHasSubscription(active);
      setCheckingSubscription(false);
    }

    checkSubscription();
  }, [user, requireSubscription]);

  if (loading || (requireSubscription && checkingSubscription)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-teal text-xl">Cargando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // If subscription is required but user doesn't have one, show content with banner
  // (You can change this to redirect to /subscription if preferred)
  if (requireSubscription && hasSubscription === false) {
    return (
      <>
        <SubscriptionBanner />
        {children}
      </>
    );
  }

  return <>{children}</>;
}

