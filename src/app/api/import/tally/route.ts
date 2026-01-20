import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { ledgers, vouchers } = await req.json();

        // 1. Import Ledgers (Accounts)
        let ledgersCreated = 0;
        for (const ledger of ledgers) {
            // Check if exists
            const existing = await db.account.findFirst({
                where: { name: ledger.name }
            });

            if (!existing) {
                // Determine type based on parent (simplified mapping)
                let type = 'Expense'; // Default
                const parentUpper = ledger.parent.toUpperCase();
                if (parentUpper.includes('ASSET') || parentUpper.includes('BANK') || parentUpper.includes('CASH')) type = 'Asset';
                else if (parentUpper.includes('LIABILIT') || parentUpper.includes('CREDITOR')) type = 'Liability';
                else if (parentUpper.includes('INCOME') || parentUpper.includes('SALES')) type = 'Revenue';
                else if (parentUpper.includes('PURCHASE')) type = 'Expense';
                else if (parentUpper.includes('CAPITAL')) type = 'Equity';

                await db.account.create({
                    data: {
                        name: ledger.name,
                        code: ledger.name.substring(0, 3).toUpperCase() + Math.floor(Math.random() * 10000), // Temp auto-code
                        type: type,
                        balance: ledger.openingBalance || 0,
                        isActive: true
                    }
                });
                ledgersCreated++;
            }
        }

        // 2. Import Vouchers
        let vouchersCreated = 0;

        for (const v of vouchers) {
            // Find or create Voucher Type
            let typeName = v.voucherType || 'Journal';
            let formattedType = typeName; // Keep original name or map it

            // Map common Tally types to standard types if needed
            if (typeName.toLowerCase().includes('receipt')) formattedType = 'Receipt';
            else if (typeName.toLowerCase().includes('payment')) formattedType = 'Payment';
            else if (typeName.toLowerCase().includes('contra')) formattedType = 'Contra';
            else if (typeName.toLowerCase().includes('sales')) formattedType = 'Sales';
            else if (typeName.toLowerCase().includes('purchase')) formattedType = 'Purchase';

            // Create Voucher Type if not exists (Lazy creation)
            /* In a strict system we might want to fail if type doesn't exist, 
               but for import we want to be permissive */

            // Generate valid date
            const dateStr = v.date || new Date().toISOString();
            // Tally date format might need parsing if not ISO. 
            // Assuming parser returns YYYYMMDD or standard format, but lets be safe
            // If parser returns YYYYMMDD string from XML, we might need custom parsing.
            // For now assuming parser output is largely compatible or we try standard parse.
            /* 
               Checking parser output: It returns text content directly. 
               Tally XML usually is YYYYMMDD. e.g. 20240401
            */
            let voucherDate = new Date();
            if (v.date && v.date.length === 8) {
                const y = parseInt(v.date.substring(0, 4));
                const m = parseInt(v.date.substring(4, 6)) - 1;
                const d = parseInt(v.date.substring(6, 8));
                voucherDate = new Date(y, m, d);
            } else if (v.date) {
                voucherDate = new Date(v.date);
            }

            // Create Voucher
            const newVoucher = await db.voucher.create({
                data: {
                    voucherNumber: v.voucherNumber || `IMP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                    voucherType: formattedType,
                    date: voucherDate,
                    narration: v.narration || 'Imported from Tally',
                    totalDebit: v.amount,  // This is usually the total amount
                    totalCredit: v.amount,
                    createdBy: (session.user as any).id || 'SYSTEM'
                }
            });

            // Create Entries
            for (const entry of v.ledgerEntries) {
                // Find Account
                const account = await db.account.findFirst({
                    where: { name: entry.ledgerName }
                });

                if (account) {
                    await db.voucherEntry.create({
                        data: {
                            voucherId: newVoucher.id,
                            accountId: account.id,
                            accountName: account.name,
                            debit: entry.isDeemedPositive ? entry.amount : 0,
                            credit: !entry.isDeemedPositive ? entry.amount : 0,
                            narration: 'Imported Entry'
                        }
                    });
                }
            }
            vouchersCreated++;
        }

        return NextResponse.json({
            success: true,
            ledgers: ledgersCreated,
            vouchers: vouchersCreated,
            message: 'Import processed successfully'
        });

    } catch (error: any) {
        console.error('Import Error:', error);
        return NextResponse.json({ error: error.message || 'Import failed' }, { status: 500 });
    }
}
