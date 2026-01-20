
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateInsights } from '@/lib/ai';

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const insights = await generateInsights();
        return NextResponse.json(insights);
    } catch (error) {
        console.error("AI Insight Error", error);
        return NextResponse.json({ error: 'Failed to generate insights' }, { status: 500 });
    }
}
