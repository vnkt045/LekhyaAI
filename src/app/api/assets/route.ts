
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

// GET /api/assets
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.companyId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    try {
        const whereClause: any = {
            companyId: session.user.companyId!
        };
        if (status) whereClause.status = status;

        const assets = await db.fixedAsset.findMany({
            where: whereClause,
            include: {
                account: { select: { name: true } }, // Asset Account
                depreciationEntries: true
            },
            orderBy: { purchaseDate: 'desc' }
        });

        return NextResponse.json(assets);
    } catch (error) {
        console.error('Failed to fetch assets:', error);
        return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 500 });
    }
}

// POST /api/assets
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.companyId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();

        // Basic Validation
        if (!body.name || !body.accountId || !body.purchaseCost || !body.purchaseDate) {
            return NextResponse.json({ error: 'Name, Account, Cost and Date are required' }, { status: 400 });
        }

        const asset = await db.fixedAsset.create({
            data: {
                companyId: session.user.companyId!,
                name: body.name,
                assetNumber: body.assetNumber, // Optional, can enable auto-gen logic later
                description: body.description,

                accountId: body.accountId,

                // Depreciation Config
                depreciationMethod: body.depreciationMethod || 'STRAIGHT_LINE',
                depreciationRate: parseFloat(body.depreciationRate) || 0,
                usefulLifeInYears: parseFloat(body.usefulLifeInYears) || null,

                depreciationExpenseAccountId: body.depreciationExpenseAccountId,
                accumulatedDepreciationAccountId: body.accumulatedDepreciationAccountId,

                purchaseDate: new Date(body.purchaseDate),
                purchaseCost: parseFloat(body.purchaseCost),
                salvageValue: parseFloat(body.salvageValue) || 0,

                status: 'ACTIVE'
            }
        });

        await logAudit({
            entityType: 'fixedAsset',
            entityId: asset.id,
            action: 'CREATE',
            newValue: asset,
            req
        });

        return NextResponse.json(asset, { status: 201 });
    } catch (error) {
        console.error('Asset creation error:', error);
        return NextResponse.json({ error: 'Failed to create asset' }, { status: 500 });
    }
}
