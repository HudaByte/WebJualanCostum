-- Enable Realtime for products table
-- This allows clients to subscribe to changes in real-time
ALTER PUBLICATION supabase_realtime ADD TABLE products;

-- Enable Realtime for site_settings table
-- This allows clients to subscribe to settings changes in real-time
ALTER PUBLICATION supabase_realtime ADD TABLE site_settings;

-- Note: If the above commands fail, you may need to enable Realtime via Supabase Dashboard:
-- 1. Go to Database > Replication
-- 2. Find the table (products or site_settings)
-- 3. Toggle "Enable Realtime" to ON
--
-- Alternatively, you can use the Supabase Dashboard:
-- - Go to Table Editor
-- - Select the table
-- - Click on "Realtime" tab
-- - Enable "Enable Realtime" toggle

-- Verify Realtime is enabled (run this query to check)
-- SELECT schemaname, tablename 
-- FROM pg_publication_tables 
-- WHERE pubname = 'supabase_realtime';
