import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export interface TrialBalanceAccount {
    id: string;
    name: string;
    code?: string;
    type: string;
    debit: number;
    credit: number;
    net: number; // Positive for Debit, Negative for Credit
    isGroup: false;
}

export interface TrialBalanceGroup {
    id: string;
    name: string;
    type: string;
    debit: number;
    credit: number;
    net: number;
    isGroup: true;
    children: (TrialBalanceGroup | TrialBalanceAccount)[];
}

export async function getTrialBalance(fromDate?: Date, toDate?: Date) {
    // 1. Fetch all accounts
    // In our simplified schema, Groups and Ledgers are both 'Accounts'
    // Root groups have parentId = null
    const allAccounts = await db.account.findMany({
        where: { isActive: true }
    });

    // 2. Fetch journal entry aggregations
    // Group by accountId and sum debit/credit
    const whereClause: Prisma.VoucherEntryWhereInput = {};
    if (fromDate) whereClause.voucher = { date: { gte: fromDate } };
    if (toDate) whereClause.voucher = {
        ...((whereClause.voucher as any) || {}),
        date: { ...((whereClause.voucher as any)?.date || {}), lte: toDate }
    };

    const aggregations = await db.voucherEntry.groupBy({
        by: ['accountId'],
        _sum: {
            debit: true,
            credit: true
        },
        where: whereClause
    });

    // Map aggregations
    const balanceMap: Record<string, { debit: number, credit: number }> = {};
    for (const agg of aggregations) {
        if (agg.accountId) {
            balanceMap[agg.accountId] = {
                debit: agg._sum.debit || 0,
                credit: agg._sum.credit || 0
            };
        }
    }

    // 3. Build Tree
    // We need to differentiate between 'Group' nodes and 'Leaf' nodes for the UI?
    // Or just return a recursive structure where everything is a node.
    // The UI expects TrialBalanceAccount (Leaf) and TrialBalanceGroup (Node/Parent).
    // Let's assume accounts with children are Groups. But we need to build the tree bottom-up or top-down.

    // Let's create a map of all items converted to our interface format
    const nodeMap: Record<string, TrialBalanceGroup | TrialBalanceAccount> = {};

    // First pass: Create nodes
    for (const acc of allAccounts) {
        const balances = balanceMap[acc.id] || { debit: 0, credit: 0 };

        // Opening balance placeholder
        const openingDebit = 0;
        const openingCredit = 0;

        const totalDebit = balances.debit + openingDebit;
        const totalCredit = balances.credit + openingCredit;
        const net = totalDebit - totalCredit;

        // Ideally, we'd know if it's a group or ledger.
        // For now, let's treat everything as a node that *can* have children.
        // But to match the interface, we need to decide isGroup.
        // We'll update isGroup later if we find children?
        // Or simpler: Treat everything as "Group" structure but if it has no children, it acts like a ledger.
        // The interfaces distinguish heavily. Let's use a Hybrid intermediate, then map.
        // Actually, let's just use TrialBalanceGroup for everything, but if children is empty, it's a leaf.
        // But the Type definitions enforce `isGroup: true/false`.

        // Let's default to treat as Account (Leaf), and upgrade to Group if it has children?
        // But mapped parents must be Groups.
        // Let's assume everything is a potential group for the tree building.

        // Problem: The interface TrialBalanceAccount has `isGroup: false`, TrialBalanceGroup has `isGroup: true`.
        // Let's init everything as keys in a map, and we'll link them.

        // We'll use a temporary structure
        nodeMap[acc.id] = {
            id: acc.id,
            name: acc.name,
            type: acc.type,
            debit: totalDebit,
            credit: totalCredit,
            net: net,
            isGroup: false, // Default to false
            children: []    // Even accounts might have property
        } as any;
    }

    // Second pass: Link parents
    const rootItems: (TrialBalanceGroup | TrialBalanceAccount)[] = [];

    allAccounts.forEach(acc => {
        const node = nodeMap[acc.id];
        if (acc.parentId && nodeMap[acc.parentId]) {
            const parent = nodeMap[acc.parentId] as TrialBalanceGroup;
            parent.isGroup = true; // Mark parent as group
            parent.children = parent.children || [];
            parent.children.push(node);
        } else {
            rootItems.push(node);
        }
    });

    // 4. Calculate Aggregates (Recursive)
    // Now we need to roll up balances from children to parents
    function calculateTotals(node: TrialBalanceGroup | TrialBalanceAccount): { debit: number, credit: number, net: number } {
        // If it's strictly an account (leaf/no children), return its own values
        // But wait, if it's a Group, its own balance is 0 usually (container), and it sums children.
        // BUT in our single table model, a "Group" could technically have direct journal entries too?
        // Tally allows creating vouchers for Groups? No, only Ledgers.
        // So if `isGroup` becomes true (has children), does it imply it has NO direct entries?
        // Safe bet: Sum of children + own direct entries.

        let sumDebit = (node as any).debit || 0;
        let sumCredit = (node as any).credit || 0;

        if (node.isGroup && (node as TrialBalanceGroup).children) {
            const groupNode = node as TrialBalanceGroup;
            // Reset own totals if they are meant to be purely aggregates?
            // Usually Groups don't have direct entries. 
            // If they do, we keep them.

            // However, for the 'Group' total, we want the sum of children.
            // If we initialized `debit` with direct entries (from journal), we add children to it.

            for (const child of groupNode.children) {
                const childTotals = calculateTotals(child);
                sumDebit += childTotals.debit;
                sumCredit += childTotals.credit;
            }
        }

        node.debit = sumDebit;
        node.credit = sumCredit;
        node.net = sumDebit - sumCredit;

        return { debit: node.debit, credit: node.credit, net: node.net };
    }

    // Calculate for all roots
    for (const root of rootItems) {
        calculateTotals(root);
    }

    return rootItems;
}
