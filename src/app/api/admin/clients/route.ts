import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

/**
 * GET /api/admin/clients
 * List all clients
 */
export async function GET(req: Request) {
    try {
        const cookieStore = await cookies();
        const adminSessionId = cookieStore.get('admin_session')?.value;

        if (!adminSessionId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const clients = await db.client.findMany({
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(clients);
    } catch (error) {
        console.error('Failed to fetch clients:', error);
        return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
    }
}

/**
 * POST /api/admin/clients
 * Create new client
 */
export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const adminSessionId = cookieStore.get('admin_session')?.value;

        if (!adminSessionId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();

        // Generate license key
        const licenseKey = `LKY-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        const client = await db.client.create({
            data: {
                ...body,
                licenseKey,
                subscriptionStart: new Date(),
            },
        });

        return NextResponse.json(client);
    } catch (error) {
        console.error('Failed to create client:', error);
        return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
    }
}
