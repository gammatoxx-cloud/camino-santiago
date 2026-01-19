import { TeamJoinRequestWithDetails } from '../../types';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface TeamJoinRequestCardProps {
  request: TeamJoinRequestWithDetails;
  onAccept: (requestId: string) => void;
  onDecline: (requestId: string) => void;
  accepting?: boolean;
  declining?: boolean;
}

export function TeamJoinRequestCard({
  request,
  onAccept,
  onDecline,
  accepting = false,
  declining = false,
}: TeamJoinRequestCardProps) {
  const requesterName = request.requester?.name || 'Usuario desconocido';
  const requesterLocation = request.requester?.location || null;

  return (
    <Card variant="elevated" className="p-4">
      <div className="flex items-start gap-4">
        <Avatar
          avatarUrl={request.requester?.avatar_url}
          name={requesterName}
          size="md"
        />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 text-base mb-1 truncate">
            {requesterName}
          </p>
          {requesterLocation && (
            <p className="text-sm text-gray-600 mb-3 truncate">{requesterLocation}</p>
          )}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => onAccept(request.id)}
              disabled={accepting || declining}
              className="min-h-[44px] flex-1"
            >
              {accepting ? 'Aceptando...' : 'Aceptar'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDecline(request.id)}
              disabled={accepting || declining}
              className="min-h-[44px] flex-1"
            >
              {declining ? 'Rechazando...' : 'Rechazar'}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
