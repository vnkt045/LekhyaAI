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
        const voucher = await db.voucher.findUnique({
            where: { id: params.id },
            include: {
                entries: {
                    include: {
                        account: true
                    }
                },
                items: true,
                gstDetails: true
            }
        });

        if (!voucher) {
            return NextResponse.json({ error: 'Voucher not found' }, { status: 404 });
        }

        return NextResponse.json(voucher);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch voucher' }, { status: 500 });
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

        // Fetch old voucher for audit trail
        const oldVoucher = await db.voucher.findUnique({
            where: { id: params.id },
            include: {
                entries: true,
                items: true
            }
        });

        if (!oldVoucher) {
            return NextResponse.json({ error: 'Voucher not found' }, { status: 404 });
        }

        // Update voucher
        const updatedVoucher = await db.voucher.update({
            where: { id: params.id },
            data: {
                voucherNumber: body.voucherNumber,
                voucherType: body.voucherType,
                date: body.date ? new Date(body.date) : undefined,
                totalDebit: body.totalDebit,
                totalCredit: body.totalCredit,
                narration: body.narration,
                invoiceNumber: body.invoiceNumber,
                currency: body.currency,
                exchangeRate: body.exchangeRate,
                isPosted: body.isPosted
            },
            include: {
                entries: true,
                items: true
            }
        });

        // Log the update in audit trail
        await logAudit({
            entityType: 'voucher',
            entityId: params.id,
            action: 'UPDATE',
            oldValue: oldVoucher,
            newValue: updatedVoucher,
            req
        });

        return NextResponse.json(updatedVoucher);
    } catch (error) {
        console.error('Voucher update error:', error);
        return NextResponse.json({ error: 'Failed to update voucher' }, { status: 500 });
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
        // Fetch voucher before deletion for audit trail
        const voucher = await db.voucher.findUnique({
            where: { id: params.id },
            include: {
                entries: true,
                items: true
            }
        });

        if (!voucher) {
            return NextResponse.json({ error: 'Voucher not found' }, { status: 404 });
        }

        // Check if voucher is immutable
        if (voucher.isImmutable) {
            return NextResponse.json({
                error: 'Cannot delete immutable voucher. This voucher has been posted and locked.'
            }, { status: 403 });
        }

        // Delete voucher (cascade will handle entries and items)
        await db.voucher.delete({
            where: { id: params.id }
        });

        // Log the deletion in audit trail
        await logAudit({
            entityType: 'voucher',
            entityId: params.id,
            action: 'DELETE',
            oldValue: voucher,
            req
        });

        return NextResponse.json({ message: 'Voucher deleted successfully' });
    } catch (error) {
        console.error('Voucher deletion error:', error);
        return NextResponse.json({ error: 'Failed to delete voucher' }, { status: 500 });
    }
}
