import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId');

    try {
        const whereClause: any = {};
        if (categoryId) {
            whereClause.category = { id: categoryId };
        }

        // Fetch Cost Centers with their Allocations
        const costCenters = await db.costCenter.findMany({
            where: whereClause,
            include: {
                category: true,
                allocations: {
                    include: {
                        voucherEntry: {
                            include: {
                                voucher: true,
                                account: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            }
        });

        // Transform for Report
        const reportData = costCenters.map(cc => {
            const totalAmount = cc.allocations.reduce((sum, a) => sum + a.amount, 0);
            return {
                id: cc.id,
                name: cc.name,
                categoryName: cc.category.name,
                totalAmount,
                transactions: cc.allocations.map(a => ({
                    id: a.id,
                    date: a.voucherEntry.voucher.date,
                    voucherNumber: a.voucherEntry.voucher.voucherNumber,
                    ledgerName: a.voucherEntry.account.name,
                    amount: a.amount,
                    type: a.voucherEntry.debit > 0 ? 'Debit' : 'Credit' // Allocation usually follows entry nature
                }))
            };
        });

        return NextResponse.json(reportData);
    } catch (error) {
        console.error('Cost Center Report Error:', error);
        return NextResponse.json({ error: 'Failed to fetch report' }, { status: 500 });
    }
}
