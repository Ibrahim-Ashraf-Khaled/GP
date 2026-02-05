import { createClient } from '@supabase/supabase-js';

// التحقق من وجود المتغيرات
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
        '⚠️ Missing Supabase environment variables.\n' +
        'Please add to .env.local:\n' +
        '  NEXT_PUBLIC_SUPABASE_URL=your_supabase_url\n' +
        '  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key\n' +
        '\nUsing placeholder values for development.'
    );
}

// إنشاء العميل (بدون typed database لتجنب مشاكل التوافق)
export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder',
    {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
        },
    }
);

// اسم الـ Storage Bucket للصور
export const STORAGE_BUCKET = 'properties-images';

// دوال مساعدة للتخزين
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
