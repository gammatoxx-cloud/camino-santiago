-- Magnolias hikes completions table setup
-- This table tracks which Magnolias training hikes users have completed

-- Create magnolias_hikes_completions table
CREATE TABLE IF NOT EXISTS magnolias_hikes_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  hike_id TEXT NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, hike_id)
);

-- Enable RLS
ALTER TABLE magnolias_hikes_completions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own Magnolias hike completions
CREATE POLICY "Users can view own magnolias hike completions" ON magnolias_hikes_completions 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can insert their own Magnolias hike completions
CREATE POLICY "Users can insert own magnolias hike completions" ON magnolias_hikes_completions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own Magnolias hike completions
CREATE POLICY "Users can delete own magnolias hike completions" ON magnolias_hikes_completions 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_magnolias_hikes_completions_user_id ON magnolias_hikes_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_magnolias_hikes_completions_hike_id ON magnolias_hikes_completions(hike_id);
