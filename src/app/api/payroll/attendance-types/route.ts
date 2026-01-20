import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse('Unauthorized', { status: 401 });

    try {
        const types = await db.attendanceType.findMany({
            orderBy: { name: 'asc' }
        });
        return NextResponse.json(types);
    } catch (error) {
        return new NextResponse('Internal Error', { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse('Unauthorized', { status: 401 });

    try {
        const body = await req.json();
        const { name, unitName, isLeave, isPaidLeave } = body;

        const newType = await db.attendanceType.create({
            data: {
                name,
                unitName,
                isLeave,
                isPaidLeave
            }
        });
        return NextResponse.json(newType);
    } catch (error) {
        return new NextResponse('Error creating type', { status: 500 });
    }
}
