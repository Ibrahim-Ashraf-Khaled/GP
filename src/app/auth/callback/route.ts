import { createServerSupabase } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const redirectTo = searchParams.get('redirect') || '/';

  if (!code) {
    return NextResponse.redirect(new URL('/auth?mode=login', origin));
  }

  // the helper reads/writes cookies via next/headers internally
  const supabase = createServerSupabase();


  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL(`/auth?mode=login&error=${encodeURIComponent(error.message)}`, origin)
    );
  }

  return NextResponse.redirect(new URL(redirectTo, origin));
}
