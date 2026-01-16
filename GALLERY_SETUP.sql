-- Migration: Add gallery feature with monthly albums
-- Run this SQL in your Supabase SQL Editor

-- Create gallery_images table
CREATE TABLE IF NOT EXISTS gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  album_month INTEGER NOT NULL CHECK (album_month >= 1 AND album_month <= 12),
  image_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create gallery_likes table
CREATE TABLE IF NOT EXISTS gallery_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_id UUID REFERENCES gallery_images(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(image_id, user_id)
);

-- Create gallery_comments table
CREATE TABLE IF NOT EXISTS gallery_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_id UUID REFERENCES gallery_images(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for gallery_images
-- All authenticated users can view images
CREATE POLICY "Anyone can view gallery images"
ON gallery_images FOR SELECT
USING (auth.role() = 'authenticated');

-- Users can insert their own images
CREATE POLICY "Users can insert own gallery images"
ON gallery_images FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own images
CREATE POLICY "Users can update own gallery images"
ON gallery_images FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own images
CREATE POLICY "Users can delete own gallery images"
ON gallery_images FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for gallery_likes
-- All authenticated users can view likes
CREATE POLICY "Anyone can view gallery likes"
ON gallery_likes FOR SELECT
USING (auth.role() = 'authenticated');

-- Users can insert their own likes
CREATE POLICY "Users can insert own gallery likes"
ON gallery_likes FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own likes
CREATE POLICY "Users can delete own gallery likes"
ON gallery_likes FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for gallery_comments
-- All authenticated users can view comments
CREATE POLICY "Anyone can view gallery comments"
ON gallery_comments FOR SELECT
USING (auth.role() = 'authenticated');

-- Users can insert their own comments
CREATE POLICY "Users can insert own gallery comments"
ON gallery_comments FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete own gallery comments"
ON gallery_comments FOR DELETE
USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_gallery_images_album_month ON gallery_images(album_month);
CREATE INDEX IF NOT EXISTS idx_gallery_images_user_id ON gallery_images(user_id);
CREATE INDEX IF NOT EXISTS idx_gallery_images_created_at ON gallery_images(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_likes_image_id ON gallery_likes(image_id);
CREATE INDEX IF NOT EXISTS idx_gallery_likes_user_id ON gallery_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_gallery_comments_image_id ON gallery_comments(image_id);
CREATE INDEX IF NOT EXISTS idx_gallery_comments_user_id ON gallery_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_gallery_comments_created_at ON gallery_comments(created_at DESC);

-- Storage bucket creation (run via Supabase Dashboard Storage section):
-- 1. Go to Storage in Supabase Dashboard
-- 2. Click "New bucket"
-- 3. Name: gallery-images
-- 4. Check "Public bucket" to make it publicly accessible
-- 5. Click "Create bucket"

-- Storage policies for gallery-images bucket
-- Note: These policies assume the bucket is named 'gallery-images'
-- and files are stored as: gallery-images/{album_month}/{user_id}/{filename}

CREATE POLICY "Users can upload gallery images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'gallery-images' AND
  auth.uid()::text = (storage.foldername(name))[2]
);

CREATE POLICY "Anyone can view gallery images"
ON storage.objects FOR SELECT
USING (bucket_id = 'gallery-images');

CREATE POLICY "Users can update own gallery images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'gallery-images' AND
  auth.uid()::text = (storage.foldername(name))[2]
)
WITH CHECK (
  bucket_id = 'gallery-images' AND
  auth.uid()::text = (storage.foldername(name))[2]
);

CREATE POLICY "Users can delete own gallery images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'gallery-images' AND
  auth.uid()::text = (storage.foldername(name))[2]
);

