import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';

/**
 * GET /api/admin/auth/session
 * Get current admin session
 */
export async function GET(req: Request) {
    try {
        const cookieStore = await cookies();
        const adminSessionId = cookieStore.get('admin_session')?.value;

        if (!adminSessionId) {
            return NextResponse.json({ authenticated: false }, { status: 401 });
        }

        const adminUser = await db.adminUser.findUnique({
            where: { id: adminSessionId },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                isActive: true,
            },
        });

        if (!adminUser || !adminUser.isActive) {
            return NextResponse.json({ authenticated: false }, { status: 401 });
        }

        return NextResponse.json({
            authenticated: true,
            user: adminUser,
        });
    } catch (error) {
        console.error('Admin session error:', error);
        return NextResponse.json({ authenticated: false }, { status: 500 });
    }
}
