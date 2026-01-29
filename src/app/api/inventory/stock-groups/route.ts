import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/inventory/stock-groups - Fetch all stock groups
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.companyId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const groups = await db.stockGroup.findMany({
            where: { companyId: session.user.companyId! },
            include: {
                parent: true,
                children: true,
                items: {
                    select: {
                        id: true,
                        name: true,
                        currentStock: true
                    }
                }
            },
            orderBy: { name: 'asc' }
        });

        return NextResponse.json(groups);
    } catch (error) {
        console.error('Failed to fetch stock groups:', error);
        return NextResponse.json({ error: 'Failed to fetch stock groups' }, { status: 500 });
    }
}

// POST /api/inventory/stock-groups - Create new stock group
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.companyId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();

        // Check for duplicates
        const existing = await db.stockGroup.findFirst({
            where: {
                name: body.name,
                companyId: session.user.companyId!
            }
        });

        if (existing) {
            return NextResponse.json({ error: 'Stock Group already exists' }, { status: 400 });
        }

        const group = await db.stockGroup.create({
            data: {
                companyId: session.user.companyId!,
                name: body.name,
                parentId: body.parentId || null,
                description: body.description
            }
        });

        return NextResponse.json(group, { status: 201 });
    } catch (error) {
        console.error('Stock group creation error:', error);
        return NextResponse.json({ error: 'Failed to create stock group' }, { status: 500 });
    }
}
