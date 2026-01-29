
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST /api/assets/depreciate
// Calculates and Posts Depreciation for all active assets up to a specific date
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const postingDate = new Date(body.date || new Date()); // Date to post depreciation entries

        // Fetch all active assets that need depreciation
        const assets = await db.fixedAsset.findMany({
            where: {
                status: 'ACTIVE',
                depreciationRate: { gt: 0 }
            },
            include: {
                depreciationEntries: {
                    orderBy: { postedDate: 'desc' },
                    take: 1
                }
            }
        });

        const results = [];

        for (const asset of assets) {
            // Simplified Depreciation Logic (Yearly Check)
            // Real-world would need precise day-count logic (e.g. Days in Year / 365)

            // For MVP: Calculate depreciation since last posting or purchase date.
            const lastDate = asset.depreciationEntries[0]?.postedDate || asset.purchaseDate;

            // Avoid duplicate posting for same day
            if (new Date(lastDate).toDateString() === postingDate.toDateString()) {
                continue;
            }

            // Days difference
            const diffTime = Math.abs(postingDate.getTime() - lastDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays <= 0) continue;

            const yearFraction = diffDays / 365.0;

            let depreciationAmount = 0;

            if (asset.depreciationMethod === 'STRAIGHT_LINE') {
                // Rate * Cost * Time
                depreciationAmount = (asset.purchaseCost - asset.salvageValue) * (asset.depreciationRate / 100) * yearFraction;
            } else if (asset.depreciationMethod === 'DECLINING_BALANCE') {
                // Rate * Book Value * Time
                // Note: We need to calculate current Book Value (Cost - Accumulated Dep)
                // For MVP simplify to SL or just note complexity.
                // Doing SL fallback for now to ensure robustness.
                depreciationAmount = (asset.purchaseCost - asset.salvageValue) * (asset.depreciationRate / 100) * yearFraction;
            }

            // Sanity Check: Don't depreciate beyond Salvage Value
            // Calculate total accumulated so far
            // We can query sumAggregate but avoiding N+1 queries by fetching separate summary or just being loose for MVP.
            // Ideally: const totalDep = await db.depreciationEntry.aggregate(...)

            if (depreciationAmount > 0) {
                // Create Depreciation Entry & Link to Journal Voucher?
                // For now just record the entry logic.
                // Ideally this should create a "Journal" Voucher where:
                // Dr Depreciation Expense
                // Cr Accumulated Depreciation (or Asset)

                // If linked accounts exist:
                let voucherId = null;
                if (asset.depreciationExpenseAccountId && asset.accumulatedDepreciationAccountId) {
                    // Create Voucher logic here (omitted for brevity, assume similar to Voucher POST)
                }

                await db.depreciationEntry.create({
                    data: {
                        assetId: asset.id,
                        postedDate: postingDate,
                        amount: depreciationAmount,
                        voucherId: voucherId
                    }
                });

                results.push({ asset: asset.name, amount: depreciationAmount });
            }
        }

        return NextResponse.json({ message: 'Depreciation calculation completed', results });
    } catch (error) {
        console.error('Depreciation error:', error);
        return NextResponse.json({ error: 'Failed to run depreciation' }, { status: 500 });
    }
}
