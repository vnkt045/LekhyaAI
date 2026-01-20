import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// Cost Centers
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const centers = await db.costCenter.findMany({
            include: { category: true },
            orderBy: { name: 'asc' }
        });
        return NextResponse.json(centers);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch centers' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await req.json();
        const { name, categoryId } = body;

        if (!name || !categoryId) return NextResponse.json({ error: 'Name and Category required' }, { status: 400 });

        const center = await db.costCenter.create({
            data: {
                name,
                categoryId
            }
        });
        return NextResponse.json(center);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create center' }, { status: 500 });
    }
}
