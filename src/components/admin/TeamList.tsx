import { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import type { TeamWithAdminStats } from '../../lib/adminQueries';

interface TeamListProps {
  teams: TeamWithAdminStats[];
  loading?: boolean;
  onDeleteTeam: (teamId: string) => Promise<void>;
  onAddUser: (teamId: string) => void;
  onRemoveUser: (teamId: string, userId: string) => Promise<void>;
}

export function TeamList({ teams, loading, onDeleteTeam, onAddUser, onRemoveUser }: TeamListProps) {
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());
  const [deletingTeamId, setDeletingTeamId] = useState<string | null>(null);
  const [removingUserId, setRemovingUserId] = useState<{ teamId: string; userId: string } | null>(null);

  const toggleTeam = (teamId: string) => {
    const newExpanded = new Set(expandedTeams);
    if (newExpanded.has(teamId)) {
      newExpanded.delete(teamId);
    } else {
      newExpanded.add(teamId);
    }
    setExpandedTeams(newExpanded);
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este equipo? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setDeletingTeamId(teamId);
      await onDeleteTeam(teamId);
    } catch (error: any) {
      console.error('Delete team error:', error);
      alert(`Error al eliminar el equipo: ${error.message || 'Por favor intenta de nuevo.'}`);
    } finally {
      setDeletingTeamId(null);
    }
  };

  const handleRemoveUser = async (teamId: string, userId: string) => {
    if (!confirm('¿Estás seguro de que quieres remover este usuario del equipo?')) {
      return;
    }

    try {
      setRemovingUserId({ teamId, userId });
      await onRemoveUser(teamId, userId);
    } catch (error) {
      alert('Error al remover el usuario. Por favor intenta de nuevo.');
    } finally {
      setRemovingUserId(null);
    }
  };

  if (loading) {
    return (
      <Card variant="elevated" className="mb-6">
        <div className="text-center py-8">
          <div className="inline-block w-8 h-8 border-4 border-teal border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-600">Cargando equipos...</p>
        </div>
      </Card>
    );
  }

  if (teams.length === 0) {
    return (
      <Card variant="elevated" className="mb-6">
        <p className="text-gray-600 text-center py-8">No hay equipos registrados.</p>
      </Card>
    );
  }

  return (
    <Card variant="elevated" className="mb-6">
      <h2 className="text-2xl font-bold text-teal mb-4">Equipos ({teams.length})</h2>
      <div className="space-y-4">
        {teams.map((team) => {
          const isExpanded = expandedTeams.has(team.id);
          return (
            <div
              key={team.id}
              className="p-4 bg-white/60 rounded-xl border-2 border-white/40 hover:border-teal/30 transition-colors"
            >
              {/* Team Header */}
              <div className="flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-gray-800 truncate">
                      {team.name || `Equipo ${team.id.slice(0, 8)}`}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {team.member_count} de {team.max_members} miembros
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 flex-shrink-0">
                    <div className="text-right sm:text-left">
                      <p className="text-xs text-gray-500">Puntos Totales</p>
                      <p className="text-lg font-bold text-teal">{team.totalPoints.toLocaleString()}</p>
                    </div>
                    <div className="text-right sm:text-left">
                      <p className="text-xs text-gray-500">Km Totales</p>
                      <p className="text-lg font-bold text-teal">{team.totalKm.toFixed(1)}</p>
                    </div>
                  </div>
                </div>

                {/* Team Actions */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleTeam(team.id)}
                    className="min-h-[44px]"
                  >
                    {isExpanded ? 'Ocultar Miembros' : 'Ver Miembros'}
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onAddUser(team.id)}
                    className="min-h-[44px]"
                  >
                    Agregar Usuario
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDeleteTeam(team.id)}
                    disabled={deletingTeamId === team.id}
                    className="min-h-[44px]"
                  >
                    {deletingTeamId === team.id ? 'Eliminando...' : 'Eliminar Equipo'}
                  </Button>
                </div>

                {/* Team Members (Expandable) */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-white/40">
                    <h4 className="font-semibold text-gray-700 mb-3">Miembros del Equipo</h4>
                    {team.members.length === 0 ? (
                      <p className="text-gray-600 text-sm">No hay miembros en este equipo.</p>
                    ) : (
                      <div className="space-y-2">
                        {team.members.map((member) => {
                          const isRemoving = removingUserId?.teamId === team.id && removingUserId?.userId === member.user_id;
                          return (
                            <div
                              key={member.id}
                              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-white/40 rounded-lg"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-800 truncate">
                                  {member.profile?.name || 'Usuario desconocido'}
                                </p>
                                <p className="text-xs text-gray-600">
                                  {member.role === 'leader' ? '👑 Líder' : 'Miembro'}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveUser(team.id, member.user_id)}
                                disabled={isRemoving}
                                className="min-h-[44px] w-full sm:w-auto"
                              >
                                {isRemoving ? 'Removiendo...' : 'Remover'}
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
