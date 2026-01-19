import { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { supabase } from '../../lib/supabase';
import type { UserProfile } from '../../types';

interface TeamMemberManagerProps {
  teamId: string;
  teamName: string;
  currentMembers: string[]; // Array of user IDs already in the team
  onClose: () => void;
  onAddUser: (userId: string) => Promise<void>;
}

export function TeamMemberManager({ teamId: _teamId, teamName, currentMembers, onClose, onAddUser }: TeamMemberManagerProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [addingUserId, setAddingUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .order('name');

      if (fetchError) throw fetchError;
      setUsers((data || []) as UserProfile[]);
    } catch (err: any) {
      setError(err.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (userId: string) => {
    try {
      setAddingUserId(userId);
      setError(null);
      await onAddUser(userId);
      // Close modal on success
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al agregar usuario al equipo');
    } finally {
      setAddingUserId(null);
    }
  };

  // Filter users: exclude current members and filter by search term
  const availableUsers = users.filter(
    (user) =>
      !currentMembers.includes(user.id) &&
      (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <Card
          variant="elevated"
          className="max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-teal">Agregar Usuario a Equipo</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/40 transition-colors"
            aria-label="Cerrar"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-gray-600 mb-4">
          Equipo: <span className="font-semibold">{teamName}</span>
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar usuario por nombre o ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 text-base rounded-lg border-2 border-gray-200 focus:border-teal focus:outline-none bg-white/80"
          />
        </div>

        {/* User List */}
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block w-8 h-8 border-4 border-teal border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-600">Cargando usuarios...</p>
          </div>
        ) : availableUsers.length === 0 ? (
          <p className="text-gray-600 text-center py-8">
            {searchTerm ? 'No se encontraron usuarios.' : 'No hay usuarios disponibles para agregar.'}
          </p>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {availableUsers.map((user) => (
              <div
                key={user.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-white/60 rounded-lg border-2 border-white/40"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">{user.name}</p>
                  <p className="text-xs text-gray-600 truncate">ID: {user.id}</p>
                  {user.location && <p className="text-xs text-gray-500 truncate">{user.location}</p>}
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleAddUser(user.id)}
                  disabled={addingUserId === user.id}
                  className="min-h-[44px] w-full sm:w-auto"
                >
                  {addingUserId === user.id ? 'Agregando...' : 'Agregar'}
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <Button variant="ghost" size="md" onClick={onClose} className="min-h-[44px]">
            Cancelar
          </Button>
        </div>
      </Card>
      </div>
    </div>
  );
}
