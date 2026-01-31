import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET: View database tables and data
export async function GET(req: Request) {
    const session: any = await getServerSession(authOptions);

    if (!session || session.user.role !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const table = searchParams.get('table');
        const limit = parseInt(searchParams.get('limit') || '100');

        // If no table specified, return list of tables with counts
        if (!table) {
            const tables = await Promise.all([
                db.user.count().then(count => ({ name: 'User', count })),
                db.company.count().then(count => ({ name: 'Company', count })),
                db.licenseKey.count().then(count => ({ name: 'LicenseKey', count })),
                db.loginActivity.count().then(count => ({ name: 'LoginActivity', count })),
                db.account.count().then(count => ({ name: 'Account', count })),
                db.voucher.count().then(count => ({ name: 'Voucher', count })),
                db.inventoryItem.count().then(count => ({ name: 'InventoryItem', count })),
                db.subscription.count().then(count => ({ name: 'Subscription', count })),
            ]);

            return NextResponse.json({ tables });
        }

        // Fetch data for specific table
        let data: any[] = [];
        switch (table) {
            case 'User':
                data = await db.user.findMany({ take: limit, orderBy: { createdAt: 'desc' } });
                break;
            case 'Company':
                data = await db.company.findMany({
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                    include: { licenseKey: true, subscription: true }
                });
                break;
            case 'LicenseKey':
                data = await db.licenseKey.findMany({
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                    include: { company: { select: { name: true } } }
                });
                break;
            case 'LoginActivity':
                data = await db.loginActivity.findMany({
                    take: limit,
                    orderBy: { loginTime: 'desc' },
                    include: { user: { select: { name: true, email: true } } }
                });
                break;
            case 'Account':
                data = await db.account.findMany({ take: limit, orderBy: { createdAt: 'desc' } });
                break;
            case 'Voucher':
                data = await db.voucher.findMany({ take: limit, orderBy: { date: 'desc' } });
                break;
            case 'InventoryItem':
                data = await db.inventoryItem.findMany({ take: limit, orderBy: { createdAt: 'desc' } });
                break;
            case 'Subscription':
                data = await db.subscription.findMany({
                    take: limit,
                    orderBy: { startDate: 'desc' },
                    include: { company: { select: { name: true } } }
                });
                break;
            default:
                return NextResponse.json({ error: 'Invalid table name' }, { status: 400 });
        }

        return NextResponse.json({ table, data, count: data.length });
    } catch (error) {
        console.error('Failed to fetch database data:', error);
        return NextResponse.json({ error: 'Failed to fetch database data' }, { status: 500 });
    }
}

// POST: Execute raw SQL query (DANGEROUS - Super Admin only)
export async function POST(req: Request) {
    const session: any = await getServerSession(authOptions);

    if (!session || session.user.role !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const { query } = await req.json();

        // Only allow SELECT queries for safety
        if (!query.trim().toUpperCase().startsWith('SELECT')) {
            return NextResponse.json({ error: 'Only SELECT queries are allowed' }, { status: 400 });
        }

        const result = await db.$queryRawUnsafe(query);
        return NextResponse.json({ result });
    } catch (error: any) {
        console.error('Failed to execute query:', error);
        return NextResponse.json({ error: error.message || 'Failed to execute query' }, { status: 500 });
    }
}
