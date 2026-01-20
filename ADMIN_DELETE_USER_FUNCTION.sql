-- Database function to allow admin to delete any user
-- This function bypasses RLS and checks if the user is the admin
-- Note: This deletes the profile and all related data (cascade).
-- The auth user will need to be deleted separately via Supabase dashboard or admin API.
-- Run this in your Supabase SQL Editor

CREATE OR REPLACE FUNCTION admin_delete_user(user_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_email TEXT := 'edith.fuentes.2022@gmail.com';
  current_user_email TEXT;
  profile_exists BOOLEAN;
BEGIN
  -- Get the current user's email
  SELECT email INTO current_user_email
  FROM auth.users
  WHERE id = auth.uid();
  
  -- Check if the current user is the admin
  IF current_user_email IS NULL OR LOWER(current_user_email) != LOWER(admin_email) THEN
    RAISE EXCEPTION 'Only the admin can delete users using this function';
  END IF;
  
  -- Prevent admin from deleting themselves
  IF user_id_param = auth.uid() THEN
    RAISE EXCEPTION 'Admin cannot delete their own account';
  END IF;
  
  -- Check if profile exists
  SELECT EXISTS(SELECT 1 FROM profiles WHERE id = user_id_param) INTO profile_exists;
  
  IF NOT profile_exists THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;
  
  -- Delete the profile (cascade will handle all related data:
  -- walk_completions, phase_unlocks, phase_completions, book_completions,
  -- video_completions, trail_completions, magnolias_hikes_completions,
  -- team_members, team_invitations, team_join_requests, gallery_images, etc.)
  DELETE FROM profiles WHERE id = user_id_param;
  
  -- If no rows were deleted, something went wrong
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Failed to delete user profile';
  END IF;
  
  -- Note: The auth user in auth.users will need to be deleted separately
  -- via Supabase dashboard or using the admin API
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION admin_delete_user(UUID) TO authenticated;
