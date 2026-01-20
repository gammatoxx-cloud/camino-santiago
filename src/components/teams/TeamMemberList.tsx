import { TeamWithMembers } from '../../types';
import { Avatar } from '../ui/Avatar';

interface TeamMemberListProps {
  team: TeamWithMembers;
  currentUserId: string;
}

export function TeamMemberList({ team, currentUserId }: TeamMemberListProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-teal mb-4">Miembros del Equipo</h3>
      <div className="space-y-3">
        {team.members.map((member, index) => (
          <div
            key={member.id}
            className="glass-member-card flex items-center justify-between p-4 rounded-2xl"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <Avatar
                avatarUrl={member.profile?.avatar_url}
                name={member.profile?.name || 'Desconocido'}
                size="md"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-gray-800 text-base truncate">
                    {member.profile?.name || 'Desconocido'}
                  </p>
                  {member.user_id === currentUserId && (
                    <span className="px-2 py-0.5 bg-teal/10 text-teal rounded-full text-xs font-medium whitespace-nowrap">
                      Tú
                    </span>
                  )}
                </div>
                {member.profile?.location && (
                  <p className="text-sm text-gray-600 truncate">{member.profile.location}</p>
                )}
              </div>
            </div>
            {member.role === 'leader' && (
              <div className="glass-leader-badge px-3 py-1.5 rounded-full flex-shrink-0">
                <span className="text-teal text-xs font-semibold uppercase tracking-wide">
                  Líder
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-6 pt-4 border-t border-gray-200/50">
        <p className="text-sm font-medium text-gray-600 text-center">
          {team.member_count} de {Math.max(team.max_members, 14)} miembros
        </p>
      </div>
    </div>
  );
}

