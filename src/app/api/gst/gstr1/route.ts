import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/gst/gstr1 - Generate GSTR-1 data
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

        // Fetch all sales vouchers with GST details
        const vouchers = await db.voucher.findMany({
            where: {
                voucherType: 'SALES',
                date: {
                    gte: startDate,
                    lte: endDate
                }
            },
            include: {
                gstDetails: true,
                items: true
            }
        });

        // B2B Invoices (with GSTIN)
        const b2bInvoices = vouchers
            .filter(v => v.gstDetails?.gstin)
            .map(v => ({
                gstin: v.gstDetails?.gstin,
                invoiceNumber: v.voucherNumber,
                invoiceDate: v.date,
                invoiceValue: v.totalDebit,
                placeOfSupply: v.gstDetails?.placeOfSupply || '',
                reverseCharge: v.gstDetails?.reverseCharge ? 'Y' : 'N',
                invoiceType: 'Regular',
                taxableValue: v.items.reduce((sum, item) => sum + item.taxableAmount, 0),
                cgstAmount: v.items.reduce((sum, item) => sum + item.cgstAmount, 0),
                sgstAmount: v.items.reduce((sum, item) => sum + item.sgstAmount, 0),
                igstAmount: v.items.reduce((sum, item) => sum + item.igstAmount, 0)
            }));

        // B2C Large (> 2.5 lakhs without GSTIN)
        const b2cLarge = vouchers
            .filter(v => !v.gstDetails?.gstin && v.totalDebit > 250000)
            .map(v => ({
                invoiceNumber: v.voucherNumber,
                invoiceDate: v.date,
                invoiceValue: v.totalDebit,
                placeOfSupply: v.gstDetails?.placeOfSupply || '',
                taxableValue: v.items.reduce((sum, item) => sum + item.taxableAmount, 0),
                cgstAmount: v.items.reduce((sum, item) => sum + item.cgstAmount, 0),
                sgstAmount: v.items.reduce((sum, item) => sum + item.sgstAmount, 0),
                igstAmount: v.items.reduce((sum, item) => sum + item.igstAmount, 0)
            }));

        // B2C Small (consolidated)
        const b2cSmall = vouchers
            .filter(v => !v.gstDetails?.gstin && v.totalDebit <= 250000)
            .reduce((acc, v) => {
                const pos = v.gstDetails?.placeOfSupply || 'Unknown';
                if (!acc[pos]) {
                    acc[pos] = {
                        placeOfSupply: pos,
                        taxableValue: 0,
                        cgstAmount: 0,
                        sgstAmount: 0,
                        igstAmount: 0
                    };
                }
                acc[pos].taxableValue += v.items.reduce((sum, item) => sum + item.taxableAmount, 0);
                acc[pos].cgstAmount += v.items.reduce((sum, item) => sum + item.cgstAmount, 0);
                acc[pos].sgstAmount += v.items.reduce((sum, item) => sum + item.sgstAmount, 0);
                acc[pos].igstAmount += v.items.reduce((sum, item) => sum + item.igstAmount, 0);
                return acc;
            }, {} as Record<string, any>);

        const gstr1Data = {
            gstin: '29AABCT1332L000', // Should come from company settings
            tradeName: 'LekhyaAI Demo Company',
            period: `${month}${year}`,
            b2b: b2bInvoices,
            b2cl: b2cLarge,
            b2cs: Object.values(b2cSmall),
            summary: {
                totalInvoices: vouchers.length,
                totalTaxableValue: vouchers.reduce((sum, v) =>
                    sum + v.items.reduce((s, item) => s + item.taxableAmount, 0), 0),
                totalCGST: vouchers.reduce((sum, v) =>
                    sum + v.items.reduce((s, item) => s + item.cgstAmount, 0), 0),
                totalSGST: vouchers.reduce((sum, v) =>
                    sum + v.items.reduce((s, item) => s + item.sgstAmount, 0), 0),
                totalIGST: vouchers.reduce((sum, v) =>
                    sum + v.items.reduce((s, item) => s + item.igstAmount, 0), 0)
            }
        };

        return NextResponse.json(gstr1Data);
    } catch (error) {
        console.error('GSTR-1 generation error:', error);
        return NextResponse.json({ error: 'Failed to generate GSTR-1' }, { status: 500 });
    }
}
