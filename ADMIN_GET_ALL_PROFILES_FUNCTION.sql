-- Database function to allow admin to get all profiles
-- This function bypasses RLS and returns all profiles for the admin
-- Run this in your Supabase SQL Editor

-- Drop the existing function first (required when changing return type)
DROP FUNCTION IF EXISTS admin_get_all_profiles();

CREATE OR REPLACE FUNCTION admin_get_all_profiles()
RETURNS TABLE (
  id UUID,
  name TEXT,
  location TEXT,
  address TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  avatar_url TEXT,
  phone_number TEXT,
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
    profiles.phone_number,
    profiles.start_date,
    COALESCE(profiles.user_plan, 'gratis')::TEXT as user_plan,
    profiles.created_at,
    profiles.updated_at
  FROM profiles
  ORDER BY profiles.created_at DESC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION admin_get_all_profiles() TO authenticated;
