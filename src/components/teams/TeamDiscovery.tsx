import { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { NearbyUser, TeamWithMembers } from '../../types';
import { TeamCard } from './TeamCard';

interface TeamDiscoveryProps {
  nearbyUsers: NearbyUser[];
  availableTeams: TeamWithMembers[];
  currentUserId: string;
  onCreateTeam: () => void;
  onJoinTeam: (teamId: string) => void;
  onLeaveTeam: (teamId: string) => void;
  onRequestJoin?: (teamId: string) => void;
  loading?: boolean;
  pendingJoinRequestTeamIds?: string[]; // Team IDs the user has pending requests for
}

export function TeamDiscovery({
  nearbyUsers,
  availableTeams,
  currentUserId,
  onCreateTeam,
  onJoinTeam,
  onLeaveTeam,
  onRequestJoin,
  loading = false,
  pendingJoinRequestTeamIds = [],
}: TeamDiscoveryProps) {
  const [showNearbyUsers, setShowNearbyUsers] = useState(true);
  const [showTeams, setShowTeams] = useState(true);
  const [nearbyUsersPage, setNearbyUsersPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const usersPerPage = 5;

  // Filter nearby users based on search query
  const filteredNearbyUsers = nearbyUsers.filter(user => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    return (
      user.name.toLowerCase().includes(query) ||
      (user.team_name && user.team_name.toLowerCase().includes(query))
    );
  });

  // Reset to page 1 when nearby users list or search query changes
  useEffect(() => {
    setNearbyUsersPage(1);
  }, [nearbyUsers.length, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Nearby Users Section */}
      <Card variant="elevated">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-teal">
            Usuarios Cercanos ({filteredNearbyUsers.length})
          </h2>
          <button
            onClick={() => setShowNearbyUsers(!showNearbyUsers)}
            className="text-teal hover:text-teal-600 transition-colors"
          >
            {showNearbyUsers ? 'Ocultar' : 'Mostrar'}
          </button>
        </div>

        {showNearbyUsers && (
          <>
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block w-8 h-8 border-4 border-teal border-t-transparent rounded-full animate-spin" />
                <p className="mt-2 text-gray-600">Buscando usuarios cercanos...</p>
              </div>
            ) : filteredNearbyUsers.length === 0 ? (
              <p className="text-gray-600 py-4">
                {searchQuery.trim() 
                  ? 'No se encontraron usuarios que coincidan con tu búsqueda.'
                  : 'No se encontraron usuarios dentro de 10 millas. ¡Intenta ampliar tu búsqueda o crea un equipo e invita a tus amigos!'}
              </p>
            ) : (
              <>
                {/* Search Field */}
                <div className="mb-4">
                  <input
                    type="text"
                     placeholder="Buscar por nombre o equipo..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-teal focus:outline-none bg-white/80 text-base"
                  />
                </div>
                
                <div className="space-y-3">
                  {filteredNearbyUsers
                    .slice((nearbyUsersPage - 1) * usersPerPage, nearbyUsersPage * usersPerPage)
                    .map((user) => {
                      const isTeamLeader = user.is_team_leader === true;
                      const hasSpace = user.team_id != null && !pendingJoinRequestTeamIds.includes(user.team_id);
                      const canRequestJoin = isTeamLeader && hasSpace && onRequestJoin && user.team_id;

                      return (
                        <div
                          key={user.id}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-white/60 rounded-lg"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-gray-800 truncate">{user.name}</p>
                              {isTeamLeader && (
                                <span className="px-2 py-0.5 bg-teal/10 text-teal rounded-full text-xs font-semibold whitespace-nowrap">
                                  👑 Líder
                                </span>
                              )}
                            </div>
                            {user.team_name && (
                              <p className="text-sm text-teal font-medium mb-1 truncate">
                                {user.team_name}
                              </p>
                            )}
                            {/* Location removed for privacy - addresses should not be visible to other users */}
                          </div>
                          <div className="flex flex-col sm:items-end gap-2 flex-shrink-0">
                            <p className="text-sm font-medium text-teal whitespace-nowrap">
                              A {user.distance_miles.toFixed(1)} millas
                            </p>
                            {canRequestJoin && (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => onRequestJoin(user.team_id!)}
                                className="min-h-[44px] w-full sm:w-auto"
                              >
                                Solicitar Unirse
                              </Button>
                            )}
                            {isTeamLeader && user.team_id && pendingJoinRequestTeamIds.includes(user.team_id) && (
                              <span className="text-xs text-gray-500 text-center sm:text-right">
                                Solicitud enviada
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
                
                {/* Pagination Controls */}
                {filteredNearbyUsers.length > usersPerPage && (
                  <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setNearbyUsersPage(prev => Math.max(1, prev - 1))}
                      disabled={nearbyUsersPage === 1}
                      className="min-h-[44px]"
                    >
                      Anterior
                    </Button>
                    <span className="text-sm text-gray-600">
                      Página {nearbyUsersPage} de {Math.ceil(filteredNearbyUsers.length / usersPerPage)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setNearbyUsersPage(prev => Math.min(Math.ceil(filteredNearbyUsers.length / usersPerPage), prev + 1))}
                      disabled={nearbyUsersPage >= Math.ceil(filteredNearbyUsers.length / usersPerPage)}
                      className="min-h-[44px]"
                    >
                      Siguiente
                    </Button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </Card>

      {/* Available Teams Section */}
      <Card variant="elevated">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-teal">
            Equipos Disponibles ({availableTeams.length})
          </h2>
          <button
            onClick={() => setShowTeams(!showTeams)}
            className="text-teal hover:text-teal-600 transition-colors"
          >
            {showTeams ? 'Ocultar' : 'Mostrar'}
          </button>
        </div>

        {showTeams && (
          <>
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block w-8 h-8 border-4 border-teal border-t-transparent rounded-full animate-spin" />
                <p className="mt-2 text-gray-600">Buscando equipos disponibles...</p>
              </div>
            ) : availableTeams.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-600 mb-4">
                  No se encontraron equipos con espacios disponibles cerca.
                </p>
                <Button onClick={onCreateTeam} variant="primary">
                  Crear Nuevo Equipo
                </Button>
              </div>
            ) : (
              <div>
                {availableTeams.map((team) => (
                  <TeamCard
                    key={team.id}
                    team={team}
                    currentUserId={currentUserId}
                    onJoin={onJoinTeam}
                    onLeave={onLeaveTeam}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {!loading && availableTeams.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <Button onClick={onCreateTeam} variant="secondary" size="md" className="w-full">
              Crea Tu Propio Equipo
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}

