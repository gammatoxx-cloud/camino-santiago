import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { TeamDiscovery } from '../components/teams/TeamDiscovery';
import { TeamMemberList } from '../components/teams/TeamMemberList';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  findNearbyUsers,
  findAvailableTeams,
  getUserTeam,
  createTeam,
  joinTeam,
  leaveTeam,
  deleteTeam,
  sendTeamInvitation,
  getUserInvitations,
  acceptInvitation,
  declineInvitation,
  getTeamTotalDistance,
  createJoinRequest,
  getTeamJoinRequests,
  acceptJoinRequest,
  declineJoinRequest,
  getUserJoinRequests,
} from '../lib/teamMatching';
import { TeamStatsCard } from '../components/teams/TeamStatsCard';
import { TeamJoinRequestCard } from '../components/teams/TeamJoinRequestCard';
import type { NearbyUser, TeamWithMembers, TeamInvitationWithDetails, TeamJoinRequestWithDetails, UserProfile } from '../types';

export function TeamPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userTeam, setUserTeam] = useState<TeamWithMembers | null>(null);
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
  const [availableTeams, setAvailableTeams] = useState<TeamWithMembers[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitationWithDetails[]>([]);
  const [joinRequests, setJoinRequests] = useState<TeamJoinRequestWithDetails[]>([]);
  const [userJoinRequests, setUserJoinRequests] = useState<TeamJoinRequestWithDetails[]>([]);
  const [teamTotalDistance, setTeamTotalDistance] = useState<number | null>(null);
  const [loadingTeamDistance, setLoadingTeamDistance] = useState(false);
  const [loading, setLoading] = useState(true);
  const [discovering, setDiscovering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [acceptingRequestId, setAcceptingRequestId] = useState<string | null>(null);
  const [decliningRequestId, setDecliningRequestId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    loadUserData();
  }, [user, navigate]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Load user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      if (!profileData) {
        navigate('/onboarding');
        return;
      }

      const userProfile = profileData as UserProfile;
      setProfile(userProfile);

      // Check if user has coordinates
      if (!userProfile.latitude || !userProfile.longitude) {
        setError(
          'Por favor actualiza tu dirección en la configuración de tu perfil para encontrar compañeros de equipo. Necesitamos tu ubicación para conectarte con usuarios cercanos.'
        );
        setLoading(false);
        return;
      }

      // Load user's current team
      const team = await getUserTeam(user.id);
      setUserTeam(team);

      // Load pending invitations
      const userInvitations = await getUserInvitations(user.id);
      setInvitations(userInvitations);

      // Load user's join requests (to show pending status)
      const userRequests = await getUserJoinRequests(user.id);
      setUserJoinRequests(userRequests);

      // Load team join requests if user is a team leader
      if (team) {
        const isLeader = team.members.some(m => m.user_id === user.id && m.role === 'leader');
        if (isLeader) {
          const teamRequests = await getTeamJoinRequests(team.id, user.id);
          setJoinRequests(teamRequests);
        }
      }

      // Always load nearby users (to show them for inviting when in a team, or for discovery when not in a team)
      await discoverTeams(userProfile.latitude, userProfile.longitude);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los datos del equipo');
    } finally {
      setLoading(false);
    }
  };

  // Load team distance after team is loaded (non-blocking)
  const loadingDistanceRef = useRef(false);
  
  useEffect(() => {
    if (!userTeam) {
      setTeamTotalDistance(null);
      loadingDistanceRef.current = false;
      return;
    }

    // Prevent concurrent calls
    if (loadingDistanceRef.current) {
      return;
    }

    let isMounted = true;
    loadingDistanceRef.current = true;

    const loadTeamDistance = async () => {
      try {
        setLoadingTeamDistance(true);
        const distance = await getTeamTotalDistance(userTeam.id);
        if (isMounted) {
          setTeamTotalDistance(distance);
        }
      } catch (err: any) {
        console.error('Error loading team distance:', err);
        // Graceful degradation - show 0 on error
        if (isMounted) {
          setTeamTotalDistance(0);
        }
      } finally {
        if (isMounted) {
          setLoadingTeamDistance(false);
          loadingDistanceRef.current = false;
        }
      }
    };

    loadTeamDistance();

    return () => {
      isMounted = false;
      loadingDistanceRef.current = false;
    };
  }, [userTeam?.id]); // Only depend on team ID

  const discoverTeams = async (latitude: number, longitude: number) => {
    if (!user) return;

    try {
      setDiscovering(true);
      setError(null);

      const [users, teams] = await Promise.all([
        findNearbyUsers(user.id, latitude, longitude, 10),
        findAvailableTeams(user.id, latitude, longitude, 10),
      ]);

      setNearbyUsers(users);
      setAvailableTeams(teams);
    } catch (err: any) {
      setError(err.message || 'Error al buscar equipos');
    } finally {
      setDiscovering(false);
    }
  };

  const handleCreateTeam = async () => {
    if (!user || !profile) return;

    try {
      setError(null);
      const team = await createTeam(user.id, newTeamName.trim() || undefined, 6);
      setUserTeam(team);
      setShowCreateTeamModal(false);
      setNewTeamName('');
      
      // Refresh available teams
      if (profile.latitude && profile.longitude) {
        await discoverTeams(profile.latitude, profile.longitude);
      }
    } catch (err: any) {
      setError(err.message || 'Error al crear el equipo');
    }
  };

  const handleJoinTeam = async (teamId: string) => {
    if (!user) return;

    try {
      setError(null);
      const team = await joinTeam(user.id, teamId);
      setUserTeam(team);
      
      // Refresh available teams
      if (profile?.latitude && profile?.longitude) {
        await discoverTeams(profile.latitude, profile.longitude);
      }
    } catch (err: any) {
      setError(err.message || 'Error al unirse al equipo');
    }
  };

  const handleLeaveTeam = async (teamId: string) => {
    if (!user) return;

    if (!confirm('¿Estás seguro de que quieres salir de este equipo?')) {
      return;
    }

    try {
      setError(null);
      await leaveTeam(user.id, teamId);
      setUserTeam(null);
      
      // Refresh available teams
      if (profile?.latitude && profile?.longitude) {
        await discoverTeams(profile.latitude, profile.longitude);
      }
    } catch (err: any) {
      setError(err.message || 'Error al salir del equipo');
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!user) return;

    if (!confirm('¿Estás seguro de que quieres eliminar este equipo? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setError(null);
      await deleteTeam(user.id, teamId);
      setUserTeam(null);
      
      // Refresh available teams
      if (profile?.latitude && profile?.longitude) {
        await discoverTeams(profile.latitude, profile.longitude);
      }
    } catch (err: any) {
      setError(err.message || 'Error al eliminar el equipo');
    }
  };

  const handleRefresh = () => {
    if (profile?.latitude && profile?.longitude) {
      discoverTeams(profile.latitude, profile.longitude);
    }
  };

  const handleInviteUser = async (userId: string) => {
    if (!userTeam || !user) return;

    try {
      setError(null);
      await sendTeamInvitation(user.id, userTeam.id, userId);
      
      // Note: We can't see other users' invitations, but we can show a success message
      
      const invitedUserName = nearbyUsers.find(u => u.id === userId)?.name || 'este usuario';
      alert(`Invitación enviada a ${invitedUserName}. Recibirán una notificación en su página de Equipos.`);
    } catch (err: any) {
      setError(err.message || 'Error al enviar la invitación. Por favor intenta de nuevo.');
    }
  };

  const handleAcceptInvitation = async (invitationId: string) => {
    if (!user) return;

    try {
      setError(null);
      const team = await acceptInvitation(user.id, invitationId);
      setUserTeam(team);
      
      // Refresh invitations
      const userInvitations = await getUserInvitations(user.id);
      setInvitations(userInvitations);
      
      // Refresh available teams
      if (profile?.latitude && profile?.longitude) {
        await discoverTeams(profile.latitude, profile.longitude);
      }
    } catch (err: any) {
      setError(err.message || 'Error al aceptar la invitación.');
    }
  };

  const handleDeclineInvitation = async (invitationId: string) => {
    if (!user) return;

    try {
      setError(null);
      await declineInvitation(user.id, invitationId);
      
      // Refresh invitations
      const userInvitations = await getUserInvitations(user.id);
      setInvitations(userInvitations);
    } catch (err: any) {
      setError(err.message || 'Error al rechazar la invitación.');
    }
  };

  const handleRequestJoin = async (teamId: string) => {
    if (!user) return;

    try {
      setError(null);
      await createJoinRequest(user.id, teamId);
      
      // Refresh user's join requests
      const userRequests = await getUserJoinRequests(user.id);
      setUserJoinRequests(userRequests);
      
      alert('Solicitud enviada. El líder del equipo recibirá una notificación.');
    } catch (err: any) {
      setError(err.message || 'Error al enviar la solicitud de unión.');
    }
  };

  const handleAcceptJoinRequest = async (requestId: string) => {
    if (!user || !userTeam) return;

    try {
      setError(null);
      setAcceptingRequestId(requestId);
      const updatedTeam = await acceptJoinRequest(userTeam.id, requestId, user.id);
      setUserTeam(updatedTeam);
      
      // Refresh join requests
      const teamRequests = await getTeamJoinRequests(userTeam.id, user.id);
      setJoinRequests(teamRequests);
      
      // Refresh nearby users and available teams
      if (profile?.latitude && profile?.longitude) {
        await discoverTeams(profile.latitude, profile.longitude);
      }
    } catch (err: any) {
      setError(err.message || 'Error al aceptar la solicitud.');
    } finally {
      setAcceptingRequestId(null);
    }
  };

  const handleDeclineJoinRequest = async (requestId: string) => {
    if (!user || !userTeam) return;

    try {
      setError(null);
      setDecliningRequestId(requestId);
      await declineJoinRequest(userTeam.id, requestId, user.id);
      
      // Refresh join requests
      const teamRequests = await getTeamJoinRequests(userTeam.id, user.id);
      setJoinRequests(teamRequests);
    } catch (err: any) {
      setError(err.message || 'Error al rechazar la solicitud.');
    } finally {
      setDecliningRequestId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream px-4 py-8 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-20">
            <div className="inline-block w-12 h-12 border-4 border-teal border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-600">Cargando información del equipo...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream px-4 py-8 md:px-8">
      <div className="max-w-4xl mx-auto">
        {error && (
          <Card variant="elevated" className="mb-6 bg-red-50 border-red-200">
            <p className="text-red-700">{error}</p>
          </Card>
        )}

        {/* Notifications Section - Show pending invitations */}
        {invitations.length > 0 && (
          <Card variant="elevated" className="mb-6 bg-teal/10 border-teal/20">
            <h2 className="text-2xl font-bold text-teal mb-4">Invitaciones Pendientes</h2>
            <div className="space-y-3">
              {invitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="p-4 bg-white/60 rounded-lg border-2 border-teal/30"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 mb-1">
                        {invitation.inviter?.name || 'Alguien'} te ha invitado a unirte a su equipo
                      </p>
                      <p className="text-sm text-gray-600">
                        Equipo: <span className="font-medium">{invitation.team?.name || `Equipo ${invitation.team_id.slice(0, 8)}`}</span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleAcceptInvitation(invitation.id)}
                      >
                        Aceptar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeclineInvitation(invitation.id)}
                      >
                        Rechazar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Join Requests Section - Show for team leaders */}
        {userTeam && joinRequests.length > 0 && userTeam.members.some(m => m.user_id === user?.id && m.role === 'leader') && (
          <Card variant="elevated" className="mb-6 bg-amber/10 border-amber/20">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-2xl font-bold text-teal">Solicitudes de Unión</h2>
              {joinRequests.length > 0 && (
                <span className="px-2.5 py-1 bg-amber-500 text-white rounded-full text-sm font-bold min-w-[24px] text-center">
                  {joinRequests.length}
                </span>
              )}
            </div>
            <div className="space-y-3">
              {joinRequests.map((request) => (
                <TeamJoinRequestCard
                  key={request.id}
                  request={request}
                  onAccept={handleAcceptJoinRequest}
                  onDecline={handleDeclineJoinRequest}
                  accepting={acceptingRequestId === request.id}
                  declining={decliningRequestId === request.id}
                />
              ))}
            </div>
          </Card>
        )}

        {/* User's Current Team */}
        {userTeam ? (
          <>
            <Card variant="elevated" className="mb-6">
              <div className="flex flex-col md:flex-row md:justify-between items-start mb-4 gap-4 md:gap-0">
                <div>
                  <h2 className="text-2xl font-bold text-teal mb-2">
                    Tu Equipo: {userTeam.name || `Equipo ${userTeam.id.slice(0, 8)}`}
                  </h2>
                  <p className="text-gray-600">
                    {userTeam.member_count} de {userTeam.max_members} miembros
                  </p>
                </div>
                <div className="flex gap-2">
                  {userTeam.created_by === user?.id && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleDeleteTeam(userTeam.id)}
                    >
                      Eliminar Equipo
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLeaveTeam(userTeam.id)}
                  >
                    Salir del Equipo
                  </Button>
                </div>
              </div>
            </Card>

            {/* Team Statistics Card */}
            <TeamStatsCard 
              totalDistance={teamTotalDistance} 
              loading={loadingTeamDistance}
            />

            <Card variant="elevated" className="mb-6">
              <TeamMemberList team={userTeam} currentUserId={user?.id || ''} />
            </Card>

            {/* Nearby Users Card - Show when user has a team and can invite others */}
            {userTeam.member_count < userTeam.max_members && (
              <Card variant="elevated" className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-teal">
                      Usuarios Cercanos ({nearbyUsers.filter(u => !userTeam.members.some(m => m.user_id === u.id)).length})
                    </h2>
                    <p className="text-gray-600 text-sm mt-1">
                      Encuentra usuarios cercanos para invitar a tu equipo
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={discovering}>
                    {discovering ? 'Buscando...' : 'Actualizar'}
                  </Button>
                </div>

                {discovering ? (
                  <div className="text-center py-8">
                    <div className="inline-block w-8 h-8 border-4 border-teal border-t-transparent rounded-full animate-spin" />
                    <p className="mt-2 text-gray-600">Buscando usuarios cercanos...</p>
                  </div>
                ) : nearbyUsers.filter(u => !userTeam.members.some(m => m.user_id === u.id)).length === 0 ? (
                  <p className="text-gray-600 py-4">
                    No se encontraron usuarios cercanos dentro de 10 millas. ¡Intenta actualizar o pide a tus amigos que se unan!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {nearbyUsers
                      .filter(u => !userTeam.members.some(m => m.user_id === u.id))
                      .map((nearbyUser) => (
                        <div
                          key={nearbyUser.id}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-white/60 rounded-lg"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-gray-800 truncate">{nearbyUser.name}</p>
                              {nearbyUser.is_team_leader && (
                                <span className="px-2 py-0.5 bg-teal/10 text-teal rounded-full text-xs font-semibold whitespace-nowrap">
                                  👑 Líder
                                </span>
                              )}
                            </div>
                            {nearbyUser.team_name && (
                              <p className="text-sm text-teal font-medium mb-1 truncate">
                                {nearbyUser.team_name}
                              </p>
                            )}
                            {nearbyUser.location && (
                              <p className="text-sm text-gray-600 truncate">{nearbyUser.location}</p>
                            )}
                          </div>
                          <div className="flex flex-col sm:items-end gap-2 flex-shrink-0">
                            <p className="text-sm font-medium text-teal whitespace-nowrap">
                              A {nearbyUser.distance_miles.toFixed(1)} millas
                            </p>
                            {userTeam.created_by === user?.id && userTeam.member_count < userTeam.max_members && (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleInviteUser(nearbyUser.id)}
                                className="min-h-[44px] w-full sm:w-auto"
                              >
                                Invitar
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </Card>
            )}
          </>
        ) : (
          <>
            {/* Discovery Section */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-teal">Encuentra Tu Equipo</h2>
                <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={discovering}>
                  {discovering ? 'Buscando...' : 'Actualizar'}
                </Button>
              </div>

              {profile?.latitude && profile?.longitude ? (
                <TeamDiscovery
                  nearbyUsers={nearbyUsers}
                  availableTeams={availableTeams}
                  currentUserId={user?.id || ''}
                  onCreateTeam={() => setShowCreateTeamModal(true)}
                  onJoinTeam={handleJoinTeam}
                  onLeaveTeam={handleLeaveTeam}
                  onRequestJoin={handleRequestJoin}
                  loading={discovering}
                  pendingJoinRequestTeamIds={userJoinRequests
                    .filter(req => req.status === 'pending')
                    .map(req => req.team_id)}
                />
              ) : (
                <Card variant="elevated">
                  <p className="text-gray-700 mb-4">
                    Por favor actualiza tu dirección en la configuración de tu perfil para encontrar compañeros de equipo.
                  </p>
                  <Button onClick={() => navigate('/profile')} variant="primary">
                    Actualizar Perfil
                  </Button>
                </Card>
              )}
            </div>
          </>
        )}

        {/* Create Team Modal */}
        {showCreateTeamModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card variant="elevated" className="max-w-md w-full">
              <h3 className="text-2xl font-bold text-teal mb-4">Crear Nuevo Equipo</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="teamName" className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Equipo (opcional)
                  </label>
                  <input
                    id="teamName"
                    type="text"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    className="w-full px-4 py-3 text-base rounded-lg border-2 border-gray-200 focus:border-teal focus:outline-none bg-white/80"
                    placeholder="Ingresa el nombre del equipo"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    size="md"
                    className="flex-1"
                    onClick={() => {
                      setShowCreateTeamModal(false);
                      setNewTeamName('');
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    className="flex-1"
                    onClick={handleCreateTeam}
                  >
                    Crear Equipo
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

