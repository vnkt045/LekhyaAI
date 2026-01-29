import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/payroll/salary-structures - Fetch all salary structures
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.companyId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const structures = await db.salaryStructure.findMany({
            where: {
                companyId: session.user.companyId!
            },
            include: {
                employees: {
                    select: {
                        id: true,
                        name: true,
                        employeeCode: true
                    }
                }
            },
            orderBy: { name: 'asc' }
        });

        return NextResponse.json(structures);
    } catch (error) {
        console.error('Failed to fetch salary structures:', error);
        return NextResponse.json({ error: 'Failed to fetch salary structures' }, { status: 500 });
    }
}

// POST /api/payroll/salary-structures - Create new salary structure
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.companyId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();

        const structure = await db.salaryStructure.create({
            data: {
                companyId: session.user.companyId!,
                name: body.name,
                basicSalary: parseFloat(body.basicSalary),
                hra: parseFloat(body.hra) || 0,
                conveyance: parseFloat(body.conveyance) || 0,
                medicalAllowance: parseFloat(body.medicalAllowance) || 0,
                otherAllowances: parseFloat(body.otherAllowances) || 0,
                pf: parseFloat(body.pf) || 0,
                esi: parseFloat(body.esi) || 0,
                professionalTax: parseFloat(body.professionalTax) || 0
            }
        });

        return NextResponse.json(structure, { status: 201 });
    } catch (error) {
        console.error('Salary structure creation error:', error);
        return NextResponse.json({ error: 'Failed to create salary structure' }, { status: 500 });
    }
}
