-- Add whatsapp_link column to teams table
ALTER TABLE teams 
ADD COLUMN IF NOT EXISTS whatsapp_link TEXT;

-- Add comment to document the field
COMMENT ON COLUMN teams.whatsapp_link IS 'WhatsApp group link for the team. Visible to all team members.';
