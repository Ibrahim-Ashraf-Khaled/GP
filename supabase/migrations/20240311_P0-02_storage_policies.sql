-- ============================================
-- P0-02: Storage Bucket Policies for properties-images
-- ============================================
-- IMPORTANT: Execute this in Supabase Dashboard → SQL Editor
-- This creates policies to ensure users can only access their own image folders

-- Prerequisites:
-- 1. Make sure the bucket 'properties-images' exists in Supabase Storage
-- 2. If not, create it first:
--    INSERT INTO storage.buckets (id, name, public) VALUES ('properties-images', 'properties-images', true);

-- Remove any existing policies (to avoid conflicts)
DROP POLICY IF EXISTS "user_upload_own_folder" ON storage.objects;
DROP POLICY IF EXISTS "user_delete_own_folder" ON storage.objects;
DROP POLICY IF EXISTS "public_read" ON storage.objects;

-- Policy 1: Users can only upload to their own folder (USER_ID/filename)
CREATE POLICY "user_upload_own_folder"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'properties-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: Users can only delete from their own folder
CREATE POLICY "user_delete_own_folder"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'properties-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 3: Public read access (images are public)
CREATE POLICY "public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'properties-images');

-- Verification: Check existing policies on storage.objects
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
WHERE tablename = 'objects' AND schemaname = 'storage';
