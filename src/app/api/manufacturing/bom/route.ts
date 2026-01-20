import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

// GET /api/manufacturing/bom - Fetch all BOMs
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const boms = await db.billOfMaterial.findMany({
            include: {
                finishedItem: true,
                components: {
                    include: {
                        item: true
                    }
                },
                manufacturingJournals: {
                    take: 5,
                    orderBy: { date: 'desc' }
                }
            },
            orderBy: { name: 'asc' }
        });

        return NextResponse.json(boms);
    } catch (error) {
        console.error('Failed to fetch BOMs:', error);
        return NextResponse.json({ error: 'Failed to fetch BOMs' }, { status: 500 });
    }
}

// POST /api/manufacturing/bom - Create new BOM
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { name, finishedItemId, components } = body;

        if (!name || !finishedItemId || !components || components.length === 0) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const bom = await db.billOfMaterial.create({
            data: {
                name,
                finishedItemId,
                components: {
                    create: components.map((comp: any) => ({
                        itemId: comp.itemId,
                        quantity: comp.quantity,
                        wastagePercent: comp.wastagePercent || 0
                    }))
                }
            },
            include: {
                finishedItem: true,
                components: {
                    include: {
                        item: true
                    }
                }
            }
        });

        // Audit log
        await logAudit({
            entityType: 'bom',
            entityId: bom.id,
            action: 'CREATE',
            newValue: JSON.stringify(bom),
            req
        });

        return NextResponse.json(bom, { status: 201 });
    } catch (error) {
        console.error('BOM creation error:', error);
        return NextResponse.json({ error: 'Failed to create BOM' }, { status: 500 });
    }
}

// PUT /api/manufacturing/bom - Update BOM
export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { id, name, components } = body;

        if (!id) {
            return NextResponse.json({ error: 'BOM ID is required' }, { status: 400 });
        }

        const oldBOM = await db.billOfMaterial.findUnique({
            where: { id },
            include: { components: true }
        });

        if (!oldBOM) {
            return NextResponse.json({ error: 'BOM not found' }, { status: 404 });
        }

        // Delete old components and create new ones
        await db.bOMComponent.deleteMany({
            where: { bomId: id }
        });

        const updatedBOM = await db.billOfMaterial.update({
            where: { id },
            data: {
                name: name || oldBOM.name,
                components: {
                    create: components.map((comp: any) => ({
                        itemId: comp.itemId,
                        quantity: comp.quantity,
                        wastagePercent: comp.wastagePercent || 0
                    }))
                }
            },
            include: {
                finishedItem: true,
                components: {
                    include: {
                        item: true
                    }
                }
            }
        });

        // Audit log
        await logAudit({
            entityType: 'bom',
            entityId: updatedBOM.id,
            action: 'UPDATE',
            oldValue: JSON.stringify(oldBOM),
            newValue: JSON.stringify(updatedBOM),
            req
        });

        return NextResponse.json(updatedBOM);
    } catch (error) {
        console.error('BOM update error:', error);
        return NextResponse.json({ error: 'Failed to update BOM' }, { status: 500 });
    }
}

// DELETE /api/manufacturing/bom - Delete BOM
export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'BOM ID is required' }, { status: 400 });
        }

        const bom = await db.billOfMaterial.findUnique({
            where: { id },
            include: { manufacturingJournals: true }
        });

        if (!bom) {
            return NextResponse.json({ error: 'BOM not found' }, { status: 404 });
        }

        if (bom.manufacturingJournals.length > 0) {
            return NextResponse.json({ error: 'Cannot delete BOM with manufacturing journals' }, { status: 400 });
        }

        await db.billOfMaterial.delete({ where: { id } });

        // Audit log
        await logAudit({
            entityType: 'bom',
            entityId: id,
            action: 'DELETE',
            oldValue: JSON.stringify(bom),
            req
        });

        return NextResponse.json({ message: 'BOM deleted successfully' });
    } catch (error) {
        console.error('BOM deletion error:', error);
        return NextResponse.json({ error: 'Failed to delete BOM' }, { status: 500 });
    }
}
