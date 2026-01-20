
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
        // Fetch all SALES vouchers
        // In real app: Filter by date range (e.g., current month)
        const salesVouchers = await db.voucher.findMany({
            where: {
                voucherType: 'SALES',
                isPosted: true
            },
            include: {
                entries: true // To get party details if needed
            }
        });

        // Basic aggregation for GSTR-1 Summary
        const summary = {
            b2b: { count: 0, taxable: 0, tax: 0 },
            b2cLarge: { count: 0, taxable: 0, tax: 0 },
            b2cSmall: { count: 0, taxable: 0, tax: 0 },
            exports: { count: 0, taxable: 0, tax: 0 },
            totalSales: 0
        };

        salesVouchers.forEach((v: any) => {
            // Logic to categorize (Mock logic for now as Voucher struct needs strict Party link)
            // Assuming simplified flow: 
            // All sales > 2.5L inter-state = B2CL (if no GSTIN)
            // Has GSTIN = B2B
            // Else B2CS

            // For Phase 4 Demo, putting everything in B2B to show data flow
            const amount = v.totalCredit; // Sales usually Credit side total
            summary.b2b.count++;
            summary.b2b.taxable += amount;
            // distinct tax calculation requires line-item level details which we are simplifying
            summary.b2b.tax += (amount * 0.18); // Assume flat 18% for demo

            summary.totalSales += amount;
        });

        return NextResponse.json({
            period: 'Current Month',
            data: summary
        });

    } catch (error) {
        return NextResponse.json({ error: 'Failed to generate GSTR-1' }, { status: 500 });
    }
}
