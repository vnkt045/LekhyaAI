import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/tds/sections
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.companyId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const sections = await db.tDSSection.findMany({
            where: {
                isActive: true,
                companyId: session.user.companyId!
            },
            orderBy: { section: 'asc' }
        });

        return NextResponse.json(sections);
    } catch (error) {
        console.error('Failed to fetch TDS sections:', error);
        return NextResponse.json({ error: 'Failed to fetch TDS sections' }, { status: 500 });
    }
}

// POST /api/tds/sections
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.companyId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();

        // Check for duplicates in company
        const existing = await db.tDSSection.findFirst({
            where: {
                section: body.section,
                companyId: session.user.companyId!
            }
        });

        if (existing) {
            return NextResponse.json({ error: 'TDS Section already exists' }, { status: 400 });
        }

        const section = await db.tDSSection.create({
            data: {
                companyId: session.user.companyId!,
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
