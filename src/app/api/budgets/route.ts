
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

// GET /api/budgets
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.companyId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const year = searchParams.get('year'); // Optional filter by year

    try {
        const whereClause: any = {
            companyId: session.user.companyId!
        };

        // If filtering by year, we can check overlap range
        if (year) {
            const startOfYear = new Date(`${year}-04-01`); // Assuming April-March
            const endOfYear = new Date(`${parseInt(year) + 1}-03-31`);

            whereClause.financialYearStart = { gte: startOfYear };
            whereClause.financialYearEnd = { lte: endOfYear };
        }

        const budgets = await db.budget.findMany({
            where: whereClause,
            include: {
                entries: {
                    include: {
                        account: { select: { name: true, code: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(budgets);
    } catch (error) {
        console.error('Failed to fetch budgets:', error);
        return NextResponse.json({ error: 'Failed to fetch budgets' }, { status: 500 });
    }
}

// POST /api/budgets
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.companyId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();

        if (!body.name || !body.financialYearStart || !body.financialYearEnd) {
            return NextResponse.json({ error: 'Name and Dates are required' }, { status: 400 });
        }

        const budget = await db.budget.create({
            data: {
                companyId: session.user.companyId!,
                name: body.name,
                financialYearStart: new Date(body.financialYearStart),
                financialYearEnd: new Date(body.financialYearEnd),
                period: body.period || 'MONTHLY',

                entries: {
                    create: (body.entries || []).map((e: any) => ({
                        accountId: e.accountId,
                        periodIndex: parseInt(e.periodIndex) || 1,
                        amount: parseFloat(e.amount) || 0
                    }))
                }
            },
            include: {
                entries: true
            }
        });

        await logAudit({
            entityType: 'budget',
            entityId: budget.id,
            action: 'CREATE',
            newValue: budget,
            req
        });

        return NextResponse.json(budget, { status: 201 });
    } catch (error) {
        console.error('Budget creation error:', error);
        return NextResponse.json({ error: 'Failed to create budget' }, { status: 500 });
    }
}
