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
        const item = await db.inventoryItem.findUnique({
            where: { id: params.id },
            include: {
                movements: {
                    take: 10,
                    orderBy: { date: 'desc' }
                }
            }
        });

        if (!item) {
            return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 });
        }

        return NextResponse.json(item);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch inventory item' }, { status: 500 });
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

        // Fetch old value for audit trail
        const oldItem = await db.inventoryItem.findUnique({
            where: { id: params.id }
        });

        if (!oldItem) {
            return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 });
        }

        // Update inventory item
        const updatedItem = await db.inventoryItem.update({
            where: { id: params.id },
            data: {
                code: body.code,
                name: body.name,
                description: body.description,
                category: body.category,
                unit: body.unit,
                hsnCode: body.hsnCode,
                gstRate: body.gstRate,
                purchaseRate: body.purchaseRate,
                saleRate: body.saleRate,
                mrp: body.mrp,
                reorderLevel: body.reorderLevel,
                valuationMethod: body.valuationMethod,
                alternateUnit: body.alternateUnit,
                conversionFactor: body.conversionFactor,
                isActive: body.isActive
            }
        });

        // Log the update in audit trail
        await logAudit({
            entityType: 'inventory_item',
            entityId: params.id,
            action: 'UPDATE',
            oldValue: oldItem,
            newValue: updatedItem,
            req
        });

        return NextResponse.json(updatedItem);
    } catch (error) {
        console.error('Inventory item update error:', error);
        return NextResponse.json({ error: 'Failed to update inventory item' }, { status: 500 });
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
        // Fetch item before deletion for audit trail
        const item = await db.inventoryItem.findUnique({
            where: { id: params.id }
        });

        if (!item) {
            return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 });
        }

        // Delete inventory item
        await db.inventoryItem.delete({
            where: { id: params.id }
        });

        // Log the deletion in audit trail
        await logAudit({
            entityType: 'inventory_item',
            entityId: params.id,
            action: 'DELETE',
            oldValue: item,
            req
        });

        return NextResponse.json({ message: 'Inventory item deleted successfully' });
    } catch (error) {
        console.error('Inventory item deletion error:', error);
        return NextResponse.json({ error: 'Failed to delete inventory item' }, { status: 500 });
    }
}
