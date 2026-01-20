import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

/**
 * GET /api/admin/licenses
 * List all licenses
 */
export async function GET(req: Request) {
    try {
        const cookieStore = await cookies();
        const adminSessionId = cookieStore.get('admin_session')?.value;

        if (!adminSessionId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const licenses = await db.client.findMany({
            where: {
                licenseKey: {
                    not: null,
                },
            },
            select: {
                id: true,
                companyName: true,
                licenseKey: true,
                subscriptionPlan: true,
                licenseStatus: true,
                subscriptionStart: true,
                subscriptionEnd: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(licenses);
    } catch (error) {
        console.error('Failed to fetch licenses:', error);
        return NextResponse.json({ error: 'Failed to fetch licenses' }, { status: 500 });
    }
}
