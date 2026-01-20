import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status'); // 'PENDING' | 'REGULARIZED' | 'ALL'

    try {
        const whereClause: any = {
            isPostDated: true
        };

        if (status === 'PENDING') {
            whereClause.regularizedDate = null;
        } else if (status === 'REGULARIZED') {
            whereClause.regularizedDate = { not: null };
        }

        const pdcs = await db.voucher.findMany({
            where: whereClause,
            include: {
                entries: {
                    include: { account: true },
                    where: {
                        OR: [
                            { debit: { gt: 0 } },
                            { credit: { gt: 0 } }
                        ]
                    }
                }
            },
            orderBy: { pdcDate: 'asc' }
        });

        // Transform for UI
        const data = pdcs.map((v: any) => ({
            id: v.id,
            voucherNumber: v.voucherNumber,
            date: v.date,
            pdcDate: v.pdcDate,
            amount: v.totalDebit, // Voucher totals should match
            narration: v.narration,
            status: v.regularizedDate ? 'Regularized' : 'Pending',
            // Try to find the party name (usually the one that differs from Cash/Bank)
            // This is a simplification.
            partyName: v.entries.find((e: any) => e.account.type !== 'Asset' || e.account.name.toLowerCase().includes('bank'))?.account.name || 'Unknown'
        }));

        return NextResponse.json(data);
    } catch (error) {
        console.error('Fetch PDC Error:', error);
        return NextResponse.json({ error: 'Failed to fetch PDCs' }, { status: 500 });
    }
}
