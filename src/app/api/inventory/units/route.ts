import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/inventory/units - Fetch all units of measure
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const units = await db.unitOfMeasure.findMany({
            orderBy: { name: 'asc' }
        });

        return NextResponse.json(units);
    } catch (error) {
        console.error('Failed to fetch units:', error);
        return NextResponse.json({ error: 'Failed to fetch units' }, { status: 500 });
    }
}

// POST /api/inventory/units - Create new unit
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();

        const unit = await db.unitOfMeasure.create({
            data: {
                name: body.name,
                symbol: body.symbol,
                decimalPlaces: body.decimalPlaces || 2
            }
        });

        return NextResponse.json(unit, { status: 201 });
    } catch (error) {
        console.error('Unit creation error:', error);
        return NextResponse.json({ error: 'Failed to create unit' }, { status: 500 });
    }
}
