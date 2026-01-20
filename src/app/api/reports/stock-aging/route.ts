import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/reports/stock-aging - Generate stock aging report
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const asOfDate = searchParams.get('asOfDate') || new Date().toISOString();

        // Fetch all inventory items with their last stock movement
        const items = await db.inventoryItem.findMany({
            where: {
                currentStock: {
                    gt: 0
                }
            },
            include: {
                movements: {
                    orderBy: {
                        date: 'desc'
                    },
                    take: 1
                }
            }
        });

        const agingData = items.map(item => {
            const lastMovement = item.movements[0];
            const lastMovementDate = lastMovement ? lastMovement.date : item.createdAt;
            const ageInDays = Math.floor((new Date(asOfDate).getTime() - new Date(lastMovementDate).getTime()) / (1000 * 60 * 60 * 24));

            let ageBracket = '90+';
            if (ageInDays <= 30) ageBracket = '0-30';
            else if (ageInDays <= 60) ageBracket = '31-60';
            else if (ageInDays <= 90) ageBracket = '61-90';

            const value = item.currentStock * item.purchaseRate;

            return {
                itemId: item.id,
                itemCode: item.code,
                itemName: item.name,
                currentStock: item.currentStock,
                unit: item.unit,
                purchaseRate: item.purchaseRate,
                value,
                lastMovementDate,
                ageInDays,
                ageBracket
            };
        });

        // Group by age bracket
        const summary = {
            '0-30': { count: 0, value: 0 },
            '31-60': { count: 0, value: 0 },
            '61-90': { count: 0, value: 0 },
            '90+': { count: 0, value: 0 }
        };

        agingData.forEach(item => {
            summary[item.ageBracket as keyof typeof summary].count++;
            summary[item.ageBracket as keyof typeof summary].value += item.value;
        });

        return NextResponse.json({
            asOfDate,
            summary,
            items: agingData
        });
    } catch (error) {
        console.error('Failed to generate stock aging report:', error);
        return NextResponse.json({ error: 'Failed to generate stock aging report' }, { status: 500 });
    }
}
