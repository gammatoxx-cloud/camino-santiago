import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import { signIn, signUp, signOut as authSignOut } from '../lib/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  signUp: (email: string, password: string) => Promise<{ data: any; error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ data: any; error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Module-level ref to track the current effect instance across remounts
const currentEffectIdRef = { current: Symbol() };

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Create a new effect instance ID
    const effectId = Symbol();
    // Set this as the current effect instance
    currentEffectIdRef.current = effectId;
    let initialSessionHandled = false;

    // Listen for auth changes - this will fire with INITIAL_SESSION event immediately
    // This is the primary source of truth for auth state
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // Check if this is still the current effect instance
      if (currentEffectIdRef.current === effectId) {
        // Always update user state from auth state changes
        const newUser = session?.user ?? null;
        setUser(newUser);
        // Set loading to false when we receive the initial session
        if (_event === 'INITIAL_SESSION') {
          initialSessionHandled = true;
          setLoading(false);
        }
      }
    });

    // Also call getSession immediately to get user state faster
    supabase.auth.getSession().then(({ data: { session }, error: sessionError }) => {
      // Only update state if this is still the current effect instance
      if (currentEffectIdRef.current === effectId && !initialSessionHandled) {
        const immediateUser = !sessionError ? (session?.user ?? null) : null;
        setUser(immediateUser);
        initialSessionHandled = true;
        setLoading(false);
      }
    }).catch((err) => {
      // Still set loading to false on error if this is the current effect
      if (currentEffectIdRef.current === effectId && !initialSessionHandled) {
        initialSessionHandled = true;
        setLoading(false);
      }
    });

    // Fallback: if INITIAL_SESSION doesn't fire within 500ms, use getSession()
    // This handles edge cases where onAuthStateChange might be delayed
    const fallbackTimeout = setTimeout(() => {
      if (currentEffectIdRef.current === effectId && !initialSessionHandled) {
        supabase.auth.getSession().then(({ data: { session }, error: sessionError }) => {
          if (currentEffectIdRef.current === effectId && !initialSessionHandled) {
            const fallbackUser = !sessionError ? (session?.user ?? null) : null;
            if (!sessionError) {
              setUser(fallbackUser);
            }
            initialSessionHandled = true;
            setLoading(false);
          }
        });
      }
    }, 500);

    return () => {
      // Only invalidate if this is still the current effect instance
      // (don't invalidate if a newer effect has already taken over)
      if (currentEffectIdRef.current === effectId) {
        // Invalidate by setting to a new symbol (no effect instance is current)
        currentEffectIdRef.current = Symbol();
      }
      clearTimeout(fallbackTimeout);
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
      // Update user state immediately after successful sign-in
      if (data?.user) {
        setUser(data.user);
        setLoading(false);
      }
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

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signUp: handleSignUp,
        signIn: handleSignIn,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

