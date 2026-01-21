# Supabase Database Setup

Run the following SQL in your Supabase SQL Editor to set up the database schema and Row Level Security policies.

## Database Schema

```sql
-- Enable PostGIS extension for spatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  address TEXT, -- Full address string for geocoding
  latitude DECIMAL(10, 8), -- Latitude coordinate
  longitude DECIMAL(11, 8), -- Longitude coordinate
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Walk completions table
CREATE TABLE walk_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  day_of_week TEXT NOT NULL,
  distance_km DECIMAL(5,2) NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week_number, day_of_week)
);

-- Phase unlocks table
CREATE TABLE phase_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  phase_number INTEGER NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, phase_number)
);

-- Phase completions table (tracks completed phases for badges)
CREATE TABLE phase_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  phase_number INTEGER NOT NULL CHECK (phase_number >= 1 AND phase_number <= 5),
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, phase_number)
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE walk_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE phase_unlocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE phase_completions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Profiles: users can read/update their own profile
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
-- Users can also view profiles of team members (users who share at least one team)
CREATE POLICY "Users can view team member profiles" ON profiles FOR SELECT 
  USING (
    auth.uid() = id
    OR
    EXISTS (
      SELECT 1 
      FROM team_members tm1
      JOIN team_members tm2 ON tm1.team_id = tm2.team_id
      WHERE tm1.user_id = auth.uid()
      AND tm2.user_id = profiles.id
    )
  );
-- Team leaders can view profiles of users who have sent join requests to their teams
CREATE POLICY "Team leaders can view join requester profiles" ON profiles FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 
      FROM team_members tm
      INNER JOIN team_join_requests tjr ON tm.team_id = tjr.team_id
      WHERE tm.user_id = auth.uid()
      AND tm.role = 'leader'
      AND tjr.requested_by = profiles.id
      AND tjr.status = 'pending'
    )
  );
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Walk completions: users can manage their own completions
CREATE POLICY "Users can view own completions" ON walk_completions FOR SELECT USING (auth.uid() = user_id);
-- Team members can view walk completions of other team members (for team statistics)
CREATE POLICY "Team members can view team completions" ON walk_completions FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 
      FROM team_members tm1
      INNER JOIN team_members tm2 ON tm1.team_id = tm2.team_id
      WHERE tm1.user_id = auth.uid()
      AND tm2.user_id = walk_completions.user_id
    )
  );
CREATE POLICY "Users can insert own completions" ON walk_completions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own completions" ON walk_completions FOR DELETE USING (auth.uid() = user_id);

-- Phase unlocks: users can view their own unlocks
CREATE POLICY "Users can view own unlocks" ON phase_unlocks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own unlocks" ON phase_unlocks FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Phase completions: users can view and insert their own completions
CREATE POLICY "Users can view own phase completions" ON phase_completions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own phase completions" ON phase_completions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Book completions table
CREATE TABLE book_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  book_id TEXT NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, book_id)
);

-- Enable RLS on book_completions
ALTER TABLE book_completions ENABLE ROW LEVEL SECURITY;

-- Book completions: users can manage their own completions
CREATE POLICY "Users can view own book completions" ON book_completions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own book completions" ON book_completions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own book completions" ON book_completions FOR DELETE USING (auth.uid() = user_id);

-- Create index for efficient queries
CREATE INDEX idx_book_completions_user_id ON book_completions(user_id);

-- Video completions table
CREATE TABLE video_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  video_id TEXT NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);

-- Enable RLS on video_completions
ALTER TABLE video_completions ENABLE ROW LEVEL SECURITY;

-- Video completions: users can manage their own completions
CREATE POLICY "Users can view own video completions" ON video_completions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own video completions" ON video_completions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own video completions" ON video_completions FOR DELETE USING (auth.uid() = user_id);

-- Create index for efficient queries
CREATE INDEX idx_video_completions_user_id ON video_completions(user_id);

-- Teams table
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  max_members INTEGER DEFAULT 14 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team members table (many-to-many relationship)
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('leader', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Team invitations table (notifications for team invites)
CREATE TABLE team_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  invited_by UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  invited_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, invited_user_id, status) -- One pending invitation per team per user
);

-- Team join requests table (users requesting to join teams)
CREATE TABLE team_join_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  requested_by UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, requested_by, status) -- One pending request per team per user
);

-- Create spatial index on profiles for efficient distance queries
CREATE INDEX idx_profiles_location ON profiles USING GIST (
  ST_MakePoint(longitude, latitude)
);

-- Create index on teams for queries
CREATE INDEX idx_teams_created_by ON teams(created_by);
CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_team_join_requests_team_id ON team_join_requests(team_id);
CREATE INDEX idx_team_join_requests_requested_by ON team_join_requests(requested_by);

-- Enable RLS on new tables
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_join_requests ENABLE ROW LEVEL SECURITY;

-- Helper functions with SECURITY DEFINER to bypass RLS and avoid recursion
-- These functions run with the privileges of the function owner and can query
-- team_members without triggering RLS policies

-- Function to check if a user is a member of a team
CREATE OR REPLACE FUNCTION is_team_member(team_id_param UUID, user_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  -- Handle NULL inputs
  IF team_id_param IS NULL OR user_id_param IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- This query bypasses RLS because the function is SECURITY DEFINER
  RETURN EXISTS (
    SELECT 1 
    FROM team_members 
    WHERE team_members.team_id = team_id_param 
    AND team_members.user_id = user_id_param
  );
END;
$$;

-- Function to get team member count
CREATE OR REPLACE FUNCTION get_team_member_count(team_id_param UUID)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  member_count BIGINT;
BEGIN
  -- Handle NULL input
  IF team_id_param IS NULL THEN
    RETURN 0::BIGINT;
  END IF;
  
  -- This query bypasses RLS because the function is SECURITY DEFINER
  SELECT COUNT(*)::BIGINT INTO member_count
  FROM team_members 
  WHERE team_members.team_id = team_id_param;
  
  RETURN COALESCE(member_count, 0::BIGINT);
END;
$$;

-- Grant execute permissions on functions to authenticated users
GRANT EXECUTE ON FUNCTION is_team_member(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_team_member_count(UUID) TO authenticated;

-- RLS Policies for teams
-- Users can view teams they're members of
CREATE POLICY "Users can view teams they're in" ON teams FOR SELECT 
  USING (is_team_member(teams.id, auth.uid()));

-- Users can view teams with open spots (for discovery)
CREATE POLICY "Users can view available teams" ON teams FOR SELECT 
  USING (get_team_member_count(teams.id) < teams.max_members::BIGINT);

-- Users can create teams
CREATE POLICY "Users can create teams" ON teams FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

-- Team creators can update their teams
CREATE POLICY "Users can update own teams" ON teams FOR UPDATE 
  USING (auth.uid() = created_by);

-- Team leaders can update their teams
CREATE POLICY "Team leaders can update teams" ON teams FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 
      FROM team_members tm
      WHERE tm.team_id = teams.id
      AND tm.user_id = auth.uid()
      AND tm.role = 'leader'
    )
  );

-- Team creators can delete their teams
CREATE POLICY "Users can delete own teams" ON teams FOR DELETE 
  USING (auth.uid() = created_by);

-- RLS Policies for team_members
-- Users can view members of teams they're in
-- The SECURITY DEFINER function bypasses RLS, so no recursion occurs
CREATE POLICY "Users can view team members" ON team_members FOR SELECT 
  USING (is_team_member(team_members.team_id, auth.uid()));

-- Users can join teams with open spots
CREATE POLICY "Users can join teams" ON team_members FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM teams t
      WHERE t.id = team_id
      AND get_team_member_count(t.id) < t.max_members::BIGINT
    )
  );

-- Team leaders can add members when accepting join requests
-- This allows team leaders to add members when there's a pending or accepted join request from that user
CREATE POLICY "Team leaders can add members from join requests" ON team_members FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members tm
      INNER JOIN team_join_requests tjr ON tm.team_id = tjr.team_id
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = auth.uid()
      AND tm.role = 'leader'
      AND tjr.requested_by = team_members.user_id
      AND tjr.team_id = team_members.team_id
      AND tjr.status IN ('pending', 'accepted')
    ) AND
    EXISTS (
      SELECT 1 FROM teams t
      WHERE t.id = team_id
      AND get_team_member_count(t.id) < t.max_members::BIGINT
    )
  );

-- Users can leave teams
CREATE POLICY "Users can leave teams" ON team_members FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies for team_invitations
-- Users can view invitations sent to them
CREATE POLICY "Users can view own invitations" ON team_invitations FOR SELECT 
  USING (auth.uid() = invited_user_id);

-- Team members can view invitations for their team
CREATE POLICY "Team members can view team invitations" ON team_invitations FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm 
      WHERE tm.team_id = team_invitations.team_id 
      AND tm.user_id = auth.uid()
    )
  );

-- Users can create invitations (team leaders/members can invite)
CREATE POLICY "Users can create invitations" ON team_invitations FOR INSERT 
  WITH CHECK (
    auth.uid() = invited_by AND
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_invitations.team_id
      AND tm.user_id = auth.uid()
    )
  );

-- Invited users can update their invitations (accept/decline)
CREATE POLICY "Users can update own invitations" ON team_invitations FOR UPDATE 
  USING (auth.uid() = invited_user_id);

-- RLS Policies for team_join_requests
-- Users can view requests they've sent
CREATE POLICY "Users can view own join requests" ON team_join_requests FOR SELECT 
  USING (auth.uid() = requested_by);

-- Team leaders can view requests for their teams
CREATE POLICY "Team leaders can view team join requests" ON team_join_requests FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm 
      WHERE tm.team_id = team_join_requests.team_id 
      AND tm.user_id = auth.uid()
      AND tm.role = 'leader'
    )
  );

-- Users can create join requests
CREATE POLICY "Users can create join requests" ON team_join_requests FOR INSERT 
  WITH CHECK (
    auth.uid() = requested_by AND
    NOT EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_join_requests.team_id
      AND tm.user_id = auth.uid()
    ) AND
    EXISTS (
      SELECT 1 FROM teams t
      WHERE t.id = team_join_requests.team_id
      AND get_team_member_count(t.id) < t.max_members::BIGINT
    )
  );

-- Team leaders can update join requests (accept/decline)
CREATE POLICY "Team leaders can update join requests" ON team_join_requests FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm 
      WHERE tm.team_id = team_join_requests.team_id 
      AND tm.user_id = auth.uid()
      AND tm.role = 'leader'
    )
  );

-- Function to find users within a radius (in meters, converts miles to meters)
CREATE OR REPLACE FUNCTION find_users_within_radius(
  user_lat DECIMAL,
  user_lng DECIMAL,
  radius_miles DECIMAL DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  location TEXT,
  address TEXT,
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
    p.address,
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

-- Optional: Function to get total distance walked by a team (for team statistics)
-- This function is optional - the app works without it using direct queries
CREATE OR REPLACE FUNCTION get_team_total_distance(team_id_param UUID)
RETURNS DECIMAL AS $$
DECLARE
  total_distance DECIMAL;
BEGIN
  SELECT COALESCE(SUM(wc.distance_km), 0)
  INTO total_distance
  FROM walk_completions wc
  INNER JOIN team_members tm ON wc.user_id = tm.user_id
  WHERE tm.team_id = team_id_param;
  
  RETURN COALESCE(total_distance, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get team membership info for users (bypasses RLS for discovery)
-- This allows users to see which teams nearby users belong to and their roles
CREATE OR REPLACE FUNCTION get_user_team_memberships(user_ids UUID[])
RETURNS TABLE (
  user_id UUID,
  team_id UUID,
  role TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tm.user_id,
    tm.team_id,
    tm.role
  FROM team_members tm
  WHERE tm.user_id = ANY(user_ids);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_user_team_memberships(UUID[]) TO authenticated;
```

## Environment Variables

After running the SQL, create a `.env` file in the project root with your Supabase credentials:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_MAPBOX_API_KEY=your_mapbox_api_key
```

You can find these values in your Supabase project settings under API.

For the Mapbox API key:
1. Sign up at https://www.mapbox.com/
2. Go to Account → Access Tokens
3. Create a new token or use the default public token
4. Add it to your `.env` file as `VITE_MAPBOX_API_KEY`

**Note:** The Mapbox Geocoding API has a free tier of 100,000 requests per month.

## Profile Picture Storage Setup

To enable profile picture uploads, you need to set up a storage bucket:

1. **Create the storage bucket:**
   - Go to Storage in your Supabase Dashboard
   - Click "New bucket"
   - Name: `profile-pictures`
   - Check "Public bucket" to make images publicly accessible
   - Click "Create bucket"

2. **Run the storage policies SQL:**
   - Go to SQL Editor in your Supabase Dashboard
   - Run the SQL from `ADD_PROFILE_PICTURES.sql` file
   - This adds the `avatar_url` column and storage policies

The storage policies allow:
- Users to upload, update, and delete their own profile pictures
- Anyone to view profile pictures (for displaying team member avatars)

