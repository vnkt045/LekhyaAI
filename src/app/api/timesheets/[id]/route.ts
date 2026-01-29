
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

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

        const oldTimesheet = await db.timesheet.findUnique({
            where: { id: params.id },
            include: { entries: true }
        });

        if (!oldTimesheet) {
            return NextResponse.json({ error: 'Timesheet not found' }, { status: 404 });
        }

        // Check if any entry is billed/approved?
        // If APPROVED, maybe block?
        // If entry.billingStatus == 'BILLED', block.
        const isBilled = oldTimesheet.entries.some((e: any) => e.billingStatus === 'BILLED');

        if (isBilled) {
            return NextResponse.json({ error: 'Cannot update a billed timesheet.' }, { status: 403 });
        }

        // Transaction
        const updatedTimesheet = await db.$transaction(async (tx) => {
            // 1. Delete existing entries (Simple Replace strategy)
            await tx.timesheetEntry.deleteMany({
                where: { timesheetId: params.id }
            });

            // 2. Update Header & Recreate Entries
            return await tx.timesheet.update({
                where: { id: params.id },
                data: {
                    date: new Date(body.date),
                    status: body.status,
                    userId: body.userId, // Allow changing user? Usually no, but admin might correcting.

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
        });

        await logAudit({
            entityType: 'timesheet',
            entityId: params.id,
            action: 'UPDATE',
            oldValue: oldTimesheet,
            newValue: updatedTimesheet,
            req
        });

        return NextResponse.json(updatedTimesheet);
    } catch (error) {
        console.error('Timesheet update error:', error);
        return NextResponse.json({ error: 'Failed to update timesheet' }, { status: 500 });
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
        const timesheet = await db.timesheet.findUnique({
            where: { id: params.id },
            include: { entries: true }
        });

        if (!timesheet) {
            return NextResponse.json({ error: 'Timesheet not found' }, { status: 404 });
        }

        const isBilled = timesheet.entries.some((e: any) => e.billingStatus === 'BILLED');

        if (isBilled) {
            return NextResponse.json({ error: 'Cannot delete a billed timesheet.' }, { status: 403 });
        }

        await db.timesheet.delete({
            where: { id: params.id }
        });

        await logAudit({
            entityType: 'timesheet',
            entityId: params.id,
            action: 'DELETE',
            oldValue: timesheet,
            req
        });

        return NextResponse.json({ message: 'Timesheet deleted successfully' });
    } catch (error) {
        console.error('Timesheet deletion error:', error);
        return NextResponse.json({ error: 'Failed to delete timesheet' }, { status: 500 });
    }
}
