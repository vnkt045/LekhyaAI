import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

// GET /api/masters/godowns - Fetch all godowns
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.companyId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const godowns = await db.godown.findMany({
            where: { companyId: session.user.companyId! },
            include: {
                parent: true,
                children: true,
                stockMovements: {
                    select: { id: true },
                },
                voucherItems: {
                    select: { id: true },
                }
            },
            orderBy: { name: 'asc' }
        });

        return NextResponse.json(godowns);
    } catch (error) {
        console.error('Failed to fetch godowns:', error);
        return NextResponse.json({ error: 'Failed to fetch godowns' }, { status: 500 });
    }
}

// POST /api/masters/godowns - Create new godown
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.companyId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();

        if (!body.name) {
            return NextResponse.json({ error: 'Godown name is required' }, { status: 400 });
        }

        // Check for duplicate name in company
        const existing = await db.godown.findFirst({
            where: {
                name: body.name,
                companyId: session.user.companyId!
            }
        });

        if (existing) {
            return NextResponse.json({ error: 'Godown with this name already exists' }, { status: 400 });
        }

        const godown = await db.godown.create({
            data: {
                companyId: session.user.companyId!,
                name: body.name,
                location: body.location || null,
                parentId: body.parentId || null
            },
            include: {
                parent: true
            }
        });

        // Audit log
        await logAudit({
            entityType: 'godown',
            entityId: godown.id,
            action: 'CREATE',
            newValue: godown,
            req
        });

        return NextResponse.json(godown, { status: 201 });
    } catch (error) {
        console.error('Godown creation error:', error);
        return NextResponse.json({ error: 'Failed to create godown' }, { status: 500 });
    }
}

// PUT /api/masters/godowns - Update godown
export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.companyId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { id, name, location, parentId } = body;

        if (!id) {
            return NextResponse.json({ error: 'Godown ID is required' }, { status: 400 });
        }

        const oldGodown = await db.godown.findFirst({
            where: { id, companyId: session.user.companyId! }
        });

        if (!oldGodown) {
            return NextResponse.json({ error: 'Godown not found' }, { status: 404 });
        }

        // Check for duplicate name (excluding current godown)
        if (name && name !== oldGodown.name) {
            const existing = await db.godown.findFirst({
                where: {
                    name,
                    companyId: session.user.companyId!
                }
            });
            if (existing) {
                return NextResponse.json({ error: 'Godown with this name already exists' }, { status: 400 });
            }
        }

        const updatedGodown = await db.godown.update({
            where: { id },
            data: {
                name: name || oldGodown.name,
                location: location !== undefined ? location : oldGodown.location,
                parentId: parentId !== undefined ? parentId : oldGodown.parentId
            },
            include: {
                parent: true
            }
        });

        // Audit log
        await logAudit({
            entityType: 'godown',
            entityId: updatedGodown.id,
            action: 'UPDATE',
            oldValue: oldGodown,
            newValue: updatedGodown,
            req
        });

        return NextResponse.json(updatedGodown);
    } catch (error) {
        console.error('Godown update error:', error);
        return NextResponse.json({ error: 'Failed to update godown' }, { status: 500 });
    }
}

// DELETE /api/masters/godowns - Delete godown
export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.companyId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Godown ID is required' }, { status: 400 });
        }

        const godown = await db.godown.findFirst({
            where: { id, companyId: session.user.companyId! },
            include: {
                stockMovements: true,
                voucherItems: true
            }
        });

        if (!godown) {
            return NextResponse.json({ error: 'Godown not found' }, { status: 404 });
        }

        // Check if godown has stock movements or voucher items
        if (godown.stockMovements.length > 0 || godown.voucherItems.length > 0) {
            return NextResponse.json({ error: 'Cannot delete godown with existing stock movements or voucher items' }, { status: 400 });
        }

        await db.godown.delete({ where: { id } });

        // Audit log
        await logAudit({
            entityType: 'godown',
            entityId: id,
            action: 'DELETE',
            oldValue: godown,
            req
        });

        return NextResponse.json({ message: 'Godown deleted successfully' });
    } catch (error) {
        console.error('Godown deletion error:', error);
        return NextResponse.json({ error: 'Failed to delete godown' }, { status: 500 });
    }
}
