-- ============================================
-- P3-02: get_user_property_stats function
-- ============================================
-- IMPORTANT: Execute this in Supabase Dashboard → SQL Editor
-- This function aggregates all property statistics in a single query
-- Replaces 4 separate queries for better performance

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_user_property_stats(uuid);

-- Create the function with SECURITY DEFINER
-- SECURITY DEFINER allows users to see their own aggregated stats
CREATE OR REPLACE FUNCTION get_user_property_stats(user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result json;
BEGIN
    SELECT json_build_object(
        'total_properties', COUNT(*),
        'available_count',  COUNT(*) FILTER (WHERE status = 'available'),
        'rented_count',     COUNT(*) FILTER (WHERE status = 'rented'),
        'total_views',      SUM(views_count)
    ) INTO result
    FROM properties
    WHERE owner_id = user_id;

    RETURN result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_property_stats(uuid) TO authenticated;

-- Verification: Check the function exists
SELECT
    p.proname,
    p.prosrc,
    CASE
        WHEN p.prosecdef THEN 'SECURITY DEFINER'
        ELSE 'SECURITY INVOKER'
    END as security_type
FROM pg_proc p
WHERE p.proname = 'get_user_property_stats';

-- Test the function (replace with a real user_id from your database)
-- SELECT get_user_property_stats('your-user-id-here') as stats;
-- Expected output:
-- {
--   "total_properties": 5,
--   "available_count": 3,
--   "rented_count": 2,
--   "total_views": 150
-- }

-- Usage in TypeScript/JavaScript:
-- const { data, error } = await supabase.rpc('get_user_property_stats', { user_id: userId });
-- if (data) {
--   const stats = data as {
--     total_properties: number;
--     available_count: number;
//     rented_count: number;
//     total_views: number;
//   };
//   console.log(stats);
// }
