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
        const costCenters = await db.costCenter.findMany({
            include: { category: true },
            orderBy: { name: 'asc' }
        });
        return NextResponse.json(costCenters);
    } catch (error) {
        console.error('Failed to fetch cost centers:', error);
        return NextResponse.json({ error: 'Failed to fetch cost centers' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { name } = body;

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        // Ensure Primary Cost Category exists
        let primaryCategory = await db.costCategory.findUnique({
            where: { name: 'Primary Cost Category' }
        });

        if (!primaryCategory) {
            primaryCategory = await db.costCategory.create({
                data: {
                    name: 'Primary Cost Category',
                    allocateRevenue: true,
                    allocateNonRevenue: false, // Default Tally behavior
                }
            });
        }

        const costCenter = await db.costCenter.create({
            data: {
                name,
                categoryId: primaryCategory.id
            }
        });

        return NextResponse.json(costCenter, { status: 201 });
    } catch (error) {
        console.error('Failed to create cost center:', error);
        return NextResponse.json({ error: 'Failed to create cost center' }, { status: 500 });
    }
}
