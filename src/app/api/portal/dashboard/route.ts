
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
    const session: any = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Portal Access Control
    // Allow admins to view for testing, but primarily for PORTAL_USER with accountId
    const accountId = session.user.accountId;

    if (!accountId && session.user.role !== 'admin') {
        return NextResponse.json({ error: 'No account linked to user' }, { status: 403 });
    }

    // If admin is browsing, maybe passed as query param? 
    // For now, assume this route is for the logged in portal user context.

    if (!accountId) {
        return NextResponse.json({ message: 'Admin view not implemented for portal dashboard specific route' });
    }

    try {
        const [quotes, orders, invoices, paymentPending] = await Promise.all([
            // Recent Quotes
            db.quote.findMany({
                where: { partyId: accountId, status: { not: 'CONVERTED' } },
                orderBy: { date: 'desc' },
                take: 5
            }),
            // Open Orders
            db.salesOrder.findMany({
                where: { partyId: accountId, status: 'OPEN' },
                orderBy: { date: 'desc' },
                take: 5
            }),
            // Recent Invoices
            db.voucher.findMany({
                where: {
                    voucherType: 'SALES',
                    entries: {
                        some: { accountId: accountId }
                    }
                },
                orderBy: { date: 'desc' },
                take: 5,
                include: { entries: true }
            }),
            // Total Outstanding (Simplified)
            db.account.findUnique({
                where: { id: accountId },
                select: { balance: true }
            })
        ]);

        return NextResponse.json({
            overview: {
                balance: paymentPending?.balance || 0,
                openOrdersCount: orders.length,
                activeQuotesCount: quotes.length
            },
            recentQuotes: quotes,
            recentOrders: orders,
            recentInvoices: invoices
        });
    } catch (error) {
        console.error('Portal dashboard error:', error);
        return NextResponse.json({ error: 'Failed to load dashboard' }, { status: 500 });
    }
}
