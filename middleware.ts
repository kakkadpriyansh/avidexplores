import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Admin routes protection
    if (pathname.startsWith('/admin')) {
      if (!token || token.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/login?callbackUrl=' + pathname, req.url));
      }
    }

    // Dashboard routes protection
    if (pathname.startsWith('/dashboard')) {
      if (!token) {
        return NextResponse.redirect(new URL('/login?callbackUrl=' + pathname, req.url));
      }
    }

    // API routes protection
    if (pathname.startsWith('/api/admin')) {
      if (!token || token.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    // Protected API routes that require authentication
    const protectedApiRoutes = [
      '/api/bookings',
      '/api/testimonials',
      '/api/stories'
    ];

    if (protectedApiRoutes.some(route => pathname.startsWith(route))) {
      if (!token && req.method !== 'GET') {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Allow public routes
        if (
          pathname === '/' ||
          pathname.startsWith('/events') ||
          pathname.startsWith('/stories') ||
          pathname.startsWith('/about') ||
          pathname.startsWith('/contact') ||
          pathname === '/login' ||
          pathname === '/register' ||
          pathname.startsWith('/api/auth') ||
          pathname.startsWith('/api/events') ||
          pathname.startsWith('/api/stories') ||
          pathname.startsWith('/api/subscribers') ||
          pathname.startsWith('/api/teams')
        ) {
          return true;
        }

        // Require authentication for other routes
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};