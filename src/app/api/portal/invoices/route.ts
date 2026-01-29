
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

    if (!accountId) { // Admin or random user shouldn't access this
        return NextResponse.json({ error: 'No account linked' }, { status: 403 });
    }

    try {
        const invoices = await db.voucher.findMany({
            where: {
                voucherType: 'SALES',
                // Find vouchers where this account is invalid involved (as Debtor)
                // Since we don't have a direct "partyId" on Voucher, we rely on Entries.
                // Or if we added a direct relation? We didn't add direct relation on Voucher to Account as "Party".
                // But typically for Sales Voucher, one entry is the Debtor (Dr).
                entries: {
                    some: { accountId: accountId }
                }
            },
            include: {
                entries: true,
                items: true
            },
            orderBy: { date: 'desc' }
        });

        return NextResponse.json(invoices);
    } catch (error) {
        console.error('Portal invoices error:', error);
        return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
    }
}
