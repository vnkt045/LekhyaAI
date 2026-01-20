import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse('Unauthorized', { status: 401 });

    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get('employeeId');

    if (!employeeId) return new NextResponse('Employee ID required', { status: 400 });

    try {
        const details = await db.employeeSalaryDetail.findMany({
            where: { employeeId }
        });
        return NextResponse.json(details);
    } catch (error) {
        return new NextResponse('Internal Error', { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse('Unauthorized', { status: 401 });

    try {
        const body = await req.json();
        const { employeeId, details } = body;

        // Transaction to update details
        await db.$transaction(async (tx) => {
            // Delete existing
            await tx.employeeSalaryDetail.deleteMany({
                where: { employeeId }
            });

            // Create new
            for (const detail of details) {
                if (detail.amount > 0) {
                    await tx.employeeSalaryDetail.create({
                        data: {
                            employeeId,
                            payHeadId: detail.payHeadId,
                            amount: detail.amount
                        }
                    });
                }
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return new NextResponse('Error saving salary details', { status: 500 });
    }
}
