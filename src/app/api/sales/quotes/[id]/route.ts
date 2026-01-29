
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
        const quote = await db.quote.findUnique({
            where: { id: params.id },
            include: {
                items: true,
                party: {
                    select: { name: true, email: true, phone: true, address: true }
                }
            }
        });

        if (!quote) {
            return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
        }

        return NextResponse.json(quote);
    } catch (error) {
        console.error('Failed to fetch quote:', error);
        return NextResponse.json({ error: 'Failed to fetch quote' }, { status: 500 });
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

        const oldQuote = await db.quote.findUnique({
            where: { id: params.id },
            include: { items: true }
        });

        if (!oldQuote) {
            return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
        }

        if (oldQuote.status === 'CONVERTED' || oldQuote.status === 'ACCEPTED') {
            // Optional: Block update if already converted/accepted
            // For now, let's allow it but maybe warn? Or just block?
            // Strict accounting: Block.
            return NextResponse.json({ error: 'Cannot update a converted or accepted quote.' }, { status: 403 });
        }

        // Transaction to update header and replace items
        const updatedQuote = await db.$transaction(async (tx) => {
            // 1. Delete existing items
            await tx.quoteItem.deleteMany({
                where: { quoteId: params.id }
            });

            // 2. Update Quote Header & Create New Items
            return await tx.quote.update({
                where: { id: params.id },
                data: {
                    date: new Date(body.date),
                    expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
                    partyId: body.partyId,
                    partyName: body.partyName,
                    status: body.status, // Allow manual status change

                    totalAmount: parseFloat(body.totalAmount) || 0,
                    currency: body.currency,
                    exchangeRate: parseFloat(body.exchangeRate) || 1.0,

                    termsAndConditions: body.termsAndConditions,
                    notes: body.notes,

                    items: {
                        create: body.items.map((item: any) => ({
                            productName: item.productName || item.description,
                            description: item.description,
                            itemId: item.itemId || null,

                            quantity: parseFloat(item.quantity) || 0,
                            rate: parseFloat(item.rate) || 0,
                            discount: parseFloat(item.discount) || 0,

                            taxableAmount: parseFloat(item.taxableAmount) || 0,
                            taxAmount: parseFloat(item.taxAmount) || 0,
                            totalAmount: parseFloat(item.totalAmount) || 0,

                            hsnSac: item.hsnSac,
                            gstRate: parseFloat(item.gstRate) || 0
                        }))
                    }
                },
                include: {
                    items: true
                }
            });
        });

        // Audit Log
        await logAudit({
            entityType: 'quote',
            entityId: params.id,
            action: 'UPDATE',
            oldValue: oldQuote,
            newValue: updatedQuote,
            req
        });

        return NextResponse.json(updatedQuote);
    } catch (error) {
        console.error('Quote update error:', error);
        return NextResponse.json({ error: 'Failed to update quote' }, { status: 500 });
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
        const quote = await db.quote.findUnique({
            where: { id: params.id }
        });

        if (!quote) {
            return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
        }

        if (quote.status === 'CONVERTED') {
            return NextResponse.json({ error: 'Cannot delete a converted quote.' }, { status: 403 });
        }

        await db.quote.delete({
            where: { id: params.id }
        });

        await logAudit({
            entityType: 'quote',
            entityId: params.id,
            action: 'DELETE',
            oldValue: quote,
            req
        });

        return NextResponse.json({ message: 'Quote deleted successfully' });
    } catch (error) {
        console.error('Quote deletion error:', error);
        return NextResponse.json({ error: 'Failed to delete quote' }, { status: 500 });
    }
}
