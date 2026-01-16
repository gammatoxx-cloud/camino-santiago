import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  const errorMsg = 'Missing Supabase environment variables. Please check your .env file.\nRequired: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY';
  console.error(errorMsg);
  
  // In production, show user-friendly error
  if (import.meta.env.PROD) {
    throw new Error('Application configuration error. Please contact support.');
  }
}

export const supabase = createClient<Database>(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

