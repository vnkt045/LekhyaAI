
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
        const prefix = 'SO';

        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = String(now.getFullYear()).slice(-2);
        const datePrefix = `${day}${month}${year}`;

        const soPrefix = `${prefix}-${datePrefix}`;

        const todayOrders = await db.salesOrder.findMany({
            where: {
                orderNumber: {
                    startsWith: soPrefix
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

        const orderNumber = `${soPrefix}${String(nextNumber).padStart(6, '0')}`;

        return NextResponse.json({ orderNumber });
    } catch (error) {
        console.error('Error generating SO number:', error);
        return NextResponse.json({ error: 'Failed to generate SO number' }, { status: 500 });
    }
}
