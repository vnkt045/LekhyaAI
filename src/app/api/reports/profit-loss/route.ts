import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const fromDate = searchParams.get('fromDate') || new Date(new Date().getFullYear(), 3, 1).toISOString(); // Apr 1
        const toDate = searchParams.get('toDate') || new Date().toISOString();

        // Fetch all Revenue and Expense accounts with their entries
        const accounts = await db.account.findMany({
            where: {
                isActive: true,
                OR: [
                    { type: 'Revenue' },
                    { type: 'Expense' }
                ]
            },
            include: {
                entries: {
                    where: {
                        voucher: {
                            date: {
                                gte: new Date(fromDate),
                                lte: new Date(toDate)
                            }
                        }
                    }
                }
            },
            orderBy: { type: 'asc' }
        });

        // Calculate balances for each account
        const accountsWithBalances = accounts.map(account => {
            const totalDebit = account.entries.reduce((sum, entry) => sum + entry.debit, 0);
            const totalCredit = account.entries.reduce((sum, entry) => sum + entry.credit, 0);

            // For Revenue: Credit balance is positive
            // For Expense: Debit balance is positive
            const balance = account.type === 'Revenue'
                ? totalCredit - totalDebit
                : totalDebit - totalCredit;

            return {
                id: account.id,
                name: account.name,
                type: account.type,
                balance: balance
            };
        });

        // Separate Revenue and Expenses
        const revenue = accountsWithBalances.filter(a => a.type === 'Revenue');
        const expenses = accountsWithBalances.filter(a => a.type === 'Expense');

        // Calculate totals
        const totalRevenue = revenue.reduce((sum, a) => sum + a.balance, 0);
        const totalExpenses = expenses.reduce((sum, a) => sum + a.balance, 0);
        const netProfit = totalRevenue - totalExpenses;

        return NextResponse.json({
            period: {
                from: fromDate,
                to: toDate
            },
            revenue: {
                accounts: revenue,
                total: totalRevenue
            },
            expenses: {
                accounts: expenses,
                total: totalExpenses
            },
            netProfit: netProfit,
            netProfitPercentage: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0
        });
    } catch (error) {
        console.error('P&L error:', error);
        return NextResponse.json({ error: 'Failed to generate P&L statement' }, { status: 500 });
    }
}
