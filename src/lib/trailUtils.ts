/**
 * Categorizes a trail by its difficulty level.
 * 
 * Rules:
 * - If level contains "moderado", it goes to "moderado" (including "Fácil a Moderado" or "Moderado a Difícil")
 * - If level contains "difícil" or "extenuante" (without moderado), it goes to "dificil"
 * - If level contains "fácil" (without moderado), it goes to "facil"
 * - Default fallback: "facil"
 */
export function categorizeTrailByDifficulty(level: string): 'facil' | 'moderado' | 'dificil' {
  const lowerLevel = level.toLowerCase();
  
  // Moderado takes precedence - if it contains "moderado", it goes to moderado
  if (lowerLevel.includes('moderado')) {
    return 'moderado';
  }
  
  // Difícil or Extenuante (without moderado)
  if (lowerLevel.includes('difícil') || lowerLevel.includes('extenuante')) {
    return 'dificil';
  }
  
  // Fácil (without moderado)
  if (lowerLevel.includes('fácil')) {
    return 'facil';
  }
  
  // Default fallback
  return 'facil';
}
