import { Card } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { TeamWithMembers } from '../../types';

interface TeamCardProps {
  team: TeamWithMembers;
  currentUserId: string;
  onJoin?: (teamId: string) => void;
  onLeave?: (teamId: string) => void;
  showActions?: boolean;
}

export function TeamCard({ team, currentUserId, onJoin, onLeave, showActions = true }: TeamCardProps) {
  const isMember = team.members.some(m => m.user_id === currentUserId);
  const maxMembers = Math.max(team.max_members, 14);
  const isFull = team.member_count >= maxMembers;

  return (
    <Card variant="elevated" className="mb-4">
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-1 flex-col items-start gap-3 min-w-0 sm:flex-row sm:items-center">
          <Avatar
            avatarUrl={team.avatar_url}
            name={team.name || `Equipo ${team.id.slice(0, 8)}`}
            size="md"
            className="flex-shrink-0"
          />
          <div className="min-w-0">
            <h3 className="text-xl font-bold text-teal mb-1">
              {team.name || `Equipo ${team.id.slice(0, 8)}`}
            </h3>
            <p className="text-sm text-gray-600">
              {team.member_count} / {Math.max(team.max_members, 14)} miembros
            </p>
          </div>
        </div>
        {showActions && (
          <div>
            {isMember ? (
              <span className="px-3 py-1 bg-teal/20 text-teal rounded-full text-sm font-medium">
                Miembro
              </span>
            ) : isFull ? (
              <span className="px-3 py-1 bg-gray-200 text-gray-600 rounded-full text-sm font-medium">
                Lleno
              </span>
            ) : (
              <button
                onClick={() => onJoin?.(team.id)}
                className="px-3 py-1 bg-teal text-white rounded-full text-sm font-medium hover:bg-teal-600 transition-colors"
              >
                Unirse
              </button>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700 mb-2">Miembros:</p>
        <div className="flex flex-wrap gap-2">
          {team.members.map((member) => (
            <div
              key={member.id}
              className="px-3 py-1 bg-white/60 rounded-lg text-sm"
            >
              <span className="text-gray-700">{member.profile?.name || 'Desconocido'}</span>
              {member.role === 'leader' && (
                <span className="ml-1 text-teal font-medium">👑</span>
              )}
              {member.user_id === currentUserId && (
                <span className="ml-1 text-gray-500">(Tú)</span>
              )}
            </div>
          ))}
        </div>
        {isFull && !isMember && (
          <p className="text-sm text-amber-600 mt-2">
            Este equipo está lleno. No puedes unirte en este momento.
          </p>
        )}
        {isMember && showActions && (
          <button
            onClick={() => onLeave?.(team.id)}
            className="mt-3 text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Salir del Equipo
          </button>
        )}
      </div>
    </Card>
  );
}

