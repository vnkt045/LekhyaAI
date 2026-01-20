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
        const asOfDate = searchParams.get('asOfDate') || new Date().toISOString();

        // Fetch all accounts
        const accounts = await db.account.findMany({
            where: { isActive: true },
            include: {
                entries: {
                    where: {
                        voucher: {
                            date: {
                                lte: new Date(asOfDate)
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
            const balance = account.balance + totalDebit - totalCredit;

            return {
                id: account.id,
                name: account.name,
                type: account.type,
                balance: balance
            };
        });

        // Group accounts by type
        const assets = accountsWithBalances.filter(a => a.type === 'Asset');
        const liabilities = accountsWithBalances.filter(a => a.type === 'Liability');
        const equity = accountsWithBalances.filter(a => a.type === 'Equity');

        // Calculate totals
        const totalAssets = assets.reduce((sum, a) => sum + a.balance, 0);
        const totalLiabilities = liabilities.reduce((sum, a) => sum + a.balance, 0);
        const totalEquity = equity.reduce((sum, a) => sum + a.balance, 0);

        // Calculate retained earnings (from Revenue - Expenses)
        const revenue = accountsWithBalances.filter(a => a.type === 'Revenue');
        const expenses = accountsWithBalances.filter(a => a.type === 'Expense');
        const totalRevenue = revenue.reduce((sum, a) => sum + Math.abs(a.balance), 0);
        const totalExpenses = expenses.reduce((sum, a) => sum + a.balance, 0);
        const retainedEarnings = totalRevenue - totalExpenses;

        return NextResponse.json({
            asOfDate,
            assets: {
                accounts: assets,
                total: totalAssets
            },
            liabilities: {
                accounts: liabilities,
                total: totalLiabilities
            },
            equity: {
                accounts: equity,
                retainedEarnings,
                total: totalEquity + retainedEarnings
            },
            totals: {
                assets: totalAssets,
                liabilitiesAndEquity: totalLiabilities + totalEquity + retainedEarnings
            }
        });
    } catch (error) {
        console.error('Balance sheet error:', error);
        return NextResponse.json({ error: 'Failed to generate balance sheet' }, { status: 500 });
    }
}
