import { supabase } from './supabase';
import { isAdmin } from './admin';
import type { User } from '@supabase/supabase-js';
import type { UserPlan } from '../types';

/**
 * Plan hierarchy: gratis < basico < completo
 * Higher plans have access to all lower plan features
 * Admin users always have full access regardless of plan
 */

const PLAN_HIERARCHY: Record<UserPlan, number> = {
  gratis: 0,
  basico: 1,
  completo: 2,
};

/**
 * Get user's plan from database
 */
export async function getUserPlan(userId: string): Promise<UserPlan> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('user_plan')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    if (!data || !data.user_plan) {
      // Default to 'gratis' if not set
      return 'gratis';
    }

    return data.user_plan as UserPlan;
  } catch (error) {
    console.error('Error fetching user plan:', error);
    // Default to 'gratis' on error
    return 'gratis';
  }
}

/**
 * Check if a user plan has access to a required plan level
 * Higher plans automatically have access to lower plan features
 * Admin users always have full access
 */
export function hasPlanAccess(userPlan: UserPlan, requiredPlan: UserPlan, user?: User | null): boolean {
  // Admin always has full access
  if (user && isAdmin(user)) {
    return true;
  }
  return PLAN_HIERARCHY[userPlan] >= PLAN_HIERARCHY[requiredPlan];
}

/**
 * Get the required plan for a given page path
 */
export function getRequiredPlanForPage(path: string): UserPlan | null {
  // Always accessible pages (no plan required)
  const alwaysAccessible = ['/resources', '/profile'];
  if (alwaysAccessible.some(p => path.startsWith(p))) {
    return null;
  }

  // Pages requiring 'completo' plan
  const completoPages = ['/magnolias-hikes'];
  if (completoPages.some(p => path.startsWith(p))) {
    return 'completo';
  }

  // All other dashboard pages require 'basico' plan
  const basicoPages = [
    '/',
    '/training',
    '/teams',
    '/trails',
    '/gallery',
    '/insignias',
    '/dashboard',
  ];
  if (basicoPages.some(p => path === p || path.startsWith(p + '/'))) {
    return 'basico';
  }

  return null;
}

/**
 * Check if user can access a specific page
 * Admin users always have full access
 */
export function canAccessPage(userPlan: UserPlan, path: string, user?: User | null): boolean {
  // Admin always has full access
  if (user && isAdmin(user)) {
    return true;
  }
  
  const requiredPlan = getRequiredPlanForPage(path);
  if (requiredPlan === null) {
    return true; // No plan required
  }
  return hasPlanAccess(userPlan, requiredPlan, user);
}

/**
 * Get the upgrade plan needed for a page
 */
export function getUpgradePlanForPage(path: string): UserPlan | null {
  const requiredPlan = getRequiredPlanForPage(path);
  return requiredPlan;
}
