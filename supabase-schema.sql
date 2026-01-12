-- Create pastes table for storing encrypted pastes
CREATE TABLE IF NOT EXISTS pastes (
  id TEXT PRIMARY KEY,
  encrypted_content TEXT NOT NULL,
  language TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- Create index on expires_at for efficient cleanup queries
CREATE INDEX IF NOT EXISTS idx_pastes_expires_at ON pastes(expires_at);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_pastes_created_at ON pastes(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE pastes ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert pastes (anonymous paste creation)
CREATE POLICY "Anyone can create pastes"
  ON pastes
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Policy: Anyone can read pastes (public access)
CREATE POLICY "Anyone can read pastes"
  ON pastes
  FOR SELECT
  TO public
  USING (true);

-- Policy: Anyone can delete expired pastes
CREATE POLICY "Anyone can delete expired pastes"
  ON pastes
  FOR DELETE
  TO public
  USING (expires_at IS NOT NULL AND expires_at < NOW());

-- Optional: Create a function to automatically clean up expired pastes
CREATE OR REPLACE FUNCTION cleanup_expired_pastes()
RETURNS void AS $$
BEGIN
  DELETE FROM pastes
  WHERE expires_at IS NOT NULL
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Optional: Schedule automatic cleanup (requires pg_cron extension)
-- This can be set up in Supabase Dashboard > Database > Cron Jobs
-- SELECT cron.schedule(
--   'cleanup-expired-pastes',
--   '0 * * * *', -- Run every hour
--   $$ SELECT cleanup_expired_pastes(); $$
-- );
