import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { voucherEntryId, bankDate } = body;

        if (!voucherEntryId || !bankDate) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Upsert reconciliation record
        // If it exists, update the date. If not, create it.
        const reconciliation = await (db as any).bankReconciliation.upsert({
            where: {
                voucherEntryId: voucherEntryId
            },
            update: {
                bankDate: new Date(bankDate),
                status: 'RECONCILED',
                reconciledDate: new Date()
            },
            create: {
                voucherEntryId: voucherEntryId,
                bankDate: new Date(bankDate),
                status: 'RECONCILED',
                reconciledDate: new Date()
            }
        });

        return NextResponse.json(reconciliation);

    } catch (error) {
        console.error('Reconciliation Error:', error);
        return NextResponse.json({ error: 'Failed to reconcile entry' }, { status: 500 });
    }
}
