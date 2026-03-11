-- ============================================
-- P0-01: RLS Policies on properties table
-- ============================================
-- IMPORTANT: Execute this in Supabase Dashboard → SQL Editor
-- This enables Row Level Security and creates policies to ensure
-- users can only access their own properties

-- Step 1: Enable RLS on the properties table
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Step 2: Remove any existing policies (to avoid conflicts)
DROP POLICY IF EXISTS "owner_select_own" ON properties;
DROP POLICY IF EXISTS "public_select_available" ON properties;
DROP POLICY IF EXISTS "owner_insert_own" ON properties;
DROP POLICY IF EXISTS "owner_update_own" ON properties;
DROP POLICY IF EXISTS "owner_delete_own" ON properties;

-- Policy 1: Users can only see their own properties in my-properties page
CREATE POLICY "owner_select_own"
ON properties FOR SELECT
USING (owner_id = auth.uid());

-- Policy 2: Available properties are visible to everyone (for browse page)
CREATE POLICY "public_select_available"
ON properties FOR SELECT
USING (status = 'available');

-- Policy 3: Users can only insert properties with their own owner_id
CREATE POLICY "owner_insert_own"
ON properties FOR INSERT
WITH CHECK (owner_id = auth.uid());

-- Policy 4: Users can only update their own properties
CREATE POLICY "owner_update_own"
ON properties FOR UPDATE
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- Policy 5: Users can only delete their own properties
CREATE POLICY "owner_delete_own"
ON properties FOR DELETE
USING (owner_id = auth.uid());

-- Verification: Check existing policies
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'properties';
