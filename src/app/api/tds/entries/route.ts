import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCurrentQuarter, getCurrentFinancialYear } from '@/lib/tds';

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const quarter = searchParams.get('quarter') || getCurrentQuarter();
    const financialYear = searchParams.get('financialYear') || getCurrentFinancialYear();

    try {
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
                createdAt: 'desc'
            }
        });

        // Calculate summary
        const summary = {
            quarter,
            financialYear,
            totalEntries: entries.length,
            totalTaxableAmount: entries.reduce((sum, e) => sum + e.amount, 0),
            totalTDSAmount: entries.reduce((sum, e) => sum + e.tdsAmount, 0),
            bySection: {} as Record<string, any>
        };

        // Group by section
        entries.forEach(entry => {
            const sectionCode = entry.section.section;
            if (!summary.bySection[sectionCode]) {
                summary.bySection[sectionCode] = {
                    section: entry.section,
                    count: 0,
                    totalAmount: 0,
                    totalTDS: 0,
                    entries: []
                };
            }
            summary.bySection[sectionCode].count++;
            summary.bySection[sectionCode].totalAmount += entry.amount;
            summary.bySection[sectionCode].totalTDS += entry.tdsAmount;
            summary.bySection[sectionCode].entries.push(entry);
        });

        return NextResponse.json({
            summary,
            entries
        });
    } catch (error) {
        console.error('Failed to fetch TDS entries:', error);
        return NextResponse.json({ error: 'Failed to fetch TDS entries' }, { status: 500 });
    }
}
