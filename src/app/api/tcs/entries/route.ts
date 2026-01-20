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
        const entries = await db.tCSEntry.findMany({
            where: {
                quarter,
                financialYear
            },
            include: {
                config: true,
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
            totalSaleAmount: entries.reduce((sum, e) => sum + e.amount, 0),
            totalTCSAmount: entries.reduce((sum, e) => sum + e.tcsAmount, 0),
            byGoodsType: {} as Record<string, any>
        };

        // Group by goods type
        entries.forEach(entry => {
            const goodsType = entry.config.goodsType;
            if (!summary.byGoodsType[goodsType]) {
                summary.byGoodsType[goodsType] = {
                    config: entry.config,
                    count: 0,
                    totalAmount: 0,
                    totalTCS: 0,
                    entries: []
                };
            }
            summary.byGoodsType[goodsType].count++;
            summary.byGoodsType[goodsType].totalAmount += entry.amount;
            summary.byGoodsType[goodsType].totalTCS += entry.tcsAmount;
            summary.byGoodsType[goodsType].entries.push(entry);
        });

        return NextResponse.json({
            summary,
            entries
        });
    } catch (error) {
        console.error('Failed to fetch TCS entries:', error);
        return NextResponse.json({ error: 'Failed to fetch TCS entries' }, { status: 500 });
    }
}
