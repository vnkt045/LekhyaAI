import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
    const session: any = await getServerSession(authOptions);
    if (!session || !session.user?.companyId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const entityType = searchParams.get('entityType');
    const userId = searchParams.get('userId');
    const action = searchParams.get('action');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    try {
        const whereClause: any = {};

        // Filter by entity type
        if (entityType && entityType !== 'all') {
            whereClause.entityType = entityType;
        }

        // Filter by user
        if (userId && userId !== 'all') {
            whereClause.userId = userId;
        }

        // Filter by action
        if (action && action !== 'all') {
            whereClause.action = action;
        }

        // Filter by date range
        if (startDate || endDate) {
            whereClause.timestamp = {};
            if (startDate) {
                whereClause.timestamp.gte = new Date(startDate);
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                whereClause.timestamp.lte = end;
            }
        }

        // Search in description, entity ID, or user email
        if (search) {
            whereClause.OR = [
                { description: { contains: search } },
                { entityId: { contains: search } },
                { userEmail: { contains: search } },
                { userName: { contains: search } }
            ];
        }

        // Get total count for pagination
        const total = await db.auditLog.count({ where: whereClause });

        // Fetch logs
        const logs = await db.auditLog.findMany({
            where: whereClause,
            orderBy: { timestamp: 'desc' },
            skip: (page - 1) * limit,
            take: limit
        });

        return NextResponse.json({
            logs,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Failed to fetch audit logs:', error);
        return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
    }
}
