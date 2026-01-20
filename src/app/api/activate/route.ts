import { NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { key } = body;

        if (!key) return NextResponse.json({ error: 'Key required' }, { status: 400 });

        const license = await prisma.license.findUnique({
            where: { key }
        });

        if (!license) {
            return NextResponse.json({ error: 'Invalid License Key' }, { status: 404 });
        }

        if (license.status === 'REVOKED') {
            return NextResponse.json({ error: 'License Revoked' }, { status: 403 });
        }

        // Activate if PENDING, else just check
        if (license.status === 'PENDING') {
            await prisma.license.update({
                where: { id: license.id },
                data: {
                    status: 'ACTIVE',
                    activatedAt: new Date()
                }
            });
        }

        // Set Cookie (valid for 30 days)
        (await cookies()).set('lekhya_license_status', 'active', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 30,
            path: '/',
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Activation Error:", error);
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
