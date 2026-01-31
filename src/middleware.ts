import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Protected API routes that require permission checks
const protectedRoutes = [
    { path: '/api/vouchers', resource: 'vouchers', action: 'create' },
    { path: '/api/accounts', resource: 'accounts', action: 'create' },
    { path: '/api/masters', resource: 'masters', action: 'create' },
    { path: '/api/reports', resource: 'reports', action: 'view' },
    { path: '/api/users', resource: 'users', action: 'manage' },
    { path: '/api/rbac', resource: 'rbac', action: 'manage' }
];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    console.log('[MIDDLEWARE] Processing path:', pathname);

    // Multi-Tenant Routing: Extract tenant slug from /masters/:slug/* paths
    const tenantMatch = pathname.match(/^\/masters\/([^\/]+)/);
    if (tenantMatch) {
        const tenantSlug = tenantMatch[1];

        // Add tenant slug to request headers for downstream use
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-tenant-slug', tenantSlug);

        console.log('[MIDDLEWARE] Tenant slug detected:', tenantSlug);

        // Continue with tenant context
        const response = NextResponse.next({
            request: {
                headers: requestHeaders
            }
        });

        response.headers.set('x-tenant-slug', tenantSlug);
        return response;
    }

    // Super Admin Route Protection
    if (pathname.startsWith('/admin-super') || pathname.startsWith('/api/admin-super')) {
        const token = await getToken({ req: request });

        if (!token) {
            if (pathname.startsWith('/api')) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
            return NextResponse.redirect(new URL('/login', request.url));
        }

        // Only SUPER_ADMIN role can access
        if (token.role !== 'SUPER_ADMIN') {
            if (pathname.startsWith('/api')) {
                return NextResponse.json({ error: 'Forbidden - Super Admin access required' }, { status: 403 });
            }
            return NextResponse.redirect(new URL('/', request.url));
        }

        // Allow super admin to proceed
        return NextResponse.next();
    }

    // Route to admin middleware for all admin routes
    if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
        console.log('[MIDDLEWARE] Routing to admin middleware');

        // Add pathname to headers so layout can detect admin routes
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-pathname', pathname);

        const { adminMiddleware } = await import('@/lib/admin-middleware');
        const response = await adminMiddleware(request);

        // Add pathname header to response as well
        if (response) {
            response.headers.set('x-pathname', pathname);
        }

        return response;
    }

    // 1. License Check (REMOVED AS PER REQUEST)
    /*
    const isPublicPath =
        pathname.startsWith('/_next') ||
        pathname.startsWith('/static') ||
        pathname.startsWith('/api/auth') ||
        pathname.startsWith('/activate') ||
        pathname.startsWith('/api/activate') ||
        pathname.startsWith('/owner') ||
        pathname.startsWith('/api/owner');

    const hasLicense = request.cookies.get('lekhya_license_status');

    if (!isPublicPath && !hasLicense) {
        return NextResponse.redirect(new URL('/activate', request.url));
    }
    */

    const isPublicPath =
        pathname.startsWith('/_next') ||
        pathname.startsWith('/static') ||
        pathname.startsWith('/api/auth') ||
        pathname.startsWith('/activate') ||
        pathname.startsWith('/owner'); // Re-declare for subsequent logic usage if needed, or inline it.

    // 2. Auth Check - STRICT ENFORCEMENT
    // Use getToken instead of getServerSession for Edge compatibility
    const token = await getToken({ req: request });

    // If no session exists
    if (!token) {
        // Allow public paths (login, assets, etc.) to pass
        if (isPublicPath || pathname === '/login' || pathname === '/api/auth/signin') {
            return NextResponse.next();
        }

        // For API routes, return 401 Unauthorized
        if (pathname.startsWith('/api')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // For all other PAGE routes, strictly redirect to Login
        // This fixes the "app exposed" issue where protected pages were rendering
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // If session exists, prevent them from accessing /login implies they should be on dashboard
    if (token && pathname === '/login') {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // 3. RBAC Check (Edge Compatible Logic)
    if (token) {
        const route = protectedRoutes.find(r => pathname.startsWith(r.path));
        if (route) {
            // Simplified RBAC logic that runs on Edge (no DB calls)
            // Replicates checkPermission logic using token claims
            const role = token.role as string;
            let hasPermission = false;

            if (role === 'admin') {
                hasPermission = true;
            } else if (role === 'accountant' || role === 'user') {
                // Deny access to user management and system settings
                // Allow everything else
                // Treat default 'user' as 'accountant' for now to prevent easy blockers
                if (route.resource !== 'users' && route.resource !== 'settings') {
                    hasPermission = true;
                }
            } else if (role === 'viewer') {
                // Viewer has read-only access (view/read)
                if (route.action === 'read' || route.action === 'view') {
                    hasPermission = true;
                }
            }

            if (!hasPermission) {
                // Log for debugging
                console.log(`[RBAC] Denied: Role=${role}, Resource=${route.resource}, Action=${route.action}`);
                return NextResponse.json({ error: 'Forbidden - Insufficient permissions' }, { status: 403 });
            }
        }
    }

    // Prevent browser caching for all protected routes
    const response = NextResponse.next();

    if (!isPublicPath) {
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');
    }

    return response;
}

export const config = {
    matcher: [
        // Only run middleware on these specific paths, excluding admin entirely (handled by if check)
        '/',
        '/login',
        '/api/vouchers/:path*',
        '/api/accounts/:path*',
        '/api/masters/:path*',
        '/api/reports/:path*',
        '/api/users/:path*',
        '/api/rbac/:path*',
        '/vouchers/:path*',
        '/accounts/:path*',
        '/reports/:path*',
        '/masters/:path*',
        '/settings/:path*',
        '/dashboard/:path*',
        '/users/:path*',
        '/setup/:path*',
        '/inventory/:path*',
        '/banking/:path*',
        '/gst/:path*',
        '/payroll/:path*',
    ]
};
