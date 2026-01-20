import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

/**
 * GET /api/admin/clients/[id]/users
 * Get all users for a client
 */
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const cookieStore = await cookies();
        const adminSessionId = cookieStore.get('admin_session')?.value;

        if (!adminSessionId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const users = await db.clientUser.findMany({
            where: { clientId: id },
        });

        // Parse moduleAccess JSON
        const parsedUsers = users.map(user => ({
            ...user,
            moduleAccess: user.moduleAccess ? JSON.parse(user.moduleAccess) : {},
        }));

        return NextResponse.json(parsedUsers);
    } catch (error) {
        console.error('Failed to fetch users:', error);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}
