-- Fix RLS policies using SECURITY DEFINER functions with proper RLS bypass
-- This approach uses functions that bypass RLS to avoid recursion

-- Step 1: Drop existing policies
DROP POLICY IF EXISTS "Users can view teams they're in" ON teams;
DROP POLICY IF EXISTS "Users can view available teams" ON teams;
DROP POLICY IF EXISTS "Users can view team members" ON team_members;
DROP POLICY IF EXISTS "Users can join teams" ON team_members;

-- Step 2: Drop existing functions if they exist
DROP FUNCTION IF EXISTS is_team_member(UUID, UUID);
DROP FUNCTION IF EXISTS get_team_member_count(UUID);

-- Step 3: Create SECURITY DEFINER functions that properly bypass RLS
-- These functions run with the privileges of the function owner (postgres)
-- and can query team_members without triggering RLS policies

-- Function to check if a user is a member of a team
-- SECURITY DEFINER ensures it bypasses RLS when querying team_members
CREATE OR REPLACE FUNCTION is_team_member(team_id_param UUID, user_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  -- Handle NULL inputs
  IF team_id_param IS NULL OR user_id_param IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- This query bypasses RLS because the function is SECURITY DEFINER
  RETURN EXISTS (
    SELECT 1 
    FROM team_members 
    WHERE team_members.team_id = team_id_param 
    AND team_members.user_id = user_id_param
  );
END;
$$;

-- Function to get team member count
-- SECURITY DEFINER ensures it bypasses RLS when querying team_members
CREATE OR REPLACE FUNCTION get_team_member_count(team_id_param UUID)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  member_count BIGINT;
BEGIN
  -- Handle NULL input
  IF team_id_param IS NULL THEN
    RETURN 0::BIGINT;
  END IF;
  
  -- This query bypasses RLS because the function is SECURITY DEFINER
  SELECT COUNT(*)::BIGINT INTO member_count
  FROM team_members 
  WHERE team_members.team_id = team_id_param;
  
  RETURN COALESCE(member_count, 0::BIGINT);
END;
$$;

-- Step 4: Grant execute permissions on functions to authenticated users
GRANT EXECUTE ON FUNCTION is_team_member(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_team_member_count(UUID) TO authenticated;

-- Step 5: Recreate policies using the SECURITY DEFINER functions
-- Users can view teams they're members of
CREATE POLICY "Users can view teams they're in" ON teams FOR SELECT 
  USING (is_team_member(teams.id, auth.uid()));

-- Users can view teams with open spots (for discovery)
CREATE POLICY "Users can view available teams" ON teams FOR SELECT 
  USING (get_team_member_count(teams.id) < teams.max_members::BIGINT);

-- Users can view members of teams they're in
-- The function bypasses RLS, so no recursion occurs
CREATE POLICY "Users can view team members" ON team_members FOR SELECT 
  USING (is_team_member(team_members.team_id, auth.uid()));

-- Users can join teams with open spots
CREATE POLICY "Users can join teams" ON team_members FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM teams t
      WHERE t.id = team_id
      AND get_team_member_count(t.id) < t.max_members::BIGINT
    )
  );









