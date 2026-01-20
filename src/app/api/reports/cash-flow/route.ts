import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns';

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const fromDateParam = searchParams.get('fromDate');
    const toDateParam = searchParams.get('toDate');

    // Default to current month if not specified
    const now = new Date();
    const fromDate = fromDateParam ? new Date(fromDateParam) : startOfMonth(now);
    const toDate = toDateParam ? new Date(toDateParam) : endOfMonth(now);

    try {
        // 1. Identify Cash and Bank Ledgers
        // We need to find all accounts that are children of "Cash-in-hand" or "Bank Accounts" groups.
        // For now, let's filter by Account Type or specific Group Names if we know them.
        // Assuming database has standard Tally groups. 
        // A more robust way is to finding the Group IDs for 'Cash-in-hand' and 'Bank Accounts' and getting all children.

        // Let's try to match by name pattern or standard types if available.
        // In our schema, Account usually has a type. 
        // If type is 'Asset', we need to check the group.

        const cashBankGroups = await db.account.findMany({
            where: {
                name: { in: ['Cash-in-hand', 'Bank Accounts', 'Bank OD A/c'] }
            },
            include: {
                children: true
            }
        });

        const targetAccountIds: string[] = [];
        cashBankGroups.forEach(g => {
            g.children.forEach(a => targetAccountIds.push(a.id));
        });

        // Also fetch accounts that might be directly named 'Cash' if they aren't in the group correctly (failsafe)
        const explicitAccounts = await db.account.findMany({
            where: {
                name: { contains: 'Cash' }
            }
        });
        explicitAccounts.forEach(a => {
            if (!targetAccountIds.includes(a.id)) targetAccountIds.push(a.id);
        });

        if (targetAccountIds.length === 0) {
            return NextResponse.json({ inflow: [], outflow: [], netCashFlow: 0 });
        }

        // 2. Fetch Voucher Entries affecting these accounts
        const entries = await db.voucherEntry.findMany({
            where: {
                accountId: { in: targetAccountIds },
                voucher: {
                    date: {
                        gte: fromDate,
                        lte: toDate
                    },
                    isPostDated: false // Exclude PDCs
                }
            },
            include: {
                voucher: true,
                account: true
            }
        });

        // 3. Classify Inflow/Outflow
        // Debit to Cash/Bank = Inflow (Receipt)
        // Credit to Cash/Bank = Outflow (Payment)

        let totalInflow = 0;
        let totalOutflow = 0;

        const inflowItems: any[] = [];
        const outflowItems: any[] = [];

        entries.forEach(entry => {
            if (entry.debit > 0) {
                // Inflow
                totalInflow += entry.debit;
                inflowItems.push({
                    date: entry.voucher.date,
                    particulars: entry.voucher.voucherNumber, // Ideally find the OTHER side of the entry
                    amount: entry.debit,
                    type: 'Receipt'
                });
            } else if (entry.credit > 0) {
                // Outflow
                totalOutflow += entry.credit;
                outflowItems.push({
                    date: entry.voucher.date,
                    particulars: entry.voucher.voucherNumber,
                    amount: entry.credit,
                    type: 'Payment'
                });
            }
        });

        return NextResponse.json({
            inflow: inflowItems,
            outflow: outflowItems,
            totalInflow,
            totalOutflow,
            netCashFlow: totalInflow - totalOutflow,
            openingBalance: 0, // Todo: calculate opening balance relative to fromDate
            closingBalance: (totalInflow - totalOutflow) // + Opening
        });

    } catch (error) {
        console.error('Cash Flow Error:', error);
        return NextResponse.json({ error: 'Failed to fetch Cash Flow' }, { status: 500 });
    }
}
