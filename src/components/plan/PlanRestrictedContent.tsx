import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useUserPlan } from '../../hooks/useUserPlan';
import { hasPlanAccess } from '../../lib/userPlans';
import { isAdmin } from '../../lib/admin';
import { BlurOverlay } from './BlurOverlay';
import type { UserPlan } from '../../types';

interface PlanRestrictedContentProps {
  requiredPlan: UserPlan;
  upgradeToPlan: UserPlan;
  children: React.ReactNode;
  className?: string;
}

export function PlanRestrictedContent({
  requiredPlan,
  upgradeToPlan,
  children,
  className = '',
}: PlanRestrictedContentProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { plan, loading } = useUserPlan();
  const [showOverlay] = useState(true);

  // Show loading state
  if (loading || !plan) {
    return (
      <div className={`relative ${className}`}>
        <div className="opacity-50 pointer-events-none">{children}</div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-teal text-lg">Cargando...</div>
        </div>
      </div>
    );
  }

  // Admin always has full access
  const isUserAdmin = user ? isAdmin(user) : false;
  
  // Check if user has access
  const hasAccess = isUserAdmin || hasPlanAccess(plan, requiredPlan, user);

  if (hasAccess) {
    return <div className={className}>{children}</div>;
  }

  // User doesn't have access - show blurred content with overlay
  return (
    <div className={`relative ${className}`}>
      {/* Blurred content */}
      <div
        className="relative"
        style={{
          filter: 'blur(8px)',
          WebkitFilter: 'blur(8px)',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        {children}
      </div>

      {/* Overlay */}
      {showOverlay && (
        <BlurOverlay
          upgradeToPlan={upgradeToPlan}
          onUpgrade={() => {
            // Navigate to subscription page
            navigate('/subscription');
          }}
        />
      )}
    </div>
  );
}
