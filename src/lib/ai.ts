
import { db } from '@/lib/db';

export interface Insight {
    id: string;
    type: 'WARNING' | 'INFO' | 'OPPORTUNITY';
    title: string;
    message: string;
    metric?: string;
    date: Date;
}

export async function generateInsights(): Promise<Insight[]> {
    const insights: Insight[] = [];

    // 1. Check Cash Balance
    // In a real app, we'd sum up specific Cash ledgers. 
    // For Phase 5 MVP, we'll fetch all 'Asset' accounts with 'Cash' in name
    const cashAccounts = await db.account.findMany({
        where: {
            name: { contains: 'Cash' },
            type: 'Asset'
        }
    });

    const totalCash = cashAccounts.reduce((sum, acc) => sum + acc.balance, 0);

    if (totalCash < 0) {
        insights.push({
            id: 'ins-1',
            type: 'WARNING',
            title: 'Low Cash Balance',
            message: 'Your cash accounts are showing a negative balance. Please reconcile immediately.',
            metric: `₹${totalCash.toFixed(2)}`,
            date: new Date()
        });
    } else if (totalCash < 5000) {
        insights.push({
            id: 'ins-2',
            type: 'INFO',
            title: 'Low Liquidity',
            message: 'Cash reserves are running low based on recent trends.',
            metric: `₹${totalCash.toFixed(2)}`,
            date: new Date()
        });
    }

    // 2. Expense Spike Detection (Mock Logic for now)
    // Real logic: Compare current month expenses vs avg of last 3 months
    const expenses = await db.account.findMany({
        where: { type: 'Expense' }
    });

    // Simulate a check (if total expenses > 50000, just for demo)
    const totalExpense = expenses.reduce((sum, acc) => sum + acc.balance, 0);

    if (totalExpense > 50000) {
        insights.push({
            id: 'ins-3',
            type: 'WARNING',
            title: 'High Expense Alert',
            message: 'Expenses for this period have exceeded the usual threshold.',
            metric: `₹${totalExpense.toFixed(2)}`,
            date: new Date()
        });
    }

    // 3. Tax Liability Check
    // If output tax > input tax significantly
    // Placeholder logic
    const liabilityAccounts = await db.account.findMany({
        where: { type: 'Liability' }
    });
    const totalLiability = liabilityAccounts.reduce((sum, acc) => sum + acc.balance, 0);

    if (totalLiability > 100000) {
        insights.push({
            id: 'ins-4',
            type: 'INFO',
            title: 'High Liability',
            message: 'You have significant outstanding liabilities.',
            metric: `₹${totalLiability.toFixed(2)}`,
            date: new Date()
        });
    }

    return insights;
}
