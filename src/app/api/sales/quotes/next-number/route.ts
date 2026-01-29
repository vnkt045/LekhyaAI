import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Default Quote Prefix
        const prefix = 'QT';

        // Similar logic to Voucher, using Date Prefix
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = String(now.getFullYear()).slice(-2);
        const datePrefix = `${day}${month}${year}`;

        const quotePrefix = `${prefix}-${datePrefix}`;

        const todayQuotes = await db.quote.findMany({
            where: {
                quoteNumber: {
                    startsWith: quotePrefix
                }
            },
            orderBy: {
                quoteNumber: 'desc'
            },
            take: 1
        });

        let nextNumber = 1;

        if (todayQuotes.length > 0) {
            const lastQuote = todayQuotes[0].quoteNumber;
            const lastNumberStr = lastQuote.slice(-6);
            const lastNumber = parseInt(lastNumberStr, 10);
            if (!isNaN(lastNumber)) {
                nextNumber = lastNumber + 1;
            }
        }

        const quoteNumber = `${quotePrefix}${String(nextNumber).padStart(6, '0')}`;

        return NextResponse.json({ quoteNumber });
    } catch (error) {
        console.error('Error generating quote number:', error);
        return NextResponse.json({ error: 'Failed to generate quote number' }, { status: 500 });
    }
}
