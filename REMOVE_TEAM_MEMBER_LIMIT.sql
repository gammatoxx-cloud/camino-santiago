-- Remove team member limit: make max_members nullable (NULL = no limit)
-- Run this in Supabase SQL Editor

-- 1. Allow NULL and set default to NULL
ALTER TABLE teams
  ALTER COLUMN max_members DROP NOT NULL,
  ALTER COLUMN max_members SET DEFAULT NULL;

-- 2. Set all existing teams to no limit
UPDATE teams SET max_members = NULL WHERE max_members IS NOT NULL;

-- 3. Drop and recreate RLS policies that check max_members so NULL means "no limit"

-- Teams: "Users can view available teams" -> allow viewing if member or team has room or no limit
DROP POLICY IF EXISTS "Users can view available teams" ON teams;
CREATE POLICY "Users can view available teams" ON teams FOR SELECT
  USING (
    teams.max_members IS NULL
    OR get_team_member_count(teams.id) < teams.max_members::BIGINT
  );

-- team_members: "Users can join teams" -> allow join if team has room or no limit
DROP POLICY IF EXISTS "Users can join teams" ON team_members;
CREATE POLICY "Users can join teams" ON team_members FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM teams t
      WHERE t.id = team_id
      AND (t.max_members IS NULL OR get_team_member_count(t.id) < t.max_members::BIGINT)
    )
  );

-- team_members: "Team leaders can add members from join requests"
DROP POLICY IF EXISTS "Team leaders can add members from join requests" ON team_members;
CREATE POLICY "Team leaders can add members from join requests" ON team_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members tm
      INNER JOIN team_join_requests tjr ON tm.team_id = tjr.team_id
      WHERE tm.team_id = team_members.team_id
        AND tm.user_id = auth.uid()
        AND tm.role = 'leader'
        AND tjr.requested_by = team_members.user_id
        AND tjr.team_id = team_members.team_id
        AND tjr.status IN ('pending', 'accepted')
    )
    AND EXISTS (
      SELECT 1 FROM teams t
      WHERE t.id = team_id
      AND (t.max_members IS NULL OR get_team_member_count(t.id) < t.max_members::BIGINT)
    )
  );

-- team_join_requests: "Users can create join requests"
DROP POLICY IF EXISTS "Users can create join requests" ON team_join_requests;
CREATE POLICY "Users can create join requests" ON team_join_requests FOR INSERT
  WITH CHECK (
    auth.uid() = requested_by
    AND NOT EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_join_requests.team_id
      AND tm.user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM teams t
      WHERE t.id = team_join_requests.team_id
      AND (t.max_members IS NULL OR get_team_member_count(t.id) < t.max_members::BIGINT)
    )
  );
