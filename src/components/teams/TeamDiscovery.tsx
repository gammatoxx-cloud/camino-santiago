import { useState } from 'react';
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

  return (
    <div className="space-y-6">
      {/* Nearby Users Section */}
      <Card variant="elevated">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-teal">
            Usuarios Cercanos ({nearbyUsers.length})
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
            ) : nearbyUsers.length === 0 ? (
              <p className="text-gray-600 py-4">
                No se encontraron usuarios dentro de 10 millas. ¡Intenta ampliar tu búsqueda o crea un equipo e invita a tus amigos!
              </p>
            ) : (
              <div className="space-y-3">
                {nearbyUsers.map((user) => {
                  const isTeamLeader = user.is_team_leader === true;
                  const hasSpace = user.team_max_members && user.team_id
                    ? !pendingJoinRequestTeamIds.includes(user.team_id)
                    : false;
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
                        {user.location && (
                          <p className="text-sm text-gray-600 truncate">{user.location}</p>
                        )}
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

