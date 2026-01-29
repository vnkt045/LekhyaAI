
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
        const order = await db.salesOrder.findUnique({
            where: { id: params.id },
            include: {
                items: true,
                party: {
                    select: { name: true, email: true, phone: true, address: true }
                },
                invoices: {
                    include: {
                        invoice: {
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
        console.error('Failed to fetch order:', error);
        return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
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

        const oldOrder = await db.salesOrder.findUnique({
            where: { id: params.id },
            include: { items: true, invoices: true }
        });

        if (!oldOrder) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        if (oldOrder.invoices.length > 0) {
            // Strict: Cannot edit strict details if already invoiced.
            // For now, let's allow basic edits but warn/block if amount changes significantly?
            // Simplest: Block fully if Invoiced.
            // If status is PARTIALLY_INVOICED, edit might be tricky.
            // Let's block if ANY invoice exists for safety in Phase 1.
            return NextResponse.json({ error: 'Cannot update an order that has linked invoices.' }, { status: 403 });
        }

        // Transaction
        const updatedOrder = await db.$transaction(async (tx) => {
            // 1. Delete existing items
            await tx.salesOrderItem.deleteMany({
                where: { salesOrderId: params.id }
            });

            // 2. Update Order
            return await tx.salesOrder.update({
                where: { id: params.id },
                data: {
                    date: new Date(body.date),
                    deliveryDate: body.deliveryDate ? new Date(body.deliveryDate) : null,
                    partyId: body.partyId,
                    status: body.status,

                    totalAmount: parseFloat(body.totalAmount) || 0,

                    items: {
                        create: body.items.map((item: any) => ({
                            itemId: item.itemId || null,
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
        });

        // Audit Log
        await logAudit({
            entityType: 'salesOrder',
            entityId: params.id,
            action: 'UPDATE',
            oldValue: oldOrder,
            newValue: updatedOrder,
            req
        });

        return NextResponse.json(updatedOrder);
    } catch (error) {
        console.error('Order update error:', error);
        return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
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
        const order = await db.salesOrder.findUnique({
            where: { id: params.id },
            include: { invoices: true }
        });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        if (order.invoices.length > 0) {
            return NextResponse.json({ error: 'Cannot delete an order that has linked invoices.' }, { status: 403 });
        }

        await db.salesOrder.delete({
            where: { id: params.id }
        });

        await logAudit({
            entityType: 'salesOrder',
            entityId: params.id,
            action: 'DELETE',
            oldValue: order,
            req
        });

        return NextResponse.json({ message: 'Order deleted successfully' });
    } catch (error) {
        console.error('Order deletion error:', error);
        return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
    }
}
