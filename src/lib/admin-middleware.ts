import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Admin-specific middleware
 * Handles authentication for admin panel routes only
 */
export async function adminMiddleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    console.log('[ADMIN MIDDLEWARE] Processing:', pathname);

    // Allow admin login page and API auth routes
    if (pathname === '/admin/login' || pathname.startsWith('/api/admin/auth')) {
        console.log('[ADMIN MIDDLEWARE] Allowing public admin route');
        return NextResponse.next();
    }

    // Check admin session for all other admin routes
    const cookieStore = await cookies();
    const adminSessionId = cookieStore.get('admin_session')?.value;

    if (!adminSessionId) {
        console.log('[ADMIN MIDDLEWARE] No session, redirecting to /admin/login');
        return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // Session exists, allow access
    // Note: Full validation happens in API routes, not middleware
    console.log('[ADMIN MIDDLEWARE] Valid session found, allowing access');
    return NextResponse.next();
}
