import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

/**
 * PUT /api/admin/client-users/[userId]/rbac
 * Update user RBAC permissions
 */
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const cookieStore = await cookies();
        const adminSessionId = cookieStore.get('admin_session')?.value;

        if (!adminSessionId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { moduleAccess } = body;
        const { userId } = await params;

        const user = await db.clientUser.update({
            where: { id: userId },
            data: {
                moduleAccess: JSON.stringify(moduleAccess),
            },
        });

        return NextResponse.json({
            ...user,
            moduleAccess: JSON.parse(user.moduleAccess),
        });
    } catch (error) {
        console.error('Failed to update RBAC:', error);
        return NextResponse.json({ error: 'Failed to update RBAC' }, { status: 500 });
    }
}
