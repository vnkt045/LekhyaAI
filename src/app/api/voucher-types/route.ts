import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/voucher-types - List all voucher types
export async function GET() {
    try {
        const voucherTypes = await prisma.voucherType.findMany({
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
    try {
        const body = await request.json();

        // Validate required fields
        if (!body.name || !body.abbreviation || !body.category) {
            return NextResponse.json(
                { error: 'Name, abbreviation, and category are required' },
                { status: 400 }
            );
        }

        // Check if name already exists
        const existing = await prisma.voucherType.findUnique({
            where: { name: body.name }
        });

        if (existing) {
            return NextResponse.json(
                { error: 'A voucher type with this name already exists' },
                { status: 409 }
            );
        }

        // Create new voucher type
        const voucherType = await prisma.voucherType.create({
            data: {
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
