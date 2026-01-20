import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserPlan } from '../lib/userPlans';
import type { UserPlan } from '../types';

interface UseUserPlanReturn {
  plan: UserPlan | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch and cache user's plan
 */
export function useUserPlan(): UseUserPlanReturn {
  const { user } = useAuth();
  const [plan, setPlan] = useState<UserPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPlan = async () => {
    if (!user) {
      setPlan(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const userPlan = await getUserPlan(user.id);
      setPlan(userPlan);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch user plan');
      setError(error);
      console.error('Error fetching user plan:', err);
      // Default to 'gratis' on error
      setPlan('gratis');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, [user?.id]);

  return {
    plan,
    loading,
    error,
    refetch: fetchPlan,
  };
}
