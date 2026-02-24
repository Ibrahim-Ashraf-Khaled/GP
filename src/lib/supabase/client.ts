import { createBrowserClient } from '@supabase/ssr';
import { STORAGE_BUCKET as _STORAGE_BUCKET } from '../supabase';

// browser client is singleton
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// keep storage helpers here so they use the same client instance
export const STORAGE_BUCKET = _STORAGE_BUCKET;

export async function uploadImage(file: File, pathPrefix: string = ''): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${pathPrefix}${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`فشل رفع الصورة: ${uploadError.message}`);
  }

  const { data } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(fileName);

  return data.publicUrl;
}

export async function deleteImage(url: string): Promise<void> {
  const fileName = url.split('/').pop();
  if (!fileName) return;

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove([fileName]);

  if (error) {
    console.error('Error deleting image:', error);
  }
}