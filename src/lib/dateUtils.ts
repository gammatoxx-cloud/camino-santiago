import { differenceInDays, addDays, startOfDay } from 'date-fns';

/**
 * Calculate which week the user is currently in (1-52)
 * 
 * NOTE: Start date tracking has been permanently disabled.
 * This function now always returns week 1.
 * Week progression is now managed through phase unlocks and completions.
 */
export function calculateCurrentWeek(startDate: Date): number {
  // Start date tracking disabled - always return week 1
  // Week progression is now based on phase unlocks and manual selection
  return 1;
}

/**
 * Get the start date of a specific week (Monday of that week)
 */
export function getWeekStartDate(startDate: Date, weekNumber: number): Date {
  const daysToAdd = (weekNumber - 1) * 7;
  return addDays(startDate, daysToAdd);
}

/**
 * Check if a phase is unlocked for the user
 */
export function isPhaseUnlocked(userPhase: number, targetPhase: number): boolean {
  return targetPhase <= userPhase;
}

/**
 * Get the day name for a given date
 */
export function getDayName(date: Date): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}

