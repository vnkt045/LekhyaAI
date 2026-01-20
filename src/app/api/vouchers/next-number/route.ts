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
        // Fetch company settings for prefix
        const company = await db.company.findFirst();
        const prefix = company?.voucherPrefix || 'VCH';
        const isAuto = company?.isAutoNumbering !== false; // Default to true

        if (!isAuto) {
            return NextResponse.json({ voucherNumber: '' }); // Manual entry
        }

        // Get current date logic based on format (Simplified to YYYYMMDD or just Auto Increment?)
        // Let's stick to user requirement: "Voucher Number, etc" settings.
        // Common pattern: PREFIX-NUMBER (e.g., INV-001) or PREFIX-YYMM-NUM

        // For simplicity and robustness, let's use PREFIX-SEQUENTIAL for now, 
        // asking user if they want date-inc later. 
        // Actually, previous logic was PREFIX-DDMMYY-NUM. Let's keep that but changeable PREFIX.

        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = String(now.getFullYear()).slice(-2);
        const datePrefix = `${day}${month}${year}`;

        // Find all vouchers with today's date prefix AND the custom prefix
        const voucherPrefix = `${prefix}-${datePrefix}`;

        const todayVouchers = await db.voucher.findMany({
            where: {
                voucherNumber: {
                    startsWith: voucherPrefix
                }
            },
            orderBy: {
                voucherNumber: 'desc'
            },
            take: 1
        });

        let nextNumber = 1;

        if (todayVouchers.length > 0) {
            // Extract the last 6 digits and increment
            const lastVoucher = todayVouchers[0].voucherNumber;
            // Assuming format PREFIX-DDMMYY000001
            // Length: PREFIX + 1 (hyphen) + 6 (date) + 6 (seq)
            // It's safer to just take rightmost 6 chars
            const lastNumberStr = lastVoucher.slice(-6);
            const lastNumber = parseInt(lastNumberStr, 10);
            if (!isNaN(lastNumber)) {
                nextNumber = lastNumber + 1;
            }
        }

        // Format: PREFIX-DDMMYY000001
        const voucherNumber = `${voucherPrefix}${String(nextNumber).padStart(6, '0')}`;

        return NextResponse.json({ voucherNumber });
    } catch (error) {
        console.error('Error generating voucher number:', error);
        return NextResponse.json({ error: 'Failed to generate voucher number' }, { status: 500 });
    }
}
