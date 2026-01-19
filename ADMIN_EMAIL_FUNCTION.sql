-- Database function to get user email for admin dashboard
-- This function allows the admin dashboard to fetch user emails
-- Run this in your Supabase SQL Editor

CREATE OR REPLACE FUNCTION get_user_email(user_id UUID)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT email FROM auth.users WHERE id = user_id;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_email(UUID) TO authenticated;

-- Note: This function uses SECURITY DEFINER to bypass RLS and access auth.users
-- Only use this if you trust your authenticated users or restrict access via RLS policies
