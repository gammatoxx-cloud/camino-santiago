import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardTrainingCard } from '../components/dashboard/DashboardTrainingCard';
import { DashboardTeamCard } from '../components/dashboard/DashboardTeamCard';
import { DashboardVideosSection } from '../components/dashboard/DashboardVideosSection';
import { DashboardInsigniasCard } from '../components/dashboard/DashboardInsigniasCard';
import { SectionHeader } from '../components/ui/SectionHeader';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { getCurrentPhase, getWeekByNumber } from '../lib/trainingData';
import { calculateTotalScore, calculateWalkPoints, calculatePhasePoints } from '../lib/scoringUtils';
import { getUserTeam, getUserInvitations } from '../lib/teamMatching';
import { videoSections, VideoSection } from '../lib/videoData';
import { insignias } from '../lib/insigniasData';
import { getHikesByEtapa } from '../lib/magnoliasHikesData';
import type { UserProfile, WalkCompletion, PhaseUnlock, TeamWithMembers, TeamInvitationWithDetails, TrailCompletion, BookCompletion, MagnoliasHikeCompletion, Insignia } from '../types';

// TEMPORARY: Test mode - allows manual week selection for testing
const TEST_MODE = true;

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [completions, setCompletions] = useState<WalkCompletion[]>([]);
  const [allCompletions, setAllCompletions] = useState<WalkCompletion[]>([]);
  const [phaseUnlocks, setPhaseUnlocks] = useState<PhaseUnlock[]>([]);
  const [trailCompletions, setTrailCompletions] = useState<TrailCompletion[]>([]);
  const [bookCompletions, setBookCompletions] = useState<BookCompletion[]>([]);
  const [userTeam, setUserTeam] = useState<TeamWithMembers | null>(null);
  const [invitations, setInvitations] = useState<TeamInvitationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testWeek, setTestWeek] = useState(1);
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

      // Calculate current week
      const currentWeek = TEST_MODE ? testWeek : 1;

      // Load completions for current week
      const { data: completionsData, error: completionsError } = await supabase
        .from('walk_completions')
        .select('*')
        .eq('user_id', user.id)
        .eq('week_number', currentWeek)
        .order('day_of_week');

      if (completionsError) throw completionsError;
      setCompletions(completionsData || []);

      // Load ALL completions for scoring
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

      // Load team data
      const team = await getUserTeam(user.id);
      setUserTeam(team);

      // Load invitations
      const userInvitations = await getUserInvitations(user.id);
      setInvitations(userInvitations);

    } catch (err: any) {
      console.error('Error loading dashboard data:', err);
      setError(err.message || 'Error al cargar los datos del tablero');
    } finally {
      setLoading(false);
    }
  }, [user, navigate, testWeek]);

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

  const reloadCompletions = useCallback(async () => {
    if (!user) return;

    try {
      const { data: completionsData, error: completionsError } = await supabase
        .from('walk_completions')
        .select('*')
        .eq('user_id', user.id)
        .eq('week_number', testWeek)
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
  }, [user, testWeek]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    loadDashboardData();
  }, [user, loadDashboardData]);

  // TEMPORARY: Reload completions when test week changes
  useEffect(() => {
    if (TEST_MODE && user && profile) {
      reloadCompletions();
    }
  }, [testWeek, user, profile, reloadCompletions]);

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

  // Calculate values
  const currentWeek = TEST_MODE ? testWeek : 1;
  const currentPhase = getCurrentPhase(currentWeek) || null;
  const week = getWeekByNumber(currentWeek);
  const totalScore = calculateTotalScore(allCompletions, phaseUnlocks, trailCompletions, bookCompletions, magnoliasHikeCompletions);
  const walkPoints = calculateWalkPoints(allCompletions);
  
  const completedWalksThisWeek = completions.length;
  const totalWalksThisWeek = week?.days.length || 0;
  const weekProgress = totalWalksThisWeek > 0 ? (completedWalksThisWeek / totalWalksThisWeek) * 100 : 0;

  let phaseProgress = 0;
  if (currentPhase) {
    const phaseStartWeek = Math.min(...currentPhase.weeks);
    const phaseEndWeek = Math.max(...currentPhase.weeks);
    const weeksCompleted = currentWeek - phaseStartWeek + 1;
    const totalWeeks = phaseEndWeek - phaseStartWeek + 1;
    phaseProgress = (weeksCompleted / totalWeeks) * 100;
  }

  const relevantVideoSection = getRelevantVideoSection(currentWeek);

  return (
    <div className="min-h-screen bg-cream pb-24 md:pb-6 pt-10 md:pt-12 overflow-x-hidden">
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
        <SectionHeader label="Tablero" icon="📊" />
        <div className="mb-10 md:mb-14 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-teal/10 to-teal/5 mb-4 md:mb-5">
            <span className="text-3xl md:text-4xl">🎯</span>
          </div>
          <h1 className="text-heading-1 text-teal">
            Bienvenida a Tu Tablero
          </h1>
        </div>

        {/* TEMPORARY: Test mode week selector */}
        {TEST_MODE && (
          <div className="mb-8 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
            <p className="text-sm font-semibold text-yellow-800 mb-2">
              🧪 MODO DE PRUEBA: Seguimiento de semanas deshabilitado
            </p>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar Semana para Probar (1-52):
            </label>
            <input
              type="number"
              min="1"
              max="52"
              value={testWeek}
              onChange={(e) => setTestWeek(Math.max(1, Math.min(52, parseInt(e.target.value) || 1)))}
              className="w-full px-4 py-2 border-2 border-teal rounded-lg focus:outline-none focus:ring-2 focus:ring-teal"
            />
            <p className="text-xs text-gray-600 mt-2">
              Todas las fases están desbloqueadas para pruebas. Semana actual: {currentWeek}
            </p>
          </div>
        )}

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
  );
}

