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
        const account = await db.account.findUnique({
            where: { id: params.id }
        });

        if (!account) {
            return NextResponse.json({ error: 'Account not found' }, { status: 404 });
        }

        return NextResponse.json(account);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch account' }, { status: 500 });
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

        // Fetch old value for audit trail
        const oldAccount = await db.account.findUnique({
            where: { id: params.id }
        });

        if (!oldAccount) {
            return NextResponse.json({ error: 'Account not found' }, { status: 404 });
        }

        // Update account
        const updatedAccount = await db.account.update({
            where: { id: params.id },
            data: {
                name: body.name,
                code: body.code,
                type: body.type,
                parentId: body.parentId || null,
                balance: body.balance !== undefined ? parseFloat(body.balance) : undefined,
                isActive: body.isActive !== undefined ? body.isActive : undefined,
                // @ts-ignore: Prisma client might be stale
                isCostCenterEnabled: body.isCostCenterEnabled !== undefined ? body.isCostCenterEnabled : undefined
            }
        });

        // Log the update in audit trail
        await logAudit({
            entityType: 'account',
            entityId: params.id,
            action: 'UPDATE',
            oldValue: oldAccount,
            newValue: updatedAccount,
            req
        });

        return NextResponse.json(updatedAccount);
    } catch (error) {
        console.error('Account update error:', error);
        return NextResponse.json({ error: 'Failed to update account' }, { status: 500 });
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
        // Fetch account before deletion for audit trail
        const account = await db.account.findUnique({
            where: { id: params.id }
        });

        if (!account) {
            return NextResponse.json({ error: 'Account not found' }, { status: 404 });
        }

        // Delete account
        await db.account.delete({
            where: { id: params.id }
        });

        // Log the deletion in audit trail
        await logAudit({
            entityType: 'account',
            entityId: params.id,
            action: 'DELETE',
            oldValue: account,
            req
        });

        return NextResponse.json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Account deletion error:', error);
        return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
    }
}
