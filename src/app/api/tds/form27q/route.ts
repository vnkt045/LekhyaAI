import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const quarter = searchParams.get('quarter');
        const financialYear = searchParams.get('financialYear');

        if (!quarter || !financialYear) {
            return NextResponse.json({ error: 'Quarter and financial year required' }, { status: 400 });
        }

        // Fetch TDS entries for the quarter
        const entries = await db.tDSEntry.findMany({
            where: {
                quarter,
                financialYear
            },
            include: {
                section: true,
                party: true,
                voucher: true
            },
            orderBy: {
                createdAt: 'asc'
            }
        });

        // Group by party
        const groupedByParty = entries.reduce((acc: any, entry) => {
            const partyKey = entry.partyId;
            if (!acc[partyKey]) {
                acc[partyKey] = {
                    partyName: entry.party.name,
                    panNumber: entry.panNumber || 'N/A',
                    entries: [],
                    totalAmount: 0,
                    totalTDS: 0
                };
            }
            acc[partyKey].entries.push({
                voucherNumber: entry.voucher.voucherNumber,
                voucherDate: entry.voucher.date,
                section: entry.section.section,
                amount: entry.amount,
                tdsAmount: entry.tdsAmount,
                tdsRate: entry.tdsRate
            });
            acc[partyKey].totalAmount += entry.amount;
            acc[partyKey].totalTDS += entry.tdsAmount;
            return acc;
        }, {});

        const form27Q = {
            quarter,
            financialYear,
            deductorDetails: {
                tan: 'XXXXXXXXXX', // To be configured in settings
                name: 'Your Company Name', // To be fetched from settings
                address: 'Company Address'
            },
            deductees: Object.values(groupedByParty),
            summary: {
                totalDeductees: Object.keys(groupedByParty).length,
                totalPayments: entries.reduce((sum, e) => sum + e.amount, 0),
                totalTDS: entries.reduce((sum, e) => sum + e.tdsAmount, 0),
                totalEntries: entries.length
            },
            generatedAt: new Date().toISOString()
        };

        return NextResponse.json(form27Q);
    } catch (error) {
        console.error('Form 27Q generation error:', error);
        return NextResponse.json({ error: 'Failed to generate Form 27Q' }, { status: 500 });
    }
}
