import { createServerClient } from '@supabase/ssr';
import { cookies, headers } from 'next/headers';

// wrapper used by server components, route handlers and middleware
export function createServerSupabase() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: async (name: string) => {
          const cookieStore = await cookies();
          return cookieStore.get(name)?.value;
        },
        set: async (name: string, value: string, options: any) => {
          (await cookies()).set(name, value, options);
        },
        remove: async (name: string, options: any) => {
          (await cookies()).set(name, '', { ...options, maxAge: 0 });
        },
      },
    }
  );
}
