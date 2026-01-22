import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { UserList } from '../components/admin/UserList';
import { TeamList } from '../components/admin/TeamList';
import { TeamMemberManager } from '../components/admin/TeamMemberManager';
import {
  getAllUsersWithStats,
  getAllTeamsWithStats,
  addUserToTeam,
  removeUserFromTeam,
  deleteTeam,
  type UserWithStats,
  type TeamWithAdminStats,
} from '../lib/adminQueries';

export function AdminPage() {
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [teams, setTeams] = useState<TeamWithAdminStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddUserModal, setShowAddUserModal] = useState<{ teamId: string; teamName: string } | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [usersData, teamsData] = await Promise.all([
        getAllUsersWithStats(),
        getAllTeamsWithStats(),
      ]);
      setUsers(usersData);
      setTeams(teamsData);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los datos del administrador');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleDeleteTeam = async (teamId: string) => {
    try {
      await deleteTeam(teamId);
      // Reload teams after deletion
      const teamsData = await getAllTeamsWithStats();
      setTeams(teamsData);
    } catch (err: any) {
      throw err; // Let TeamList handle the error display
    }
  };

  const handleAddUser = (teamId: string) => {
    const team = teams.find((t) => t.id === teamId);
    setShowAddUserModal({
      teamId,
      teamName: team?.name || `Equipo ${teamId.slice(0, 8)}`,
    });
  };

  const handleAddUserToTeam = async (userId: string) => {
    if (!showAddUserModal) return;
    try {
      await addUserToTeam(userId, showAddUserModal.teamId);
      // Reload teams after adding user
      const teamsData = await getAllTeamsWithStats();
      setTeams(teamsData);
      setShowAddUserModal(null);
    } catch (err: any) {
      throw err; // Let TeamMemberManager handle the error display
    }
  };

  const handleRemoveUser = async (teamId: string, userId: string) => {
    try {
      await removeUserFromTeam(userId, teamId);
      // Reload teams after removing user
      const teamsData = await getAllTeamsWithStats();
      setTeams(teamsData);
    } catch (err: any) {
      throw err; // Let TeamList handle the error display
    }
  };

  // Filter users based on search query
  const filteredUsers = users.filter((user) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.phone_number?.toLowerCase().includes(query) ||
      user.address?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-cream px-4 py-8 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <Card variant="elevated" className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-teal mb-2">Panel de Administración</h1>
              <p className="text-gray-600">Gestiona usuarios y equipos de la aplicación</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className="px-6 py-3 bg-teal text-white rounded-xl font-semibold hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
            >
              {refreshing ? 'Actualizando...' : 'Actualizar'}
            </button>
          </div>
        </Card>

        {/* Error Message */}
        {error && (
          <Card variant="elevated" className="mb-6 bg-red-50 border-red-200">
            <p className="text-red-700">{error}</p>
          </Card>
        )}

        {/* Search Bar */}
        <Card variant="elevated" className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <label htmlFor="user-search" className="block text-sm font-medium text-gray-700 mb-2">
                Buscar usuarios
              </label>
              <div className="relative">
                <input
                  id="user-search"
                  type="text"
                  placeholder="Buscar por nombre, email, teléfono o dirección..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pl-10 rounded-xl border-2 border-gray-200 focus:border-teal focus:outline-none bg-white text-gray-800 placeholder-gray-400 min-h-[44px]"
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Limpiar búsqueda"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              {searchQuery && (
                <p className="mt-2 text-sm text-gray-600">
                  {filteredUsers.length === 1
                    ? '1 usuario encontrado'
                    : `${filteredUsers.length} usuarios encontrados`}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Users Section */}
        <UserList users={filteredUsers} loading={loading} onPlanUpdate={handleRefresh} onUserDelete={handleRefresh} />

        {/* Teams Section */}
        <TeamList
          teams={teams}
          loading={loading}
          onDeleteTeam={handleDeleteTeam}
          onAddUser={handleAddUser}
          onRemoveUser={handleRemoveUser}
        />

        {/* Add User Modal */}
        {showAddUserModal && (
          <TeamMemberManager
            teamId={showAddUserModal.teamId}
            teamName={showAddUserModal.teamName}
            currentMembers={teams.find((t) => t.id === showAddUserModal.teamId)?.members.map((m) => m.user_id) || []}
            onClose={() => setShowAddUserModal(null)}
            onAddUser={handleAddUserToTeam}
          />
        )}
      </div>
    </div>
  );
}
