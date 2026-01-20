import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// GET - Fetch all challans
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const quarter = searchParams.get('quarter');
        const financialYear = searchParams.get('financialYear');

        const where: any = {};
        if (quarter) where.quarter = quarter;
        if (financialYear) where.financialYear = financialYear;

        // Fetch TDS entries with challan info
        const entries = await db.tDSEntry.findMany({
            where: {
                ...where,
                challanNo: { not: null }
            },
            include: {
                section: true,
                party: true
            },
            orderBy: {
                challanDate: 'desc'
            }
        });

        // Group by challan number
        const challans = entries.reduce((acc: any, entry) => {
            const challanKey = entry.challanNo!;
            if (!acc[challanKey]) {
                acc[challanKey] = {
                    challanNo: entry.challanNo,
                    challanDate: entry.challanDate,
                    quarter: entry.quarter,
                    financialYear: entry.financialYear,
                    entries: [],
                    totalAmount: 0
                };
            }
            acc[challanKey].entries.push({
                id: entry.id,
                partyName: entry.party.name,
                section: entry.section.section,
                tdsAmount: entry.tdsAmount
            });
            acc[challanKey].totalAmount += entry.tdsAmount;
            return acc;
        }, {});

        return NextResponse.json(Object.values(challans));
    } catch (error) {
        console.error('Challan fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch challans' }, { status: 500 });
    }
}

// POST - Record challan payment
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { entryIds, challanNo, challanDate } = body;

        if (!entryIds || !Array.isArray(entryIds) || !challanNo || !challanDate) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Update TDS entries with challan info
        await db.tDSEntry.updateMany({
            where: {
                id: { in: entryIds }
            },
            data: {
                challanNo,
                challanDate: new Date(challanDate)
            }
        });

        return NextResponse.json({
            message: 'Challan recorded successfully',
            updatedCount: entryIds.length
        });
    } catch (error) {
        console.error('Challan record error:', error);
        return NextResponse.json({ error: 'Failed to record challan' }, { status: 500 });
    }
}
