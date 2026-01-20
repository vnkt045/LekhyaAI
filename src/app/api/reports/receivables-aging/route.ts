import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - Receivables Aging Report
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const asOfDate = searchParams.get('asOfDate') || new Date().toISOString();
        const reportDate = new Date(asOfDate);

        // Fetch all receivable accounts (Debtors/Sundry Debtors)
        const receivables = await db.account.findMany({
            where: {
                type: 'Asset',
                OR: [
                    { name: { contains: 'Debtor' } },
                    { name: { contains: 'Receivable' } },
                    { name: { contains: 'Sundry Debtor' } }
                ],
                isActive: true
            },
            include: {
                entries: {
                    include: {
                        voucher: true
                    },
                    where: {
                        voucher: {
                            date: {
                                lte: reportDate
                            }
                        }
                    }
                }
            }
        });

        const agingData: any[] = [];

        receivables.forEach(account => {
            if (account.balance <= 0) return; // Skip if no outstanding balance

            // Calculate aging buckets
            const aging = {
                partyName: account.name,
                totalOutstanding: account.balance,
                current: 0,      // 0-30 days
                days31to60: 0,   // 31-60 days
                days61to90: 0,   // 61-90 days
                days91to180: 0,  // 91-180 days
                over180: 0       // 180+ days
            };

            // Group entries by invoice date and calculate aging
            account.entries.forEach(entry => {
                if (entry.debit > 0) { // Debit entries are receivables
                    const invoiceDate = entry.voucher.date;
                    const daysDiff = Math.floor((reportDate.getTime() - invoiceDate.getTime()) / (1000 * 60 * 60 * 24));

                    const amount = entry.debit;

                    if (daysDiff <= 30) {
                        aging.current += amount;
                    } else if (daysDiff <= 60) {
                        aging.days31to60 += amount;
                    } else if (daysDiff <= 90) {
                        aging.days61to90 += amount;
                    } else if (daysDiff <= 180) {
                        aging.days91to180 += amount;
                    } else {
                        aging.over180 += amount;
                    }
                }
            });

            agingData.push(aging);
        });

        // Calculate totals
        const totals = {
            totalOutstanding: agingData.reduce((sum, item) => sum + item.totalOutstanding, 0),
            current: agingData.reduce((sum, item) => sum + item.current, 0),
            days31to60: agingData.reduce((sum, item) => sum + item.days31to60, 0),
            days61to90: agingData.reduce((sum, item) => sum + item.days61to90, 0),
            days91to180: agingData.reduce((sum, item) => sum + item.days91to180, 0),
            over180: agingData.reduce((sum, item) => sum + item.over180, 0)
        };

        return NextResponse.json({
            asOfDate: reportDate.toISOString().split('T')[0],
            agingData,
            totals,
            partyCount: agingData.length
        });
    } catch (error) {
        console.error('Receivables aging error:', error);
        return NextResponse.json({ error: 'Failed to generate receivables aging' }, { status: 500 });
    }
}
