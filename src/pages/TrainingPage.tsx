import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CurrentWeekCard } from '../components/training/CurrentWeekCard';
import { CurrentPhaseCard } from '../components/training/CurrentPhaseCard';
import { NextPhaseCard } from '../components/training/NextPhaseCard';
import { ScoreCard } from '../components/training/ScoreCard';
import { SectionHeader } from '../components/ui/SectionHeader';
import { PlanRestrictedContent } from '../components/plan/PlanRestrictedContent';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { getCurrentPhase, checkPhaseCompletion } from '../lib/trainingData';
import { calculateTotalScore, calculateWalkPoints } from '../lib/scoringUtils';
import type { UserProfile, WalkCompletion, PhaseUnlock, PhaseCompletion, TrailCompletion, BookCompletion, MagnoliasHikeCompletion } from '../types';


export function TrainingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [completions, setCompletions] = useState<WalkCompletion[]>([]);
  const [allCompletions, setAllCompletions] = useState<WalkCompletion[]>([]); // All completions for scoring
  const [phaseUnlocks, setPhaseUnlocks] = useState<PhaseUnlock[]>([]);
  const [phaseCompletions, setPhaseCompletions] = useState<PhaseCompletion[]>([]);
  const [trailCompletions, setTrailCompletions] = useState<TrailCompletion[]>([]);
  const [bookCompletions, setBookCompletions] = useState<BookCompletion[]>([]);
  const [magnoliasHikeCompletions, setMagnoliasHikeCompletions] = useState<MagnoliasHikeCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasNavigatedRef = useRef(false);
  const [currentWeekNumber, setCurrentWeekNumber] = useState(1);

  const loadData = useCallback(async () => {
    if (!user || hasNavigatedRef.current) return;

    try {
      setLoading(true);
      setError(null);

      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profileData) {
        hasNavigatedRef.current = true;
        navigate('/onboarding', { replace: true });
        return;
      }

      // Check if we've navigated away while loading
      if (hasNavigatedRef.current) return;

      setProfile(profileData);

      // Start date tracking disabled - use current week number or default to week 1
      const currentWeek = currentWeekNumber;

      // Load completions for current week
      const { data: completionsData, error: completionsError } = await supabase
        .from('walk_completions')
        .select('*')
        .eq('user_id', user.id)
        .eq('week_number', currentWeek)
        .order('day_of_week');

      if (completionsError) throw completionsError;
      
      // Check again before setting state
      if (hasNavigatedRef.current) return;
      setCompletions(completionsData || []);

      // Load ALL completions for scoring (not just current week)
      const { data: allCompletionsData, error: allCompletionsError } = await supabase
        .from('walk_completions')
        .select('*')
        .eq('user_id', user.id)
        .order('week_number', { ascending: true })
        .order('day_of_week', { ascending: true });

      if (allCompletionsError) throw allCompletionsError;
      
      // Check again before setting state
      if (hasNavigatedRef.current) return;
      setAllCompletions(allCompletionsData || []);

      // Load phase unlocks
      const { data: unlocksData, error: unlocksError } = await supabase
        .from('phase_unlocks')
        .select('*')
        .eq('user_id', user.id)
        .order('phase_number');

      if (unlocksError) throw unlocksError;
      
      // Check again before setting state
      if (hasNavigatedRef.current) return;
      setPhaseUnlocks(unlocksData || []);

      // Load phase completions
      const { data: phaseCompletionsData, error: phaseCompletionsError } = await supabase
        .from('phase_completions')
        .select('*')
        .eq('user_id', user.id)
        .order('phase_number');

      if (phaseCompletionsError) throw phaseCompletionsError;
      
      // Final check before setting state
      if (hasNavigatedRef.current) return;
      setPhaseCompletions(phaseCompletionsData || []);

      // Load trail completions
      const { data: trailCompletionsData, error: trailCompletionsError } = await supabase
        .from('trail_completions')
        .select('*')
        .eq('user_id', user.id);

      if (trailCompletionsError) throw trailCompletionsError;
      
      // Final check before setting state
      if (hasNavigatedRef.current) return;
      setTrailCompletions(trailCompletionsData || []);

      // Load book completions
      const { data: bookCompletionsData, error: bookCompletionsError } = await supabase
        .from('book_completions')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      if (bookCompletionsError) throw bookCompletionsError;
      
      // Final check before setting state
      if (hasNavigatedRef.current) return;
      setBookCompletions(bookCompletionsData || []);

      // Load Magnolias hike completions
      const { data: magnoliasCompletionsData, error: magnoliasCompletionsError } = await supabase
        .from('magnolias_hikes_completions')
        .select('*')
        .eq('user_id', user.id);

      if (magnoliasCompletionsError) throw magnoliasCompletionsError;
      
      // Check again before setting state
      if (hasNavigatedRef.current) return;
      setMagnoliasHikeCompletions(magnoliasCompletionsData || []);

    } catch (err: any) {
      // Don't set error if we've navigated away
      if (hasNavigatedRef.current) return;
      console.error('Error loading training data:', err);
      setError(err.message || 'Failed to load training data');
    } finally {
      // Only update loading state if we haven't navigated away
      if (!hasNavigatedRef.current) {
        setLoading(false);
      }
    }
  }, [user, navigate]);

  useEffect(() => {
    // Reset navigation flag and state when user changes
    hasNavigatedRef.current = false;
    setProfile(null);
    setCompletions([]);
    setAllCompletions([]);
    setPhaseUnlocks([]);
    setPhaseCompletions([]);
    setTrailCompletions([]);
    setBookCompletions([]);
    setMagnoliasHikeCompletions([]);
    setError(null);
    
    // Only load data when user is available
    if (user) {
      loadData();
    } else {
      // If user is not available (shouldn't happen due to ProtectedRoute, but handle gracefully)
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]); // Only depend on user.id to prevent re-running when user object reference changes

  // Reload completions when current week changes
  useEffect(() => {
    if (user && profile) {
      const reloadCompletions = async () => {
        try {
          const { data: completionsData, error: completionsError } = await supabase
            .from('walk_completions')
            .select('*')
            .eq('user_id', user.id)
            .eq('week_number', currentWeekNumber)
            .order('day_of_week');

          if (completionsError) throw completionsError;
          setCompletions(completionsData || []);

          // Also reload all completions for scoring
          const { data: allCompletionsData, error: allCompletionsError } = await supabase
            .from('walk_completions')
            .select('*')
            .eq('user_id', user.id)
            .order('week_number', { ascending: true })
            .order('day_of_week', { ascending: true });

          if (allCompletionsError) throw allCompletionsError;
          setAllCompletions(allCompletionsData || []);
        } catch (err: any) {
          console.error('Error reloading completions:', err);
        }
      };
      reloadCompletions();
    }
  }, [currentWeekNumber, user, profile]);

  const handleToggleCompletion = async (
    day: string,
    distance: number,
    completed: boolean
  ) => {
    if (!user || !profile) return;

    // Start date tracking disabled - use current week number
    const currentWeek = currentWeekNumber;

    try {
      if (completed) {
        // Delete completion
        const { error: deleteError } = await supabase
          .from('walk_completions')
          .delete()
          .eq('user_id', user.id)
          .eq('week_number', currentWeek)
          .eq('day_of_week', day);

        if (deleteError) throw deleteError;

        setCompletions((prev) =>
          prev.filter((c) => c.day_of_week !== day)
        );
        // Also update all completions for scoring
        setAllCompletions((prev) =>
          prev.filter((c) => !(c.week_number === currentWeek && c.day_of_week === day))
        );
      } else {
        // Insert completion
        const { data, error: insertError } = await supabase
          .from('walk_completions')
          .insert({
            user_id: user.id,
            week_number: currentWeek,
            day_of_week: day,
            distance_km: distance,
          } as any)
          .select()
          .single();

        if (insertError) throw insertError;

        setCompletions((prev) => [...prev, data]);
        // Also update all completions for scoring
        setAllCompletions((prev) => [...prev, data]);
      }

      // Check if phase is complete and unlock next phase
      await checkAndUnlockPhase(currentWeek);
    } catch (err: any) {
      setError(err.message || 'Failed to update completion');
    }
  };

  const checkAndUnlockPhase = async (weekNumber: number) => {
    if (!user) return;

    const phase = getCurrentPhase(weekNumber);
    if (!phase) return;

    // Fetch all completions from database to ensure we have latest data
    const { data: allCompletionsData } = await supabase
      .from('walk_completions')
      .select('*')
      .eq('user_id', user.id)
      .order('week_number', { ascending: true })
      .order('day_of_week', { ascending: true });

    const currentCompletions = (allCompletionsData || []) as WalkCompletion[];

    // Use utility function to check if phase is complete
    const isPhaseComplete = checkPhaseCompletion(phase.number, currentCompletions);

    // If phase is complete, record the completion
    if (isPhaseComplete) {
      // Check if already recorded as completed
      const { data: existingCompletion } = await supabase
        .from('phase_completions')
        .select('id')
        .eq('user_id', user.id)
        .eq('phase_number', phase.number)
        .maybeSingle();

      if (!existingCompletion) {
        const { error: completionError } = await supabase
          .from('phase_completions')
          .insert({
            user_id: user.id,
            phase_number: phase.number,
          } as any);

        if (!completionError) {
          // Reload phase completions
          const { data: phaseCompletionsData } = await supabase
            .from('phase_completions')
            .select('*')
            .eq('user_id', user.id)
            .order('phase_number');

          if (phaseCompletionsData) {
            setPhaseCompletions(phaseCompletionsData);
          }
        }
      }
    }

    // If phase is complete and not Phase 5, unlock next phase
    if (isPhaseComplete && phase.number < 5) {
      const nextPhaseNumber = phase.number + 1;

      // Check if already unlocked
      const { data: existingUnlock } = await supabase
        .from('phase_unlocks')
        .select('id')
        .eq('user_id', user.id)
        .eq('phase_number', nextPhaseNumber)
        .maybeSingle();

      if (!existingUnlock) {
        const { error: unlockError } = await supabase
          .from('phase_unlocks')
          .insert({
            user_id: user.id,
            phase_number: nextPhaseNumber,
          } as any);

        if (!unlockError) {
          // Reload phase unlocks
          const { data: unlocksData } = await supabase
            .from('phase_unlocks')
            .select('*')
            .eq('user_id', user.id)
            .order('phase_number');

          if (unlocksData) {
            setPhaseUnlocks(unlocksData);
          }
        }
      }
    }
  };

  // Calculate score from all completions, phase unlocks, trail completions, book completions, and Magnolias hike completions
  const totalScore = calculateTotalScore(allCompletions, phaseUnlocks, trailCompletions, bookCompletions, magnoliasHikeCompletions);
  const walkPoints = calculateWalkPoints(allCompletions);
  const phaseCount = phaseUnlocks.length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-teal text-xl">Loading your training...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream px-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="px-6 py-3 bg-teal text-white rounded-lg font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream px-4">
        <div className="text-center">
          <p className="text-gray-700 mb-4">No se encontró el perfil. Por favor completa el registro inicial.</p>
          <button
            onClick={() => navigate('/onboarding')}
            className="px-6 py-3 bg-teal text-white rounded-lg font-semibold"
          >
            Ir al Registro Inicial
          </button>
        </div>
      </div>
    );
  }

  // Calculate values after early returns (start date tracking disabled)
  const currentWeek = currentWeekNumber;
  const currentPhase = getCurrentPhase(currentWeek);
  const isSpanishPhase = currentPhase?.number ? currentPhase.number <= 5 : false;
  const maxUnlockedPhase = phaseUnlocks.length > 0
    ? Math.max(...phaseUnlocks.map((u) => u.phase_number))
    : 1;

  return (
    <PlanRestrictedContent requiredPlan="basico" upgradeToPlan="basico">
      <div className="min-h-screen bg-cream pb-20 md:pb-6 pt-8 md:pt-12 overflow-x-hidden">
        <div className="max-w-4xl mx-auto px-4 py-4 md:py-8">
          <SectionHeader label={isSpanishPhase ? "Entrenamiento" : "Training"} icon="🚶" />
          <h1 className="text-heading-1 text-teal mb-12 text-center">
            {isSpanishPhase ? 'Tu Viaje de Entrenamiento' : 'Your Training Journey'}
          </h1>

          <div className="space-y-8">
            <ScoreCard
              totalScore={totalScore}
              walkPoints={walkPoints}
              phaseCount={phaseCount}
              completedPhaseNumbers={phaseCompletions.map((c) => c.phase_number)}
              isSpanishPhase={isSpanishPhase}
            />

            <CurrentWeekCard
              weekNumber={currentWeek}
              completions={completions}
              onToggleCompletion={handleToggleCompletion}
              onWeekChange={setCurrentWeekNumber}
            />

            {currentPhase && (
              <CurrentPhaseCard
                phaseNumber={currentPhase.number}
                currentWeek={currentWeek}
              />
            )}

            {currentPhase && currentPhase.number < 5 && (
              <NextPhaseCard
                nextPhaseNumber={currentPhase.number + 1}
                currentPhaseNumber={maxUnlockedPhase}
              />
            )}
          </div>
        </div>
      </div>
    </PlanRestrictedContent>
  );
}

