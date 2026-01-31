import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// POST: Track login activity
export async function POST(req: Request) {
    try {
        const session: any = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Extract IP address and user agent
        const forwarded = req.headers.get('x-forwarded-for');
        const ipAddress = forwarded ? forwarded.split(',')[0] :
            req.headers.get('x-real-ip') ||
            'unknown';
        const userAgent = req.headers.get('user-agent') || 'unknown';

        // Create login activity record
        await db.loginActivity.create({
            data: {
                userId: session.user.id,
                companyId: session.user.companyId || null,
                ipAddress,
                userAgent
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to track login activity:', error);
        // Don't fail the login if activity tracking fails
        return NextResponse.json({ success: false, error: 'Failed to track activity' }, { status: 500 });
    }
}
