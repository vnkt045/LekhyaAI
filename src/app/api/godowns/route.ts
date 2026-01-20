import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const godowns = await db.godown.findMany({
            orderBy: { name: 'asc' }
        });
        return NextResponse.json(godowns);
    } catch (error) {
        console.error('Failed to fetch godowns:', error);
        return NextResponse.json({ error: 'Failed to fetch godowns' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { name, location } = body;

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        const godown = await db.godown.create({
            data: {
                name,
                location
            }
        });

        return NextResponse.json(godown, { status: 201 });
    } catch (error) {
        console.error('Failed to create godown:', error);
        return NextResponse.json({ error: 'Failed to create godown' }, { status: 500 });
    }
}
