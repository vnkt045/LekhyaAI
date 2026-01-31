import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET: Fetch recent login activity
export async function GET(req: Request) {
    const session: any = await getServerSession(authOptions);

    if (!session || session.user.role !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit') || '50');

        const activities = await db.loginActivity.findMany({
            take: limit,
            orderBy: { loginTime: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true
                    }
                }
            }
        });

        // Get company names for each activity
        const activitiesWithCompany = await Promise.all(
            activities.map(async (activity) => {
                let companyName = 'N/A';
                if (activity.companyId) {
                    const company = await db.company.findUnique({
                        where: { id: activity.companyId },
                        select: { name: true }
                    });
                    companyName = company?.name || 'Unknown';
                }

                return {
                    id: activity.id,
                    userName: activity.user.name,
                    userEmail: activity.user.email,
                    userRole: activity.user.role,
                    companyName,
                    loginTime: activity.loginTime,
                    ipAddress: activity.ipAddress,
                    userAgent: activity.userAgent
                };
            })
        );

        return NextResponse.json({ activities: activitiesWithCompany });
    } catch (error) {
        console.error('Failed to fetch login activity:', error);
        return NextResponse.json({ error: 'Failed to fetch login activity' }, { status: 500 });
    }
}
