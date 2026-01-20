import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getTrialBalance } from '@/lib/reports';

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const fromParam = searchParams.get('from');
        const toParam = searchParams.get('to');

        // Parse dates safely. If invalid, pass undefined to fetch all.
        // Or default to current FY? Let's leave it flexible.
        const fromDate = fromParam && !isNaN(Date.parse(fromParam)) ? new Date(fromParam) : undefined;
        const toDate = toParam && !isNaN(Date.parse(toParam)) ? new Date(toParam) : undefined;

        console.log(`Generating Trial Balance from ${fromDate} to ${toDate}`);

        const data = await getTrialBalance(fromDate, toDate);

        return NextResponse.json(data);
    } catch (error) {
        console.error('Trial Balance Error:', error);
        return NextResponse.json(
            { error: 'Failed to generate Trial Balance' },
            { status: 500 }
        );
    }
}
