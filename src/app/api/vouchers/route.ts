
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

// GET /api/vouchers - Fetch all vouchers with optional filters
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const isRecurring = searchParams.get('isRecurring') === 'true';

    try {
        const whereClause: any = search ? {
            OR: [
                { voucherNumber: { contains: search } },
                { invoiceNumber: { contains: search } },
                { narration: { contains: search } },
                {
                    entries: {
                        some: {
                            accountName: { contains: search }
                        }
                    }
                }
            ]
        } : {};

        if (isRecurring) {
            whereClause.isRecurring = true;
        }

        // If search term is a number, try to match amount (optional enhancement)
        const searchAmount = parseFloat(search);
        if (!isNaN(searchAmount)) {
            whereClause.OR.push({ totalDebit: { equals: searchAmount } });
        }

        const vouchers = await db.voucher.findMany({
            where: whereClause,
            include: {
                entries: true,
                items: true
            },
            orderBy: { date: 'desc' },
            take: 50
        });

        // Safe filter: Ensure date and basic fields exist (Legacy data protection)
        const safeVouchers = vouchers.filter(v => v && v.date && v.voucherNumber);

        return NextResponse.json(safeVouchers);
    } catch (error) {
        console.error('Failed to fetch vouchers:', error);
        return NextResponse.json({ error: 'Failed to fetch vouchers' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const exchangeRate = parseFloat(body.exchangeRate) || 1.0;
        const currency = body.currency || 'INR';
        const isForeign = currency !== 'INR';

        // Entered Amount (Foreign or Base)
        const enteredAmount = parseFloat(body.amount);

        // Base Amount (for GL and Reporting)
        const baseAmount = enteredAmount * exchangeRate;

        const narration = isForeign ? `${body.narration} (Rate: ${exchangeRate})` : body.narration;

        // 1. Create the Header
        const voucher = await db.voucher.create({
            data: {
                voucherNumber: body.number,
                voucherType: body.type,
                date: new Date(body.date),
                totalDebit: baseAmount,
                totalCredit: baseAmount,
                narration: narration,
                createdBy: session.user?.email || 'system',
                isPosted: true,

                // Post-Dated Cheques
                isPostDated: body.isPostDated || false,
                pdcDate: body.isPostDated ? new Date(body.pdcDate) : null,
                isOptional: body.isOptional || false,

                // Multi-Currency
                currency: currency,
                exchangeRate: exchangeRate,

                // 2. Create Items (Item Invoice Details)
                items: {
                    create: (body.items || []).map((item: any) => ({
                        productName: item.productName,
                        description: item.description,
                        hsnSac: item.hsnSac,
                        inventoryItemId: item.inventoryItemId || null, // Link to Inventory
                        godownId: item.godownId || null, // Store Location
                        qty: parseFloat(item.qty) || 0,
                        rate: parseFloat(item.rate) || 0, // Stored in Document Currency
                        per: item.per,
                        taxableAmount: parseFloat(item.taxableAmount) || 0,
                        cgstRate: parseFloat(item.cgstRate) || 0,
                        cgstAmount: parseFloat(item.cgstAmount) || 0,
                        sgstRate: parseFloat(item.sgstRate) || 0,
                        sgstAmount: parseFloat(item.sgstAmount) || 0,
                        igstRate: parseFloat(item.igstRate) || 0,
                        igstAmount: parseFloat(item.igstAmount) || 0,
                        totalAmount: parseFloat(item.totalAmount) || 0 // Document Currency
                    }))
                },

                // 3. Create the Entries (Correct Double Entry Logic)
                entries: {
                    create: await (async () => {
                        const entries = [];

                        // Default Accounts Lookup
                        const purchaseAc = await db.account.findFirst({ where: { code: 'PURCHASE' } });
                        const salesAc = await db.account.findFirst({ where: { code: 'SALES' } });
                        const cashAc = await db.account.findFirst({ where: { code: 'CASH' } });

                        // Helper to safely get ID
                        // Helper to safely get ID
                        const purchaseId = purchaseAc?.id || body.accountId; // Fallback (unsafe but prevents crash)
                        const salesId = salesAc?.id || body.accountId;
                        const cashId = cashAc?.id || body.accountId;

                        // Prepare Allocations Data (If allocations present)
                        const allocationsData = (body.allocations && body.allocations.length > 0) ? {
                            create: body.allocations.map((a: any) => ({
                                costCenterId: a.costCenterId,
                                amount: parseFloat(a.amount)
                            }))
                        } : undefined;

                        // Logic Separation
                        if (body.type === 'PURCHASE') {
                            // Debit Purchase A/c (Expense) - Apply Cost Center Here
                            entries.push({
                                accountId: purchaseId,
                                accountName: purchaseAc?.name || 'Purchase',
                                debit: baseAmount,
                                credit: 0,
                                costCenterId: null, // Deprecated single field? Or use primary? Let's use allocations logic only.
                                allocations: allocationsData, // Apply allocations
                                foreignAmount: null // Local currency usually
                            });
                            // Credit Party (Liability)
                            entries.push({
                                accountId: body.accountId,
                                accountName: body.accountName,
                                debit: 0,
                                credit: baseAmount,
                                foreignAmount: isForeign ? enteredAmount : null
                            });
                        } else if (body.type === 'SALES') {
                            // Debit Party (Asset)
                            entries.push({
                                accountId: body.accountId,
                                accountName: body.accountName,
                                debit: baseAmount,
                                credit: 0,
                                foreignAmount: isForeign ? enteredAmount : null
                            });
                            // Credit Sales A/c (Revenue) - Apply Cost Center Here
                            entries.push({
                                accountId: salesId,
                                accountName: salesAc?.name || 'Sales',
                                debit: 0,
                                credit: baseAmount,
                                allocations: allocationsData, // Apply allocations
                                foreignAmount: null
                            });
                        } else if (body.type === 'PAYMENT') {
                            // Debit Party (Usually Expense or Liability) - Apply allocations if this is the expense
                            // In a simple Payment voucher, 'accountId' is the Debit Account (Expense).
                            entries.push({
                                accountId: body.accountId,
                                accountName: body.accountName,
                                debit: baseAmount,
                                credit: 0,
                                allocations: allocationsData, // Apply to the Debit Entry
                                foreignAmount: isForeign ? enteredAmount : null
                            });
                            // Credit Cash/Bank (Implicit Cash for now)
                            entries.push({
                                accountId: cashId,
                                accountName: cashAc?.name || 'Cash',
                                debit: 0,
                                credit: baseAmount
                            });
                        } else if (body.type === 'RECEIPT') {
                            // Debit Cash/Bank
                            entries.push({
                                accountId: cashId,
                                accountName: cashAc?.name || 'Cash',
                                debit: baseAmount,
                                credit: 0
                            });
                            // Credit Party (Income/Asset) - Apply allocations if Income
                            entries.push({
                                accountId: body.accountId,
                                accountName: body.accountName,
                                debit: 0,
                                credit: baseAmount,
                                allocations: allocationsData, // Apply to the Credit Entry
                                foreignAmount: isForeign ? enteredAmount : null
                            });
                        }
                        return entries;
                    })()
                }
            }
        });

        // 4. Update Inventory Stock (Post-Creation)
        if (body.type === 'PURCHASE' || body.type === 'SALES') {
            for (const item of (body.items || [])) {
                if (item.inventoryItemId) {
                    const qty = parseFloat(item.qty) || 0;
                    const movementType = body.type === 'PURCHASE' ? 'IN' : 'OUT';
                    const itemRate = parseFloat(item.rate) || 0;
                    const itemTotal = parseFloat(item.totalAmount) || 0;

                    // Convert to Base Currency for Inventory Valuation
                    const baseRate = itemRate * exchangeRate;
                    const baseTotal = itemTotal * exchangeRate;

                    // Create Movement Record
                    await db.stockMovement.create({
                        data: {
                            itemId: item.inventoryItemId,
                            godownId: item.godownId || null, // Capture Godown
                            type: movementType,
                            quantity: qty,
                            rate: baseRate,
                            amount: baseTotal,
                            voucherId: voucher.id,
                            date: new Date(body.date),
                            narration: `Voucher #${body.number} - ${body.type}`
                        }
                    });

                    // Update Item Stock
                    const adjustment = movementType === 'IN' ? qty : -qty;
                    await db.inventoryItem.update({
                        where: { id: item.inventoryItemId },
                        data: {
                            currentStock: { increment: adjustment },
                            // Update purchase rate if it's a purchase (Moving Average could be implemented here)
                            ...(movementType === 'IN' ? { purchaseRate: parseFloat(item.rate) } : {})
                        }
                    });
                }
            }
        }

        // Log voucher creation in audit trail
        await logAudit({
            entityType: 'voucher',
            entityId: voucher.id,
            action: 'CREATE',
            newValue: {
                ...voucher,
                items: body.items,
                entries: body.entries
            },
            req
        });

        return NextResponse.json(voucher, { status: 201 });
    } catch (error) {
        console.error('Voucher creation error:', error);
        return NextResponse.json({ error: 'Failed to create voucher' }, { status: 500 });
    }
}
