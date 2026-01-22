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
                {/* Location/address removed for privacy - addresses should not be visible to other users */}
                <div className="flex flex-col gap-1 mt-1">
                  {member.profile?.email && (
                    <div className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-gray-400 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      <a
                        href={`mailto:${member.profile.email}`}
                        className="text-sm text-teal hover:underline truncate"
                      >
                        {member.profile.email}
                      </a>
                    </div>
                  )}
                  {member.profile?.phone_number && (
                    <div className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-gray-400 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      <a
                        href={`tel:${member.profile.phone_number}`}
                        className="text-sm text-teal hover:underline truncate"
                      >
                        {member.profile.phone_number}
                      </a>
                    </div>
                  )}
                </div>
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

