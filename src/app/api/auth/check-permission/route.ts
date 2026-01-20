import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Middleware to check permissions
export async function checkPermission(session: any, resource: string, action: string): Promise<boolean> {
    if (!session?.user?.email) return false;

    try {
        // Fetch user with role
        const user = await db.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) return false;

        // Simple role-based access control
        // Admin has access to everything
        if (user.role === 'admin') return true;

        // Accountant has access to most accounting features
        if (user.role === 'accountant') {
            // Deny access to user management and system settings
            if (resource === 'users' || resource === 'settings') return false;
            return true;
        }

        // Viewer has read-only access
        if (user.role === 'viewer') {
            return action === 'read' || action === 'view';
        }

        return false;
    } catch (error) {
        console.error('Permission check error:', error);
        return false;
    }
}

// POST /api/auth/check-permission - Check if user has specific permission
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { resource, action } = await req.json();

        const hasPermission = await checkPermission(session, resource, action);

        return NextResponse.json({ hasPermission });
    } catch (error) {
        console.error('Permission check error:', error);
        return NextResponse.json({ error: 'Failed to check permission' }, { status: 500 });
    }
}
