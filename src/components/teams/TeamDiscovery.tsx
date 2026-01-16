import React, { useState } from 'react';
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
  loading?: boolean;
}

export function TeamDiscovery({
  nearbyUsers,
  availableTeams,
  currentUserId,
  onCreateTeam,
  onJoinTeam,
  onLeaveTeam,
  loading = false,
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
                {nearbyUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 bg-white/60 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-800">{user.name}</p>
                      {user.location && (
                        <p className="text-sm text-gray-600">{user.location}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-teal">
                        A {user.distance_miles.toFixed(1)} millas de distancia
                      </p>
                    </div>
                  </div>
                ))}
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

