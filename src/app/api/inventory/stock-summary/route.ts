import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - Stock summary report
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const items = await db.inventoryItem.findMany({
            where: { isActive: true },
            include: {
                movements: {
                    orderBy: { date: 'desc' },
                    take: 1
                }
            },
            orderBy: { name: 'asc' }
        });

        const summary = items.map(item => {
            const stockValue = item.currentStock * item.purchaseRate;
            const isLowStock = item.currentStock <= item.reorderLevel;

            return {
                id: item.id,
                code: item.code,
                name: item.name,
                category: item.category,
                unit: item.unit,
                openingStock: item.openingStock,
                currentStock: item.currentStock,
                reorderLevel: item.reorderLevel,
                purchaseRate: item.purchaseRate,
                saleRate: item.saleRate,
                stockValue: stockValue,
                isLowStock: isLowStock,
                lastMovement: item.movements[0] || null
            };
        });

        const totalValue = summary.reduce((sum, item) => sum + item.stockValue, 0);
        const lowStockCount = summary.filter(item => item.isLowStock).length;

        return NextResponse.json({
            items: summary,
            totals: {
                totalItems: summary.length,
                totalValue: totalValue,
                lowStockCount: lowStockCount
            }
        });
    } catch (error) {
        console.error('Stock summary error:', error);
        return NextResponse.json({ error: 'Failed to generate stock summary' }, { status: 500 });
    }
}
