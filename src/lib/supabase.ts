// central index for supabase helpers; browser client is created separately so
// we can use a light typed client and share storage helpers.

export { supabase } from '@/lib/supabase/client';
export { createServerSupabase } from '@/lib/supabase/server';

// اسم الـ Storage Bucket للصور (exported for convenience)
export const STORAGE_BUCKET = 'properties-images';

// re-export upload/delete helpers from client, which also reference supabase
export { uploadImage, deleteImage } from '@/lib/supabase/client';
