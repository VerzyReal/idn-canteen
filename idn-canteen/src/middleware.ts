import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';

// ─── Route groups yang dilindungi ─────────────────────────────────────────────
const PROTECTED_USER_ROUTES  = ['/menu', '/checkout', '/orders', '/profile'];
const PROTECTED_ADMIN_ROUTES = ['/admin'];
const AUTH_ROUTES            = ['/login', '/register'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isUserRoute  = PROTECTED_USER_ROUTES.some(r  => pathname.startsWith(r));
  const isAdminRoute = PROTECTED_ADMIN_ROUTES.some(r => pathname.startsWith(r));
  const isAuthRoute  = AUTH_ROUTES.some(r => pathname.startsWith(r));

  const user = await getUserFromRequest(req);

  // ── Redirect jika sudah login dan mencoba akses halaman auth ──
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // ── Proteksi halaman user ──────────────────────────────────────
  if (isUserRoute && !user) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Proteksi halaman admin ─────────────────────────────────────
  if (isAdminRoute) {
    if (!user) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/?error=forbidden', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images|uploads).*)',
  ],
};

