import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// GET /api/voucher-types/[id] - Get specific voucher type
export async function GET(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    try {
        const voucherType = await prisma.voucherType.findUnique({
            where: { id: params.id }
        });

        if (!voucherType) {
            return NextResponse.json(
                { error: 'Voucher type not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(voucherType);
    } catch (error) {
        console.error('Error fetching voucher type:', error);
        return NextResponse.json(
            { error: 'Failed to fetch voucher type' },
            { status: 500 }
        );
    }
}

// PUT /api/voucher-types/[id] - Update voucher type
export async function PUT(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    try {
        const body = await req.json();

        // Check if voucher type exists
        const existing = await prisma.voucherType.findUnique({
            where: { id: params.id }
        });

        if (!existing) {
            return NextResponse.json(
                { error: 'Voucher type not found' },
                { status: 404 }
            );
        }

        // Prevent editing system-defined types
        if (existing.isSystemDefined) {
            return NextResponse.json(
                { error: 'Cannot modify system-defined voucher types' },
                { status: 403 }
            );
        }

        // Update voucher type
        const voucherType = await prisma.voucherType.update({
            where: { id: params.id },
            data: {
                name: body.name,
                abbreviation: body.abbreviation,
                category: body.category,
                prefix: body.prefix || null,
                startingNumber: body.startingNumber || 1,
                affectsInventory: body.affectsInventory || false,
                requiresGST: body.requiresGST || false,
                isActive: body.isActive !== undefined ? body.isActive : true
            }
        });

        return NextResponse.json(voucherType);
    } catch (error) {
        console.error('Error updating voucher type:', error);
        return NextResponse.json(
            { error: 'Failed to update voucher type' },
            { status: 500 }
        );
    }
}

// DELETE /api/voucher-types/[id] - Deactivate voucher type (soft delete)
export async function DELETE(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    try {
        // Check if voucher type exists
        const existing = await prisma.voucherType.findUnique({
            where: { id: params.id }
        });

        if (!existing) {
            return NextResponse.json(
                { error: 'Voucher type not found' },
                { status: 404 }
            );
        }

        // Prevent deleting system-defined types
        if (existing.isSystemDefined) {
            return NextResponse.json(
                { error: 'Cannot delete system-defined voucher types' },
                { status: 403 }
            );
        }

        // Soft delete by setting isActive to false
        const voucherType = await prisma.voucherType.update({
            where: { id: params.id },
            data: { isActive: false }
        });

        return NextResponse.json(voucherType);
    } catch (error) {
        console.error('Error deleting voucher type:', error);
        return NextResponse.json(
            { error: 'Failed to delete voucher type' },
            { status: 500 }
        );
    }
}
