import type { User } from '@supabase/supabase-js';

/**
 * Admin email address
 */
const ADMIN_EMAIL = 'edith.fuentes.2022@gmail.com';

/**
 * Check if a user is the admin
 * @param user - The user object from Supabase auth
 * @returns true if the user is the admin, false otherwise
 */
export function isAdmin(user: User | null): boolean {
  if (!user || !user.email) {
    return false;
  }
  return user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}
