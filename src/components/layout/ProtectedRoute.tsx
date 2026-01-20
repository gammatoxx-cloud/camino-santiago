import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useUserPlan } from '../../hooks/useUserPlan';
import { hasPlanAccess, getRequiredPlanForPage } from '../../lib/userPlans';
import { isAdmin } from '../../lib/admin';
import { useLocation } from 'react-router-dom';
import { hasActiveSubscription } from '../../lib/wixPayments';
import { SubscriptionBanner } from '../subscription/SubscriptionBanner';
import type { UserPlan } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireSubscription?: boolean; // Optional: require active subscription
  requiredPlan?: UserPlan | null; // Optional: require specific plan level
}

export function ProtectedRoute({ 
  children, 
  requireSubscription = false,
  requiredPlan = null,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const { plan, loading: planLoading } = useUserPlan();
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);
  const [checkingSubscription, setCheckingSubscription] = useState(false);

  // Determine required plan from route if not explicitly provided
  const effectiveRequiredPlan = requiredPlan !== undefined 
    ? requiredPlan 
    : getRequiredPlanForPage(location.pathname);

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

  if (loading || planLoading || (requireSubscription && checkingSubscription)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-teal text-xl">Cargando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Check plan access if required
  // Admin always has full access regardless of plan
  const isUserAdmin = user ? isAdmin(user) : false;
  if (effectiveRequiredPlan && plan && !isUserAdmin) {
    const hasAccess = hasPlanAccess(plan, effectiveRequiredPlan, user);
    if (!hasAccess) {
      // Redirect to subscription page for upgrade
      return <Navigate to="/subscription" replace />;
    }
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

