import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get('accountId');
    const monthStr = searchParams.get('month'); // e.g., "04-2024" (MM-YYYY)

    if (!accountId) {
        return NextResponse.json({ error: 'Account ID is required' }, { status: 400 });
    }

    try {
        // 1. Get Ledger Balance (Book Balance)
        const account = await db.account.findUnique({
            where: { id: accountId },
            include: { entries: true } // Too heavy? 
        });

        if (!account) return NextResponse.json({ error: 'Account not found' }, { status: 404 });

        // Better way to get running balance: Aggregate all entries.
        // Assuming 'balance' field in Account is up to date, or we recalculate.
        // Let's recalculate for accuracy.
        const aggregations = await db.voucherEntry.groupBy({
            by: ['accountId'],
            _sum: { debit: true, credit: true },
            where: { accountId: accountId }
        });

        let bookBalance = 0;
        if (aggregations.length > 0) {
            const agg = aggregations[0];
            // Asset (Bank): Debit increases, Credit decreases
            bookBalance = (agg._sum.debit || 0) - (agg._sum.credit || 0);
        }

        // 2. Fetch Unreconciled Entries (or Reconciled in future but effectively pending for this effective date)
        // Actually, BRS is "as on date".
        // Entries in books UP TO date, but Bank Date > Date OR Bank Date is Null.

        // Let's simplify: Show ALL entries for this bank ledger that are NOT reconciled.
        const entries = await db.voucherEntry.findMany({
            where: {
                accountId: accountId,
                bankReconciliation: null // Not reconciled yet
            },
            include: {
                voucher: true,
                bankReconciliation: true // Should be null, but for typing
            },
            orderBy: {
                voucher: { date: 'asc' }
            }
        });

        // 3. Separation for BRS Logic
        // Amounts not reflected in Bank:
        // - Cheques Issued (Credit) but not presented (Bank Debit missing) -> Add to Balance (if OD logic different)
        // - Cheques Deposited (Debit) but not cleared (Bank Credit missing) -> Less from Balance

        let amountsNotReflectedInBank = 0;
        const unreconciledEntries = entries.map(entry => {
            const isDebit = entry.debit > 0;
            const amount = isDebit ? entry.debit : entry.credit;

            // Standard Bank Account (Asset):
            // Debit in Books = Deposit. If pending, Bank Balance is LOWER.
            // Credit in Books = Withdrawal. If pending, Bank Balance is HIGHER.

            if (isDebit) {
                // Deposit pending
                // Balance as per Bank = Book Balance - Pending Deposits
            } else {
                // Withdrawal pending
                // Balance as per Bank = Book Balance + Pending Withdrawals
            }

            return {
                id: entry.id,
                date: entry.voucher.date,
                voucherNumber: entry.voucher.voucherNumber,
                narration: entry.narration || entry.voucher.narration,
                debit: entry.debit,
                credit: entry.credit,
                isDebit,
                amount
            };
        });

        // Calculate "Balance as per Bank"
        // Start with Book Balance
        let balanceAsPerBank = bookBalance;

        // Add: Cheques Issued (Credit)
        const pendingWithdrawals = entries.reduce((sum, e) => sum + (e.credit || 0), 0);
        balanceAsPerBank += pendingWithdrawals;

        // Less: Cheques Deposited (Debit)
        const pendingDeposits = entries.reduce((sum, e) => sum + (e.debit || 0), 0);
        balanceAsPerBank -= pendingDeposits;

        return NextResponse.json({
            bookBalance,
            balanceAsPerBank,
            unreconciledEntries,
            stats: {
                pendingDeposits,
                pendingWithdrawals
            }
        });

    } catch (error) {
        console.error('BRS Error:', error);
        return NextResponse.json({ error: 'Failed to fetch BRS data' }, { status: 500 });
    }
}
