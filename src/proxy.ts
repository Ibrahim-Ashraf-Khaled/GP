import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  const url = request.nextUrl;
  const path = url.pathname;

  // redirect parameter (default "/")
  const redirectTo = url.searchParams.get('redirect') ?? '/';

  // /login -> /auth?mode=login&redirect=...
  if (path === '/login') {
    const target = new URL('/auth', request.url);
    target.searchParams.set('mode', 'login');
    target.searchParams.set('redirect', redirectTo);
    return NextResponse.redirect(target);
  }

  // /register -> /auth?mode=signup&redirect=...
  if (path === '/register') {
    const target = new URL('/auth', request.url);
    target.searchParams.set('mode', 'signup');
    target.searchParams.set('redirect', redirectTo);
    return NextResponse.redirect(target);
  }

  const response = NextResponse.next();

  // Security Headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Content Security Policy (CSP)
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
    '/login',
    '/register',
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
