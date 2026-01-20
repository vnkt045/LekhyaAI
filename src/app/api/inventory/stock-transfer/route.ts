import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

// GET /api/inventory/stock-transfer - Fetch all stock transfers
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');

        const transfers = await db.stockTransfer.findMany({
            where: status ? { status } : undefined,
            include: {
                fromGodown: true,
                toGodown: true,
                items: {
                    include: {
                        item: true
                    }
                }
            },
            orderBy: { date: 'desc' }
        });

        return NextResponse.json(transfers);
    } catch (error) {
        console.error('Failed to fetch stock transfers:', error);
        return NextResponse.json({ error: 'Failed to fetch stock transfers' }, { status: 500 });
    }
}

// POST /api/inventory/stock-transfer - Create new stock transfer
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { transferNumber, date, fromGodownId, toGodownId, items, status } = body;

        if (!transferNumber || !date || !fromGodownId || !toGodownId || !items || items.length === 0) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (fromGodownId === toGodownId) {
            return NextResponse.json({ error: 'Source and destination godowns cannot be the same' }, { status: 400 });
        }

        // Check if transfer number already exists
        const existing = await db.stockTransfer.findUnique({
            where: { transferNumber }
        });

        if (existing) {
            return NextResponse.json({ error: 'Transfer number already exists' }, { status: 400 });
        }

        // Create transfer with items
        const transfer = await db.stockTransfer.create({
            data: {
                transferNumber,
                date: new Date(date),
                fromGodownId,
                toGodownId,
                status: status || 'PENDING',
                createdBy: session.user.email,
                items: {
                    create: items.map((item: any) => ({
                        itemId: item.itemId,
                        quantity: item.quantity,
                        batchNumber: item.batchNumber || null
                    }))
                }
            },
            include: {
                fromGodown: true,
                toGodown: true,
                items: {
                    include: {
                        item: true
                    }
                }
            }
        });

        // If status is COMPLETED, create stock movements
        if (status === 'COMPLETED') {
            for (const item of items) {
                // OUT from source godown
                await db.stockMovement.create({
                    data: {
                        itemId: item.itemId,
                        type: 'OUT',
                        quantity: item.quantity,
                        rate: 0, // Transfer doesn't change value
                        amount: 0,
                        date: new Date(date),
                        godownId: fromGodownId,
                        referenceNo: transferNumber,
                        narration: `Stock transfer to ${transfer.toGodown.name}`,
                        batchNumber: item.batchNumber || null
                    }
                });

                // IN to destination godown
                await db.stockMovement.create({
                    data: {
                        itemId: item.itemId,
                        type: 'IN',
                        quantity: item.quantity,
                        rate: 0,
                        amount: 0,
                        date: new Date(date),
                        godownId: toGodownId,
                        referenceNo: transferNumber,
                        narration: `Stock transfer from ${transfer.fromGodown.name}`,
                        batchNumber: item.batchNumber || null
                    }
                });
            }
        }

        // Audit log
        await logAudit({
            entityType: 'stock_transfer',
            entityId: transfer.id,
            action: 'CREATE',
            newValue: JSON.stringify(transfer),
            req
        });

        return NextResponse.json(transfer, { status: 201 });
    } catch (error) {
        console.error('Stock transfer creation error:', error);
        return NextResponse.json({ error: 'Failed to create stock transfer' }, { status: 500 });
    }
}

// PUT /api/inventory/stock-transfer - Complete a pending transfer
export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { id } = body;

        if (!id) {
            return NextResponse.json({ error: 'Transfer ID is required' }, { status: 400 });
        }

        const transfer = await db.stockTransfer.findUnique({
            where: { id },
            include: {
                fromGodown: true,
                toGodown: true,
                items: {
                    include: {
                        item: true
                    }
                }
            }
        });

        if (!transfer) {
            return NextResponse.json({ error: 'Transfer not found' }, { status: 404 });
        }

        if (transfer.status === 'COMPLETED') {
            return NextResponse.json({ error: 'Transfer already completed' }, { status: 400 });
        }

        // Update status
        const updatedTransfer = await db.stockTransfer.update({
            where: { id },
            data: {
                status: 'COMPLETED',
                completedAt: new Date()
            },
            include: {
                fromGodown: true,
                toGodown: true,
                items: {
                    include: {
                        item: true
                    }
                }
            }
        });

        // Create stock movements
        for (const item of transfer.items) {
            // OUT from source godown
            await db.stockMovement.create({
                data: {
                    itemId: item.itemId,
                    type: 'OUT',
                    quantity: item.quantity,
                    rate: 0,
                    amount: 0,
                    date: transfer.date,
                    godownId: transfer.fromGodownId,
                    referenceNo: transfer.transferNumber,
                    narration: `Stock transfer to ${transfer.toGodown.name}`,
                    batchNumber: item.batchNumber || null
                }
            });

            // IN to destination godown
            await db.stockMovement.create({
                data: {
                    itemId: item.itemId,
                    type: 'IN',
                    quantity: item.quantity,
                    rate: 0,
                    amount: 0,
                    date: transfer.date,
                    godownId: transfer.toGodownId,
                    referenceNo: transfer.transferNumber,
                    narration: `Stock transfer from ${transfer.fromGodown.name}`,
                    batchNumber: item.batchNumber || null
                }
            });
        }

        // Audit log
        await logAudit({
            entityType: 'stock_transfer',
            entityId: updatedTransfer.id,
            action: 'UPDATE',
            oldValue: JSON.stringify(transfer),
            newValue: JSON.stringify(updatedTransfer),
            req
        });

        return NextResponse.json(updatedTransfer);
    } catch (error) {
        console.error('Stock transfer completion error:', error);
        return NextResponse.json({ error: 'Failed to complete stock transfer' }, { status: 500 });
    }
}
