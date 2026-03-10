-- Create properties-images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'properties-images',
    'properties-images',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

-- Grant INSERT access to authenticated users for their own folder
DROP POLICY IF EXISTS "Authenticated users can upload property images" ON storage.objects;
CREATE POLICY "Authenticated users can upload property images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'properties-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Grant DELETE access to authenticated users for their own folder
DROP POLICY IF EXISTS "Authenticated users can delete property images" ON storage.objects;
CREATE POLICY "Authenticated users can delete property images"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'properties-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Grant SELECT access to all users (public bucket)
DROP POLICY IF EXISTS "Public can view property images" ON storage.objects;
CREATE POLICY "Public can view property images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'properties-images');

NOTIFY pgrst, 'reload schema';
