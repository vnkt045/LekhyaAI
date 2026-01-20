import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { logAudit } from '@/lib/audit';

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await req.json();
        const { voucherId, regularizeDate } = body;

        if (!voucherId) {
            return NextResponse.json({ error: 'Voucher ID is required' }, { status: 400 });
        }

        // Fetch the voucher
        const voucher = await db.voucher.findUnique({
            where: { id: voucherId }
        });

        if (!voucher) {
            return NextResponse.json({ error: 'Voucher not found' }, { status: 404 });
        }

        // Update Voucher
        // We set isPostDated to false, effectively "posting" it to the ledger.
        // We also update the 'date' to the regularizeDate if provided, or keep original?
        // Usually, in Tally, regularizing converts it to a normal voucher. The date might remain the PDC date or change.
        // Let's assume we update the Voucher Date to the PDC Date (or the date user chose).

        const effectiveDate = regularizeDate ? new Date(regularizeDate) : (voucher.pdcDate || new Date());

        const updatedVoucher = await db.voucher.update({
            where: { id: voucherId },
            data: {
                isPostDated: false,
                regularizedDate: new Date(),
                date: effectiveDate
                // Note: If we had a mechanism to update Account Balances, we would run it here.
            }
        });

        // Audit Trail
        await logAudit({
            entityType: 'voucher',
            entityId: voucherId,
            action: 'UPDATE',
            oldValue: voucher,
            newValue: updatedVoucher,
            req
        });

        return NextResponse.json({ success: true, voucher: updatedVoucher });

    } catch (error) {
        console.error('PDC Regularize Error:', error);
        return NextResponse.json({ error: 'Failed to regularize PDC' }, { status: 500 });
    }
}
