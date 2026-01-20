import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

/**
 * POST /api/admin/clients/[id]/kyc/reject
 * Reject client KYC
 */
export async function POST(
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
        const client = await db.client.update({
            where: { id },
            data: {
                kycStatus: 'REJECTED',
            },
        });

        return NextResponse.json(client);
    } catch (error) {
        console.error('Failed to reject KYC:', error);
        return NextResponse.json({ error: 'Failed to reject KYC' }, { status: 500 });
    }
}
