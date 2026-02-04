-- Database function to allow admin to set the avatar URL for any team
-- Run this in your Supabase SQL Editor

CREATE OR REPLACE FUNCTION admin_update_team_avatar(team_id_param UUID, avatar_url_param TEXT)
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
    RAISE EXCEPTION 'Only the admin can update team avatars using this function';
  END IF;
  
  -- Update the team's avatar URL
  UPDATE teams
  SET avatar_url = NULLIF(TRIM(avatar_url_param), ''),
      updated_at = NOW()
  WHERE id = team_id_param;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Team not found';
  END IF;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION admin_update_team_avatar(UUID, TEXT) TO authenticated;
