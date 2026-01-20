-- User Plans Setup
-- Run this SQL in your Supabase SQL Editor to add user plan functionality
-- IMPORTANT: Run this as the service role or it will be blocked by RLS policies

-- Add user_plan column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS user_plan TEXT DEFAULT 'gratis' 
CHECK (user_plan IN ('gratis', 'basico', 'completo'));

-- Update existing profiles to default to 'gratis' if NULL
-- Note: This UPDATE bypasses RLS because it's run as service role
-- If running as regular user, use the admin function instead
UPDATE profiles 
SET user_plan = 'gratis' 
WHERE user_plan IS NULL;

-- Add index for efficient queries
CREATE INDEX IF NOT EXISTS idx_profiles_user_plan ON profiles(user_plan);

-- Add comment for documentation
COMMENT ON COLUMN profiles.user_plan IS 'User subscription plan: gratis (default), basico, or completo';
