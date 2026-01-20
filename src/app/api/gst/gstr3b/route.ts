import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/gst/gstr3b - Generate GSTR-3B data
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    if (!month || !year) {
        return NextResponse.json({ error: 'Month and year required' }, { status: 400 });
    }

    try {
        const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
        const endDate = new Date(parseInt(year), parseInt(month), 0);

        // Outward Supplies (Sales)
        const salesVouchers = await db.voucher.findMany({
            where: {
                voucherType: 'SALES',
                date: { gte: startDate, lte: endDate }
            },
            include: { items: true, gstDetails: true }
        });

        // Inward Supplies (Purchases)
        const purchaseVouchers = await db.voucher.findMany({
            where: {
                voucherType: 'PURCHASE',
                date: { gte: startDate, lte: endDate }
            },
            include: { items: true, gstDetails: true }
        });

        // Calculate outward supplies
        const outwardTaxable = salesVouchers.reduce((sum, v) =>
            sum + v.items.reduce((s, i) => s + i.taxableAmount, 0), 0);
        const outwardCGST = salesVouchers.reduce((sum, v) =>
            sum + v.items.reduce((s, i) => s + i.cgstAmount, 0), 0);
        const outwardSGST = salesVouchers.reduce((sum, v) =>
            sum + v.items.reduce((s, i) => s + i.sgstAmount, 0), 0);
        const outwardIGST = salesVouchers.reduce((sum, v) =>
            sum + v.items.reduce((s, i) => s + i.igstAmount, 0), 0);

        // Calculate ITC (Input Tax Credit)
        const itcCGST = purchaseVouchers.reduce((sum, v) =>
            sum + v.items.reduce((s, i) => s + i.cgstAmount, 0), 0);
        const itcSGST = purchaseVouchers.reduce((sum, v) =>
            sum + v.items.reduce((s, i) => s + i.sgstAmount, 0), 0);
        const itcIGST = purchaseVouchers.reduce((sum, v) =>
            sum + v.items.reduce((s, i) => s + i.igstAmount, 0), 0);

        const gstr3bData = {
            gstin: '29AABCT1332L000',
            period: `${month}${year}`,

            // Table 3.1 - Outward Supplies
            outwardSupplies: {
                taxableValue: outwardTaxable,
                integratedTax: outwardIGST,
                centralTax: outwardCGST,
                stateTax: outwardSGST,
                cess: 0
            },

            // Table 4 - ITC Available
            itcAvailable: {
                importOfGoods: { igst: 0, cess: 0 },
                importOfServices: { igst: 0, cess: 0 },
                inwardSuppliesFromISD: { igst: 0, cgst: 0, sgst: 0, cess: 0 },
                allOtherITC: {
                    igst: itcIGST,
                    cgst: itcCGST,
                    sgst: itcSGST,
                    cess: 0
                },
                total: {
                    igst: itcIGST,
                    cgst: itcCGST,
                    sgst: itcSGST,
                    cess: 0
                }
            },

            // Table 5 - ITC Reversed
            itcReversed: {
                asPerRule42And43: { igst: 0, cgst: 0, sgst: 0, cess: 0 },
                others: { igst: 0, cgst: 0, sgst: 0, cess: 0 },
                total: { igst: 0, cgst: 0, sgst: 0, cess: 0 }
            },

            // Table 6.1 - Net ITC Available
            netITC: {
                igst: itcIGST,
                cgst: itcCGST,
                sgst: itcSGST,
                cess: 0
            },

            // Table 6.2 - Tax Payable
            taxPayable: {
                igst: Math.max(0, outwardIGST - itcIGST),
                cgst: Math.max(0, outwardCGST - itcCGST),
                sgst: Math.max(0, outwardSGST - itcSGST),
                cess: 0
            }
        };

        return NextResponse.json(gstr3bData);
    } catch (error) {
        console.error('GSTR-3B generation error:', error);
        return NextResponse.json({ error: 'Failed to generate GSTR-3B' }, { status: 500 });
    }
}
