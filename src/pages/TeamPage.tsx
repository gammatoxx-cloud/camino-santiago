import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PlanRestrictedContent } from '../components/plan/PlanRestrictedContent';
import { TeamDiscovery } from '../components/teams/TeamDiscovery';
import { TeamMemberList } from '../components/teams/TeamMemberList';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  findNearbyUsers,
  findAvailableTeams,
  getUserTeams,
  getAllTeams,
  createTeam,
  updateTeamName,
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
  getTeamMembersByTeamId,
} from '../lib/teamMatching';
import { TeamStatsCard } from '../components/teams/TeamStatsCard';
import { TeamJoinRequestCard } from '../components/teams/TeamJoinRequestCard';
import { Avatar } from '../components/ui/Avatar';
import type { NearbyUser, TeamWithMembers, TeamInvitationWithDetails, TeamJoinRequestWithDetails, UserProfile, TeamMember } from '../types';

export function TeamPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userTeams, setUserTeams] = useState<TeamWithMembers[]>([]);
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
  const [availableTeams, setAvailableTeams] = useState<TeamWithMembers[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitationWithDetails[]>([]);
  const [joinRequests, setJoinRequests] = useState<Map<string, TeamJoinRequestWithDetails[]>>(new Map());
  const [userJoinRequests, setUserJoinRequests] = useState<TeamJoinRequestWithDetails[]>([]);
  const [invitationTeamMembers, setInvitationTeamMembers] = useState<Map<string, (TeamMember & { profile?: UserProfile })[]>>(new Map());
  const [teamTotalDistances, setTeamTotalDistances] = useState<Map<string, number | null>>(new Map());
  const [loadingTeamDistances, setLoadingTeamDistances] = useState<Map<string, boolean>>(new Map());
  const [allTeams, setAllTeams] = useState<TeamWithMembers[]>([]);
  const [loadingAllTeams, setLoadingAllTeams] = useState(false);
  const [loading, setLoading] = useState(true);
  const [discovering, setDiscovering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [acceptingRequestId, setAcceptingRequestId] = useState<string | null>(null);
  const [decliningRequestId, setDecliningRequestId] = useState<string | null>(null);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editedTeamName, setEditedTeamName] = useState('');
  const [updatingTeamName, setUpdatingTeamName] = useState(false);
  const [nearbyUsersPage, setNearbyUsersPage] = useState<Map<string, number>>(new Map());
  const [nearbyUsersSearch, setNearbyUsersSearch] = useState<Map<string, string>>(new Map());
  const usersPerPage = 5;

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

      // Load user's teams
      const teams = await getUserTeams(user.id);
      setUserTeams(teams);

      // Load pending invitations
      const userInvitations = await getUserInvitations(user.id);
      setInvitations(userInvitations);

      // Load team members for each invitation
      if (userInvitations.length > 0) {
        const teamMembersMap = new Map<string, (TeamMember & { profile?: UserProfile })[]>();
        await Promise.all(
          userInvitations.map(async (invitation) => {
            try {
              const members = await getTeamMembersByTeamId(invitation.team_id);
              teamMembersMap.set(invitation.team_id, members);
            } catch (err) {
              console.error(`Error loading team members for invitation ${invitation.id}:`, err);
              // Continue even if one fails
            }
          })
        );
        setInvitationTeamMembers(teamMembersMap);
      }

      // Load user's join requests (to show pending status)
      const userRequests = await getUserJoinRequests(user.id);
      setUserJoinRequests(userRequests);

      // Load team join requests for all teams where user is a leader
      const joinRequestsMap = new Map<string, TeamJoinRequestWithDetails[]>();
      await Promise.all(
        teams.map(async (team) => {
          const isLeader = team.members.some(m => m.user_id === user.id && m.role === 'leader');
          if (isLeader) {
            try {
              const teamRequests = await getTeamJoinRequests(team.id, user.id);
              if (teamRequests.length > 0) {
                joinRequestsMap.set(team.id, teamRequests);
              }
            } catch (err) {
              console.error(`Error loading join requests for team ${team.id}:`, err);
            }
          }
        })
      );
      setJoinRequests(joinRequestsMap);

      // Always load nearby users (to show them for inviting when in a team, or for discovery when not in a team)
      await discoverTeams(userProfile.latitude, userProfile.longitude);
      
      // Load all teams
      await loadAllTeams();
    } catch (err: any) {
      setError(err.message || 'Error al cargar los datos del equipo');
    } finally {
      setLoading(false);
    }
  };

  const loadAllTeams = async () => {
    try {
      setLoadingAllTeams(true);
      const teams = await getAllTeams();
      setAllTeams(teams);
    } catch (err: any) {
      console.error('Error loading all teams:', err);
      // Don't set error state for this, just log it
    } finally {
      setLoadingAllTeams(false);
    }
  };

  // Reset pagination when nearby users change
  useEffect(() => {
    setNearbyUsersPage(new Map());
  }, [nearbyUsers.length]);

  // Load team distances after teams are loaded (non-blocking)
  const loadingDistancesRef = useRef<Set<string>>(new Set());
  
  useEffect(() => {
    if (userTeams.length === 0) {
      setTeamTotalDistances(new Map());
      loadingDistancesRef.current.clear();
      return;
    }

    const loadTeamDistances = async () => {
      const distancesMap = new Map<string, number | null>();
      const loadingMap = new Map<string, boolean>();

      await Promise.all(
        userTeams.map(async (team) => {
          // Skip if already loading
          if (loadingDistancesRef.current.has(team.id)) {
            return;
          }

          loadingDistancesRef.current.add(team.id);
          loadingMap.set(team.id, true);
          setLoadingTeamDistances(new Map(loadingMap));

          try {
            const distance = await getTeamTotalDistance(team.id);
            distancesMap.set(team.id, distance);
          } catch (err: any) {
            console.error(`Error loading team distance for ${team.id}:`, err);
            distancesMap.set(team.id, 0);
          } finally {
            loadingDistancesRef.current.delete(team.id);
            loadingMap.set(team.id, false);
            setLoadingTeamDistances(new Map(loadingMap));
          }
        })
      );

      setTeamTotalDistances(distancesMap);
    };

    loadTeamDistances();
  }, [userTeams.map(t => t.id).join(',')]); // Depend on team IDs

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
      await createTeam(user.id, newTeamName.trim() || undefined, 14);
      // Refresh all teams
      const teams = await getUserTeams(user.id);
      setUserTeams(teams);
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
      await joinTeam(user.id, teamId);
      // Refresh all teams
      const teams = await getUserTeams(user.id);
      setUserTeams(teams);
      
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
      // Refresh all teams
      const teams = await getUserTeams(user.id);
      setUserTeams(teams);
      
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
      // Refresh all teams
      const teams = await getUserTeams(user.id);
      setUserTeams(teams);
      
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

  const handleInviteUser = async (userId: string, teamId: string) => {
    if (!user) return;

    try {
      setError(null);
      await sendTeamInvitation(user.id, teamId, userId);
      
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
      await acceptInvitation(user.id, invitationId);
      // Refresh all teams
      const teams = await getUserTeams(user.id);
      setUserTeams(teams);
      
      // Refresh invitations
      const userInvitations = await getUserInvitations(user.id);
      setInvitations(userInvitations);

      // Reload team members for remaining invitations
      if (userInvitations.length > 0) {
        const teamMembersMap = new Map<string, (TeamMember & { profile?: UserProfile })[]>();
        await Promise.all(
          userInvitations.map(async (invitation) => {
            try {
              const members = await getTeamMembersByTeamId(invitation.team_id);
              teamMembersMap.set(invitation.team_id, members);
            } catch (err) {
              console.error(`Error loading team members for invitation ${invitation.id}:`, err);
            }
          })
        );
        setInvitationTeamMembers(teamMembersMap);
      } else {
        setInvitationTeamMembers(new Map());
      }
      
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

      // Reload team members for remaining invitations
      if (userInvitations.length > 0) {
        const teamMembersMap = new Map<string, (TeamMember & { profile?: UserProfile })[]>();
        await Promise.all(
          userInvitations.map(async (invitation) => {
            try {
              const members = await getTeamMembersByTeamId(invitation.team_id);
              teamMembersMap.set(invitation.team_id, members);
            } catch (err) {
              console.error(`Error loading team members for invitation ${invitation.id}:`, err);
            }
          })
        );
        setInvitationTeamMembers(teamMembersMap);
      } else {
        setInvitationTeamMembers(new Map());
      }
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
      
      // Refresh all teams to update the UI
      await loadAllTeams();
      
      alert('Solicitud enviada. El líder del equipo recibirá una notificación.');
    } catch (err: any) {
      setError(err.message || 'Error al enviar la solicitud de unión.');
    }
  };

  const handleAcceptJoinRequest = async (teamId: string, requestId: string) => {
    if (!user) return;

    try {
      setError(null);
      setAcceptingRequestId(requestId);
      await acceptJoinRequest(teamId, requestId, user.id);
      
      // Refresh all teams
      const teams = await getUserTeams(user.id);
      setUserTeams(teams);
      
      // Refresh join requests for this team
      const teamRequests = await getTeamJoinRequests(teamId, user.id);
      const joinRequestsMap = new Map(joinRequests);
      if (teamRequests.length > 0) {
        joinRequestsMap.set(teamId, teamRequests);
      } else {
        joinRequestsMap.delete(teamId);
      }
      setJoinRequests(joinRequestsMap);
      
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

  const handleDeclineJoinRequest = async (teamId: string, requestId: string) => {
    if (!user) return;

    try {
      setError(null);
      setDecliningRequestId(requestId);
      await declineJoinRequest(teamId, requestId, user.id);
      
      // Refresh join requests for this team
      const teamRequests = await getTeamJoinRequests(teamId, user.id);
      const joinRequestsMap = new Map(joinRequests);
      if (teamRequests.length > 0) {
        joinRequestsMap.set(teamId, teamRequests);
      } else {
        joinRequestsMap.delete(teamId);
      }
      setJoinRequests(joinRequestsMap);
    } catch (err: any) {
      setError(err.message || 'Error al rechazar la solicitud.');
    } finally {
      setDecliningRequestId(null);
    }
  };

  const handleStartEditTeamName = (teamId: string, currentName: string) => {
    setEditingTeamId(teamId);
    setEditedTeamName(currentName || '');
  };

  const handleCancelEditTeamName = () => {
    setEditingTeamId(null);
    setEditedTeamName('');
  };

  const handleSaveTeamName = async (teamId: string) => {
    if (!user) return;

    try {
      setError(null);
      setUpdatingTeamName(true);
      const updatedTeam = await updateTeamName(user.id, teamId, editedTeamName);
      
      // Update the team in userTeams array
      setUserTeams(prevTeams => 
        prevTeams.map(team => team.id === teamId ? updatedTeam : team)
      );
      
      setEditingTeamId(null);
      setEditedTeamName('');
    } catch (err: any) {
      setError(err.message || 'Error al actualizar el nombre del equipo.');
    } finally {
      setUpdatingTeamName(false);
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
    <PlanRestrictedContent requiredPlan="basico" upgradeToPlan="basico">
      <div className="min-h-screen bg-cream px-4 py-8 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center mb-8">
            <img
              src="/equipo_icon.svg"
              alt="Equipo"
              className="max-w-full h-auto w-1/4"
            />
          </div>
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
              {invitations.map((invitation) => {
                const teamMembers = invitationTeamMembers.get(invitation.team_id) || [];
                return (
                  <div
                    key={invitation.id}
                    className="p-4 bg-white/60 rounded-lg border-2 border-teal/30"
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800 mb-1">
                            {invitation.inviter?.name || 'Alguien'} te ha invitado a unirte a su equipo
                          </p>
                          <p className="text-sm text-gray-600 mb-3">
                            Equipo: <span className="font-medium">{invitation.team?.name || `Equipo ${invitation.team_id.slice(0, 8)}`}</span>
                          </p>
                          
                          {/* Team Members List */}
                          {teamMembers.length > 0 && (
                            <div className="mt-3">
                              <p className="text-sm font-medium text-gray-700 mb-2">
                                Miembros del equipo ({teamMembers.length} de {invitation.team ? Math.max(invitation.team.max_members, 14) : 'N/A'}):
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {teamMembers.map((member) => (
                                  <div
                                    key={member.id}
                                    className="flex items-center gap-2 px-3 py-2 bg-white/80 rounded-lg border border-gray-200"
                                  >
                                    <Avatar
                                      avatarUrl={member.profile?.avatar_url}
                                      name={member.profile?.name || 'Desconocido'}
                                      size="sm"
                                    />
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-sm font-medium text-gray-800">
                                        {member.profile?.name || 'Desconocido'}
                                      </span>
                                      {member.role === 'leader' && (
                                        <span className="text-xs text-teal font-semibold">👑</span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
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
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Join Requests Section - Show for team leaders */}
        {userTeams.length > 0 && Array.from(joinRequests.values()).flat().length > 0 && (
          <Card variant="elevated" className="mb-6 bg-amber/10 border-amber/20">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-2xl font-bold text-teal">Solicitudes de Unión</h2>
              {Array.from(joinRequests.values()).flat().length > 0 && (
                <span className="px-2.5 py-1 bg-amber-500 text-white rounded-full text-sm font-bold min-w-[24px] text-center">
                  {Array.from(joinRequests.values()).flat().length}
                </span>
              )}
            </div>
            <div className="space-y-4">
              {Array.from(joinRequests.entries()).map(([teamId, requests]) => {
                const team = userTeams.find(t => t.id === teamId);
                if (!team || requests.length === 0) return null;
                return (
                  <div key={teamId} className="space-y-3">
                    <h3 className="text-lg font-semibold text-teal">
                      {team.name || `Equipo ${team.id.slice(0, 8)}`}
                    </h3>
                    {requests.map((request) => (
                      <TeamJoinRequestCard
                        key={request.id}
                        request={request}
                        onAccept={(id) => handleAcceptJoinRequest(teamId, id)}
                        onDecline={(id) => handleDeclineJoinRequest(teamId, id)}
                        accepting={acceptingRequestId === request.id}
                        declining={decliningRequestId === request.id}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* User's Teams */}
        {userTeams.length > 0 ? (
          <>
            {userTeams.map((team) => {
              const isLeader = team.members.some(m => m.user_id === user?.id && m.role === 'leader');
              const teamDistance = teamTotalDistances.get(team.id) ?? null;
              const loadingDistance = loadingTeamDistances.get(team.id) ?? false;
              const teamUserIds = new Set(team.members.map(m => m.user_id));
              
              return (
                <div key={team.id} className="mb-6 space-y-4">
                  <Card variant="elevated">
                    <div className="flex flex-col md:flex-row md:justify-between items-start mb-4 gap-4 md:gap-0">
                      <div className="flex-1 min-w-0">
                        {editingTeamId === team.id ? (
                          <div className="space-y-3">
                            <input
                              type="text"
                              value={editedTeamName}
                              onChange={(e) => setEditedTeamName(e.target.value)}
                              className="w-full px-4 py-2 text-2xl font-bold text-teal rounded-lg border-2 border-teal focus:border-teal focus:outline-none bg-white/80"
                              placeholder="Nombre del equipo"
                              autoFocus
                              disabled={updatingTeamName}
                            />
                            <div className="flex gap-2">
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleSaveTeamName(team.id)}
                                disabled={updatingTeamName}
                              >
                                {updatingTeamName ? 'Guardando...' : 'Guardar'}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCancelEditTeamName}
                                disabled={updatingTeamName}
                              >
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-2xl font-bold text-teal mb-2">
                              {team.name || `Equipo ${team.id.slice(0, 8)}`}
                            </h2>
                            {isLeader && (
                              <button
                                onClick={() => handleStartEditTeamName(team.id, team.name || '')}
                                className="p-2 text-gray-400 hover:text-teal transition-colors"
                                aria-label="Editar nombre del equipo"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                              </button>
                            )}
                          </div>
                        )}
                        <p className="text-gray-600">
                          {team.member_count} de {Math.max(team.max_members, 14)} miembros
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {team.created_by === user?.id && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleDeleteTeam(team.id)}
                            disabled={editingTeamId === team.id}
                          >
                            Eliminar Equipo
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLeaveTeam(team.id)}
                          disabled={editingTeamId === team.id}
                        >
                          Salir del Equipo
                        </Button>
                      </div>
                    </div>
                  </Card>

                  {/* Team Statistics Card */}
                  <TeamStatsCard 
                    totalDistance={teamDistance} 
                    loading={loadingDistance}
                  />

                  <Card variant="elevated">
                    <TeamMemberList team={team} currentUserId={user?.id || ''} />
                  </Card>

                  {/* Nearby Users Card - Show when user has a team and can invite others */}
                  {isLeader && team.member_count < Math.max(team.max_members, 14) && (
                    <Card variant="elevated">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h2 className="text-2xl font-bold text-teal">
                            Usuarios Cercanos ({(() => {
                              const searchQuery = nearbyUsersSearch.get(team.id) || '';
                              const baseFiltered = nearbyUsers.filter(u => !teamUserIds.has(u.id));
                              if (!searchQuery.trim()) return baseFiltered.length;
                              const query = searchQuery.toLowerCase().trim();
                              return baseFiltered.filter(user => 
                                user.name.toLowerCase().includes(query) ||
                                (user.team_name && user.team_name.toLowerCase().includes(query))
                              ).length;
                            })()})
                          </h2>
                          <p className="text-gray-600 text-sm mt-1">
                            Encuentra usuarios cercanos para invitar a este equipo
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
                      ) : (() => {
                        const baseFiltered = nearbyUsers.filter(u => !teamUserIds.has(u.id));
                        if (baseFiltered.length === 0) {
                          return (
                            <p className="text-gray-600 py-4">
                              No se encontraron usuarios cercanos dentro de 10 millas. ¡Intenta actualizar o pide a tus amigos que se unan!
                            </p>
                          );
                        }
                        
                        const searchQuery = nearbyUsersSearch.get(team.id) || '';
                        
                        // Apply search filter
                        const filteredUsers = baseFiltered.filter(user => {
                          if (!searchQuery.trim()) return true;
                          const query = searchQuery.toLowerCase().trim();
                          return (
                            user.name.toLowerCase().includes(query) ||
                            (user.team_name && user.team_name.toLowerCase().includes(query))
                          );
                        });
                        
                        if (filteredUsers.length === 0 && searchQuery.trim()) {
                          return (
                            <div>
                              <div className="mb-4">
                                <input
                                  type="text"
                                  placeholder="Buscar por nombre o equipo..."
                                  value={searchQuery}
                                  onChange={(e) => {
                                    const newQuery = e.target.value;
                                    setNearbyUsersSearch(prev => {
                                      const newMap = new Map(prev);
                                      newMap.set(team.id, newQuery);
                                      return newMap;
                                    });
                                    setNearbyUsersPage(prev => {
                                      const newMap = new Map(prev);
                                      newMap.set(team.id, 1);
                                      return newMap;
                                    });
                                  }}
                                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-teal focus:outline-none bg-white/80 text-base"
                                />
                              </div>
                              <p className="text-gray-600 py-4">
                                No se encontraron usuarios que coincidan con tu búsqueda.
                              </p>
                            </div>
                          );
                        }
                        
                        const currentPage = nearbyUsersPage.get(team.id) || 1;
                        const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
                        const paginatedUsers = filteredUsers.slice(
                          (currentPage - 1) * usersPerPage,
                          currentPage * usersPerPage
                        );
                        
                        return (
                          <>
                            {/* Search Field */}
                            <div className="mb-4">
                              <input
                                type="text"
                                placeholder="Buscar por nombre o equipo..."
                                value={searchQuery}
                                onChange={(e) => {
                                  const newQuery = e.target.value;
                                  setNearbyUsersSearch(prev => {
                                    const newMap = new Map(prev);
                                    newMap.set(team.id, newQuery);
                                    return newMap;
                                  });
                                  // Reset to page 1 when search changes
                                  setNearbyUsersPage(prev => {
                                    const newMap = new Map(prev);
                                    newMap.set(team.id, 1);
                                    return newMap;
                                  });
                                }}
                                className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-teal focus:outline-none bg-white/80 text-base"
                              />
                            </div>
                            
                            <div className="space-y-3">
                              {paginatedUsers.map((nearbyUser) => (
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
                                    {/* Location removed for privacy - addresses should not be visible to other users */}
                                  </div>
                                  <div className="flex flex-col sm:items-end gap-2 flex-shrink-0">
                                    <p className="text-sm font-medium text-teal whitespace-nowrap">
                                      A {nearbyUser.distance_miles.toFixed(1)} millas
                                    </p>
                                    {team.member_count < team.max_members && (
                                      <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={() => handleInviteUser(nearbyUser.id, team.id)}
                                        className="min-h-[44px] w-full sm:w-auto"
                                      >
                                        Invitar
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            {/* Pagination Controls */}
                            {filteredUsers.length > usersPerPage && (
                              <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const newPage = Math.max(1, currentPage - 1);
                                    setNearbyUsersPage(prev => {
                                      const newMap = new Map(prev);
                                      newMap.set(team.id, newPage);
                                      return newMap;
                                    });
                                  }}
                                  disabled={currentPage === 1}
                                  className="min-h-[44px]"
                                >
                                  Anterior
                                </Button>
                                <span className="text-sm text-gray-600">
                                  Página {currentPage} de {totalPages}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const newPage = Math.min(totalPages, currentPage + 1);
                                    setNearbyUsersPage(prev => {
                                      const newMap = new Map(prev);
                                      newMap.set(team.id, newPage);
                                      return newMap;
                                    });
                                  }}
                                  disabled={currentPage >= totalPages}
                                  className="min-h-[44px]"
                                >
                                  Siguiente
                                </Button>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </Card>
                  )}
                </div>
              );
            })}
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

        {/* All Teams Section */}
        <div className="mt-12">
          <Card variant="elevated">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-teal">
                Todos los Equipos ({allTeams.length})
              </h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={loadAllTeams} 
                disabled={loadingAllTeams}
              >
                {loadingAllTeams ? 'Cargando...' : 'Actualizar'}
              </Button>
            </div>

            {loadingAllTeams ? (
              <div className="text-center py-8">
                <div className="inline-block w-8 h-8 border-4 border-teal border-t-transparent rounded-full animate-spin" />
                <p className="mt-2 text-gray-600">Cargando equipos...</p>
              </div>
            ) : allTeams.length === 0 ? (
              <p className="text-gray-600 py-4 text-center">
                No hay equipos disponibles en este momento.
              </p>
            ) : (
              <div className="space-y-6">
                {allTeams.map((team) => {
                  const isUserMember = userTeams.some(ut => ut.id === team.id);
                  const hasPendingRequest = userJoinRequests.some(
                    req => req.team_id === team.id && req.status === 'pending'
                  );
                  const canJoin = !isUserMember && team.member_count < Math.max(team.max_members, 14);
                  const leader = team.members.find(m => m.role === 'leader');
                  
                  return (
                    <div
                      key={team.id}
                      className="p-4 bg-white/60 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-teal mb-1">
                            {team.name || `Equipo ${team.id.slice(0, 8)}`}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {team.member_count} de {Math.max(team.max_members, 14)} miembros
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {leader && (
                            <span className="px-2 py-1 bg-teal/10 text-teal rounded-full text-xs font-semibold whitespace-nowrap">
                              👑 Líder: {leader.profile?.name || 'Desconocido'}
                            </span>
                          )}
                          {isUserMember && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold whitespace-nowrap">
                              ✓ Eres miembro
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {team.members.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            Miembros:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {team.members.map((member) => (
                              <div
                                key={member.id}
                                className="flex items-center gap-2 px-3 py-2 bg-white/80 rounded-lg border border-gray-200"
                              >
                                <Avatar
                                  avatarUrl={member.profile?.avatar_url}
                                  name={member.profile?.name || 'Desconocido'}
                                  size="sm"
                                />
                                <div className="flex items-center gap-1.5">
                                  <span className="text-sm font-medium text-gray-800">
                                    {member.profile?.name || 'Desconocido'}
                                  </span>
                                  {member.role === 'leader' && (
                                    <span className="text-xs text-teal font-semibold">👑</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {canJoin && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          {hasPendingRequest ? (
                            <p className="text-sm text-gray-600 text-center">
                              Solicitud de unión enviada
                            </p>
                          ) : (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleRequestJoin(team.id)}
                              className="w-full"
                            >
                              Solicitar Unirse
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
        </div>
      </div>
    </PlanRestrictedContent>
  );
}

