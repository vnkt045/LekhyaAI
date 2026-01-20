import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/inventory/stock-groups - Fetch all stock groups
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const groups = await db.stockGroup.findMany({
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
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();

        const group = await db.stockGroup.create({
            data: {
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
