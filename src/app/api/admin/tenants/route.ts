import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/admin/tenants
 * List all tenants
 */
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin (you might want to add a specific admin role check)
    const user = await db.user.findUnique({
        where: { email: session.user?.email || '' },
    });

    if (user?.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    try {
        const tenants = await db.tenant.findMany({
            include: {
                rbacConfig: true,
                provisioningJobs: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(tenants);
    } catch (error) {
        console.error('Failed to fetch tenants:', error);
        return NextResponse.json({ error: 'Failed to fetch tenants' }, { status: 500 });
    }
}

/**
 * POST /api/admin/tenants
 * Create a new tenant and start provisioning
 */
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.user.findUnique({
        where: { email: session.user?.email || '' },
    });

    if (user?.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { name, subdomain, subscriptionPlan, maxUsers, enabledModules, expiresAt } = body;

        if (!name || !subscriptionPlan || !maxUsers || !enabledModules) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Import provisioning service
        const { startProvisioning } = await import('@/lib/provisioning');

        // Start provisioning
        const result = await startProvisioning({
            name,
            subdomain,
            subscriptionPlan,
            maxUsers,
            enabledModules: JSON.parse(enabledModules),
            expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error('Failed to create tenant:', error);
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Failed to create tenant'
        }, { status: 500 });
    }
}
