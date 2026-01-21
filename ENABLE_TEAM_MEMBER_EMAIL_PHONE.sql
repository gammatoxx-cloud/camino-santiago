-- Enable team members to see each other's email and phone number
-- This creates a function to get team member emails from auth.users

-- Function to get team member emails (SECURITY DEFINER to access auth.users)
CREATE OR REPLACE FUNCTION get_team_member_emails(team_id_param UUID)
RETURNS TABLE (
  user_id UUID,
  email TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id AS user_id,
    au.email::TEXT AS email
  FROM auth.users au
  INNER JOIN team_members tm ON au.id = tm.user_id
  WHERE tm.team_id = team_id_param
  AND EXISTS (
    -- Verify that the requesting user is also a member of this team
    SELECT 1
    FROM team_members tm_check
    WHERE tm_check.team_id = team_id_param
    AND tm_check.user_id = auth.uid()
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_team_member_emails(UUID) TO authenticated;

-- Note: Phone number is already in profiles table and accessible via existing RLS policy
-- "Users can view team member profiles" already allows team members to see each other's profiles
-- which includes phone_number field
