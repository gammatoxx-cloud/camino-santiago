-- ============================================
-- UPDATE USER PLANS - Run this SQL to update existing setup
-- ============================================
-- Run this in your Supabase SQL Editor as the service role
-- This updates the existing setup with the user_plan functionality

-- Step 1: Add user_plan column if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS user_plan TEXT DEFAULT 'gratis' 
CHECK (user_plan IN ('gratis', 'basico', 'completo'));

-- Step 2: Update existing profiles to default to 'gratis' if NULL
-- Note: Run as service role to bypass RLS
UPDATE profiles 
SET user_plan = 'gratis' 
WHERE user_plan IS NULL;

-- Step 3: Add index for efficient queries (if not exists)
CREATE INDEX IF NOT EXISTS idx_profiles_user_plan ON profiles(user_plan);

-- Step 4: Add comment for documentation
COMMENT ON COLUMN profiles.user_plan IS 'User subscription plan: gratis (default), basico, or completo';

-- Step 5: Create/Update admin function to update user plans
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

-- Step 6: Update admin_get_all_profiles function to include user_plan
-- Note: Must DROP first because we're changing the return type
DROP FUNCTION IF EXISTS admin_get_all_profiles();

CREATE FUNCTION admin_get_all_profiles()
RETURNS TABLE (
  id UUID,
  name TEXT,
  location TEXT,
  address TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  avatar_url TEXT,
  start_date DATE,
  user_plan TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
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
  -- Log for debugging (remove in production)
  IF current_user_email IS NULL THEN
    RAISE EXCEPTION 'Current user email is NULL. User ID: %', auth.uid();
  END IF;
  
  IF LOWER(TRIM(current_user_email)) != LOWER(TRIM(admin_email)) THEN
    RAISE EXCEPTION 'Only the admin can use this function. Current email: %, Expected: %', current_user_email, admin_email;
  END IF;
  
  -- Return all profiles (bypasses RLS because of SECURITY DEFINER)
  RETURN QUERY
  SELECT 
    profiles.id,
    profiles.name,
    profiles.location,
    profiles.address,
    profiles.latitude,
    profiles.longitude,
    profiles.avatar_url,
    profiles.start_date,
    COALESCE(profiles.user_plan, 'gratis')::TEXT as user_plan,
    profiles.created_at,
    profiles.updated_at
  FROM profiles
  ORDER BY profiles.created_at DESC;
END;
$$;

-- Grant execute permission (if not already granted)
GRANT EXECUTE ON FUNCTION admin_get_all_profiles() TO authenticated;
