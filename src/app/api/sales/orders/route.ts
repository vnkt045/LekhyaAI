
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

// GET /api/sales/orders
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status');

    try {
        const whereClause: any = {
            AND: []
        };

        if (search) {
            whereClause.AND.push({
                OR: [
                    { orderNumber: { contains: search } },
                    {
                        party: {
                            name: { contains: search }
                        }
                    }
                ]
            });
        }

        if (status) {
            whereClause.AND.push({ status: status });
        }

        const orders = await db.salesOrder.findMany({
            where: whereClause,
            include: {
                items: true,
                party: {
                    select: { name: true }
                },
                originalQuote: {
                    select: { quoteNumber: true }
                }
            },
            orderBy: { date: 'desc' },
            take: 50
        });

        return NextResponse.json(orders);
    } catch (error) {
        console.error('Failed to fetch sales orders:', error);
        return NextResponse.json({ error: 'Failed to fetch sales orders' }, { status: 500 });
    }
}

// POST /api/sales/orders
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();

        // Validation
        if (!body.partyId || !body.date || !body.items || body.items.length === 0) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Transaction to ensure atomicity (especially if updating Quote)
        const salesOrder = await db.$transaction(async (tx) => {

            // Check Quote status if linking
            if (body.originalQuoteId) {
                const quote = await tx.quote.findUnique({
                    where: { id: body.originalQuoteId }
                });

                if (quote && quote.status === 'CONVERTED') {
                    throw new Error('This Quote has already been converted to an Order.');
                }

                // Update Quote Status
                if (quote) {
                    await tx.quote.update({
                        where: { id: quote.id },
                        data: { status: 'CONVERTED' }
                    });
                }
            }

            const newOrder = await tx.salesOrder.create({
                data: {
                    orderNumber: body.orderNumber,
                    date: new Date(body.date),
                    deliveryDate: body.deliveryDate ? new Date(body.deliveryDate) : null,

                    partyId: body.partyId,
                    status: 'OPEN',

                    totalAmount: parseFloat(body.totalAmount) || 0,

                    originalQuoteId: body.originalQuoteId || null,

                    items: {
                        create: body.items.map((item: any) => ({
                            itemId: item.itemId || null,     // Inventory Item Link
                            description: item.description,

                            quantity: parseFloat(item.quantity) || 0,
                            rate: parseFloat(item.rate) || 0,
                            discount: parseFloat(item.discount) || 0,

                            taxableAmount: parseFloat(item.taxableAmount) || 0,
                            taxAmount: parseFloat(item.taxAmount) || 0,
                            totalAmount: parseFloat(item.totalAmount) || 0,

                            hsnSac: item.hsnSac,
                            gstRate: parseFloat(item.gstRate) || 0
                        }))
                    }
                },
                include: {
                    items: true
                }
            });

            return newOrder;
        });

        // Audit Log
        await logAudit({
            entityType: 'salesOrder',
            entityId: salesOrder.id,
            action: 'CREATE',
            newValue: salesOrder,
            req
        });

        return NextResponse.json(salesOrder, { status: 201 });
    } catch (error: any) {
        console.error('Sales Order creation error:', error);
        const message = error.message || 'Failed to create sales order';
        const status = message.includes('already been converted') ? 409 : 500;
        return NextResponse.json({ error: message }, { status: status });
    }
}
