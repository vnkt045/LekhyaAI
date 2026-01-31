import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Helper function to generate license key
function generateLicenseKey(): string {
    const segments = [];
    for (let i = 0; i < 3; i++) {
        const segment = Math.random().toString(36).substring(2, 6).toUpperCase();
        segments.push(segment);
    }
    return `LKHYA-${segments.join('-')}`;
}

// POST: Generate new license key
export async function POST(req: Request) {
    const session: any = await getServerSession(authOptions);

    if (!session || session.user.role !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const { customerName, customerEmail, expiryDate, companyId } = await req.json();

        // Generate unique key
        let key = generateLicenseKey();
        let exists = await db.licenseKey.findUnique({ where: { key } });

        // Regenerate if duplicate (very unlikely)
        while (exists) {
            key = generateLicenseKey();
            exists = await db.licenseKey.findUnique({ where: { key } });
        }

        // Create license key
        const licenseKey = await db.licenseKey.create({
            data: {
                key,
                customerName,
                customerEmail,
                companyId: companyId || null,
                expiryDate: expiryDate ? new Date(expiryDate) : null,
                status: 'ACTIVE',
                paymentStatus: 'PAID'
            }
        });

        return NextResponse.json({ success: true, licenseKey });
    } catch (error) {
        console.error('Failed to generate license key:', error);
        return NextResponse.json({ error: 'Failed to generate license key' }, { status: 500 });
    }
}

// PUT: Update license key status
export async function PUT(req: Request) {
    const session: any = await getServerSession(authOptions);

    if (!session || session.user.role !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const { keyId, status, paymentStatus } = await req.json();

        const updated = await db.licenseKey.update({
            where: { id: keyId },
            data: {
                status: status || undefined,
                paymentStatus: paymentStatus || undefined
            }
        });

        return NextResponse.json({ success: true, licenseKey: updated });
    } catch (error) {
        console.error('Failed to update license key:', error);
        return NextResponse.json({ error: 'Failed to update license key' }, { status: 500 });
    }
}

// GET: List all license keys
export async function GET(req: Request) {
    const session: any = await getServerSession(authOptions);

    if (!session || session.user.role !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const keys = await db.licenseKey.findMany({
            include: {
                company: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ keys });
    } catch (error) {
        console.error('Failed to fetch license keys:', error);
        return NextResponse.json({ error: 'Failed to fetch license keys' }, { status: 500 });
    }
}
