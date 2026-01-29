
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

// GET /api/projects
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.companyId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status');
    const customerId = searchParams.get('customerId');

    try {
        const whereClause: any = {
            companyId: session.user.companyId!,
            AND: []
        };

        if (search) {
            whereClause.AND.push({
                OR: [
                    { name: { contains: search } },
                    { customer: { name: { contains: search } } }
                ]
            });
        }

        if (status) {
            whereClause.AND.push({ status: status });
        }

        if (customerId) {
            whereClause.AND.push({ customerId: customerId });
        }

        const projects = await db.project.findMany({
            where: whereClause,
            include: {
                customer: { select: { name: true } },
                _count: {
                    select: { tasks: true, timesheets: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        return NextResponse.json(projects);
    } catch (error) {
        console.error('Failed to fetch projects:', error);
        return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
    }
}

// POST /api/projects
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.companyId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();

        if (!body.name || !body.customerId) {
            return NextResponse.json({ error: 'Name and Customer are required' }, { status: 400 });
        }

        const project = await db.project.create({
            data: {
                companyId: session.user.companyId!,
                name: body.name,
                description: body.description,
                customerId: body.customerId,

                billingType: body.billingType || 'HOURLY',
                projectAmount: parseFloat(body.projectAmount) || 0,
                ratePerHour: parseFloat(body.ratePerHour) || 0,

                status: 'ACTIVE',
                startDate: body.startDate ? new Date(body.startDate) : new Date(),
                endDate: body.endDate ? new Date(body.endDate) : null,

                tasks: {
                    create: (body.tasks || []).map((t: any) => ({
                        name: t.name,
                        description: t.description,
                        isBillable: t.isBillable !== false,
                        ratePerHour: t.ratePerHour ? parseFloat(t.ratePerHour) : undefined
                    }))
                }
            },
            include: {
                tasks: true
            }
        });

        await logAudit({
            entityType: 'project',
            entityId: project.id,
            action: 'CREATE',
            newValue: project,
            req
        });

        return NextResponse.json(project, { status: 201 });
    } catch (error) {
        console.error('Project creation error:', error);
        return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
    }
}
