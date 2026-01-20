import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - List stock movements
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const itemId = searchParams.get('itemId');
        const type = searchParams.get('type');
        const fromDate = searchParams.get('fromDate');
        const toDate = searchParams.get('toDate');

        const whereClause: any = {};

        if (itemId) {
            whereClause.itemId = itemId;
        }

        if (type) {
            whereClause.type = type;
        }

        if (fromDate || toDate) {
            whereClause.date = {};
            if (fromDate) whereClause.date.gte = new Date(fromDate);
            if (toDate) whereClause.date.lte = new Date(toDate);
        }

        const movements = await db.stockMovement.findMany({
            where: whereClause,
            include: {
                item: {
                    select: {
                        code: true,
                        name: true,
                        unit: true
                    }
                },
                voucher: {
                    select: {
                        voucherNumber: true,
                        voucherType: true
                    }
                }
            },
            orderBy: { date: 'desc' }
        });

        return NextResponse.json(movements);
    } catch (error) {
        console.error('Stock movements fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch stock movements' }, { status: 500 });
    }
}

// POST - Record stock movement
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();

        // Validation
        if (!body.itemId || !body.type || !body.quantity || !body.rate) {
            return NextResponse.json({
                error: 'Item, Type, Quantity, and Rate are required'
            }, { status: 400 });
        }

        const quantity = parseFloat(body.quantity);
        const rate = parseFloat(body.rate);
        const amount = quantity * rate;

        // Create stock movement
        const movement = await db.stockMovement.create({
            data: {
                itemId: body.itemId,
                type: body.type, // IN, OUT, ADJUST
                quantity: quantity,
                rate: rate,
                amount: amount,
                voucherId: body.voucherId || null,
                referenceNo: body.referenceNo || null,
                narration: body.narration || null,
                date: body.date ? new Date(body.date) : new Date(),
                godown: body.godown || 'Main'
            }
        });

        // Update item's current stock
        const item = await db.inventoryItem.findUnique({
            where: { id: body.itemId }
        });

        if (item) {
            let newStock = item.currentStock;

            if (body.type === 'IN') {
                newStock += quantity;
            } else if (body.type === 'OUT') {
                newStock -= quantity;
            } else if (body.type === 'ADJUST') {
                // For adjustment, quantity can be positive or negative
                newStock = quantity;
            }

            await db.inventoryItem.update({
                where: { id: body.itemId },
                data: { currentStock: newStock }
            });
        }

        return NextResponse.json(movement, { status: 201 });
    } catch (error) {
        console.error('Stock movement creation error:', error);
        return NextResponse.json({ error: 'Failed to record stock movement' }, { status: 500 });
    }
}
