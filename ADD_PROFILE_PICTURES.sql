-- Migration: Add profile picture support
-- Run this SQL in your Supabase SQL Editor

-- Add avatar_url column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Storage bucket creation (run via Supabase Dashboard Storage section):
-- 1. Go to Storage in Supabase Dashboard
-- 2. Click "New bucket"
-- 3. Name: profile-pictures
-- 4. Check "Public bucket" to make it publicly accessible
-- 5. Click "Create bucket"

-- Storage policies for profile-pictures bucket
-- Note: These policies assume the bucket is named 'profile-pictures'
-- and files are stored as: profile-pictures/{user_id}/{filename}

CREATE POLICY "Users can upload own profile pictures"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile-pictures' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own profile pictures"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'profile-pictures' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own profile pictures"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profile-pictures' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Anyone can view profile pictures"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-pictures');

