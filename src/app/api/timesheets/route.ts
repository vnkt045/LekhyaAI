
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

// GET /api/timesheets
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    try {
        const whereClause: any = {
            AND: []
        };

        if (projectId) whereClause.AND.push({ projectId });
        if (userId) whereClause.AND.push({ userId });

        if (startDate) {
            whereClause.AND.push({ date: { gte: new Date(startDate) } });
        }
        if (endDate) {
            whereClause.AND.push({ date: { lte: new Date(endDate) } });
        }

        const timesheets = await db.timesheet.findMany({
            where: whereClause,
            include: {
                project: { select: { name: true } },
                user: { select: { name: true, email: true } },
                entries: {
                    include: {
                        task: { select: { name: true, isBillable: true } }
                    }
                }
            },
            orderBy: { date: 'desc' },
            take: 100
        });

        return NextResponse.json(timesheets);
    } catch (error) {
        console.error('Failed to fetch timesheets:', error);
        return NextResponse.json({ error: 'Failed to fetch timesheets' }, { status: 500 });
    }
}

// POST /api/timesheets
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();

        // Validation
        if (!body.projectId || !body.date || !body.entries || body.entries.length === 0) {
            return NextResponse.json({ error: 'Project, Date, and Entries are required' }, { status: 400 });
        }

        // Check if timesheet already exists for this Project + User + Date?
        // Let's assume User + Date + Project should be unique? Or allow multiple?
        // Schema doesn't enforce uniqueness.
        // But logical flow suggests appending to existing or creating new one.
        // Let's create new for simplicity of POST.

        const timesheet = await db.timesheet.create({
            data: {
                projectId: body.projectId,
                userId: body.userId || session?.user?.email || 'system', // Fallback to email or system if ID missing in session type
                // If storing userId as String in schema and linking to User model:
                // Ensure userId corresponds to a valid User ID.
                // Assuming session.user.id is valid.

                date: new Date(body.date),
                status: 'DRAFT',

                entries: {
                    create: body.entries.map((e: any) => ({
                        taskId: e.taskId,
                        hours: parseFloat(e.hours),
                        description: e.description,
                        isBillable: e.isBillable !== false
                    }))
                }
            },
            include: {
                entries: true
            }
        });

        await logAudit({
            entityType: 'timesheet',
            entityId: timesheet.id,
            action: 'CREATE',
            newValue: timesheet,
            req
        });

        return NextResponse.json(timesheet, { status: 201 });
    } catch (error) {
        console.error('Timesheet creation error:', error);
        return NextResponse.json({ error: 'Failed to create timesheet' }, { status: 500 });
    }
}
