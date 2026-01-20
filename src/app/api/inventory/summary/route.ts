
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse('Unauthorized', { status: 401 });

    try {
        const items = await db.inventoryItem.findMany({
            where: { isActive: true },
            select: {
                id: true,
                code: true,
                name: true,
                category: true,
                unit: true,
                currentStock: true,
                purchaseRate: true, // For valuation (FIFO/Avg logic is complex, using Avg logic simplified: Rate * Qty)
            },
            orderBy: { name: 'asc' }
        });

        const summary = items.map(item => ({
            ...item,
            valuation: item.currentStock * item.purchaseRate // Simple valuation
        }));

        return NextResponse.json(summary);
    } catch (error) {
        console.error('Error fetching stock summary:', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
