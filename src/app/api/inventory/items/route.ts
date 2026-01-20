
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse('Unauthorized', { status: 401 });

    try {
        const items = await db.inventoryItem.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' }
        });
        return NextResponse.json(items);
    } catch (error) {
        console.error('Error fetching inventory items:', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse('Unauthorized', { status: 401 });

    try {
        const body = await req.json();
        const { code, name, category, unit, hsnCode, purchaseRate, saleRate, openingStock } = body;

        // Check for duplicate code (Barcode)
        const existing = await db.inventoryItem.findUnique({
            where: { code }
        });

        if (existing) {
            return new NextResponse('Item code/barcode already exists', { status: 400 });
        }

        const newItem = await db.inventoryItem.create({
            data: {
                code,
                name,
                category,
                unit,
                hsnCode,
                purchaseRate: parseFloat(purchaseRate),
                saleRate: parseFloat(saleRate),
                openingStock: parseFloat(openingStock || 0),
                currentStock: parseFloat(openingStock || 0), // Init current stock with opening
            }
        });

        // If opening stock > 0, we should record a movement (Optional but good practice)
        if (newItem.openingStock > 0) {
            await db.stockMovement.create({
                data: {
                    itemId: newItem.id,
                    type: 'IN', // Opening Stock treated as IN? Or separate type. Using IN for simplicity.
                    quantity: newItem.openingStock,
                    rate: newItem.purchaseRate,
                    amount: newItem.openingStock * newItem.purchaseRate,
                    narration: 'Opening Stock',
                    date: new Date()
                }
            });
        }

        // Log inventory item creation in audit trail
        await logAudit({
            entityType: 'inventory_item',
            entityId: newItem.id,
            action: 'CREATE',
            newValue: newItem,
            req
        });

        return NextResponse.json(newItem);
    } catch (error) {
        console.error('Error creating item:', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}

