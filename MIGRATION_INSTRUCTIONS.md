# Migration Instructions

The migration `20260310150000_create_properties_images_bucket.sql` has been created locally.

## Option 1: Apply via Supabase Dashboard (Recommended)

1. Go to https://trrbabfexmjjqiwsdkji.supabase.co
2. Navigate to **SQL Editor** (in the left sidebar)
3. Click **New Query**
4. Paste the following SQL:

```sql
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
```

5. Click **Run** to execute

## Option 2: Apply via Supabase CLI

If you have Supabase CLI installed locally:

```bash
# Set environment variables (or use your .env.local)
export SUPABASE_DB_PASSWORD="sbp_eac2af33cf615eb6e19f78c9ec827b764285ea6a"

# Link to your remote project
supabase link --project-ref trrbabfexmjjqiwsdkji

# Push the migration
supabase db push
```

## Verification

After applying the migration, verify:

1. Go to **Storage** in the Supabase dashboard
2. You should see a bucket named `properties-images`
3. Click on it and check the **Policies** tab
4. You should see three policies:
   - Authenticated users can upload property images
   - Authenticated users can delete property images
   - Public can view property images
