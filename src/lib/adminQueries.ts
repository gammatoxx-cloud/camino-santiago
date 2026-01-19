import { supabase } from './supabase';
import { calculateTotalScore } from './scoringUtils';
import type { UserProfile, WalkCompletion, PhaseUnlock, TrailCompletion, BookCompletion, MagnoliasHikeCompletion, Team, TeamMember } from '../types';

/**
 * User with admin stats (email, points, km walked)
 */
export interface UserWithStats extends UserProfile {
  email: string;
  totalPoints: number;
  totalKm: number;
}

/**
 * Team with admin stats (members, total points, total km)
 */
export interface TeamWithAdminStats extends Team {
  members: (TeamMember & { profile?: UserProfile })[];
  member_count: number;
  totalPoints: number;
  totalKm: number;
}

/**
 * Get all users with their stats (email, points, km walked)
 * Note: Email fetching requires a database function or view that joins profiles with auth.users
 */
export async function getAllUsersWithStats(): Promise<UserWithStats[]> {
  try {
    // First, try to use the admin function if it exists (bypasses RLS)
    let profiles: UserProfile[] | null = null;
    
    try {
      const { data: adminProfiles, error: adminError } = await (supabase.rpc as any)('admin_get_all_profiles');
      
      if (adminError) {
        console.error('Admin function error:', adminError);
        // Don't throw - fall through to direct query
      } else if (adminProfiles && Array.isArray(adminProfiles) && adminProfiles.length > 0) {
        console.log('Admin function returned profiles:', adminProfiles.length);
        profiles = adminProfiles as UserProfile[];
      } else if (adminProfiles && Array.isArray(adminProfiles)) {
        console.warn('Admin function returned empty array');
        profiles = [];
      } else {
        console.warn('Admin function returned no data or invalid format:', adminProfiles);
      }
    } catch (rpcErr: any) {
      // Admin function doesn't exist yet or failed, fall back to direct query
      console.warn('Admin function not available or failed:', rpcErr?.message || rpcErr);
      console.log('Falling back to direct query (may be limited by RLS)');
    }

    // Fallback: Direct query (limited by RLS - only shows own profile and team members)
    if (!profiles || profiles.length === 0) {
      console.log('No profiles from admin function, trying direct query...');
      const { data: directProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Direct query error:', profilesError);
        throw profilesError;
      }
      profiles = (directProfiles || []) as UserProfile[];
      console.log('Direct query returned profiles:', profiles.length);
    }

    if (!profiles || profiles.length === 0) {
      console.warn('No profiles found at all');
      return [];
    }

    console.log('Processing', profiles.length, 'profiles');

    // For each user, fetch their completions and calculate stats
    const usersWithStats: UserWithStats[] = await Promise.all(
      profiles.map(async (profile) => {
        // Try to use admin function to get all completions at once (bypasses RLS)
        let walks: WalkCompletion[] = [];
        let phases: PhaseUnlock[] = [];
        let trails: TrailCompletion[] = [];
        let books: BookCompletion[] = [];
        let hikes: MagnoliasHikeCompletion[] = [];

        try {
          const { data: completionsData, error: completionsError } = await (supabase.rpc as any)('admin_get_user_completions', {
            user_id_param: profile.id,
          });
          if (!completionsError && completionsData) {
            walks = (completionsData.walk_completions || []) as WalkCompletion[];
            phases = (completionsData.phase_unlocks || []) as PhaseUnlock[];
            trails = (completionsData.trail_completions || []) as TrailCompletion[];
            books = (completionsData.book_completions || []) as BookCompletion[];
            hikes = (completionsData.magnolias_hikes_completions || []) as MagnoliasHikeCompletion[];
          }
        } catch (rpcErr) {
          // Admin function doesn't exist, fall back to direct queries (may be limited by RLS)
          const [walkCompletions, phaseUnlocks, trailCompletions, bookCompletions, magnoliasHikeCompletions] = await Promise.all([
            supabase.from('walk_completions').select('*').eq('user_id', profile.id),
            supabase.from('phase_unlocks').select('*').eq('user_id', profile.id),
            supabase.from('trail_completions').select('*').eq('user_id', profile.id),
            supabase.from('book_completions').select('*').eq('user_id', profile.id),
            supabase.from('magnolias_hikes_completions').select('*').eq('user_id', profile.id),
          ]);

          walks = (walkCompletions.data || []) as WalkCompletion[];
          phases = (phaseUnlocks.data || []) as PhaseUnlock[];
          trails = (trailCompletions.data || []) as TrailCompletion[];
          books = (bookCompletions.data || []) as BookCompletion[];
          hikes = (magnoliasHikeCompletions.data || []) as MagnoliasHikeCompletion[];
        }

        // Calculate total points
        const totalPoints = calculateTotalScore(walks, phases, trails, books, hikes);

        // Calculate total km (sum of distance_km from walk_completions)
        const totalKm = walks.reduce((sum, walk) => sum + Number(walk.distance_km), 0);

        // Get email from auth.users
        // Note: Direct querying of auth.users from client is not possible
        // We need a database function or view that joins profiles with auth.users
        // For now, we'll use a database function if available, otherwise show placeholder
        let email = 'N/A';
        try {
          // Try to use a database function to get email
          // This function should be created in Supabase:
          // CREATE OR REPLACE FUNCTION get_user_email(user_id UUID) RETURNS TEXT AS $$
          //   SELECT email FROM auth.users WHERE id = user_id;
          // $$ LANGUAGE sql SECURITY DEFINER;
          const { data: emailData, error: emailError } = await (supabase.rpc as any)('get_user_email', {
            user_id: profile.id,
          });
          if (!emailError && emailData) {
            email = emailData;
          }
        } catch {
          // Function doesn't exist yet - will show N/A until database function is created
          email = 'N/A';
        }

        return {
          ...profile,
          email,
          totalPoints,
          totalKm: Math.round(totalKm * 10) / 10, // Round to 1 decimal
        };
      })
    );

    return usersWithStats;
  } catch (error: any) {
    console.error('Error fetching users with stats:', error);
    throw new Error(error.message || 'Failed to fetch users with stats');
  }
}

/**
 * Get all teams with their stats (members, total points, total km)
 */
export async function getAllTeamsWithStats(): Promise<TeamWithAdminStats[]> {
  try {
    // Fetch all teams
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*')
      .order('created_at', { ascending: false });

    if (teamsError) throw teamsError;
    if (!teams) return [];

    // Try to get all team members at once using admin function (bypasses RLS)
    let allTeamMembers: TeamMember[] = [];
    try {
      const { data: adminMembers, error: adminMembersError } = await (supabase.rpc as any)('admin_get_all_team_members');
      
      if (!adminMembersError && adminMembers && Array.isArray(adminMembers)) {
        allTeamMembers = adminMembers as TeamMember[];
      }
    } catch (rpcErr: any) {
      console.warn('Admin team members function not available, using direct queries (may be limited by RLS)');
    }

    // For each team, fetch members and calculate stats
    const teamsWithStats: TeamWithAdminStats[] = await Promise.all(
      (teams as Team[]).map(async (team) => {
        // Use admin function results if available, otherwise fetch directly
        let members: TeamMember[] = [];
        if (allTeamMembers.length > 0) {
          // Filter members for this team from admin function results
          members = allTeamMembers.filter(m => m.team_id === team.id);
        } else {
          // Fallback: Fetch team members directly (limited by RLS)
          const { data: teamMembers, error: membersError } = await supabase
            .from('team_members')
            .select('*')
            .eq('team_id', team.id)
            .order('joined_at', { ascending: true });

          if (membersError) throw membersError;
          members = (teamMembers || []) as TeamMember[];
        }
        
        const memberIds = members.map(m => m.user_id);

        // Fetch profiles for members
        // Try to use admin function to get all profiles (bypasses RLS)
        let memberProfiles: UserProfile[] = [];
        if (memberIds.length > 0) {
          try {
            const { data: allProfiles, error: allProfilesError } = await (supabase.rpc as any)('admin_get_all_profiles');
            
            if (!allProfilesError && allProfiles && Array.isArray(allProfiles)) {
              // Filter to only profiles for team members
              memberProfiles = (allProfiles as UserProfile[]).filter(p => memberIds.includes(p.id));
            }
          } catch (rpcErr: any) {
            console.warn('Admin profiles function not available, using direct query (may be limited by RLS)');
          }
          
          // Fallback: Direct query (limited by RLS - only shows profiles of team members you're in a team with)
          if (memberProfiles.length === 0) {
            const { data: profiles, error: profilesError } = await supabase
              .from('profiles')
              .select('*')
              .in('id', memberIds);

            if (profilesError) throw profilesError;
            if (profiles) {
              memberProfiles.push(...(profiles as UserProfile[]));
            }
          }
        }

        // Create members with profiles
        const membersWithProfiles = members.map(member => ({
          ...member,
          profile: memberProfiles.find(p => p.id === member.user_id),
        }));

        // Calculate team totals
        let totalPoints = 0;
        let totalKm = 0;

        if (memberIds.length > 0) {
          // Fetch all completions for all team members
          const [walkCompletions, phaseUnlocks, trailCompletions, bookCompletions, magnoliasHikeCompletions] = await Promise.all([
            supabase.from('walk_completions').select('*').in('user_id', memberIds),
            supabase.from('phase_unlocks').select('*').in('user_id', memberIds),
            supabase.from('trail_completions').select('*').in('user_id', memberIds),
            supabase.from('book_completions').select('*').in('user_id', memberIds),
            supabase.from('magnolias_hikes_completions').select('*').in('user_id', memberIds),
          ]);

          const walks = (walkCompletions.data || []) as WalkCompletion[];
          const phases = (phaseUnlocks.data || []) as PhaseUnlock[];
          const trails = (trailCompletions.data || []) as TrailCompletion[];
          const books = (bookCompletions.data || []) as BookCompletion[];
          const hikes = (magnoliasHikeCompletions.data || []) as MagnoliasHikeCompletion[];

          // Calculate total points for all members
          totalPoints = calculateTotalScore(walks, phases, trails, books, hikes);

          // Calculate total km
          totalKm = walks.reduce((sum, walk) => sum + Number(walk.distance_km), 0);
        }

        return {
          ...team,
          members: membersWithProfiles,
          member_count: members.length,
          totalPoints,
          totalKm: Math.round(totalKm * 10) / 10, // Round to 1 decimal
        };
      })
    );

    return teamsWithStats;
  } catch (error: any) {
    console.error('Error fetching teams with stats:', error);
    throw new Error(error.message || 'Failed to fetch teams with stats');
  }
}

/**
 * Add a user to a team
 * @param userId - The user ID to add
 * @param teamId - The team ID to add the user to
 */
export async function addUserToTeam(userId: string, teamId: string): Promise<void> {
  try {
    // Check if team exists and has space
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('max_members')
      .eq('id', teamId)
      .single();

    if (teamError) throw teamError;
    if (!team) throw new Error('Team not found');

    const teamData = team as { max_members: number };

    // Check current member count
    const { data: members, error: membersError } = await supabase
      .from('team_members')
      .select('id')
      .eq('team_id', teamId);

    if (membersError) throw membersError;

    if ((members?.length || 0) >= teamData.max_members) {
      throw new Error('Team is full');
    }

    // Check if user is already in the team
    const { data: existingMember } = await supabase
      .from('team_members')
      .select('id')
      .eq('team_id', teamId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existingMember) {
      throw new Error('User is already in this team');
    }

    // Add user to team
    const { error: insertError } = await supabase
      .from('team_members')
      .insert({
        team_id: teamId,
        user_id: userId,
        role: 'member',
      } as any);

    if (insertError) throw insertError;
  } catch (error: any) {
    console.error('Error adding user to team:', error);
    throw new Error(error.message || 'Failed to add user to team');
  }
}

/**
 * Remove a user from a team
 * @param userId - The user ID to remove
 * @param teamId - The team ID to remove the user from
 */
export async function removeUserFromTeam(userId: string, teamId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamId)
      .eq('user_id', userId);

    if (error) throw error;
  } catch (error: any) {
    console.error('Error removing user from team:', error);
    throw new Error(error.message || 'Failed to remove user from team');
  }
}

/**
 * Delete a team (admin only)
 * @param teamId - The team ID to delete
 */
export async function deleteTeam(teamId: string): Promise<void> {
  try {
    // First, try to use the admin function if it exists
    try {
      const { error: rpcError } = await (supabase.rpc as any)('admin_delete_team', {
        team_id_param: teamId,
      });

      if (!rpcError) {
        return; // Successfully deleted using admin function
      }
    } catch (rpcErr) {
      // Admin function doesn't exist or failed, fall back to direct delete
      // This will only work if the user is the team creator (due to RLS)
      console.log('Admin function not available, trying direct delete');
    }

    // Fallback: Direct delete (only works if user is team creator)
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', teamId);

    if (error) throw error;
  } catch (error: any) {
    console.error('Error deleting team:', error);
    throw new Error(error.message || 'Failed to delete team');
  }
}
