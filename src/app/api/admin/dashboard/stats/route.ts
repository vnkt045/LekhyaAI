import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

/**
 * GET /api/admin/dashboard/stats
 * Get dashboard statistics
 */
export async function GET(req: Request) {
    try {
        // Verify admin session
        const cookieStore = await cookies();
        const adminSessionId = cookieStore.get('admin_session')?.value;

        if (!adminSessionId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get stats
        const totalClients = await db.client.count();
        const activeClients = await db.client.count({
            where: { status: 'ACTIVE' },
        });
        const pendingKYC = await db.client.count({
            where: { kycStatus: 'PENDING' },
        });

        // Get expiring licenses (next 30 days)
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        const expiringLicenses = await db.client.count({
            where: {
                subscriptionEnd: {
                    lte: thirtyDaysFromNow,
                    gte: new Date(),
                },
            },
        });

        return NextResponse.json({
            totalClients,
            activeClients,
            pendingKYC,
            expiringLicenses,
        });
    } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
