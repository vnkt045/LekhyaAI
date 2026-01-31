import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET: List all tenants with their details
export async function GET(req: Request) {
    const session: any = await getServerSession(authOptions);

    // Only super admin can access
    if (!session || session.user.role !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const tenants = await db.company.findMany({
            include: {
                licenseKey: true,
                subscription: true,
                users: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                loginActivities: {
                                    orderBy: { loginTime: 'desc' },
                                    take: 1
                                }
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        users: true,
                        vouchers: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Transform data for frontend
        const tenantsData = tenants.map(tenant => ({
            id: tenant.id,
            name: tenant.name,
            slug: tenant.slug,
            email: tenant.email,
            gstin: tenant.gstin,
            licenseKey: tenant.licenseKey?.key || 'Not Assigned',
            licenseStatus: tenant.licenseKey?.status || 'NONE',
            paymentStatus: tenant.licenseKey?.paymentStatus || 'N/A',
            userCount: tenant._count.users,
            voucherCount: tenant._count.vouchers,
            lastLogin: tenant.users[0]?.user?.loginActivities[0]?.loginTime || null,
            createdAt: tenant.createdAt
        }));

        return NextResponse.json({ tenants: tenantsData });
    } catch (error) {
        console.error('Failed to fetch tenants:', error);
        return NextResponse.json({ error: 'Failed to fetch tenants' }, { status: 500 });
    }
}

// POST: Update tenant status (enable/disable, payment status)
export async function POST(req: Request) {
    const session: any = await getServerSession(authOptions);

    if (!session || session.user.role !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const { tenantId, licenseStatus, paymentStatus } = await req.json();

        // Find the license key for this tenant
        const licenseKey = await db.licenseKey.findFirst({
            where: { companyId: tenantId }
        });

        if (!licenseKey) {
            return NextResponse.json({ error: 'License key not found for this tenant' }, { status: 404 });
        }

        // Update license status
        const updated = await db.licenseKey.update({
            where: { id: licenseKey.id },
            data: {
                status: licenseStatus || licenseKey.status,
                paymentStatus: paymentStatus || licenseKey.paymentStatus,
                lastUsed: new Date()
            }
        });

        return NextResponse.json({ success: true, licenseKey: updated });
    } catch (error) {
        console.error('Failed to update tenant:', error);
        return NextResponse.json({ error: 'Failed to update tenant' }, { status: 500 });
    }
}
