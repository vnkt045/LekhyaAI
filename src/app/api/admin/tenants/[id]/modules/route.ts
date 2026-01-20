import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * PATCH /api/admin/tenants/[id]/modules
 * Toggle modules for a tenant
 */
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.user.findUnique({
        where: { email: session.user?.email || '' },
    });

    if (user?.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { enabledModules } = body;

        if (!enabledModules) {
            return NextResponse.json({ error: 'Missing enabledModules' }, { status: 400 });
        }

        const { id } = await params;
        const updated = await db.tenant.update({
            where: { id },
            data: {
                enabledModules: JSON.stringify(enabledModules),
            },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Failed to update modules:', error);
        return NextResponse.json({ error: 'Failed to update modules' }, { status: 500 });
    }
}
