/**
 * Team matching service for finding nearby users and managing teams
 */

import { supabase } from './supabase';
import type { Database } from './database.types';
import type { NearbyUser, Team, TeamMember, TeamWithMembers, TeamInvitation, TeamInvitationWithDetails, TeamJoinRequest, TeamJoinRequestWithDetails, UserProfile } from '../types';

/**
 * Find users within a specified radius (in miles) from a given location
 * @param userId - The current user's ID (to exclude from results)
 * @param latitude - User's latitude
 * @param longitude - User's longitude
 * @param radiusMiles - Radius in miles (default: 10)
 * @returns Array of nearby users with distances
 */
export async function findNearbyUsers(
  userId: string,
  latitude: number,
  longitude: number,
  radiusMiles: number = 10
): Promise<NearbyUser[]> {
  try {
    // Call the database function we created
    const { data, error } = await (supabase.rpc as any)('find_users_within_radius', {
      user_lat: latitude,
      user_lng: longitude,
      radius_miles: radiusMiles,
    });

    if (error) throw error;

    const nearbyUsers = (data || [])
      .filter((user: any) => user.id !== userId) // Exclude current user
      .map((user: any) => ({
        id: user.id,
        name: user.name,
        location: user.location,
        address: null, // Addresses are private and not visible to other users
        latitude: user.latitude,
        longitude: user.longitude,
        avatar_url: null, // Not returned by function
        start_date: '', // Not returned by function
        created_at: '', // Not returned by function
        updated_at: '', // Not returned by function
        distance_miles: parseFloat(user.distance_miles.toFixed(2)),
        team_id: undefined,
        team_name: undefined,
        is_team_leader: undefined,
        team_max_members: undefined,
      }));

    // Get team information for nearby users
    const nearbyUserIds = nearbyUsers.map((u: NearbyUser) => u.id);
    
    if (nearbyUserIds.length === 0) {
      return nearbyUsers;
    }

    // Get team memberships for nearby users using SECURITY DEFINER function to bypass RLS
    const { data: teamMembersData, error: teamMembersError } = await (supabase.rpc as any)(
      'get_user_team_memberships',
      { user_ids: nearbyUserIds }
    );

    if (teamMembersError) {
      console.error('Error fetching team members:', teamMembersError);
      // Fall back to direct query if function doesn't exist yet
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('team_members')
        .select('team_id, user_id, role')
        .in('user_id', nearbyUserIds);
      
      if (fallbackError || !fallbackData) {
        // Continue without team info if there's an error
        return nearbyUsers;
      }
      
      // Use fallback data
      const teamMemberMap = new Map<string, { team_id: string; role: string }>();
      (fallbackData || []).forEach((tm: any) => {
        teamMemberMap.set(tm.user_id, { team_id: tm.team_id, role: tm.role });
      });

      const teamIds = [...new Set((fallbackData || []).map((tm: any) => tm.team_id))];

      if (teamIds.length === 0) {
        return nearbyUsers;
      }

      // Get team details
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('id, name, max_members')
        .in('id', teamIds);

      if (teamsError) {
        console.error('Error fetching teams:', teamsError);
        return nearbyUsers;
      }

      const teamMap = new Map<string, { name: string | null; max_members: number }>();
      (teamsData || []).forEach((team: any) => {
        teamMap.set(team.id, { name: team.name, max_members: team.max_members });
      });

      // Add team information to nearby users
      return nearbyUsers.map((user: NearbyUser) => {
        const teamMember = teamMemberMap.get(user.id);
        if (teamMember) {
          const team = teamMap.get(teamMember.team_id);
          if (team) {
            return {
              ...user,
              team_id: teamMember.team_id,
              team_name: team.name || undefined,
              is_team_leader: teamMember.role === 'leader',
              team_max_members: team.max_members,
            };
          }
        }
        return user;
      });
    }

    const teamMemberMap = new Map<string, { team_id: string; role: string }>();
    (teamMembersData || []).forEach((tm: any) => {
      teamMemberMap.set(tm.user_id, { team_id: tm.team_id, role: tm.role });
    });

    const teamIds = [...new Set((teamMembersData || []).map((tm: any) => tm.team_id))];

    if (teamIds.length === 0) {
      return nearbyUsers;
    }

    // Get team details
    const { data: teamsData, error: teamsError } = await supabase
      .from('teams')
      .select('id, name, max_members')
      .in('id', teamIds);

    if (teamsError) {
      console.error('Error fetching teams:', teamsError);
      // Continue without team info if there's an error
      return nearbyUsers;
    }

    const teamMap = new Map<string, { name: string | null; max_members: number }>();
    (teamsData || []).forEach((team: any) => {
      teamMap.set(team.id, { name: team.name, max_members: team.max_members });
    });

    // Add team information to nearby users
    return nearbyUsers.map((user: NearbyUser) => {
      const teamMember = teamMemberMap.get(user.id);
      if (teamMember) {
        const team = teamMap.get(teamMember.team_id);
        if (team) {
          return {
            ...user,
            team_id: teamMember.team_id,
            team_name: team.name || undefined,
            is_team_leader: teamMember.role === 'leader',
            team_max_members: team.max_members,
          };
        }
      }
      return user;
    });
  } catch (error: any) {
    console.error('Error finding nearby users:', error);
    throw new Error(error.message || 'Failed to find nearby users');
  }
}

/**
 * Get teams that the user can join (have open spots and are nearby)
 * @param userId - The current user's ID
 * @param latitude - User's latitude
 * @param longitude - User's longitude
 * @param radiusMiles - Radius in miles (default: 10)
 * @returns Array of teams with member information
 */
export async function findAvailableTeams(
  userId: string,
  latitude: number,
  longitude: number,
  radiusMiles: number = 10
): Promise<TeamWithMembers[]> {
  try {
    // First, find nearby users who are in teams
    const nearbyUsers = await findNearbyUsers(userId, latitude, longitude, radiusMiles);
    const nearbyUserIds = nearbyUsers.map(u => u.id);

    if (nearbyUserIds.length === 0) {
      return [];
    }

    // Get teams that have members in the nearby users list
    const { data: teamMembersData, error: teamMembersError } = await supabase
      .from('team_members')
      .select('team_id, user_id')
      .in('user_id', nearbyUserIds);

    if (teamMembersError) throw teamMembersError;

    const teamIds = [...new Set((teamMembersData || []).map((tm: { team_id: string; user_id: string }) => tm.team_id))];

    if (teamIds.length === 0) {
      return [];
    }

    // Get team details and check if they have open spots
    const { data: teamsData, error: teamsError } = await supabase
      .from('teams')
      .select('*')
      .in('id', teamIds);

    if (teamsError) throw teamsError;

    // Get all team members for these teams (without profiles expansion to avoid PostgREST issues)
    const { data: allTeamMembers, error: allMembersError } = await supabase
      .from('team_members')
      .select('*')
      .in('team_id', teamIds);

    if (allMembersError) throw allMembersError;

    // Get profiles separately to avoid PostgREST foreign key expansion issues (excluding address for privacy)
    const userIds = [...new Set((allTeamMembers || []).map((tm: TeamMember) => tm.user_id))];
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name, location, latitude, longitude, avatar_url, phone_number, start_date, created_at, updated_at, user_plan')
      .in('id', userIds);

    if (profilesError) throw profilesError;

    // Create a map for quick profile lookup
    const profilesMap = new Map(((profilesData || []) as UserProfile[]).map(p => [p.id, p]));

    // Filter teams that have open spots and user is not already a member
    const availableTeams: TeamWithMembers[] = [];

    for (const team of (teamsData || []) as Team[]) {
      const members = ((allTeamMembers || []) as TeamMember[])
        .filter(tm => tm.team_id === team.id)
        .map(tm => ({
          ...tm,
          profile: profilesMap.get(tm.user_id) as UserProfile | undefined,
        })) as (TeamMember & { profile?: UserProfile })[];

      const memberCount = members.length;
      const isUserMember = members.some(m => m.user_id === userId);

      // Check if team has open spots (or no limit) and user is not already a member
      const hasSpace = team.max_members == null || memberCount < team.max_members;
      if (hasSpace && !isUserMember) {
        // Check if at least one member is in the nearby users list
        const hasNearbyMember = members.some(m => nearbyUserIds.includes(m.user_id));

        if (hasNearbyMember) {
          availableTeams.push({
            ...team,
            members,
            member_count: memberCount,
          });
        }
      }
    }

    return availableTeams;
  } catch (error: any) {
    console.error('Error finding available teams:', error);
    throw new Error(error.message || 'Failed to find available teams');
  }
}

/**
 * Get all teams that a user is currently in
 * @param userId - The user's ID
 * @returns Array of teams with members
 */
export async function getUserTeams(userId: string): Promise<TeamWithMembers[]> {
  try {
    // Get all team memberships for the user
    const { data: teamMembers, error: memberError } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', userId);

    if (memberError) throw memberError;
    if (!teamMembers || teamMembers.length === 0) return [];

    const teamIds = teamMembers.map(tm => (tm as { team_id: string }).team_id);

    // Get all team details
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*')
      .in('id', teamIds);

    if (teamsError) throw teamsError;
    if (!teams || teams.length === 0) return [];

    // Get all team members for all teams
    const { data: allMembers, error: allMembersError } = await supabase
      .from('team_members')
      .select('*')
      .in('team_id', teamIds);

    if (allMembersError) throw allMembersError;

    // Get all profiles for all members (excluding address for privacy)
    const memberUserIds = [...new Set(((allMembers || []) as TeamMember[]).map(m => m.user_id))];
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name, location, latitude, longitude, avatar_url, phone_number, start_date, created_at, updated_at, user_plan')
      .in('id', memberUserIds);

    if (profilesError) throw profilesError;

    // Get emails for all team members (fetch for each team)
    const emailsByTeamId = new Map<string, Map<string, string>>();
    await Promise.all(
      ((teams || []) as Team[]).map(async (team) => {
        try {
          const { data: emailsData, error: emailsError } = await (supabase.rpc as any)(
            'get_team_member_emails',
            { team_id_param: team.id }
          );
          
          if (!emailsError && emailsData) {
            const emailMap = new Map<string, string>();
            (emailsData || []).forEach((item: { user_id: string; email: string }) => {
              emailMap.set(item.user_id, item.email);
            });
            emailsByTeamId.set(team.id, emailMap);
          }
        } catch (err) {
          console.error(`Error fetching emails for team ${team.id}:`, err);
        }
      })
    );

    // Create maps for quick lookup
    const profilesMap = new Map(((profilesData || []) as UserProfile[]).map(p => [p.id, p]));
    const membersByTeamId = new Map<string, TeamMember[]>();
    
    ((allMembers || []) as TeamMember[]).forEach(m => {
      const existing = membersByTeamId.get(m.team_id) || [];
      existing.push(m);
      membersByTeamId.set(m.team_id, existing);
    });

    // Build TeamWithMembers array
    return ((teams || []) as Team[]).map(team => {
      const members = membersByTeamId.get(team.id) || [];
      const teamEmailsMap = emailsByTeamId.get(team.id) || new Map<string, string>();
      
      return {
        ...team,
        members: members.map(m => {
          const profile = profilesMap.get(m.user_id) as UserProfile | undefined;
          const email = teamEmailsMap.get(m.user_id);
          
          return {
            ...m,
            profile: profile ? { ...profile, address: null, email: email || null } : undefined,
          };
        }) as (TeamMember & { profile?: UserProfile })[],
        member_count: members.length,
      };
    });
  } catch (error: any) {
    console.error('Error getting user teams:', error);
    throw new Error(error.message || 'Failed to get user teams');
  }
}

/**
 * Get the first team that a user is in (for backward compatibility)
 * @param userId - The user's ID
 * @returns First team with members, or null if user is not in any team
 */
export async function getUserTeam(userId: string): Promise<TeamWithMembers | null> {
  const teams = await getUserTeams(userId);
  return teams.length > 0 ? teams[0] : null;
}

/**
 * Get team members with profiles for a given team ID
 * @param teamId - The team ID
 * @returns Array of team members with profiles
 */
export async function getTeamMembersByTeamId(teamId: string): Promise<(TeamMember & { profile?: UserProfile })[]> {
  try {
    // Get all team members
    const { data: members, error: membersError } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', teamId);

    if (membersError) throw membersError;

    if (!members || members.length === 0) {
      return [];
    }

    // Get profiles separately (excluding address for privacy)
    const memberUserIds = ((members || []) as TeamMember[]).map(m => m.user_id);
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name, location, latitude, longitude, avatar_url, phone_number, start_date, created_at, updated_at, user_plan')
      .in('id', memberUserIds);

    if (profilesError) throw profilesError;

    // Get emails for team members using the database function
    const { data: emailsData, error: emailsError } = await (supabase.rpc as any)(
      'get_team_member_emails',
      { team_id_param: teamId }
    );

    // Create maps for quick lookup
    const profilesMap = new Map(((profilesData || []) as UserProfile[]).map(p => [p.id, p]));
    const emailsMap = new Map<string, string>();
    
    if (!emailsError && emailsData) {
      (emailsData || []).forEach((item: { user_id: string; email: string }) => {
        emailsMap.set(item.user_id, item.email);
      });
    }

    // Merge profiles with emails
    return (members || []).map(m => {
      const profile = profilesMap.get((m as TeamMember).user_id) as UserProfile | undefined;
      const email = emailsMap.get((m as TeamMember).user_id);
      
      return {
        ...(m as TeamMember),
        profile: profile ? { ...profile, address: null, email: email || null } : undefined,
      };
    }) as (TeamMember & { profile?: UserProfile })[];
  } catch (error: any) {
    console.error('Error getting team members:', error);
    throw new Error(error.message || 'Failed to get team members');
  }
}

/**
 * Create a new team
 * @param userId - The user creating the team
 * @param teamName - Optional team name
 * @param maxMembers - Maximum team members (null = no limit)
 * @param whatsappLink - Optional WhatsApp group link
 * @returns Created team
 */
export async function createTeam(
  userId: string,
  teamName?: string,
  maxMembers: number | null = null,
  whatsappLink?: string
): Promise<TeamWithMembers> {
  try {
    // Create the team
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .insert({
        created_by: userId,
        name: teamName || null,
        max_members: maxMembers,
        whatsapp_link: whatsappLink?.trim() || null,
      } as any)
      .select()
      .single();

    if (teamError) throw teamError;

    // Add creator as team leader (without profiles expansion to avoid PostgREST issues)
    const { data: member, error: memberError } = await supabase
      .from('team_members')
      .insert({
        team_id: (team as Team).id,
        user_id: userId,
        role: 'leader',
      } as any)
      .select('*')
      .single();

    if (memberError) throw memberError;

    // Get user profile separately
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    // Get email for the creator
    const { data: emailsData } = await (supabase.rpc as any)(
      'get_team_member_emails',
      { team_id_param: (team as Team).id }
    );
    
    const email = emailsData && emailsData.length > 0 
      ? emailsData.find((item: { user_id: string }) => item.user_id === userId)?.email 
      : null;

    return {
      ...(team as Team),
      members: [
        {
          ...(member as TeamMember),
          profile: profile ? { ...(profile as UserProfile), address: null, email: email || null } : undefined,
        },
      ] as (TeamMember & { profile?: UserProfile })[],
      member_count: 1,
    };
  } catch (error: any) {
    console.error('Error creating team:', error);
    throw new Error(error.message || 'Failed to create team');
  }
}

/**
 * Update team name (only team leaders can do this)
 * @param userId - The user updating the team (must be a team leader)
 * @param teamId - The team ID to update
 * @param newName - The new team name (can be empty string to remove name)
 * @returns Updated team with members
 */
export async function updateTeamName(
  userId: string,
  teamId: string,
  newName: string
): Promise<TeamWithMembers> {
  try {
    // First verify the user is a team leader
    const { data: memberCheck, error: memberCheckError } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', userId)
      .single();

    if (memberCheckError || !memberCheck) {
      throw new Error('No tienes permiso para editar este equipo');
    }

    if ((memberCheck as { role: string }).role !== 'leader') {
      throw new Error('Solo los líderes del equipo pueden editar el nombre');
    }

    // Update the team name
    const updateData: Database['public']['Tables']['teams']['Update'] = {
      name: newName.trim() || null,
      updated_at: new Date().toISOString(),
    };
    
    const { data: team, error: teamError } = await (supabase
      .from('teams') as any)
      .update(updateData)
      .eq('id', teamId)
      .select()
      .single();

    if (teamError) throw teamError;

    // Get all team members
    const { data: allMembers, error: allMembersError } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', teamId);

    if (allMembersError) throw allMembersError;

    // Get profiles separately
    const memberUserIds = ((allMembers || []) as TeamMember[]).map(m => m.user_id);
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', memberUserIds);

    if (profilesError) throw profilesError;

    // Get emails for team members using the database function
    const { data: emailsData, error: emailsError } = await (supabase.rpc as any)(
      'get_team_member_emails',
      { team_id_param: teamId }
    );

    // Create maps for quick lookup
    const profilesMap = new Map(((profilesData || []) as UserProfile[]).map(p => [p.id, p]));
    const emailsMap = new Map<string, string>();
    
    if (!emailsError && emailsData) {
      (emailsData || []).forEach((item: { user_id: string; email: string }) => {
        emailsMap.set(item.user_id, item.email);
      });
    }

    return {
      ...(team as Team),
      members: ((allMembers || []) as TeamMember[]).map(m => {
        const profile = profilesMap.get(m.user_id) as UserProfile | undefined;
        const email = emailsMap.get(m.user_id);
        
        return {
          ...m,
          profile: profile ? { ...profile, address: null, email: email || null } : undefined,
        };
      }) as (TeamMember & { profile?: UserProfile })[],
      member_count: (allMembers || []).length,
    };
  } catch (error: any) {
    console.error('Error updating team name:', error);
    throw new Error(error.message || 'Failed to update team name');
  }
}

/**
 * Update team WhatsApp link (only team leaders can do this)
 * @param userId - The user updating the team (must be a team leader)
 * @param teamId - The team ID to update
 * @param whatsappLink - The new WhatsApp link (can be empty string to remove link)
 * @returns Updated team with members
 */
export async function updateTeamWhatsAppLink(
  userId: string,
  teamId: string,
  whatsappLink: string
): Promise<TeamWithMembers> {
  try {
    // First verify the user is a team leader
    const { data: memberCheck, error: memberCheckError } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', userId)
      .single();

    if (memberCheckError || !memberCheck) {
      throw new Error('No tienes permiso para editar este equipo');
    }

    if ((memberCheck as { role: string }).role !== 'leader') {
      throw new Error('Solo los líderes del equipo pueden editar el enlace de WhatsApp');
    }

    // Update the WhatsApp link
    const updateData = {
      whatsapp_link: whatsappLink.trim() || null,
      updated_at: new Date().toISOString(),
    } as never;
    
    const { data: team, error: teamError } = await (supabase
      .from('teams') as any)
      .update(updateData)
      .eq('id', teamId)
      .select()
      .single();

    if (teamError) throw teamError;

    // Get all team members
    const { data: allMembers, error: allMembersError } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', teamId);

    if (allMembersError) throw allMembersError;

    // Get all profiles for team members
    const memberUserIds = ((allMembers || []) as TeamMember[]).map(m => m.user_id);
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name, location, latitude, longitude, avatar_url, phone_number, start_date, created_at, updated_at, user_plan')
      .in('id', memberUserIds);

    if (profilesError) throw profilesError;

    const profilesMap = new Map<string, UserProfile>();
    (profiles || []).forEach((p: UserProfile) => {
      profilesMap.set(p.id, { ...p, address: null });
    });

    // Get emails for team members
    const { data: emailsData, error: emailsError } = await (supabase.rpc as any)(
      'get_team_member_emails',
      { team_id_param: teamId }
    );

    const emailsMap = new Map<string, string>();
    if (!emailsError && emailsData) {
      (emailsData || []).forEach((item: { user_id: string; email: string }) => {
        emailsMap.set(item.user_id, item.email);
      });
    }

    return {
      ...(team as Team),
      members: ((allMembers || []) as TeamMember[]).map(m => {
        const profile = profilesMap.get(m.user_id) as UserProfile | undefined;
        const email = emailsMap.get(m.user_id);
        
        return {
          ...m,
          profile: profile ? { ...profile, address: null, email: email || null } : undefined,
        };
      }) as (TeamMember & { profile?: UserProfile })[],
      member_count: (allMembers || []).length,
    };
  } catch (error: any) {
    console.error('Error updating team WhatsApp link:', error);
    throw new Error(error.message || 'Failed to update team WhatsApp link');
  }
}

/**
 * Join a team
 * @param userId - The user joining the team
 * @param teamId - The team ID to join
 * @returns Updated team with members
 */
export async function joinTeam(userId: string, teamId: string): Promise<TeamWithMembers> {
  try {
    // Check if team has open spots
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('*')
      .eq('id', teamId)
      .single();

    if (teamError) throw teamError;

    // Get current member count
    const { data: members, error: membersError } = await supabase
      .from('team_members')
      .select('id')
      .eq('team_id', teamId);

    if (membersError) throw membersError;

    const maxMembers = (team as Team).max_members;
    if (maxMembers != null && (members || []).length >= maxMembers) {
      throw new Error('Team is full');
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('team_members')
      .select('id')
      .eq('team_id', teamId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existingMember) {
      throw new Error('You are already a member of this team');
    }

    // Add user to team
    const { error: joinError } = await supabase
      .from('team_members')
      .insert({
        team_id: teamId,
        user_id: userId,
        role: 'member',
      } as any);

    if (joinError) throw joinError;

    // Get updated team with all members using the teamId we already have
    const { data: allMembers, error: allMembersError } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', teamId);

    if (allMembersError) throw allMembersError;

    // Get profiles separately (excluding address for privacy)
    const memberUserIds = ((allMembers || []) as TeamMember[]).map(m => m.user_id);
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name, location, latitude, longitude, avatar_url, phone_number, start_date, created_at, updated_at, user_plan')
      .in('id', memberUserIds);

    if (profilesError) throw profilesError;

    // Get emails for team members using the database function
    const { data: emailsData, error: emailsError } = await (supabase.rpc as any)(
      'get_team_member_emails',
      { team_id_param: teamId }
    );

    // Create maps for quick lookup
    const profilesMap = new Map(((profilesData || []) as UserProfile[]).map(p => [p.id, p]));
    const emailsMap = new Map<string, string>();
    
    if (!emailsError && emailsData) {
      (emailsData || []).forEach((item: { user_id: string; email: string }) => {
        emailsMap.set(item.user_id, item.email);
      });
    }

    return {
      ...(team as Team),
      members: ((allMembers || []) as TeamMember[]).map(m => {
        const profile = profilesMap.get(m.user_id) as UserProfile | undefined;
        const email = emailsMap.get(m.user_id);
        
        return {
          ...m,
          profile: profile ? { ...profile, address: null, email: email || null } : undefined,
        };
      }) as (TeamMember & { profile?: UserProfile })[],
      member_count: (allMembers || []).length,
    };
  } catch (error: any) {
    console.error('Error joining team:', error);
    throw new Error(error.message || 'Failed to join team');
  }
}

/**
 * Leave a team
 * @param userId - The user leaving the team
 * @param teamId - The team ID to leave
 */
export async function leaveTeam(userId: string, teamId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamId)
      .eq('user_id', userId);

    if (error) throw error;

    // If team has no members left, delete the team
    const { data: remainingMembers } = await supabase
      .from('team_members')
      .select('id')
      .eq('team_id', teamId);

    if (!remainingMembers || remainingMembers.length === 0) {
      await supabase.from('teams').delete().eq('id', teamId);
    }
  } catch (error: any) {
    console.error('Error leaving team:', error);
    throw new Error(error.message || 'Failed to leave team');
  }
}

/**
 * Delete a team (only if user is the creator)
 * @param userId - The user attempting to delete
 * @param teamId - The team ID to delete
 */
export async function deleteTeam(userId: string, teamId: string): Promise<void> {
  try {
    // Verify user is the creator
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('created_by')
      .eq('id', teamId)
      .single();

    if (teamError) throw teamError;
    if ((team as { created_by: string }).created_by !== userId) {
      throw new Error('Only the team creator can delete the team');
    }

    // Delete team (cascade will delete team_members)
    const { error: deleteError } = await supabase
      .from('teams')
      .delete()
      .eq('id', teamId);

    if (deleteError) throw deleteError;
  } catch (error: any) {
    console.error('Error deleting team:', error);
    throw new Error(error.message || 'Failed to delete team');
  }
}

/**
 * Send a team invitation (create notification)
 * @param inviterId - The user sending the invitation
 * @param teamId - The team ID
 * @param invitedUserId - The user being invited
 * @returns Created invitation
 */
export async function sendTeamInvitation(
  inviterId: string,
  teamId: string,
  invitedUserId: string
): Promise<TeamInvitation> {
  try {
    // Check if inviter is a member of the team
    const { data: inviterMember, error: memberError } = await supabase
      .from('team_members')
      .select('id')
      .eq('team_id', teamId)
      .eq('user_id', inviterId)
      .maybeSingle();

    if (memberError) throw memberError;
    if (!inviterMember) {
      throw new Error('You must be a member of the team to send invitations');
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('team_members')
      .select('id')
      .eq('team_id', teamId)
      .eq('user_id', invitedUserId)
      .maybeSingle();

    if (existingMember) {
      throw new Error('User is already a member of this team');
    }

    // Check if there's already a pending invitation
    const { data: existingInvitation } = await supabase
      .from('team_invitations')
      .select('id')
      .eq('team_id', teamId)
      .eq('invited_user_id', invitedUserId)
      .eq('status', 'pending')
      .maybeSingle();

    if (existingInvitation) {
      throw new Error('An invitation has already been sent to this user');
    }

    // Check if team has open spots
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('*')
      .eq('id', teamId)
      .single();

    if (teamError) throw teamError;

    const { data: members } = await supabase
      .from('team_members')
      .select('id')
      .eq('team_id', teamId);

    const maxMembers = (team as Team).max_members;
    if (maxMembers != null && (members || []).length >= maxMembers) {
      throw new Error('Team is full');
    }

    // Create invitation
    const { data: invitation, error: inviteError } = await supabase
      .from('team_invitations')
      .insert({
        team_id: teamId,
        invited_by: inviterId,
        invited_user_id: invitedUserId,
        status: 'pending',
      } as any)
      .select()
      .single();

    if (inviteError) throw inviteError;

    return invitation as TeamInvitation;
  } catch (error: any) {
    console.error('Error sending team invitation:', error);
    throw new Error(error.message || 'Failed to send invitation');
  }
}

/**
 * Get pending invitations for a user
 * @param userId - The user's ID
 * @returns Array of invitations with team and inviter details
 */
export async function getUserInvitations(userId: string): Promise<TeamInvitationWithDetails[]> {
  try {
    const { data: invitations, error: invitationsError } = await supabase
      .from('team_invitations')
      .select('*')
      .eq('invited_user_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (invitationsError) throw invitationsError;

    const typedInvitations = (invitations || []) as TeamInvitation[];

    if (typedInvitations.length === 0) {
      return [];
    }

    // Get team details
    const teamIds = [...new Set(typedInvitations.map(inv => inv.team_id))];
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*')
      .in('id', teamIds);

    if (teamsError) throw teamsError;

    // Get inviter profiles (excluding address for privacy)
    const inviterIds = [...new Set(typedInvitations.map(inv => inv.invited_by))];
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name, location, latitude, longitude, avatar_url, phone_number, start_date, created_at, updated_at, user_plan')
      .in('id', inviterIds);

    if (profilesError) throw profilesError;

    const teamsMap = new Map(((teams || []) as Team[]).map(t => [t.id, t]));
    const profilesMap = new Map(((profiles || []) as UserProfile[]).map(p => [p.id, { ...p, address: null }]));

    return typedInvitations.map(inv => ({
      ...inv,
      team: teamsMap.get(inv.team_id) as Team | undefined,
      inviter: profilesMap.get(inv.invited_by) ? { ...profilesMap.get(inv.invited_by)!, address: null } as UserProfile : undefined,
    })) as TeamInvitationWithDetails[];
  } catch (error: any) {
    console.error('Error getting user invitations:', error);
    throw new Error(error.message || 'Failed to get invitations');
  }
}

/**
 * Accept a team invitation
 * @param userId - The user accepting the invitation
 * @param invitationId - The invitation ID
 * @returns Updated team with members
 */
export async function acceptInvitation(userId: string, invitationId: string): Promise<TeamWithMembers> {
  try {
    // Get invitation
    const { data: invitation, error: inviteError } = await supabase
      .from('team_invitations')
      .select('*')
      .eq('id', invitationId)
      .eq('invited_user_id', userId)
      .eq('status', 'pending')
      .single();

    if (inviteError) throw inviteError;
    if (!invitation) {
      throw new Error('Invitation not found or already processed');
    }

    // Update invitation status
    const { error: updateError } = await ((supabase
      .from('team_invitations') as any)
      .update({ status: 'accepted', updated_at: new Date().toISOString() })
      .eq('id', invitationId));

    if (updateError) throw updateError;

    // Join the team
    return await joinTeam(userId, (invitation as TeamInvitation).team_id);
  } catch (error: any) {
    console.error('Error accepting invitation:', error);
    throw new Error(error.message || 'Failed to accept invitation');
  }
}

/**
 * Decline a team invitation
 * @param userId - The user declining the invitation
 * @param invitationId - The invitation ID
 */
export async function declineInvitation(userId: string, invitationId: string): Promise<void> {
  try {
    const { error } = await ((supabase
      .from('team_invitations') as any)
      .update({ status: 'declined', updated_at: new Date().toISOString() } as any)
      .eq('id', invitationId)
      .eq('invited_user_id', userId)
      .eq('status', 'pending'));

    if (error) throw error;
  } catch (error: any) {
    console.error('Error declining invitation:', error);
    throw new Error(error.message || 'Failed to decline invitation');
  }
}

/**
 * Get total distance walked by all team members
 * @param teamId - The team ID
 * @returns Total distance in km (rounded to 1 decimal), or 0 if error/no walks
 */
export async function getTeamTotalDistance(teamId: string): Promise<number> {
  try {
    // First, try to use the database function if it exists (optimized approach)
    try {
      const { data: dbResult, error: rpcError } = await (supabase.rpc as any)('get_team_total_distance', {
        team_id: teamId,
      });

      if (!rpcError && dbResult !== null && dbResult !== undefined) {
        return Math.round(Number(dbResult) * 10) / 10;
      }
    } catch (rpcErr) {
      // Database function doesn't exist or failed, fall back to direct query
      console.log('Database function not available, using direct query');
    }

    // Fallback: Direct query approach
    // Get all team member IDs
    const { data: teamMembers, error: membersError } = await supabase
      .from('team_members')
      .select('user_id')
      .eq('team_id', teamId);

    if (membersError) throw membersError;

    const typedTeamMembers = (teamMembers || []) as { user_id: string }[];

    if (typedTeamMembers.length === 0) {
      return 0;
    }

    const memberIds = typedTeamMembers.map(m => m.user_id);

    // Get all walk completions for team members
    const { data: completions, error: completionsError } = await supabase
      .from('walk_completions')
      .select('distance_km')
      .in('user_id', memberIds);

    if (completionsError) throw completionsError;

    // Sum all distances
    const total = ((completions || []) as { distance_km: number }[]).reduce((sum, c) => sum + Number(c.distance_km), 0);

    // Round to 1 decimal place
    return Math.round(total * 10) / 10;
  } catch (error: any) {
    console.error('Error getting team total distance:', error);
    // Return 0 on any error (graceful degradation)
    return 0;
  }
}

/**
 * Create a join request to join a team
 * @param userId - The user requesting to join
 * @param teamId - The team ID to request joining
 * @returns Created join request
 */
export async function createJoinRequest(
  userId: string,
  teamId: string
): Promise<TeamJoinRequest> {
  try {
    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('team_members')
      .select('id')
      .eq('team_id', teamId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existingMember) {
      throw new Error('Ya eres miembro de este equipo');
    }

    // Check if there's already a pending request
    const { data: existingRequest } = await supabase
      .from('team_join_requests')
      .select('id')
      .eq('team_id', teamId)
      .eq('requested_by', userId)
      .eq('status', 'pending')
      .maybeSingle();

    if (existingRequest) {
      throw new Error('Ya has enviado una solicitud a este equipo');
    }

    // Check if team has open spots
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('*')
      .eq('id', teamId)
      .single();

    if (teamError) throw teamError;

    const { data: members } = await supabase
      .from('team_members')
      .select('id')
      .eq('team_id', teamId);

    const maxMembers = (team as Team).max_members;
    if (maxMembers != null && (members || []).length >= maxMembers) {
      throw new Error('El equipo está lleno');
    }

    // Create join request
    const { data: request, error: requestError } = await supabase
      .from('team_join_requests')
      .insert({
        team_id: teamId,
        requested_by: userId,
        status: 'pending',
      } as any)
      .select()
      .single();

    if (requestError) throw requestError;

    return request as TeamJoinRequest;
  } catch (error: any) {
    console.error('Error creating join request:', error);
    throw new Error(error.message || 'Error al crear la solicitud de unión');
  }
}

/**
 * Get join requests for a team (team leaders only)
 * @param teamId - The team ID
 * @param leaderUserId - The team leader's user ID
 * @returns Array of join requests with requester details
 */
export async function getTeamJoinRequests(
  teamId: string,
  leaderUserId: string
): Promise<TeamJoinRequestWithDetails[]> {
  try {
    // Verify user is team leader
    const { data: leaderMember, error: memberError } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', leaderUserId)
      .eq('role', 'leader')
      .maybeSingle();

    if (memberError) throw memberError;
    if (!leaderMember) {
      throw new Error('Solo los líderes del equipo pueden ver las solicitudes');
    }

    // Get pending join requests
    const { data: requests, error: requestsError } = await supabase
      .from('team_join_requests')
      .select('*')
      .eq('team_id', teamId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (requestsError) throw requestsError;

    const typedRequests = (requests || []) as TeamJoinRequest[];

    if (typedRequests.length === 0) {
      return [];
    }

    // Get requester profiles (excluding address for privacy)
    const requesterIds = [...new Set(typedRequests.map(req => req.requested_by))];
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name, location, latitude, longitude, avatar_url, phone_number, start_date, created_at, updated_at, user_plan')
      .in('id', requesterIds);

    if (profilesError) throw profilesError;

    // Get team details
    const { data: team } = await supabase
      .from('teams')
      .select('*')
      .eq('id', teamId)
      .single();

    const profilesMap = new Map(((profiles || []) as UserProfile[]).map(p => [p.id, { ...p, address: null }]));

    return typedRequests.map(req => ({
      ...req,
      requester: profilesMap.get(req.requested_by) ? { ...profilesMap.get(req.requested_by)!, address: null } as UserProfile : undefined,
      team: team ? (team as Team) : undefined,
    })) as TeamJoinRequestWithDetails[];
  } catch (error: any) {
    console.error('Error getting team join requests:', error);
    throw new Error(error.message || 'Error al obtener las solicitudes de unión');
  }
}

/**
 * Accept a join request and add user to team
 * @param teamId - The team ID
 * @param requestId - The join request ID
 * @param leaderUserId - The team leader's user ID
 * @returns Updated team with members
 */
export async function acceptJoinRequest(
  teamId: string,
  requestId: string,
  leaderUserId: string
): Promise<TeamWithMembers> {
  try {
    // Verify user is team leader
    const { data: leaderMember, error: memberError } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', leaderUserId)
      .eq('role', 'leader')
      .maybeSingle();

    if (memberError) throw memberError;
    if (!leaderMember) {
      throw new Error('Solo los líderes del equipo pueden aceptar solicitudes');
    }

    // Get the join request
    const { data: request, error: requestError } = await supabase
      .from('team_join_requests')
      .select('*')
      .eq('id', requestId)
      .eq('team_id', teamId)
      .eq('status', 'pending')
      .single();

    if (requestError) throw requestError;
    if (!request) {
      throw new Error('Solicitud no encontrada o ya procesada');
    }

    const typedRequest = request as TeamJoinRequest;

    // Check if team still has space
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('*')
      .eq('id', teamId)
      .single();

    if (teamError) throw teamError;

    const { data: members } = await supabase
      .from('team_members')
      .select('id')
      .eq('team_id', teamId);

    const maxMembers = (team as Team).max_members;
    if (maxMembers != null && (members || []).length >= maxMembers) {
      // Update request status to declined since team is full
      await (supabase
        .from('team_join_requests')
        .update({ status: 'declined', updated_at: new Date().toISOString() } as never)
        .eq('id', requestId));
      throw new Error('El equipo está lleno');
    }

    // Update request status to accepted
    const { error: updateError } = await (supabase
      .from('team_join_requests')
      .update({ status: 'accepted', updated_at: new Date().toISOString() } as never)
      .eq('id', requestId));

    if (updateError) throw updateError;

    // Add user to team (reuse the team query we already have)
    const { error: joinError } = await supabase
      .from('team_members')
      .insert({
        team_id: teamId,
        user_id: typedRequest.requested_by,
        role: 'member',
      } as any);

    if (joinError) throw joinError;

    // Get updated team with all members using the teamId we already have
    // Get all team members
    const { data: allMembers, error: allMembersError } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', teamId);

    if (allMembersError) throw allMembersError;

    // Get profiles separately (excluding address for privacy)
    const memberUserIds = ((allMembers || []) as TeamMember[]).map(m => m.user_id);
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name, location, latitude, longitude, avatar_url, phone_number, start_date, created_at, updated_at, user_plan')
      .in('id', memberUserIds);

    if (profilesError) throw profilesError;

    // Get emails for team members using the database function
    const { data: emailsData, error: emailsError } = await (supabase.rpc as any)(
      'get_team_member_emails',
      { team_id_param: teamId }
    );

    // Create maps for quick lookup
    const profilesMap = new Map(((profilesData || []) as UserProfile[]).map(p => [p.id, p]));
    const emailsMap = new Map<string, string>();
    
    if (!emailsError && emailsData) {
      (emailsData || []).forEach((item: { user_id: string; email: string }) => {
        emailsMap.set(item.user_id, item.email);
      });
    }

    return {
      ...(team as Team),
      members: ((allMembers || []) as TeamMember[]).map(m => {
        const profile = profilesMap.get(m.user_id) as UserProfile | undefined;
        const email = emailsMap.get(m.user_id);
        
        return {
          ...m,
          profile: profile ? { ...profile, address: null, email: email || null } : undefined,
        };
      }) as (TeamMember & { profile?: UserProfile })[],
      member_count: (allMembers || []).length,
    };
  } catch (error: any) {
    console.error('Error accepting join request:', error);
    throw new Error(error.message || 'Error al aceptar la solicitud');
  }
}

/**
 * Decline a join request
 * @param teamId - The team ID
 * @param requestId - The join request ID
 * @param leaderUserId - The team leader's user ID
 */
export async function declineJoinRequest(
  teamId: string,
  requestId: string,
  leaderUserId: string
): Promise<void> {
  try {
    // Verify user is team leader
    const { data: leaderMember, error: memberError } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', leaderUserId)
      .eq('role', 'leader')
      .maybeSingle();

    if (memberError) throw memberError;
    if (!leaderMember) {
      throw new Error('Solo los líderes del equipo pueden rechazar solicitudes');
    }

    // Update request status to declined
    const { error } = await (supabase
      .from('team_join_requests')
      .update({ status: 'declined', updated_at: new Date().toISOString() } as never)
      .eq('id', requestId)
      .eq('team_id', teamId)
      .eq('status', 'pending'));

    if (error) throw error;
  } catch (error: any) {
    console.error('Error declining join request:', error);
    throw new Error(error.message || 'Error al rechazar la solicitud');
  }
}

/**
 * Get all teams in the system with their members
 * @returns Array of all teams with members
 */
export async function getAllTeams(): Promise<TeamWithMembers[]> {
  try {
    // Get all teams
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*')
      .order('created_at', { ascending: false });

    if (teamsError) throw teamsError;
    if (!teams || teams.length === 0) return [];

    const teamIds = (teams || []).map(t => (t as Team).id);

    // Get all team members for these teams using the discovery function (bypasses RLS)
    const allMembersData: Array<{
      id: string;
      team_id: string;
      user_id: string;
      role: string;
      joined_at: string;
      profile_id: string;
      profile_name: string;
      profile_avatar_url: string | null;
      profile_location: string | null;
    }> = [];

    await Promise.all(
      teamIds.map(async (teamId) => {
        try {
          const { data: membersData, error: membersError } = await (supabase.rpc as any)(
            'get_team_members_for_discovery',
            { team_id_param: teamId }
          );
          
          if (!membersError && membersData) {
            allMembersData.push(...(membersData || []));
          }
        } catch (err) {
          console.error(`Error loading members for team ${teamId}:`, err);
        }
      })
    );

    // Get emails and phone numbers for team members (only for teams user is in)
    const emailsByTeamId = new Map<string, Map<string, string>>();
    const phoneNumbersByTeamId = new Map<string, Map<string, string | null>>();
    
    // Check which teams the current user is a member of
    const { data: currentUserData } = await supabase.auth.getUser();
    const userId = currentUserData?.user?.id;
    let userTeamIds = new Set<string>();
    
    if (userId) {
      const { data: userMemberships } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', userId);
      
      userTeamIds = new Set(((userMemberships || []) as { team_id: string }[]).map((m: { team_id: string }) => m.team_id));
      
      // Only fetch emails/phone for teams the user is in
      await Promise.all(
        Array.from(userTeamIds).map(async (teamId) => {
          try {
            const { data: emailsData, error: emailsError } = await (supabase.rpc as any)(
              'get_team_member_emails',
              { team_id_param: teamId }
            );
            
            if (!emailsError && emailsData) {
              const emailsMap = new Map<string, string>();
              (emailsData || []).forEach((item: { user_id: string; email: string }) => {
                emailsMap.set(item.user_id, item.email);
              });
              emailsByTeamId.set(teamId, emailsMap);
            }
            
            // Get phone numbers for team members
            const memberUserIds = allMembersData
              .filter(m => m.team_id === teamId)
              .map(m => m.user_id);
            
            if (memberUserIds.length > 0) {
              const { data: profilesData } = await supabase
                .from('profiles')
                .select('id, phone_number')
                .in('id', memberUserIds);
              
              if (profilesData) {
                const phoneMap = new Map<string, string | null>();
                profilesData.forEach((p: { id: string; phone_number: string | null }) => {
                  phoneMap.set(p.id, p.phone_number);
                });
                phoneNumbersByTeamId.set(teamId, phoneMap);
              }
            }
          } catch (err) {
            console.error(`Error loading contact info for team ${teamId}:`, err);
          }
        })
      );
    }

    // Combine teams with their members
    const typedTeams = (teams || []) as Team[];
    
    return typedTeams.map((team: Team) => {
      const members = allMembersData
        .filter(m => m.team_id === team.id)
        .map(m => {
          // Only include email/phone if user is a member of this team
          const isUserInTeam = userTeamIds.has(team.id);
          const emailsMap = emailsByTeamId.get(team.id);
          const phoneMap = phoneNumbersByTeamId.get(team.id);
          const email = isUserInTeam ? (emailsMap?.get(m.user_id) || null) : null;
          const phone = isUserInTeam ? (phoneMap?.get(m.user_id) || null) : null;
          
          const profile: UserProfile = {
            id: m.profile_id,
            name: m.profile_name || 'Desconocido',
            avatar_url: m.profile_avatar_url,
            location: m.profile_location || null,
            address: null, // Addresses are private and not visible to other users
            latitude: null,
            longitude: null,
            phone_number: phone,
            start_date: new Date().toISOString().split('T')[0],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            user_plan: 'gratis' as const,
            email: email,
          };
          
          return {
            id: m.id,
            team_id: m.team_id,
            user_id: m.user_id,
            role: m.role as 'leader' | 'member',
            joined_at: m.joined_at,
            profile: profile,
          };
        }) as (TeamMember & { profile?: UserProfile })[];

      return {
        ...team,
        members,
        member_count: members.length,
      };
    });
  } catch (error: any) {
    console.error('Error getting all teams:', error);
    throw new Error(error.message || 'Failed to get all teams');
  }
}

/**
 * Get join requests sent by a user
 * @param userId - The user's ID
 * @returns Array of join requests with team details
 */
export async function getUserJoinRequests(userId: string): Promise<TeamJoinRequestWithDetails[]> {
  try {
    const { data: requests, error: requestsError } = await supabase
      .from('team_join_requests')
      .select('*')
      .eq('requested_by', userId)
      .order('created_at', { ascending: false });

    if (requestsError) throw requestsError;

    const typedRequests = (requests || []) as TeamJoinRequest[];

    if (typedRequests.length === 0) {
      return [];
    }

    // Get team details
    const teamIds = [...new Set(typedRequests.map(req => req.team_id))];
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*')
      .in('id', teamIds);

    if (teamsError) throw teamsError;

    const teamsMap = new Map(((teams || []) as Team[]).map(t => [t.id, t]));

    return typedRequests.map(req => ({
      ...req,
      team: teamsMap.get(req.team_id) as Team | undefined,
    })) as TeamJoinRequestWithDetails[];
  } catch (error: any) {
    console.error('Error getting user join requests:', error);
    throw new Error(error.message || 'Error al obtener las solicitudes');
  }
}
