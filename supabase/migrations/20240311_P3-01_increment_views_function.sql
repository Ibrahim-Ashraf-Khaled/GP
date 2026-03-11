-- ============================================
-- P3-01: Secure increment_property_views function
-- ============================================
-- IMPORTANT: Execute this in Supabase Dashboard → SQL Editor
-- This function safely increments property views without exposing
-- sensitive data through direct UPDATE operations

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS increment_property_views(uuid);

-- Create the function with SECURITY DEFINER
-- SECURITY DEFINER means it runs with the privileges of the function owner,
-- not the calling user. This is safe here because we only increment a counter.
CREATE OR REPLACE FUNCTION increment_property_views(property_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE properties
    SET views_count = views_count + 1,
        last_viewed_at = now()
    WHERE id = property_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_property_views(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_property_views(uuid) TO anon;

-- Verification: Check the function exists and has SECURITY DEFINER
SELECT
    p.proname,
    p.prosrc,
    CASE
        WHEN p.prosecdef THEN 'SECURITY DEFINER (runs as function owner)'
        ELSE 'SECURITY INVOKER (runs as calling user)'
    END as security_type
FROM pg_proc p
WHERE p.proname = 'increment_property_views';

-- Usage in TypeScript/JavaScript:
-- await supabase.rpc('increment_property_views', { property_id: 'your-property-id' });
