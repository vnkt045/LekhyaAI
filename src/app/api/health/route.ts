
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
    try {
        // Check database connection
        await db.company.count();

        return NextResponse.json(
            { status: 'ok', database: 'connected', timestamp: new Date().toISOString() },
            { status: 200 }
        );
    } catch (error) {
        console.error('Health check failed:', error);
        return NextResponse.json(
            { status: 'error', database: 'disconnected', error: String(error) },
            { status: 503 }
        );
    }
}
