import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { startOfDay, endOfDay } from 'date-fns';

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date');

    const date = dateParam ? new Date(dateParam) : new Date();

    // Validate date
    if (isNaN(date.getTime())) {
        return NextResponse.json({ error: 'Invalid Date' }, { status: 400 });
    }

    try {
        const vouchers = await db.voucher.findMany({
            where: {
                date: {
                    gte: startOfDay(date),
                    lte: endOfDay(date)
                },
                isPostDated: false // Exclude PDCs from Day Book until regularized
            },
            include: {
                entries: {
                    include: { account: true }
                }
            },
            orderBy: { voucherNumber: 'asc' } // Or createdAt
        });

        // Transform for UI
        const data = vouchers.map(v => {
            // Logic to determine "Particulars" (The primary party name)
            // Tally Logic:
            // Payment/Receipt: The party that is NOT Cash/Bank
            // Sales/Purchase: The party name
            // Contra: The other bank/cash
            // Journal: The first debit?

            let particulars = 'Multiple Accounts';
            let amount = v.totalDebit;

            // Simple heuristic for single-entry display style
            if (v.entries.length >= 2) {
                // Try to find the "Party" ledger
                // Exclude Cash/Bank/Sales/Purchase ledgers to find the specific party
                // This is rough but works for 90% of simple vouchers
                const partyEntry = v.entries.find(e => {
                    const type = e.account.type;
                    const name = e.account.name.toLowerCase();
                    // If Payment, ignore Cash/Bank (Credit side usually). Look for Debit side (Expense/Party)
                    if (v.voucherType === 'PAYMENT' && e.credit > 0) return false;
                    if (v.voucherType === 'RECEIPT' && e.debit > 0) return false;

                    return true;
                });

                if (partyEntry) {
                    particulars = partyEntry.account.name;
                    // If multiple debits/credits, maybe append "etc" or "Multiple"
                }
            }

            return {
                id: v.id,
                date: v.date,
                voucherNumber: v.voucherNumber,
                voucherType: v.voucherType,
                particulars: particulars,
                amount: amount, // Voucher Total
                narration: v.narration
            };
        });

        return NextResponse.json(data);
    } catch (error) {
        console.error('Day Book Error:', error);
        return NextResponse.json({ error: 'Failed to fetch Day Book' }, { status: 500 });
    }
}
