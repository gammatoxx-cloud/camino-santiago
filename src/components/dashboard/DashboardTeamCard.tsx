import { Link } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import type { TeamWithMembers, TeamInvitationWithDetails } from '../../types';

interface DashboardTeamCardProps {
  userTeam: TeamWithMembers | null;
  invitations: TeamInvitationWithDetails[];
  currentUserId: string;
}

export function DashboardTeamCard({
  userTeam,
  invitations,
  currentUserId,
}: DashboardTeamCardProps) {
  return (
    <Card variant="elevated" className="!p-6 md:!p-6 relative overflow-hidden">
      {/* Decorative background accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-rose/5 to-transparent rounded-full blur-3xl -z-0"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-teal">
            Tu Equipo
          </h2>
          <Link to="/teams">
            <Button variant="ghost" size="sm">
              Ver Todo →
            </Button>
          </Link>
        </div>

      {/* Pending Invitations Alert */}
      {invitations.length > 0 && (
        <div className="mb-5 p-4 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/50 border-2 border-amber-200/80">
          <p className="text-sm font-semibold text-amber-800 mb-1">
            🎉 Tienes {invitations.length} invitación{invitations.length > 1 ? 'es' : ''} pendiente{invitations.length > 1 ? 's' : ''}
          </p>
          <p className="text-xs text-amber-700">
            Ve a la página de Equipos para responder
          </p>
        </div>
      )}

      {/* Team Info or CTA */}
      {userTeam ? (
        <div>
          <div className="p-5 md:p-6 rounded-2xl bg-gradient-to-br from-white/70 via-white/50 to-rose/5 border border-teal/15">
            <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-3">
              {userTeam.name || `Equipo ${userTeam.id.slice(0, 8)}`}
            </h3>
            <div className="flex items-center gap-2 text-sm md:text-base text-gray-600 mb-4">
              <span className="font-semibold">
                {userTeam.member_count}/{userTeam.max_members} miembros
              </span>
              {userTeam.created_by === currentUserId && (
                <span className="px-3 py-1 bg-teal/20 text-teal text-xs rounded-full font-medium">
                  Líder
                </span>
              )}
            </div>
            
            {/* Member Preview */}
            <div className="flex flex-wrap gap-2">
              {userTeam.members.slice(0, 4).map((member) => (
                <div
                  key={member.id}
                  className="px-3 py-2 bg-white/90 backdrop-blur-sm rounded-xl text-xs md:text-sm font-medium text-gray-700 border border-gray-200/50"
                >
                  {member.profile?.name || 'Usuario'}
                  {member.user_id === currentUserId && (
                    <span className="ml-1 text-gray-500">(Tú)</span>
                  )}
                </div>
              ))}
              {userTeam.members.length > 4 && (
                <div className="px-3 py-2 bg-gray-100/80 rounded-xl text-xs md:text-sm font-medium text-gray-600">
                  +{userTeam.members.length - 4} más
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-5xl md:text-6xl mb-4">👥</div>
          <p className="text-gray-700 mb-6 text-base md:text-lg">
            Aún no estás en un equipo
          </p>
          <Link to="/teams">
            <Button variant="primary" size="md">
              Encuentra Tu Equipo
            </Button>
          </Link>
        </div>
      )}
      </div>
    </Card>
  );
}

