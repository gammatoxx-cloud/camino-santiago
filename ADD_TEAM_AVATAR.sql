-- Add avatar_url column to teams table
-- Run this in your Supabase SQL Editor
--
-- Also create Storage bucket "team-pictures" (public) in Supabase Dashboard,
-- with policy allowing authenticated users to INSERT/UPDATE objects.

ALTER TABLE teams
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

COMMENT ON COLUMN teams.avatar_url IS 'Team profile picture URL (Supabase Storage). Set by admin.';
