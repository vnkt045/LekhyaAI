import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

// GET /api/manufacturing/production - Fetch all manufacturing journals
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const journals = await db.manufacturingJournal.findMany({
            include: {
                bom: {
                    include: {
                        finishedItem: true,
                        components: {
                            include: {
                                item: true
                            }
                        }
                    }
                },
                voucher: true
            },
            orderBy: { date: 'desc' }
        });

        return NextResponse.json(journals);
    } catch (error) {
        console.error('Failed to fetch manufacturing journals:', error);
        return NextResponse.json({ error: 'Failed to fetch manufacturing journals' }, { status: 500 });
    }
}

// POST /api/manufacturing/production - Create manufacturing journal
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { journalNumber, date, bomId, quantityProduced, voucherId } = body;

        if (!journalNumber || !date || !bomId || !quantityProduced) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Fetch BOM with components
        const bom = await db.billOfMaterial.findUnique({
            where: { id: bomId },
            include: {
                finishedItem: true,
                components: {
                    include: {
                        item: true
                    }
                }
            }
        });

        if (!bom) {
            return NextResponse.json({ error: 'BOM not found' }, { status: 404 });
        }

        // Calculate total cost
        let totalCost = 0;
        for (const component of bom.components) {
            const consumedQty = component.quantity * quantityProduced * (1 + component.wastagePercent / 100);
            const cost = consumedQty * component.item.purchaseRate;
            totalCost += cost;
        }

        // Create manufacturing journal
        const journal = await db.manufacturingJournal.create({
            data: {
                journalNumber,
                date: new Date(date),
                bomId,
                voucherId: voucherId || null,
                quantityProduced,
                totalCost
            },
            include: {
                bom: {
                    include: {
                        finishedItem: true,
                        components: {
                            include: {
                                item: true
                            }
                        }
                    }
                }
            }
        });

        // Create stock movements for consumption and production
        for (const component of bom.components) {
            const consumedQty = component.quantity * quantityProduced * (1 + component.wastagePercent / 100);

            // OUT movement for raw material
            await db.stockMovement.create({
                data: {
                    itemId: component.itemId,
                    type: 'OUT',
                    quantity: consumedQty,
                    rate: component.item.purchaseRate,
                    amount: consumedQty * component.item.purchaseRate,
                    date: new Date(date),
                    referenceNo: journalNumber,
                    narration: `Manufacturing consumption for ${bom.name}`
                }
            });
        }

        // IN movement for finished item
        await db.stockMovement.create({
            data: {
                itemId: bom.finishedItemId,
                type: 'IN',
                quantity: quantityProduced,
                rate: totalCost / quantityProduced,
                amount: totalCost,
                date: new Date(date),
                referenceNo: journalNumber,
                narration: `Manufacturing production: ${bom.name}`
            }
        });

        // Audit log
        await logAudit({
            entityType: 'manufacturing_journal',
            entityId: journal.id,
            action: 'CREATE',
            newValue: JSON.stringify(journal),
            req
        });

        return NextResponse.json(journal, { status: 201 });
    } catch (error) {
        console.error('Manufacturing journal creation error:', error);
        return NextResponse.json({ error: 'Failed to create manufacturing journal' }, { status: 500 });
    }
}
