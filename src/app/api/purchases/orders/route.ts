
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

// GET /api/purchases/orders
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

        const orders = await db.purchaseOrder.findMany({
            where: whereClause,
            include: {
                items: true,
                party: {
                    select: { name: true }
                }
            },
            orderBy: { date: 'desc' },
            take: 50
        });

        return NextResponse.json(orders);
    } catch (error) {
        console.error('Failed to fetch purchase orders:', error);
        return NextResponse.json({ error: 'Failed to fetch purchase orders' }, { status: 500 });
    }
}

// POST /api/purchases/orders
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

        const purchaseOrder = await db.purchaseOrder.create({
            data: {
                orderNumber: body.orderNumber,
                date: new Date(body.date),
                expectedDate: body.expectedDate ? new Date(body.expectedDate) : null,

                partyId: body.partyId,
                status: 'OPEN',

                totalAmount: parseFloat(body.totalAmount) || 0,

                items: {
                    create: body.items.map((item: any) => ({
                        itemId: item.itemId || null,     // Inventory Item Link
                        description: item.description,

                        quantity: parseFloat(item.quantity) || 0,
                        rate: parseFloat(item.rate) || 0,

                        // Default initialized fields (received/billed qty) handled by DB default(0)

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

        // Audit Log
        await logAudit({
            entityType: 'purchaseOrder',
            entityId: purchaseOrder.id,
            action: 'CREATE',
            newValue: purchaseOrder,
            req
        });

        return NextResponse.json(purchaseOrder, { status: 201 });
    } catch (error) {
        console.error('Purchase Order creation error:', error);
        return NextResponse.json({ error: 'Failed to create purchase order' }, { status: 500 });
    }
}
