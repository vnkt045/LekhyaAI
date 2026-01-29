
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const prefix = 'PO';

        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = String(now.getFullYear()).slice(-2);
        const datePrefix = `${day}${month}${year}`;

        const poPrefix = `${prefix}-${datePrefix}`;

        const todayOrders = await db.purchaseOrder.findMany({
            where: {
                orderNumber: {
                    startsWith: poPrefix
                }
            },
            orderBy: {
                orderNumber: 'desc'
            },
            take: 1
        });

        let nextNumber = 1;

        if (todayOrders.length > 0) {
            const lastOrder = todayOrders[0].orderNumber;
            const lastNumberStr = lastOrder.slice(-6);
            const lastNumber = parseInt(lastNumberStr, 10);
            if (!isNaN(lastNumber)) {
                nextNumber = lastNumber + 1;
            }
        }

        const orderNumber = `${poPrefix}${String(nextNumber).padStart(6, '0')}`;

        return NextResponse.json({ orderNumber });
    } catch (error) {
        console.error('Error generating PO number:', error);
        return NextResponse.json({ error: 'Failed to generate PO number' }, { status: 500 });
    }
}
