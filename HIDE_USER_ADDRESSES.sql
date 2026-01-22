-- Hide user addresses from other users
-- This updates the find_users_within_radius function to exclude the address field

-- Drop the existing function first (required when changing return type)
DROP FUNCTION IF EXISTS find_users_within_radius(DECIMAL, DECIMAL, DECIMAL);

-- Recreate function to exclude address from return table
CREATE OR REPLACE FUNCTION find_users_within_radius(
  user_lat DECIMAL,
  user_lng DECIMAL,
  radius_miles DECIMAL DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  location TEXT,
  -- address TEXT, -- REMOVED: Addresses are private and should not be visible to other users
  latitude DECIMAL,
  longitude DECIMAL,
  distance_miles DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.location,
    -- p.address, -- REMOVED: Addresses are private and should not be visible to other users
    p.latitude,
    p.longitude,
    (
      ST_Distance(
        ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
        ST_SetSRID(ST_MakePoint(p.longitude, p.latitude), 4326)::geography
      ) / 1609.34
    )::DECIMAL AS distance_miles
  FROM profiles p
  WHERE 
    p.latitude IS NOT NULL 
    AND p.longitude IS NOT NULL
    AND p.id != auth.uid()
    AND ST_DWithin(
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
      ST_SetSRID(ST_MakePoint(p.longitude, p.latitude), 4326)::geography,
      radius_miles * 1609.34
    )
  ORDER BY distance_miles;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION find_users_within_radius(DECIMAL, DECIMAL, DECIMAL) TO authenticated;
