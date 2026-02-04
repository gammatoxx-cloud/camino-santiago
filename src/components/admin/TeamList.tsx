import { useState, useRef } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { uploadTeamPicture, deleteTeamPicture } from '../../lib/teamImageUpload';
import type { TeamWithAdminStats } from '../../lib/adminQueries';

interface TeamListProps {
  teams: TeamWithAdminStats[];
  loading?: boolean;
  onDeleteTeam: (teamId: string) => Promise<void>;
  onAddUser: (teamId: string) => void;
  onRemoveUser: (teamId: string, userId: string) => Promise<void>;
  onUpdateWhatsAppLink: (teamId: string, whatsappLink: string) => Promise<void>;
  onUpdateTeamAvatar: (teamId: string, avatarUrl: string | null) => Promise<void>;
}

export function TeamList({ teams, loading, onDeleteTeam, onAddUser, onRemoveUser, onUpdateWhatsAppLink, onUpdateTeamAvatar }: TeamListProps) {
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());
  const [deletingTeamId, setDeletingTeamId] = useState<string | null>(null);
  const [removingUserId, setRemovingUserId] = useState<{ teamId: string; userId: string } | null>(null);
  const [editingWhatsAppTeamId, setEditingWhatsAppTeamId] = useState<string | null>(null);
  const [whatsappLinkDraft, setWhatsappLinkDraft] = useState<Record<string, string>>({});
  const [uploadingAvatarTeamId, setUploadingAvatarTeamId] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

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

  const startEditWhatsApp = (teamId: string, currentLink: string | null) => {
    setEditingWhatsAppTeamId(teamId);
    setWhatsappLinkDraft((prev) => ({ ...prev, [teamId]: currentLink ?? '' }));
  };

  const cancelEditWhatsApp = (teamId: string) => {
    setEditingWhatsAppTeamId((prev) => (prev === teamId ? null : prev));
    setWhatsappLinkDraft((prev) => {
      const next = { ...prev };
      delete next[teamId];
      return next;
    });
  };

  const handleSaveWhatsAppLink = async (teamId: string) => {
    const link = whatsappLinkDraft[teamId] ?? '';
    try {
      await onUpdateWhatsAppLink(teamId, link.trim());
      cancelEditWhatsApp(teamId);
    } catch (err: any) {
      alert(err?.message || 'Error al guardar el enlace de WhatsApp. Por favor intenta de nuevo.');
    }
  };

  const handleAvatarFileChange = async (teamId: string, file: File | null) => {
    if (!file) return;
    setAvatarError(null);
    try {
      setUploadingAvatarTeamId(teamId);
      const team = teams.find((t) => t.id === teamId);
      if (team?.avatar_url) {
        await deleteTeamPicture(team.avatar_url);
      }
      const url = await uploadTeamPicture(teamId, file);
      await onUpdateTeamAvatar(teamId, url);
    } catch (err: any) {
      setAvatarError(err?.message || 'Error al subir la foto. Por favor intenta de nuevo.');
    } finally {
      setUploadingAvatarTeamId(null);
      const input = fileInputRefs.current[teamId];
      if (input) input.value = '';
    }
  };

  const handleRemoveAvatar = async (teamId: string) => {
    const team = teams.find((t) => t.id === teamId);
    if (!team?.avatar_url) return;
    setAvatarError(null);
    try {
      setUploadingAvatarTeamId(teamId);
      await deleteTeamPicture(team.avatar_url);
      await onUpdateTeamAvatar(teamId, null);
    } catch (err: any) {
      setAvatarError(err?.message || 'Error al eliminar la foto. Por favor intenta de nuevo.');
    } finally {
      setUploadingAvatarTeamId(null);
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
                {avatarError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm">{avatarError}</p>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex flex-1 min-w-0 flex-col items-start gap-3 sm:flex-row sm:items-center">
                    <Avatar
                      avatarUrl={team.avatar_url}
                      name={team.name || `Equipo ${team.id.slice(0, 8)}`}
                      size="md"
                      className="flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <h3 className="text-xl font-bold text-gray-800 truncate">
                        {team.name || `Equipo ${team.id.slice(0, 8)}`}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {team.member_count} de {Math.max(team.max_members, 14)} miembros
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          className="hidden"
                          ref={(el) => {
                            fileInputRefs.current[team.id] = el;
                          }}
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleAvatarFileChange(team.id, f);
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => fileInputRefs.current[team.id]?.click()}
                          disabled={uploadingAvatarTeamId === team.id}
                          className="min-h-[44px]"
                        >
                          {uploadingAvatarTeamId === team.id
                            ? 'Subiendo...'
                            : team.avatar_url
                              ? 'Cambiar foto'
                              : 'Subir foto'}
                        </Button>
                        {team.avatar_url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveAvatar(team.id)}
                            disabled={uploadingAvatarTeamId === team.id}
                            className="min-h-[44px] text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            Eliminar foto
                          </Button>
                        )}
                      </div>
                    </div>
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

                {/* WhatsApp link (admin edit) */}
                <div className="mt-2">
                  {editingWhatsAppTeamId === team.id ? (
                    <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-end">
                      <div className="flex-1 min-w-0">
                        <label htmlFor={`whatsapp-${team.id}`} className="sr-only">
                          Enlace de WhatsApp
                        </label>
                        <input
                          id={`whatsapp-${team.id}`}
                          type="url"
                          value={whatsappLinkDraft[team.id] ?? ''}
                          onChange={(e) =>
                            setWhatsappLinkDraft((prev) => ({ ...prev, [team.id]: e.target.value }))
                          }
                          placeholder="https://chat.whatsapp.com/..."
                          className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-teal focus:outline-none bg-white text-gray-800 min-h-[44px]"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleSaveWhatsAppLink(team.id)}
                          className="min-h-[44px]"
                        >
                          Guardar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => cancelEditWhatsApp(team.id)}
                          className="min-h-[44px]"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2">
                      {team.whatsapp_link ? (
                        <a
                          href={team.whatsapp_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-teal hover:underline truncate max-w-full"
                        >
                          {team.whatsapp_link}
                        </a>
                      ) : (
                        <span className="text-gray-500 text-sm">Sin enlace de WhatsApp</span>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditWhatsApp(team.id, team.whatsapp_link ?? null)}
                        className="min-h-[44px]"
                      >
                        {team.whatsapp_link ? 'Editar enlace' : 'Añadir enlace'}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Team Actions */}
                <div className="flex flex-wrap gap-2 mt-2">
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
