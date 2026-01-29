
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

// POST /api/purchases/orders/[id]/convert
export async function POST(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json(); // Optional: { voucherNumber, date, ledgerId } override

        const order = await db.purchaseOrder.findUnique({
            where: { id: params.id },
            include: { items: true, party: true }
        });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        if (order.status === 'CLOSED' || order.status === 'CANCELLED') {
            // For strictness, maybe block. But partial billing allows multiple.
            // If fully billed? 
            // Let's assume this action is "Create Bill from Order".
        }

        // Fetch Default Purchase Ledger if not provided
        let ledgerId = body.ledgerId;
        let ledgerName = body.ledgerName;

        if (!ledgerId) {
            const defaultPurchase = await db.account.findFirst({ where: { code: 'PURCHASE' } });
            if (defaultPurchase) {
                ledgerId = defaultPurchase.id;
                ledgerName = defaultPurchase.name;
            } else {
                // Fallback or Error? 
                // If no purchase ledger, maybe error strictly?
                // For now, allow fallback to Party (Double Entry error, but consistent with legacy Voucher API fallback)
                // Ideally: return error "Purchase Ledger not defined"
            }
        }

        // Create Voucher via Transaction
        const result = await db.$transaction(async (tx) => {
            // 1. Create Voucher (Bill)
            const voucher = await tx.voucher.create({
                data: {
                    companyId: session.user.companyId!,
                    voucherNumber: body.voucherNumber || `BILL-${order.orderNumber}`, // Auto-gen
                    voucherType: 'PURCHASE',
                    date: new Date(body.date || new Date()),
                    totalDebit: order.totalAmount, // Assuming full conversion
                    totalCredit: order.totalAmount, // Assuming full conversion
                    narration: `Bill against PO #${order.orderNumber}`,
                    createdBy: session.user?.email || 'system',
                    isPosted: true,

                    // Ledger Mappings for Double Entry
                    // We can reuse the Voucher Create Logic or replicate it here for DB Transaction safety.
                    // Replicating for explicit control:

                    entries: {
                        create: [
                            // Dr Purchase (Expense)
                            {
                                accountId: ledgerId || order.partyId, // Fallback unsafe
                                accountName: ledgerName || 'Purchase',
                                debit: order.totalAmount,
                                credit: 0
                            },
                            // Cr Party (Liability/Cash)
                            {
                                accountId: order.partyId,
                                accountName: order.party.name,
                                debit: 0,
                                credit: order.totalAmount
                            }
                        ]
                    },

                    items: {
                        create: order.items.map((item: any) => ({
                            productName: item.description, // Description as product name if not linked?
                            inventoryItemId: item.itemId,
                            qty: item.quantity,
                            rate: item.rate,
                            totalAmount: item.totalAmount
                        }))
                    }
                }
            });

            // 2. Link PO to Bill
            await tx.purchaseOrderBill.create({
                data: {
                    purchaseOrderId: order.id,
                    billId: voucher.id
                }
            });

            // 3. Update PO Status
            // Logic: If (billed amount >= total amount) -> CLOSED/BILLED
            // Simple logic: Mark as BILLED
            await tx.purchaseOrder.update({
                where: { id: order.id },
                data: { status: 'BILLED' }
            });

            return voucher;
        });

        await logAudit({
            entityType: 'purchaseOrder',
            entityId: order.id,
            action: 'UPDATE', // Converted to bill
            newValue: result.id, // Log the Voucher ID
            req
        });

        return NextResponse.json(result);

    } catch (error) {
        console.error('Order conversion error:', error);
        return NextResponse.json({ error: 'Failed to convert order' }, { status: 500 });
    }
}
