-- Test function to verify admin access and check what users exist
-- Run this in your Supabase SQL Editor to test

-- First, let's create a simple test function
CREATE OR REPLACE FUNCTION admin_test_function()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_email TEXT := 'edith.fuentes.2022@gmail.com';
  current_user_email TEXT;
  current_user_id UUID;
  profile_count INTEGER;
BEGIN
  -- Get current user info
  SELECT id, email INTO current_user_id, current_user_email
  FROM auth.users
  WHERE id = auth.uid();
  
  -- Get total profile count
  SELECT COUNT(*) INTO profile_count FROM profiles;
  
  -- Return diagnostic info
  RETURN json_build_object(
    'current_user_id', current_user_id,
    'current_user_email', current_user_email,
    'is_admin', (current_user_email IS NOT NULL AND LOWER(current_user_email) = LOWER(admin_email)),
    'total_profiles', profile_count,
    'admin_email_expected', admin_email
  );
END;
$$;

GRANT EXECUTE ON FUNCTION admin_test_function() TO authenticated;

-- Test it:
-- SELECT admin_test_function();
