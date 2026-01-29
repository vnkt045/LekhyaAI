
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
    const session: any = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const accountId = session.user.accountId;

    if (!accountId) {
        return NextResponse.json({ error: 'No account linked' }, { status: 403 });
    }

    try {
        const orders = await db.purchaseOrder.findMany({
            where: {
                partyId: accountId
            },
            include: {
                items: true,
                bills: {
                    include: {
                        bill: { select: { voucherNumber: true, date: true, totalCredit: true } }
                    }
                }
            },
            orderBy: { date: 'desc' }
        });

        return NextResponse.json(orders);
    } catch (error) {
        console.error('Portal orders error:', error);
        return NextResponse.json({ error: 'Failed to fetch purchase orders' }, { status: 500 });
    }
}
