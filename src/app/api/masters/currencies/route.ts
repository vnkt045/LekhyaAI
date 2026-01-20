import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

// GET /api/masters/currencies - Fetch all currencies
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const currencies = await db.currency.findMany({
            include: {
                exchangeRates: {
                    orderBy: { date: 'desc' },
                    take: 1
                }
            },
            orderBy: { code: 'asc' }
        });

        return NextResponse.json(currencies);
    } catch (error) {
        console.error('Failed to fetch currencies:', error);
        return NextResponse.json({ error: 'Failed to fetch currencies' }, { status: 500 });
    }
}

// POST /api/masters/currencies - Create new currency
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { code, name, symbol } = body;

        if (!code || !name || !symbol) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Check for duplicate code
        const existing = await db.currency.findUnique({
            where: { code }
        });

        if (existing) {
            return NextResponse.json({ error: 'Currency code already exists' }, { status: 400 });
        }

        const currency = await db.currency.create({
            data: {
                code: code.toUpperCase(),
                name,
                symbol
            }
        });

        // Audit log
        await logAudit({
            entityType: 'currency',
            entityId: currency.id,
            action: 'CREATE',
            newValue: currency,
            req
        });

        return NextResponse.json(currency, { status: 201 });
    } catch (error) {
        console.error('Currency creation error:', error);
        return NextResponse.json({ error: 'Failed to create currency' }, { status: 500 });
    }
}

// PUT /api/masters/currencies - Update currency
export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { id, name, symbol } = body;

        if (!id) {
            return NextResponse.json({ error: 'Currency ID is required' }, { status: 400 });
        }

        const oldCurrency = await db.currency.findUnique({ where: { id } });
        if (!oldCurrency) {
            return NextResponse.json({ error: 'Currency not found' }, { status: 404 });
        }

        const updatedCurrency = await db.currency.update({
            where: { id },
            data: {
                name: name || oldCurrency.name,
                symbol: symbol || oldCurrency.symbol
            }
        });

        // Audit log
        await logAudit({
            entityType: 'currency',
            entityId: updatedCurrency.id,
            action: 'UPDATE',
            oldValue: oldCurrency,
            newValue: updatedCurrency,
            req
        });

        return NextResponse.json(updatedCurrency);
    } catch (error) {
        console.error('Currency update error:', error);
        return NextResponse.json({ error: 'Failed to update currency' }, { status: 500 });
    }
}

// DELETE /api/masters/currencies - Delete currency
export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Currency ID is required' }, { status: 400 });
        }

        const currency = await db.currency.findUnique({
            where: { id },
            include: { exchangeRates: true }
        });

        if (!currency) {
            return NextResponse.json({ error: 'Currency not found' }, { status: 404 });
        }

        if (currency.exchangeRates.length > 0) {
            return NextResponse.json({ error: 'Cannot delete currency with exchange rates' }, { status: 400 });
        }

        await db.currency.delete({ where: { id } });

        // Audit log
        await logAudit({
            entityType: 'currency',
            entityId: id,
            action: 'DELETE',
            oldValue: currency,
            req
        });

        return NextResponse.json({ message: 'Currency deleted successfully' });
    } catch (error) {
        console.error('Currency deletion error:', error);
        return NextResponse.json({ error: 'Failed to delete currency' }, { status: 500 });
    }
}
