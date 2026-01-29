
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function GET(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const project = await db.project.findUnique({
            where: { id: params.id },
            include: {
                customer: { select: { name: true, email: true } },
                tasks: true,
                expenses: true,
                invoices: {
                    include: {
                        invoice: { select: { voucherNumber: true, date: true, totalDebit: true } }
                    }
                }
            }
        });

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        return NextResponse.json(project);
    } catch (error) {
        console.error('Failed to fetch project:', error);
        return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
    }
}

export async function PUT(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();

        const oldProject = await db.project.findUnique({
            where: { id: params.id }
        });

        if (!oldProject) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        // Only update Project Header. Tasks should be managed separately to avoid losing IDs linked to timesheets.
        const updatedProject = await db.project.update({
            where: { id: params.id },
            data: {
                name: body.name,
                description: body.description,
                customerId: body.customerId,
                billingType: body.billingType,
                projectAmount: parseFloat(body.projectAmount),
                ratePerHour: parseFloat(body.ratePerHour),
                status: body.status,
                startDate: body.startDate ? new Date(body.startDate) : undefined,
                endDate: body.endDate ? new Date(body.endDate) : undefined
            }
        });

        await logAudit({
            entityType: 'project',
            entityId: params.id,
            action: 'UPDATE',
            oldValue: oldProject,
            newValue: updatedProject,
            req
        });

        return NextResponse.json(updatedProject);
    } catch (error) {
        console.error('Project update error:', error);
        return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const project = await db.project.findUnique({
            where: { id: params.id },
            include: { timesheets: true, invoices: true }
        });

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        if (project.timesheets.length > 0 || project.invoices.length > 0) {
            return NextResponse.json({ error: 'Cannot delete project with linked timesheets or invoices.' }, { status: 403 });
        }

        await db.project.delete({
            where: { id: params.id }
        });

        await logAudit({
            entityType: 'project',
            entityId: params.id,
            action: 'DELETE',
            oldValue: project,
            req
        });

        return NextResponse.json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error('Project deletion error:', error);
        return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
    }
}
