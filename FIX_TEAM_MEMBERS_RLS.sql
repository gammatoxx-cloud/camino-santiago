-- Fix infinite recursion in team_members RLS policies
-- Run this SQL in your Supabase SQL Editor

-- Step 1: Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Users can view teams they're in" ON teams;
DROP POLICY IF EXISTS "Users can view available teams" ON teams;
DROP POLICY IF EXISTS "Users can view team members" ON team_members;
DROP POLICY IF EXISTS "Users can join teams" ON team_members;

-- Step 2: Create helper functions that bypass RLS to avoid recursion
-- Mark as STABLE since they depend on table data (not IMMUTABLE)
CREATE OR REPLACE FUNCTION is_team_member(team_id_param UUID, user_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Handle NULL inputs
  IF team_id_param IS NULL OR user_id_param IS NULL THEN
    RETURN FALSE;
  END IF;
  
  RETURN EXISTS (
    SELECT 1 FROM team_members 
    WHERE team_members.team_id = team_id_param 
    AND team_members.user_id = user_id_param
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Use BIGINT to match COUNT(*) return type exactly
CREATE OR REPLACE FUNCTION get_team_member_count(team_id_param UUID)
RETURNS BIGINT AS $$
BEGIN
  -- Handle NULL input
  IF team_id_param IS NULL THEN
    RETURN 0;
  END IF;
  
  RETURN (
    SELECT COUNT(*) FROM team_members 
    WHERE team_members.team_id = team_id_param
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Step 3: Recreate policies using the helper functions
-- Users can view teams they're members of
CREATE POLICY "Users can view teams they're in" ON teams FOR SELECT 
  USING (is_team_member(teams.id, auth.uid()));

-- Users can view teams with open spots (for discovery)
CREATE POLICY "Users can view available teams" ON teams FOR SELECT 
  USING (get_team_member_count(teams.id) < teams.max_members);

-- Users can view members of teams they're in
CREATE POLICY "Users can view team members" ON team_members FOR SELECT 
  USING (is_team_member(team_members.team_id, auth.uid()));

-- Users can join teams with open spots
CREATE POLICY "Users can join teams" ON team_members FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM teams t
      WHERE t.id = team_id
      AND get_team_member_count(t.id) < t.max_members
    )
  );

