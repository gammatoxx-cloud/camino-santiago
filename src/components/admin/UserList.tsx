import { useState } from 'react';
import { Card } from '../ui/Card';
import { updateUserPlan } from '../../lib/adminQueries';
import type { UserWithStats } from '../../lib/adminQueries';
import type { UserPlan } from '../../types';

interface UserListProps {
  users: UserWithStats[];
  loading?: boolean;
  onPlanUpdate?: () => void;
}

const PLAN_NAMES: Record<UserPlan, string> = {
  gratis: 'Gratis',
  basico: 'Básico',
  completo: 'Completo',
};

export function UserList({ users, loading, onPlanUpdate }: UserListProps) {
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const handlePlanChange = async (userId: string, newPlan: UserPlan) => {
    try {
      setUpdatingUserId(userId);
      setUpdateError(null);
      await updateUserPlan(userId, newPlan);
      if (onPlanUpdate) {
        onPlanUpdate();
      }
    } catch (error: any) {
      setUpdateError(error.message || 'Error al actualizar el plan');
      console.error('Error updating plan:', error);
    } finally {
      setUpdatingUserId(null);
    }
  };

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
      
      {updateError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{updateError}</p>
        </div>
      )}

      <div className="space-y-3">
        {users.map((user) => {
          const currentPlan = (user.user_plan || 'gratis') as UserPlan;
          const isUpdating = updatingUserId === user.id;

          return (
            <div
              key={user.id}
              className="p-4 bg-white/60 rounded-xl border-2 border-white/40 hover:border-teal/30 transition-colors"
            >
              <div className="flex flex-col gap-3">
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

                {/* Plan Selection */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2 border-t border-white/40">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Plan
                    </label>
                    <div className="flex items-center gap-2">
                      <select
                        value={currentPlan}
                        onChange={(e) => handlePlanChange(user.id, e.target.value as UserPlan)}
                        disabled={isUpdating}
                        className="px-3 py-2 text-sm rounded-lg border-2 border-gray-200 focus:border-teal focus:outline-none bg-white/80 font-semibold text-teal min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="gratis">Gratis</option>
                        <option value="basico">Básico</option>
                        <option value="completo">Completo</option>
                      </select>
                      {isUpdating && (
                        <div className="w-5 h-5 border-2 border-teal border-t-transparent rounded-full animate-spin" />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal/10 text-teal">
                      {PLAN_NAMES[currentPlan]}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
