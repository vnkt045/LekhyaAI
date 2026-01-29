import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

// GET /api/payroll/salary-slips - Fetch salary slips
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.companyId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const employeeId = searchParams.get('employeeId');
        const month = searchParams.get('month');
        const year = searchParams.get('year');

        const where: any = {
            companyId: session.user.companyId!
        };
        if (employeeId) where.employeeId = employeeId;
        if (month) where.month = parseInt(month);
        if (year) where.year = parseInt(year);

        const salarySlips = await db.salarySlip.findMany({
            where,
            include: {
                employee: {
                    select: {
                        employeeCode: true,
                        name: true,
                        designation: true,
                    }
                },
                entries: {
                    include: {
                        payHead: true
                    }
                }
            },
            orderBy: [
                { year: 'desc' },
                { month: 'desc' }
            ]
        });

        return NextResponse.json(salarySlips);
    } catch (error) {
        console.error('Failed to fetch salary slips:', error);
        return NextResponse.json({ error: 'Failed to fetch salary slips' }, { status: 500 });
    }
}

// POST /api/payroll/salary-slips - Generate salary slip
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.companyId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { employeeId, month, year, salaryDetails } = body;

        if (!employeeId || !month || !year || !salaryDetails || salaryDetails.length === 0) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Check for duplicate
        const existing = await db.salarySlip.findFirst({
            where: {
                companyId: session.user.companyId!,
                employeeId,
                month: parseInt(month),
                year: parseInt(year)
            }
        });

        if (existing) {
            return NextResponse.json({ error: 'Salary slip already exists for this month' }, { status: 400 });
        }

        // Calculate totals
        const earnings = salaryDetails
            .filter((d: any) => d.type === 'EARNINGS')
            .reduce((sum: number, d: any) => sum + parseFloat(d.amount), 0);

        const deductions = salaryDetails
            .filter((d: any) => d.type === 'DEDUCTIONS')
            .reduce((sum: number, d: any) => sum + parseFloat(d.amount), 0);

        const netSalary = earnings - deductions;

        // Create salary slip
        const salarySlip = await db.salarySlip.create({
            data: {
                companyId: session.user.companyId!,
                employeeId,
                month: parseInt(month),
                year: parseInt(year),
                grossSalary: earnings,
                totalDeductions: deductions,
                netSalary,
                entries: {
                    create: salaryDetails.map((detail: any) => ({
                        payHeadId: detail.payHeadId,
                        amount: parseFloat(detail.amount),
                        type: detail.type // Need to pass type from frontend or derive it
                    }))
                }
            },
            include: {
                employee: true,
                entries: {
                    include: {
                        payHead: true
                    }
                }
            }
        });

        // Audit log
        await logAudit({
            entityType: 'salarySlip',
            entityId: salarySlip.id,
            action: 'CREATE',
            newValue: salarySlip,
            req
        });

        return NextResponse.json(salarySlip, { status: 201 });
    } catch (error) {
        console.error('Salary slip creation error:', error);
        return NextResponse.json({ error: 'Failed to create salary slip' }, { status: 500 });
    }
}

// DELETE /api/payroll/salary-slips - Delete salary slip
export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.companyId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Salary slip ID is required' }, { status: 400 });
        }

        const salarySlip = await db.salarySlip.findFirst({
            where: {
                id,
                companyId: session.user.companyId!
            },
            include: { employee: true }
        });

        if (!salarySlip) {
            return NextResponse.json({ error: 'Salary slip not found' }, { status: 404 });
        }

        await db.salarySlip.delete({ where: { id } });

        // Audit log
        await logAudit({
            entityType: 'salarySlip',
            entityId: id,
            action: 'DELETE',
            oldValue: salarySlip,
            req
        });

        return NextResponse.json({ message: 'Salary slip deleted successfully' });
    } catch (error) {
        console.error('Salary slip deletion error:', error);
        return NextResponse.json({ error: 'Failed to delete salary slip' }, { status: 500 });
    }
}
