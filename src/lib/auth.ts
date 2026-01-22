import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';

export async function signUp(email: string, password: string) {
  // Normalize email and password to prevent whitespace/case issues
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPassword = password.trim();
  
  // Try to sign up without requiring email confirmation
  // This will work if email confirmation is disabled in Supabase settings
  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
    password: normalizedPassword,
    options: {
      emailRedirectTo: window.location.origin + '/auth',
      // If email confirmation is disabled, user will be able to log in immediately
    },
  });
  return { data, error };
}

export async function signIn(email: string, password: string) {
  // Normalize email and password to prevent whitespace/case issues
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPassword = password.trim();
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password: normalizedPassword,
  });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function updateEmail(newEmail: string) {
  const { data, error } = await supabase.auth.updateUser({
    email: newEmail,
  });
  return { data, error };
}

export async function updatePassword(newPassword: string) {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  return { data, error };
}

export async function resendVerificationEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  
  // Try standard resend first
  let { data, error } = await supabase.auth.resend({
    type: 'signup',
    email: normalizedEmail,
  });
  
  // If that fails, try with redirect options
  if (error) {
    const result = await supabase.auth.resend({
      type: 'signup',
      email: normalizedEmail,
      options: {
        emailRedirectTo: window.location.origin + '/auth',
      },
    });
    data = result.data;
    error = result.error;
  }
  
  return { data, error };
}