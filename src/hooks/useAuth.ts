import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import { signIn, signUp, signOut as authSignOut } from '../lib/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    let initialLoadComplete = false;

    // Get initial session first - this is the source of truth
    supabase.auth.getSession().then(({ data: { session }, error: sessionError }) => {
      if (mounted) {
        initialLoadComplete = true;
        if (!sessionError) {
          setUser(session?.user ?? null);
        }
        setLoading(false);
      }
    });

    // Listen for auth changes after initial load
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        // Update user from auth state changes
        setUser(session?.user ?? null);
        // Only set loading to false if initial load is complete (to handle INITIAL_SESSION event)
        if (initialLoadComplete && _event === 'INITIAL_SESSION') {
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSignUp = async (email: string, password: string) => {
    try {
      setError(null);
      const { data, error: signUpError } = await signUp(email, password);
      if (signUpError) throw signUpError;
      return { data, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Sign up failed');
      setError(error);
      return { data: null, error };
    }
  };

  const handleSignIn = async (email: string, password: string) => {
    try {
      setError(null);
      const { data, error: signInError } = await signIn(email, password);
      if (signInError) throw signInError;
      return { data, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Sign in failed');
      setError(error);
      return { data: null, error };
    }
  };

  const handleSignOut = async () => {
    try {
      setError(null);
      const { error: signOutError } = await authSignOut();
      if (signOutError) throw signOutError;
      return { error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Sign out failed');
      setError(error);
      return { error };
    }
  };

  return {
    user,
    loading,
    error,
    signUp: handleSignUp,
    signIn: handleSignIn,
    signOut: handleSignOut,
  };
}

