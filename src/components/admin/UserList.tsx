import { Card } from '../ui/Card';
import type { UserWithStats } from '../../lib/adminQueries';

interface UserListProps {
  users: UserWithStats[];
  loading?: boolean;
}

export function UserList({ users, loading }: UserListProps) {
  if (loading) {
    return (
      <Card variant="elevated" className="mb-6">
        <div className="text-center py-8">
          <div className="inline-block w-8 h-8 border-4 border-teal border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-600">Cargando usuarios...</p>
        </div>
      </Card>
    );
  }

  if (users.length === 0) {
    return (
      <Card variant="elevated" className="mb-6">
        <p className="text-gray-600 text-center py-8">No hay usuarios registrados.</p>
      </Card>
    );
  }

  return (
    <Card variant="elevated" className="mb-6">
      <h2 className="text-2xl font-bold text-teal mb-4">Usuarios ({users.length})</h2>
      <div className="space-y-3">
        {users.map((user) => (
          <div
            key={user.id}
            className="p-4 bg-white/60 rounded-xl border-2 border-white/40 hover:border-teal/30 transition-colors"
          >
            <div className="flex flex-col gap-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate">{user.name}</p>
                  <p className="text-sm text-gray-600 truncate">{user.email}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Puntos</p>
                    <p className="text-lg font-bold text-teal">{user.totalPoints.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Km Caminados</p>
                    <p className="text-lg font-bold text-teal">{user.totalKm.toFixed(1)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
