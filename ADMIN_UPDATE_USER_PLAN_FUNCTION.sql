-- Admin function to update user plan
-- Run this SQL in your Supabase SQL Editor
-- This function allows the admin to update a user's plan

CREATE OR REPLACE FUNCTION admin_update_user_plan(
  user_id_param UUID,
  plan_param TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
-- SECURITY DEFINER bypasses RLS, allowing admin to update any user's plan
SET search_path = public
AS $$
DECLARE
  admin_email TEXT := 'edith.fuentes.2022@gmail.com';
  current_user_email TEXT;
BEGIN
  -- Validate plan parameter
  IF plan_param NOT IN ('gratis', 'basico', 'completo') THEN
    RAISE EXCEPTION 'Invalid plan: %. Must be one of: gratis, basico, completo', plan_param;
  END IF;

  -- Get the current user's email
  SELECT email INTO current_user_email
  FROM auth.users
  WHERE auth.users.id = auth.uid();
  
  -- Check if the current user is the admin
  IF current_user_email IS NULL THEN
    RAISE EXCEPTION 'Current user email is NULL. User ID: %', auth.uid();
  END IF;
  
  IF LOWER(TRIM(current_user_email)) != LOWER(TRIM(admin_email)) THEN
    RAISE EXCEPTION 'Only the admin can use this function. Current email: %, Expected: %', current_user_email, admin_email;
  END IF;

  -- Verify user exists
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = user_id_param) THEN
    RAISE EXCEPTION 'User with ID % does not exist', user_id_param;
  END IF;

  -- Update the user's plan
  UPDATE profiles
  SET user_plan = plan_param,
      updated_at = NOW()
  WHERE id = user_id_param;

  -- Verify update was successful
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Failed to update user plan for user ID: %', user_id_param;
  END IF;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION admin_update_user_plan(UUID, TEXT) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION admin_update_user_plan(UUID, TEXT) IS 'Admin function to update a user''s subscription plan. Only accessible by the admin user.';
