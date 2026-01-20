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
        const configs = await db.tCSConfig.findMany({
            where: { isActive: true },
            orderBy: { goodsType: 'asc' }
        });

        return NextResponse.json(configs);
    } catch (error) {
        console.error('Failed to fetch TCS configs:', error);
        return NextResponse.json({ error: 'Failed to fetch TCS configs' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();

        const config = await db.tCSConfig.create({
            data: {
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
