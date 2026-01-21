-- Add phone_number column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Add comment to explain the field
COMMENT ON COLUMN profiles.phone_number IS 'User phone number for WhatsApp group communication';
