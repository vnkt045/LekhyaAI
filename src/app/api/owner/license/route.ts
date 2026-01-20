import { NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';

function generateKey() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const segment = () => Array(4).fill(0).map(() => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
    return `LEKHYA-${segment()}-${segment()}-${segment()}`;
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { clientName, plan } = body;

        const license = await prisma.license.create({
            data: {
                key: generateKey(),
                clientName,
                plan,
                status: 'PENDING'
            }
        });

        return NextResponse.json(license);
    } catch (error) {
        console.error("License Gen Error:", error);
        return NextResponse.json({ error: 'Failed to generate license' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const licenses = await prisma.license.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(licenses);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
    }
}
