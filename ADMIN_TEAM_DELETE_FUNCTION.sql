-- Database function to allow admin to delete any team
-- This function bypasses RLS and checks if the user is the admin
-- Run this in your Supabase SQL Editor

CREATE OR REPLACE FUNCTION admin_delete_team(team_id_param UUID)
RETURNS void
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
  WHERE id = auth.uid();
  
  -- Check if the current user is the admin
  IF current_user_email IS NULL OR LOWER(current_user_email) != LOWER(admin_email) THEN
    RAISE EXCEPTION 'Only the admin can delete teams using this function';
  END IF;
  
  -- Delete the team (cascade will handle team_members, invitations, etc.)
  DELETE FROM teams WHERE id = team_id_param;
  
  -- If no rows were deleted, the team doesn't exist
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Team not found';
  END IF;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION admin_delete_team(UUID) TO authenticated;
