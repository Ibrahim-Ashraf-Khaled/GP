-- ============================================
-- P3-03: Auto-updated_at trigger
-- ============================================
-- IMPORTANT: Execute this in Supabase Dashboard → SQL Editor
-- This trigger automatically updates the updated_at timestamp
-- whenever a row is modified, preventing manual timestamp errors

-- Step 1: Drop existing function if it exists
DROP FUNCTION IF EXISTS handle_updated_at() CASCADE;

-- Step 2: Create the trigger function
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Step 3: Drop existing trigger if it exists
DROP TRIGGER IF EXISTS set_updated_at ON properties;

-- Step 4: Create the trigger
-- This fires BEFORE each UPDATE on the properties table
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON properties
FOR EACH ROW
EXECUTE FUNCTION handle_updated_at();

-- Verification: Check the trigger exists
SELECT
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement,
    action_timing
FROM information_schema.triggers
WHERE event_object_table = 'properties'
  AND trigger_name = 'set_updated_at';

-- Verification: Check the function exists
SELECT
    p.proname,
    p.prosrc
FROM pg_proc p
WHERE p.proname = 'handle_updated_at';

-- Test the trigger
-- UPDATE properties SET title = 'Test' WHERE id = 'your-property-id';
-- SELECT updated_at FROM properties WHERE id = 'your-property-id';
-- The updated_at should automatically be set to the current timestamp

-- Note: After this trigger is set, you no longer need to manually set
-- updated_at in your updatePropertyInSupabase() function or anywhere else.
-- The database handles it automatically.
