import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/voucher-types - List all voucher types
export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.companyId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const voucherTypes = await db.voucherType.findMany({
            where: { companyId: session.user.companyId! },
            orderBy: [
                { isSystemDefined: 'desc' }, // System types first
                { name: 'asc' }
            ]
        });

        return NextResponse.json(voucherTypes);
    } catch (error) {
        console.error('Error fetching voucher types:', error);
        return NextResponse.json(
            { error: 'Failed to fetch voucher types' },
            { status: 500 }
        );
    }
}

// POST /api/voucher-types - Create new custom voucher type
export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.companyId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();

        // Validate required fields
        if (!body.name || !body.abbreviation || !body.category) {
            return NextResponse.json(
                { error: 'Name, abbreviation, and category are required' },
                { status: 400 }
            );
        }

        // Check if name already exists in this company
        const existing = await db.voucherType.findFirst({
            where: {
                name: body.name,
                companyId: session.user.companyId!
            }
        });

        if (existing) {
            return NextResponse.json(
                { error: 'A voucher type with this name already exists' },
                { status: 409 }
            );
        }

        // Create new voucher type
        const voucherType = await db.voucherType.create({
            data: {
                companyId: session.user.companyId!,
                name: body.name,
                abbreviation: body.abbreviation,
                category: body.category,
                prefix: body.prefix || null,
                startingNumber: body.startingNumber || 1,
                affectsInventory: body.affectsInventory || false,
                requiresGST: body.requiresGST || false,
                isSystemDefined: false, // Custom types are never system-defined
                isActive: true
            }
        });

        return NextResponse.json(voucherType, { status: 201 });
    } catch (error) {
        console.error('Error creating voucher type:', error);
        return NextResponse.json(
            { error: 'Failed to create voucher type' },
            { status: 500 }
        );
    }
}
