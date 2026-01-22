-- Function to get team members for any team (for discovery purposes)
-- This bypasses RLS so users can see team members before joining
CREATE OR REPLACE FUNCTION get_team_members_for_discovery(team_id_param UUID)
RETURNS TABLE (
  id UUID,
  team_id UUID,
  user_id UUID,
  role TEXT,
  joined_at TIMESTAMPTZ,
  profile_id UUID,
  profile_name TEXT,
  profile_avatar_url TEXT,
  profile_location TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  -- Handle NULL input
  IF team_id_param IS NULL THEN
    RETURN;
  END IF;
  
  -- This query bypasses RLS because the function is SECURITY DEFINER
  RETURN QUERY
  SELECT 
    tm.id,
    tm.team_id,
    tm.user_id,
    tm.role,
    tm.joined_at,
    p.id AS profile_id,
    p.name AS profile_name,
    p.avatar_url AS profile_avatar_url,
    p.location AS profile_location
  FROM team_members tm
  LEFT JOIN profiles p ON tm.user_id = p.id
  WHERE tm.team_id = team_id_param
  ORDER BY 
    CASE WHEN tm.role = 'leader' THEN 0 ELSE 1 END,
    tm.joined_at ASC;
END;
$$;

-- Grant execute permissions on function to authenticated users
GRANT EXECUTE ON FUNCTION get_team_members_for_discovery(UUID) TO authenticated;
