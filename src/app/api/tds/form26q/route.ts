import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateForm26Q } from '@/lib/tds';

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const quarter = searchParams.get('quarter');
    const financialYear = searchParams.get('financialYear');

    if (!quarter || !financialYear) {
        return NextResponse.json({
            error: 'Quarter and Financial Year are required'
        }, { status: 400 });
    }

    try {
        const form26Q = await generateForm26Q(quarter, financialYear);

        return NextResponse.json(form26Q);
    } catch (error) {
        console.error('Failed to generate Form 26Q:', error);
        return NextResponse.json({ error: 'Failed to generate Form 26Q' }, { status: 500 });
    }
}
