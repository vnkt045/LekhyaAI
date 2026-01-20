
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse('Unauthorized', { status: 401 });

    try {
        const body = await req.json();
        const { name, category, unit, hsnCode, purchaseRate, saleRate } = body;

        const updatedItem = await db.inventoryItem.update({
            where: { id: params.id },
            data: {
                name,
                category,
                unit,
                hsnCode,
                purchaseRate: parseFloat(purchaseRate),
                saleRate: parseFloat(saleRate),
            }
        });

        return NextResponse.json(updatedItem);
    } catch (error) {
        console.error('Error updating item:', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse('Unauthorized', { status: 401 });

    try {
        // Soft delete
        await db.inventoryItem.update({
            where: { id: params.id },
            data: { isActive: false }
        });
        return NextResponse.json({ message: 'Item deleted' });
    } catch (error) {
        console.error('Error deleting item:', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
