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
        const sections = await db.tDSSection.findMany({
            where: { isActive: true },
            orderBy: { section: 'asc' }
        });

        return NextResponse.json(sections);
    } catch (error) {
        console.error('Failed to fetch TDS sections:', error);
        return NextResponse.json({ error: 'Failed to fetch TDS sections' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();

        const section = await db.tDSSection.create({
            data: {
                section: body.section,
                description: body.description,
                thresholdLimit: parseFloat(body.thresholdLimit),
                rateWithPAN: parseFloat(body.rateWithPAN),
                rateWithoutPAN: parseFloat(body.rateWithoutPAN),
                applicableOn: body.applicableOn,
                isActive: body.isActive !== undefined ? body.isActive : true
            }
        });

        return NextResponse.json(section, { status: 201 });
    } catch (error) {
        console.error('Failed to create TDS section:', error);
        return NextResponse.json({ error: 'Failed to create TDS section' }, { status: 500 });
    }
}
