import type { WalkCompletion, PhaseUnlock, TrailCompletion, BookCompletion, MagnoliasHikeCompletion } from '../types';
import { getBookCategory } from './booksData';
import { getHikePoints } from './magnoliasHikesData';

/**
 * Points awarded for completing a phase
 */
export const PHASE_COMPLETION_POINTS = 50;

/**
 * Points awarded for completing a trail
 */
export const TRAIL_COMPLETION_POINTS = 20;

/**
 * Points awarded for completing a libro imprescindible
 */
export const BOOK_IMPRESCINDIBLE_POINTS = 75;

/**
 * Points awarded for completing a libro recomendado
 */
export const BOOK_RECOMENDADO_POINTS = 50;

/**
 * Calculate points from completed walks
 * Each kilometer walked earns 1 point
 */
export function calculateWalkPoints(walkCompletions: WalkCompletion[]): number {
  return walkCompletions.reduce((total, completion) => {
    return total + Number(completion.distance_km);
  }, 0);
}

/**
 * Calculate points from completed phases
 * Each phase completion earns PHASE_COMPLETION_POINTS (50 points)
 */
export function calculatePhasePoints(phaseUnlocks: PhaseUnlock[]): number {
  return phaseUnlocks.length * PHASE_COMPLETION_POINTS;
}

/**
 * Calculate points from completed trails
 * Each trail completion earns TRAIL_COMPLETION_POINTS (20 points)
 */
export function calculateTrailPoints(trailCompletions: TrailCompletion[]): number {
  return trailCompletions.length * TRAIL_COMPLETION_POINTS;
}

/**
 * Calculate points from completed books
 * - Libro imprescindible: BOOK_IMPRESCINDIBLE_POINTS (75 points)
 * - Libro recomendado: BOOK_RECOMENDADO_POINTS (50 points)
 * - Ficción: 0 points (not mentioned in requirements)
 */
export function calculateBookPoints(bookCompletions: BookCompletion[]): number {
  return bookCompletions.reduce((total, completion) => {
    const category = getBookCategory(completion.book_id);
    if (category === 'imprescindible') {
      return total + BOOK_IMPRESCINDIBLE_POINTS;
    } else if (category === 'recomendado') {
      return total + BOOK_RECOMENDADO_POINTS;
    }
    // Ficción books don't award points
    return total;
  }, 0);
}

/**
 * Calculate points from completed Magnolias hikes
 * Each hike awards a specific number of points based on its hike_id
 */
export function calculateMagnoliasHikePoints(magnoliasHikeCompletions: MagnoliasHikeCompletion[]): number {
  return magnoliasHikeCompletions.reduce((total, completion) => {
    return total + getHikePoints(completion.hike_id);
  }, 0);
}

/**
 * Calculate total score from walks, phase completions, trail completions, book completions, and Magnolias hike completions
 */
export function calculateTotalScore(
  walkCompletions: WalkCompletion[],
  phaseUnlocks: PhaseUnlock[],
  trailCompletions: TrailCompletion[] = [],
  bookCompletions: BookCompletion[] = [],
  magnoliasHikeCompletions: MagnoliasHikeCompletion[] = []
): number {
  const walkPoints = calculateWalkPoints(walkCompletions);
  const phasePoints = calculatePhasePoints(phaseUnlocks);
  const trailPoints = calculateTrailPoints(trailCompletions);
  const bookPoints = calculateBookPoints(bookCompletions);
  const magnoliasHikePoints = calculateMagnoliasHikePoints(magnoliasHikeCompletions);
  return walkPoints + phasePoints + trailPoints + bookPoints + magnoliasHikePoints;
}

