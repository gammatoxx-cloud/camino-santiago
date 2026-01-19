-- Database function to allow admin to get all completions for a user
-- This function bypasses RLS and returns all completion data for any user
-- Run this in your Supabase SQL Editor

CREATE OR REPLACE FUNCTION admin_get_user_completions(user_id_param UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_email TEXT := 'edith.fuentes.2022@gmail.com';
  current_user_email TEXT;
  result JSON;
BEGIN
  -- Get the current user's email
  SELECT email INTO current_user_email
  FROM auth.users
  WHERE id = auth.uid();
  
  -- Check if the current user is the admin
  IF current_user_email IS NULL OR LOWER(current_user_email) != LOWER(admin_email) THEN
    RAISE EXCEPTION 'Only the admin can use this function';
  END IF;
  
  -- Build a JSON object with all completion data
  -- Handle case where tables might not exist or have no data
  SELECT json_build_object(
    'walk_completions', COALESCE(
      (SELECT json_agg(row_to_json(wc)) FROM walk_completions wc WHERE wc.user_id = user_id_param),
      '[]'::json
    ),
    'phase_unlocks', COALESCE(
      (SELECT json_agg(row_to_json(pu)) FROM phase_unlocks pu WHERE pu.user_id = user_id_param),
      '[]'::json
    ),
    'trail_completions', COALESCE(
      (SELECT json_agg(row_to_json(tc)) FROM trail_completions tc WHERE tc.user_id = user_id_param),
      '[]'::json
    ),
    'book_completions', COALESCE(
      (SELECT json_agg(row_to_json(bc)) FROM book_completions bc WHERE bc.user_id = user_id_param),
      '[]'::json
    ),
    'magnolias_hikes_completions', COALESCE(
      (SELECT json_agg(row_to_json(mhc)) FROM magnolias_hikes_completions mhc WHERE mhc.user_id = user_id_param),
      '[]'::json
    )
  ) INTO result;
  
  RETURN COALESCE(result, '{}'::json);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION admin_get_user_completions(UUID) TO authenticated;
