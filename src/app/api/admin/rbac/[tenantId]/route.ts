import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/admin/rbac/[tenantId]
 * Get RBAC configuration for a tenant
 */
export async function GET(
    req: Request,
    { params }: { params: Promise<{ tenantId: string }> }
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
        const { tenantId } = await params;
        const rbacConfig = await db.rBACConfig.findUnique({
            where: { tenantId },
        });

        if (!rbacConfig) {
            return NextResponse.json({ error: 'RBAC config not found' }, { status: 404 });
        }

        // Parse permissions from JSON string
        const permissions = rbacConfig.permissions ? JSON.parse(rbacConfig.permissions) : {};

        return NextResponse.json({
            ...rbacConfig,
            permissions,
        });
    } catch (error) {
        console.error('Failed to fetch RBAC config:', error);
        return NextResponse.json({ error: 'Failed to fetch RBAC config' }, { status: 500 });
    }
}

/**
 * PUT /api/admin/rbac/[tenantId]
 * Update RBAC configuration for a tenant
 */
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ tenantId: string }> }
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
        const { permissions } = body;

        if (!permissions) {
            return NextResponse.json({ error: 'Missing permissions' }, { status: 400 });
        }

        const { tenantId } = await params;
        const updated = await db.rBACConfig.update({
            where: { tenantId },
            data: {
                permissions: JSON.stringify(permissions),
            },
        });

        return NextResponse.json({
            ...updated,
            permissions: JSON.parse(updated.permissions),
        });
    } catch (error) {
        console.error('Failed to update RBAC config:', error);
        return NextResponse.json({ error: 'Failed to update RBAC config' }, { status: 500 });
    }
}
