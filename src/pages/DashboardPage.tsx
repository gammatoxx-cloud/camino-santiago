import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardTrainingCard } from '../components/dashboard/DashboardTrainingCard';
import { DashboardTeamCard } from '../components/dashboard/DashboardTeamCard';
import { DashboardVideosSection } from '../components/dashboard/DashboardVideosSection';
import { DashboardInsigniasCard } from '../components/dashboard/DashboardInsigniasCard';
import { PlanRestrictedContent } from '../components/plan/PlanRestrictedContent';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { getCurrentPhase, getWeekByNumber, calculateCurrentWeekFromProgress } from '../lib/trainingData';
import { calculateTotalScore, calculateWalkPoints } from '../lib/scoringUtils';
import { getUserTeams, getUserInvitations } from '../lib/teamMatching';
import { videoSections, VideoSection } from '../lib/videoData';
import { insignias } from '../lib/insigniasData';
import { getHikesByEtapa } from '../lib/magnoliasHikesData';
import type { UserProfile, WalkCompletion, PhaseUnlock, TeamWithMembers, TeamInvitationWithDetails, TrailCompletion, BookCompletion, MagnoliasHikeCompletion, Insignia } from '../types';

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [allCompletions, setAllCompletions] = useState<WalkCompletion[]>([]);
  const [phaseUnlocks, setPhaseUnlocks] = useState<PhaseUnlock[]>([]);
  const [trailCompletions, setTrailCompletions] = useState<TrailCompletion[]>([]);
  const [bookCompletions, setBookCompletions] = useState<BookCompletion[]>([]);
  const [userTeam, setUserTeam] = useState<TeamWithMembers | null>(null);
  const [invitations, setInvitations] = useState<TeamInvitationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [magnoliasHikeCompletions, setMagnoliasHikeCompletions] = useState<MagnoliasHikeCompletion[]>([]);

  const loadDashboardData = useCallback(async () => {
    if (!user) return;

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
        navigate('/onboarding', { replace: true });
        return;
      }

      setProfile(profileData);

      // Load ALL completions for scoring and current week calculation
      const { data: allCompletionsData, error: allCompletionsError } = await supabase
        .from('walk_completions')
        .select('*')
        .eq('user_id', user.id)
        .order('week_number', { ascending: true })
        .order('day_of_week', { ascending: true });

      if (allCompletionsError) throw allCompletionsError;
      setAllCompletions(allCompletionsData || []);

      // Load phase unlocks
      const { data: unlocksData, error: unlocksError } = await supabase
        .from('phase_unlocks')
        .select('*')
        .eq('user_id', user.id)
        .order('phase_number');

      if (unlocksError) throw unlocksError;
      setPhaseUnlocks(unlocksData || []);

      // Note: Completions for current week will be filtered from allCompletions in render

      // Load trail completions
      const { data: trailCompletionsData, error: trailCompletionsError } = await supabase
        .from('trail_completions')
        .select('*')
        .eq('user_id', user.id);

      if (trailCompletionsError) throw trailCompletionsError;
      setTrailCompletions(trailCompletionsData || []);

      // Load book completions
      const { data: bookCompletionsData, error: bookCompletionsError } = await supabase
        .from('book_completions')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      if (bookCompletionsError) throw bookCompletionsError;
      setBookCompletions(bookCompletionsData || []);

      // Load magnolias hike completions
      const { data: magnoliasCompletionsData, error: magnoliasCompletionsError } = await supabase
        .from('magnolias_hikes_completions')
        .select('*')
        .eq('user_id', user.id);

      if (magnoliasCompletionsError) throw magnoliasCompletionsError;
      setMagnoliasHikeCompletions(magnoliasCompletionsData || []);

      // Load team data (get all teams, but show first one on dashboard)
      const teams = await getUserTeams(user.id);
      setUserTeam(teams.length > 0 ? teams[0] : null);

      // Load invitations
      const userInvitations = await getUserInvitations(user.id);
      setInvitations(userInvitations);

    } catch (err: any) {
      console.error('Error loading dashboard data:', err);
      setError(err.message || 'Error al cargar los datos del tablero');
    } finally {
      setLoading(false);
    }
  }, [user, navigate]);

  // Calculate earned insignias based on completed hikes
  const earnedInsignias = useMemo(() => {
    if (!magnoliasHikeCompletions.length) return [];
    
    const completedHikeIds = new Set(
      magnoliasHikeCompletions.map(completion => completion.hike_id)
    );
    
    const earned: Insignia[] = [];
    
    for (const insignia of insignias) {
      const hikesForEtapa = getHikesByEtapa(insignia.etapa);
      const allHikesCompleted = hikesForEtapa.length > 0 && 
        hikesForEtapa.every((hike) => completedHikeIds.has(hike.id));
      
      if (allHikesCompleted) {
        earned.push(insignia);
      }
    }
    
    return earned;
  }, [magnoliasHikeCompletions]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    loadDashboardData();
  }, [user, loadDashboardData]);

  // Get relevant video section based on current week
  const getRelevantVideoSection = (weekNumber: number): VideoSection | null => {
    if (weekNumber <= 4) {
      return videoSections.find(s => s.id === 'semanas-1-4') || null;
    } else if (weekNumber <= 10) {
      return videoSections.find(s => s.id === 'semanas-5-10') || null;
    } else if (weekNumber <= 24) {
      return videoSections.find(s => s.id === 'semanas-11-24') || null;
    } else if (weekNumber <= 36) {
      return videoSections.find(s => s.id === 'semanas-25-36') || null;
    } else {
      return videoSections.find(s => s.id === 'semanas-37-52') || null;
    }
  };

  // Calculate values - ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  // This ensures hooks are called in the same order on every render
  const currentWeek = useMemo(() => {
    return calculateCurrentWeekFromProgress(
      allCompletions.map(c => ({ week_number: c.week_number, day_of_week: c.day_of_week })),
      phaseUnlocks.map(u => ({ phase_number: u.phase_number }))
    );
  }, [allCompletions, phaseUnlocks]);
  
  // Filter completions for current week from all completions
  const completionsForCurrentWeek = useMemo(() => {
    return allCompletions.filter(c => c.week_number === currentWeek);
  }, [allCompletions, currentWeek]);
  
  const currentPhase = useMemo(() => getCurrentPhase(currentWeek) || null, [currentWeek]);
  const week = useMemo(() => getWeekByNumber(currentWeek), [currentWeek]);
  const totalScore = useMemo(() => calculateTotalScore(allCompletions, phaseUnlocks, trailCompletions, bookCompletions, magnoliasHikeCompletions), [allCompletions, phaseUnlocks, trailCompletions, bookCompletions, magnoliasHikeCompletions]);
  const walkPoints = useMemo(() => calculateWalkPoints(allCompletions), [allCompletions]);
  
  const completedWalksThisWeek = completionsForCurrentWeek.length;
  const totalWalksThisWeek = week?.days.length || 0;
  const weekProgress = totalWalksThisWeek > 0 ? (completedWalksThisWeek / totalWalksThisWeek) * 100 : 0;

  const phaseProgress = useMemo(() => {
    if (!currentPhase) return 0;
    const phaseStartWeek = Math.min(...currentPhase.weeks);
    const phaseEndWeek = Math.max(...currentPhase.weeks);
    const weeksCompleted = currentWeek - phaseStartWeek + 1;
    const totalWeeks = phaseEndWeek - phaseStartWeek + 1;
    return (weeksCompleted / totalWeeks) * 100;
  }, [currentPhase, currentWeek]);

  const relevantVideoSection = useMemo(() => getRelevantVideoSection(currentWeek), [currentWeek]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-teal text-xl">Cargando tu tablero...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream px-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="px-6 py-3 bg-teal text-white rounded-lg font-semibold"
          >
            Intentar de Nuevo
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream px-4">
        <div className="text-center">
          <p className="text-gray-700 mb-4">No se encontró el perfil. Por favor completa la configuración inicial.</p>
          <button
            onClick={() => navigate('/onboarding')}
            className="px-6 py-3 bg-teal text-white rounded-lg font-semibold"
          >
            Ir a Configuración
          </button>
        </div>
      </div>
    );
  }

  return (
    <PlanRestrictedContent requiredPlan="basico" upgradeToPlan="basico">
      <div className="min-h-screen bg-cream pb-24 md:pb-6 pt-10 md:pt-12 overflow-x-hidden">
        <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
          <div className="flex justify-center mb-8">
            <img 
              src="/tablero_icon.svg" 
              alt="Tablero" 
              className="max-w-full h-auto w-[17.5%]"
            />
          </div>
          <div className="mb-10 md:mb-14 text-center">
            <h1 className="text-heading-1 text-teal">
              Bienvenida a Tu Tablero
            </h1>
          </div>

          <div className="space-y-8 md:space-y-10">
            {/* Training Progress Card */}
            <div className="dashboard-card-enter">
              <DashboardTrainingCard
                totalScore={totalScore}
                walkPoints={walkPoints}
                currentWeek={currentWeek}
                currentPhase={currentPhase}
                completedWalksThisWeek={completedWalksThisWeek}
                totalWalksThisWeek={totalWalksThisWeek}
                phaseProgress={phaseProgress}
                weekProgress={weekProgress}
              />
            </div>

            {/* Insignias Card */}
            <div className="dashboard-card-enter">
              <DashboardInsigniasCard
                earnedInsignias={earnedInsignias}
                totalInsignias={insignias.length}
              />
            </div>

            {/* Team Card */}
            <div className="dashboard-card-enter">
              <DashboardTeamCard
                userTeam={userTeam}
                invitations={invitations}
                currentUserId={user?.id || ''}
              />
            </div>

            {/* Recommended Videos */}
            {relevantVideoSection && (
              <div className="dashboard-card-enter">
                <DashboardVideosSection
                  relevantSection={relevantVideoSection}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </PlanRestrictedContent>
  );
}

