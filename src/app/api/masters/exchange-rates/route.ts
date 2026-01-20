import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

// GET /api/masters/exchange-rates - Fetch exchange rates
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const currencyId = searchParams.get('currencyId');
        const date = searchParams.get('date');

        const where: any = {};
        if (currencyId) where.currencyId = currencyId;
        if (date) where.date = new Date(date);

        const rates = await db.exchangeRate.findMany({
            where,
            include: {
                currency: true
            },
            orderBy: { date: 'desc' }
        });

        return NextResponse.json(rates);
    } catch (error) {
        console.error('Failed to fetch exchange rates:', error);
        return NextResponse.json({ error: 'Failed to fetch exchange rates' }, { status: 500 });
    }
}

// POST /api/masters/exchange-rates - Create exchange rate
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { currencyId, date, rate } = body;

        if (!currencyId || !date || !rate) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Check for duplicate (currency + date)
        const existing = await db.exchangeRate.findFirst({
            where: {
                currencyId,
                date: new Date(date)
            }
        });

        if (existing) {
            return NextResponse.json({ error: 'Exchange rate for this currency and date already exists' }, { status: 400 });
        }

        const exchangeRate = await db.exchangeRate.create({
            data: {
                currencyId,
                date: new Date(date),
                rate: parseFloat(rate)
            },
            include: {
                currency: true
            }
        });

        // Audit log
        await logAudit({
            entityType: 'exchange_rate',
            entityId: exchangeRate.id,
            action: 'CREATE',
            newValue: JSON.stringify(exchangeRate),
            req
        });

        return NextResponse.json(exchangeRate, { status: 201 });
    } catch (error) {
        console.error('Exchange rate creation error:', error);
        return NextResponse.json({ error: 'Failed to create exchange rate' }, { status: 500 });
    }
}

// PUT /api/masters/exchange-rates - Update exchange rate
export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { id, rate } = body;

        if (!id || !rate) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const oldRate = await db.exchangeRate.findUnique({ where: { id } });
        if (!oldRate) {
            return NextResponse.json({ error: 'Exchange rate not found' }, { status: 404 });
        }

        const updatedRate = await db.exchangeRate.update({
            where: { id },
            data: {
                rate: parseFloat(rate)
            },
            include: {
                currency: true
            }
        });

        // Audit log
        await logAudit({
            entityType: 'exchange_rate',
            entityId: updatedRate.id,
            action: 'UPDATE',
            oldValue: JSON.stringify(oldRate),
            newValue: JSON.stringify(updatedRate),
            req
        });

        return NextResponse.json(updatedRate);
    } catch (error) {
        console.error('Exchange rate update error:', error);
        return NextResponse.json({ error: 'Failed to update exchange rate' }, { status: 500 });
    }
}

// DELETE /api/masters/exchange-rates - Delete exchange rate
export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Exchange rate ID is required' }, { status: 400 });
        }

        const rate = await db.exchangeRate.findUnique({
            where: { id },
            include: { currency: true }
        });

        if (!rate) {
            return NextResponse.json({ error: 'Exchange rate not found' }, { status: 404 });
        }

        await db.exchangeRate.delete({ where: { id } });

        // Audit log
        await logAudit({
            entityType: 'exchange_rate',
            entityId: id,
            action: 'DELETE',
            oldValue: JSON.stringify(rate),
            req
        });

        return NextResponse.json({ message: 'Exchange rate deleted successfully' });
    } catch (error) {
        console.error('Exchange rate deletion error:', error);
        return NextResponse.json({ error: 'Failed to delete exchange rate' }, { status: 500 });
    }
}
