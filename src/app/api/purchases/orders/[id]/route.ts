
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function GET(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const order = await db.purchaseOrder.findUnique({
            where: { id: params.id },
            include: {
                items: true,
                party: {
                    select: { name: true, email: true, phone: true, address: true }
                },
                bills: {
                    include: {
                        bill: {
                            select: { voucherNumber: true, date: true, totalDebit: true, totalCredit: true }
                        }
                    }
                }
            }
        });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        return NextResponse.json(order);
    } catch (error) {
        console.error('Failed to fetch purchase order:', error);
        return NextResponse.json({ error: 'Failed to fetch purchase order' }, { status: 500 });
    }
}

export async function PUT(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();

        const oldOrder = await db.purchaseOrder.findUnique({
            where: { id: params.id },
            include: { items: true, bills: true }
        });

        if (!oldOrder) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Check if any item has been received or billed (partial)
        // If strict PO: block editing if any downstream activity occurred.
        // We can check `bills` relation or item quantities.
        const hashDownstreamActivity = oldOrder.items.some((i: any) => i.receivedQuantity > 0 || i.billedQuantity > 0);

        if (hashDownstreamActivity || oldOrder.bills.length > 0) {
            return NextResponse.json({ error: 'Cannot update a purchase order that has been partially received or billed.' }, { status: 403 });
        }

        // Transaction
        const updatedOrder = await db.$transaction(async (tx) => {
            // 1. Delete existing items
            await tx.purchaseOrderItem.deleteMany({
                where: { purchaseOrderId: params.id }
            });

            // 2. Update Order
            return await tx.purchaseOrder.update({
                where: { id: params.id },
                data: {
                    date: new Date(body.date),
                    expectedDate: body.expectedDate ? new Date(body.expectedDate) : null,
                    partyId: body.partyId,
                    status: body.status,

                    totalAmount: parseFloat(body.totalAmount) || 0,

                    items: {
                        create: body.items.map((item: any) => ({
                            itemId: item.itemId || null,
                            description: item.description,

                            quantity: parseFloat(item.quantity) || 0,
                            rate: parseFloat(item.rate) || 0,

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
        });

        // Audit Log
        await logAudit({
            entityType: 'purchaseOrder',
            entityId: params.id,
            action: 'UPDATE',
            oldValue: oldOrder,
            newValue: updatedOrder,
            req
        });

        return NextResponse.json(updatedOrder);
    } catch (error) {
        console.error('Purchase Order update error:', error);
        return NextResponse.json({ error: 'Failed to update purchase order' }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const order = await db.purchaseOrder.findUnique({
            where: { id: params.id },
            include: { items: true, bills: true }
        });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        const hashDownstreamActivity = order.items.some((i: any) => i.receivedQuantity > 0 || i.billedQuantity > 0);

        if (hashDownstreamActivity || order.bills.length > 0) {
            return NextResponse.json({ error: 'Cannot delete a purchase order that has been partially received or billed.' }, { status: 403 });
        }

        await db.purchaseOrder.delete({
            where: { id: params.id }
        });

        await logAudit({
            entityType: 'purchaseOrder',
            entityId: params.id,
            action: 'DELETE',
            oldValue: order,
            req
        });

        return NextResponse.json({ message: 'Purchase Order deleted successfully' });
    } catch (error) {
        console.error('Purchase Order deletion error:', error);
        return NextResponse.json({ error: 'Failed to delete purchase order' }, { status: 500 });
    }
}
