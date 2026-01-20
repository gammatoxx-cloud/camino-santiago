-- Fix: Allow users to view profiles of users who have commented on or uploaded gallery images
-- This fixes the issue where comment usernames show as "Usuario" instead of the actual name

-- Add RLS policy to allow viewing profiles of gallery commenters
-- Any authenticated user can view profiles of users who have commented on gallery images
CREATE POLICY "Users can view gallery commenter profiles" ON profiles FOR SELECT 
  USING (
    auth.uid() = id
    OR (
      auth.role() = 'authenticated'
      AND EXISTS (
        SELECT 1 
        FROM gallery_comments gc
        WHERE gc.user_id = profiles.id
      )
    )
  );

-- Also allow viewing profiles of users who uploaded gallery images
-- Any authenticated user can view profiles of users who have uploaded gallery images
CREATE POLICY "Users can view gallery image uploader profiles" ON profiles FOR SELECT 
  USING (
    auth.uid() = id
    OR (
      auth.role() = 'authenticated'
      AND EXISTS (
        SELECT 1 
        FROM gallery_images gi
        WHERE gi.user_id = profiles.id
      )
    )
  );
