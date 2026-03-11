-- ============================================
-- P0-03: Database Indexes for Performance
-- ============================================
-- IMPORTANT: Execute this in Supabase Dashboard → SQL Editor
-- These indexes improve query performance for the most common operations

-- Index 1: Optimize user property queries (my-properties page)
-- This makes getUserPropertiesFromSupabase() fast
CREATE INDEX IF NOT EXISTS idx_properties_owner_id
ON properties(owner_id);

-- Index 2: Optimize status filtering (browse page)
-- This makes queries like "WHERE status = 'available'" fast
CREATE INDEX IF NOT EXISTS idx_properties_status
ON properties(status);

-- Index 3: Optimize sorting by creation date (browse page)
-- This makes ORDER BY created_at DESC fast
CREATE INDEX IF NOT EXISTS idx_properties_created_at
ON properties(created_at DESC);

-- Index 4: Composite index for browse page (status + created_at)
-- This optimizes the common query pattern in the browse page:
-- SELECT * FROM properties WHERE status = 'available' ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_properties_status_created_at
ON properties(status, created_at DESC);

-- Index 5: Category filtering
CREATE INDEX IF NOT EXISTS idx_properties_category
ON properties(category);

-- Index 6: Price range queries
CREATE INDEX IF NOT EXISTS idx_properties_price
ON properties(price);

-- Verification: Check existing indexes
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'properties'
ORDER BY indexname;

-- Optional: Check index usage statistics (after running queries)
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE tablename = 'properties'
ORDER BY idx_scan DESC;
