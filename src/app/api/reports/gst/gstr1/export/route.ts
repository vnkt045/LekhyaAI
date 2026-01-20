import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse('Unauthorized', { status: 401 });

    const company = await db.company.findUnique({
        where: { id: 'default-company' } // In multi-tenant, use session.companyId
    });

    if (!company) {
        return new NextResponse('Company not found', { status: 404 });
    }

    // Default to current month for now
    // In production, would take ?month=01&year=2026
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // Fetch Sales Vouchers with Items
    const salesVouchers = await db.voucher.findMany({
        where: {
            voucherType: 'SALES',
            date: {
                gte: startOfMonth,
                lte: endOfMonth
            }
        },
        include: {
            entries: true, // simplified
            // For real GSTR-1 we need party details (GSTIN) usually stored in Account or Voucher
            // Assuming Account has GSTIN
        }
    });

    // 1. Prepare B2B Data
    // Filter sales where party has GSTIN
    // For now, this is a placeholder structure demonstrating the format
    const b2b = [];

    // 2. Prepare B2C Small
    const b2cs = [];

    // Construct the Official GSTR-1 JSON Format
    const gstr1Json = {
        gstin: company.gstin || "URP",
        fp: `${(today.getMonth() + 1).toString().padStart(2, '0')}${today.getFullYear()}`, // e.g. 012026
        version: "1.0",
        hash: "hash_placeholder",
        b2b: [
            {
                ctin: "27AAAAA0000A1Z5", // Dummy Customer GSTIN
                inv: [
                    {
                        inum: "INV-001",
                        idt: "01-01-2026",
                        val: 5000.00,
                        pos: "27", // Maharashtra
                        rchrg: "N",
                        inv_typ: "R",
                        itms: [
                            {
                                num: 1,
                                itm_det: {
                                    txval: 4500.00,
                                    rt: 18,
                                    iamt: 0,
                                    camt: 405.00,
                                    samt: 405.00,
                                    csamt: 0
                                }
                            }
                        ]
                    }
                ]
            }
        ],
        b2cl: [],
        b2cs: []
    };

    // Return as downloadable JSON
    const jsonString = JSON.stringify(gstr1Json, null, 2);

    return new NextResponse(jsonString, {
        headers: {
            'Content-Type': 'application/json',
            'Content-Disposition': `attachment; filename="GSTR1_${company.gstin}_${today.getMonth() + 1}_${today.getFullYear()}.json"`
        }
    });
}
