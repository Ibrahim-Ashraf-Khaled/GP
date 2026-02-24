import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/rateLimit';

const protectedPaths = [
  '/api/properties',
  '/api/bookings',
  '/api/payments',
  '/api/messages'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const isProtected = protectedPaths.some(path => pathname.startsWith(path));
  
  if (isProtected) {
    const limiter = await rateLimit(request);
    
    if (!limiter.success) {
      return new NextResponse(
        JSON.stringify({
          error: 'عدد الطلبات كبير جداً. حاول مرة أخرى لاحقاً',
          retryAfter: Math.ceil((limiter.reset - Date.now()) / 1000)
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': limiter.limit.toString(),
            'X-RateLimit-Remaining': limiter.remaining.toString(),
            'X-RateLimit-Reset': limiter.reset.toString(),
            'Retry-After': Math.ceil((limiter.reset - Date.now()) / 1000).toString()
          }
        }
      );
    }
  }

  const response = NextResponse.next({
    request,
  });

  const supabase = createServerSupabase();

  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.warn('middleware supabase.getSession error:', error.message || error);
  }

  if (isProtected) {
    const limiter = await rateLimit(request);
    response.headers.set('X-RateLimit-Limit', limiter.limit.toString());
    response.headers.set('X-RateLimit-Remaining', limiter.remaining.toString());
    response.headers.set('X-RateLimit-Reset', limiter.reset.toString());
  }

  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://apis.google.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https: http:",
    "media-src 'self' blob:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ');

  response.headers.set('Content-Security-Policy', csp);

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};