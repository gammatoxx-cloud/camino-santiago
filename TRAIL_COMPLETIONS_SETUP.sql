-- Trail completions table setup
-- This table tracks which trails users have completed

-- Create trail_completions table
CREATE TABLE IF NOT EXISTS trail_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  trail_id TEXT NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, trail_id)
);

-- Enable RLS
ALTER TABLE trail_completions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own trail completions
CREATE POLICY "Users can view own trail completions" ON trail_completions 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can insert their own trail completions
CREATE POLICY "Users can insert own trail completions" ON trail_completions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own trail completions
CREATE POLICY "Users can delete own trail completions" ON trail_completions 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_trail_completions_user_id ON trail_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_trail_completions_trail_id ON trail_completions(trail_id);

