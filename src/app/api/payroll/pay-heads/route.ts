import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.companyId) return new NextResponse('Unauthorized', { status: 401 });

    try {
        const payHeads = await db.payHead.findMany({
            where: {
                companyId: session.user.companyId!
            },
            orderBy: { name: 'asc' }
        });
        return NextResponse.json(payHeads);
    } catch (error) {
        return new NextResponse('Internal Error', { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.companyId) return new NextResponse('Unauthorized', { status: 401 });

    try {
        const body = await req.json();
        const { name, type, calculationType, ledgerName } = body;

        const newPayHead = await db.payHead.create({
            data: {
                companyId: session.user.companyId!,
                name,
                type,
                calculationType,
                ledgerName
            }
        });
        return NextResponse.json(newPayHead);
    } catch (error) {
        return new NextResponse('Error creating Pay Head', { status: 500 });
    }
}
