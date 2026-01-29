import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/tcs/configs
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.companyId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const configs = await db.tCSConfig.findMany({
            where: {
                isActive: true,
                companyId: session.user.companyId!
            },
            orderBy: { goodsType: 'asc' }
        });

        return NextResponse.json(configs);
    } catch (error) {
        console.error('Failed to fetch TCS configs:', error);
        return NextResponse.json({ error: 'Failed to fetch TCS configs' }, { status: 500 });
    }
}

// POST /api/tcs/configs
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.companyId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();

        // Check for duplicates in company
        const existing = await db.tCSConfig.findFirst({
            where: {
                goodsType: body.goodsType,
                companyId: session.user.companyId!
            }
        });

        if (existing) {
            return NextResponse.json({ error: 'TCS Config for this Goods Type already exists' }, { status: 400 });
        }

        const config = await db.tCSConfig.create({
            data: {
                companyId: session.user.companyId!,
                goodsType: body.goodsType,
                description: body.description,
                threshold: parseFloat(body.threshold),
                rate: parseFloat(body.rate),
                isActive: body.isActive !== undefined ? body.isActive : true
            }
        });

        return NextResponse.json(config, { status: 201 });
    } catch (error) {
        console.error('Failed to create TCS config:', error);
        return NextResponse.json({ error: 'Failed to create TCS config' }, { status: 500 });
    }
}
