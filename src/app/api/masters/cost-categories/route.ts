import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// Cost Categories
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const categories = await db.costCategory.findMany({
            include: { _count: { select: { costCenters: true } } },
            orderBy: { name: 'asc' }
        });
        return NextResponse.json(categories);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await req.json();
        const { name, allocateRevenue, allocateNonRevenue } = body;

        if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 });

        const category = await db.costCategory.create({
            data: {
                name,
                allocateRevenue: allocateRevenue ?? true,
                allocateNonRevenue: allocateNonRevenue ?? false
            }
        });
        return NextResponse.json(category);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
    }
}
