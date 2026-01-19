-- Database function to allow admin to get all team members for all teams
-- This function bypasses RLS and returns all team members
-- Run this in your Supabase SQL Editor

CREATE OR REPLACE FUNCTION admin_get_all_team_members()
RETURNS TABLE (
  id UUID,
  team_id UUID,
  user_id UUID,
  role TEXT,
  joined_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_email TEXT := 'edith.fuentes.2022@gmail.com';
  current_user_email TEXT;
BEGIN
  -- Get the current user's email
  SELECT email INTO current_user_email
  FROM auth.users
  WHERE auth.users.id = auth.uid();
  
  -- Check if the current user is the admin
  IF current_user_email IS NULL OR LOWER(TRIM(current_user_email)) != LOWER(TRIM(admin_email)) THEN
    RAISE EXCEPTION 'Only the admin can use this function. Current email: %, Expected: %', current_user_email, admin_email;
  END IF;
  
  -- Return all team members (bypasses RLS because of SECURITY DEFINER)
  RETURN QUERY
  SELECT 
    team_members.id,
    team_members.team_id,
    team_members.user_id,
    team_members.role,
    team_members.joined_at
  FROM team_members
  ORDER BY team_members.team_id, team_members.joined_at;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION admin_get_all_team_members() TO authenticated;
