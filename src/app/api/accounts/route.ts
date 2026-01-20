
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type');

        const whereClause: any = { isActive: true };
        if (type) {
            whereClause.type = type;
        }

        const accounts = await db.account.findMany({
            where: whereClause,
            orderBy: { name: 'asc' }
        });

        return NextResponse.json(accounts);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();

        // Basic validation
        if (!body.name || !body.type) {
            return NextResponse.json({ error: 'Name and Type are required' }, { status: 400 });
        }

        // Generate a simple code if not provided (in real app, use complex logic)
        const code = body.code || body.name.substring(0, 3).toUpperCase() + Math.floor(Math.random() * 1000);

        const account = await db.account.create({
            data: {
                name: body.name,
                code: code,
                type: body.type,  // Asset, Liability, Equity, Revenue, Expense
                parentId: body.parentGroup || null,
                balance: parseFloat(body.openingBalance) || 0,
                isActive: true,
                // @ts-ignore: Prisma client might be stale
                isCostCenterEnabled: body.isCostCenterEnabled || false
            }
        });

        // Log the creation in audit trail
        await logAudit({
            entityType: 'account',
            entityId: account.id,
            action: 'CREATE',
            newValue: account,
            req
        });

        return NextResponse.json(account, { status: 201 });
    } catch (error) {
        console.error('Account creation error:', error);
        return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
    }
}

