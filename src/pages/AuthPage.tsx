import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthForm } from '../components/auth/AuthForm';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { isAdmin } from '../lib/admin';

export function AuthPage() {
  const navigate = useNavigate();
  const { user, signUp, signIn } = useAuth();

  useEffect(() => {
    if (user) {
      // Check if user has completed onboarding
      checkOnboardingStatus(user);
    }
  }, [user]);

  const checkOnboardingStatus = async (userToCheck?: typeof user) => {
    const targetUser = userToCheck || user;
    if (!targetUser) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, user_plan')
      .eq('id', targetUser.id)
      .maybeSingle();

    if (profile) {
      // Check user's plan and admin status
      // Type assertion to handle user_plan field that may not be in generated types yet
      const profileData = profile as { id: string; user_plan?: string | null };
      const userPlanValue = profileData.user_plan;
      const userPlan = (userPlanValue && typeof userPlanValue === 'string' && 
        (userPlanValue === 'gratis' || userPlanValue === 'basico' || userPlanValue === 'completo'))
        ? (userPlanValue as 'gratis' | 'basico' | 'completo')
        : 'gratis';
      const userIsAdmin = isAdmin(targetUser);
      
      // Admin always goes to dashboard, basico users go to resources
      if (userIsAdmin) {
        navigate('/');
      } else if (userPlan === 'basico') {
        navigate('/resources');
      } else {
        // For gratis and completo users, go to training (or dashboard for completo)
        navigate('/training');
      }
    } else {
      navigate('/onboarding');
    }
  };

  const handleSignUp = async (email: string, password: string) => {
    const result = await signUp(email, password);
    if (!result.error && result.data?.user) {
      // New user - redirect to email verification page
      navigate('/verify-email');
    }
    return result;
  };

  const handleSignIn = async (email: string, password: string) => {
    const result = await signIn(email, password);
    if (!result.error && result.data?.user) {
      // Check onboarding status - pass user from sign-in result directly
      await checkOnboardingStatus(result.data.user);
    }
    return result;
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 bg-cream">
      <div className="w-full max-w-md">
        <AuthForm onSignUp={handleSignUp} onSignIn={handleSignIn} />
      </div>
    </div>
  );
}

