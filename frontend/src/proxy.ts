import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE } from '@/lib/session';

const PUBLIC_PATHS = ['/', '/login', '/register'];

export default function proxy(request: NextRequest) {
  const isPublicPath = PUBLIC_PATHS.includes(request.nextUrl.pathname);
  const hasSession = request.cookies.has(SESSION_COOKIE);

  if (!isPublicPath && !hasSession) return NextResponse.redirect(new URL('/login', request.url));

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)'],
};
