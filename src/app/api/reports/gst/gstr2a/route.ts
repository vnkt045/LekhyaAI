import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - GSTR-2A Report (Purchase Register)
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const month = searchParams.get('month');
        const year = searchParams.get('year');

        if (!month || !year) {
            return NextResponse.json({
                error: 'Month and Year are required'
            }, { status: 400 });
        }

        const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
        const endDate = new Date(parseInt(year), parseInt(month), 0);

        // Fetch purchase vouchers with GST details
        const purchases = await db.voucher.findMany({
            where: {
                voucherType: 'Purchase',
                date: {
                    gte: startDate,
                    lte: endDate
                }
            },
            include: {
                gstDetails: true,
                entries: {
                    include: {
                        account: true
                    }
                }
            },
            orderBy: { date: 'asc' }
        });

        // Calculate ITC (Input Tax Credit)
        const itcSummary = {
            cgst: 0,
            sgst: 0,
            igst: 0,
            cess: 0,
            total: 0
        };

        const supplierWise: Array<{
            date: Date;
            voucherNumber: string;
            supplierName: string;
            gstin: string;
            invoiceNumber: string;
            invoiceValue: number;
            cgst: number;
            sgst: number;
            igst: number;
            cess: number;
            totalTax: number;
        }> = [];

        purchases.forEach((voucher) => {
            if (voucher.gstDetails) {
                const gst = voucher.gstDetails;
                itcSummary.cgst += gst.cgstAmount || 0;
                itcSummary.sgst += gst.sgstAmount || 0;
                itcSummary.igst += gst.igstAmount || 0;
                itcSummary.cess += gst.cessAmount || 0;
                itcSummary.total += gst.totalGST;

                // Find supplier from entries
                const supplierEntry = voucher.entries.find((e) => e.credit > 0);
                if (supplierEntry) {
                    supplierWise.push({
                        date: voucher.date,
                        voucherNumber: voucher.voucherNumber,
                        supplierName: supplierEntry.account.name,
                        gstin: gst.gstin || 'N/A',
                        invoiceNumber: gst.invoiceNumber || voucher.voucherNumber,
                        invoiceValue: gst.taxableAmount,
                        cgst: gst.cgstAmount || 0,
                        sgst: gst.sgstAmount || 0,
                        igst: gst.igstAmount || 0,
                        cess: gst.cessAmount || 0,
                        totalTax: gst.totalGST
                    });
                }
            }
        });

        return NextResponse.json({
            period: `${month}/${year}`,
            itcSummary,
            supplierWise,
            totalPurchases: purchases.length
        });
    } catch (error) {
        console.error('GSTR-2A generation error:', error);
        return NextResponse.json({ error: 'Failed to generate GSTR-2A' }, { status: 500 });
    }
}
