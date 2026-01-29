import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

// GET /api/payroll/employees - Fetch all employees
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.companyId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const isActive = searchParams.get('isActive');

        const employees = await db.employee.findMany({
            where: {
                companyId: session.user.companyId!,
                ...(isActive !== null ? { isActive: isActive === 'true' } : {})
            },
            include: {
                salaryDetails: {
                    include: {
                        payHead: true
                    }
                },
                attendance: {
                    take: 5,
                    orderBy: { date: 'desc' }
                }
            },
            orderBy: { employeeCode: 'asc' }
        });

        return NextResponse.json(employees);
    } catch (error) {
        console.error('Failed to fetch employees:', error);
        return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 });
    }
}

// POST /api/payroll/employees - Create new employee
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.companyId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();

        if (!body.employeeCode || !body.name || !body.designation || !body.dateOfJoining) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Check for duplicate code within company
        const existing = await db.employee.findFirst({
            where: {
                employeeCode: body.employeeCode,
                companyId: session.user.companyId!
            }
        });

        if (existing) {
            return NextResponse.json({ error: 'Employee code already exists' }, { status: 400 });
        }

        const employee = await db.employee.create({
            data: {
                companyId: session.user.companyId!,
                employeeCode: body.employeeCode,
                name: body.name,
                designation: body.designation,
                department: body.department || null,
                dateOfJoining: new Date(body.dateOfJoining),
                dateOfLeaving: body.dateOfLeaving ? new Date(body.dateOfLeaving) : null,
                bankName: body.bankName || null,
                accountNumber: body.accountNumber || null,
                ifscCode: body.ifscCode || null,
                panNumber: body.panNumber || null,
                aadharNumber: body.aadharNumber || null,
                uanNumber: body.uanNumber || null,
                esiNumber: body.esiNumber || null,
                isActive: true
            }
        });

        // Audit log
        await logAudit({
            entityType: 'employee',
            entityId: employee.id,
            action: 'CREATE',
            newValue: employee,
            req
        });

        return NextResponse.json(employee, { status: 201 });
    } catch (error) {
        console.error('Employee creation error:', error);
        return NextResponse.json({ error: 'Failed to create employee' }, { status: 500 });
    }
}

// PUT /api/payroll/employees - Update employee
export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.companyId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { id, ...updateData } = body;

        if (!id) {
            return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 });
        }

        // Verify employee belongs to company
        const oldEmployee = await db.employee.findFirst({
            where: {
                id,
                companyId: session.user.companyId!
            }
        });

        if (!oldEmployee) {
            return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
        }

        const updatedEmployee = await db.employee.update({
            where: { id },
            data: {
                ...updateData,
                dateOfJoining: updateData.dateOfJoining ? new Date(updateData.dateOfJoining) : oldEmployee.dateOfJoining
            }
        });

        // Audit log
        await logAudit({
            entityType: 'employee',
            entityId: updatedEmployee.id,
            action: 'UPDATE',
            oldValue: oldEmployee,
            newValue: updatedEmployee,
            req
        });

        return NextResponse.json(updatedEmployee);
    } catch (error) {
        console.error('Employee update error:', error);
        return NextResponse.json({ error: 'Failed to update employee' }, { status: 500 });
    }
}

// DELETE /api/payroll/employees - Delete employee
export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.companyId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 });
        }

        const employee = await db.employee.findFirst({
            where: {
                id,
                companyId: session.user.companyId!
            },
            include: { salarySlips: true }
        });

        if (!employee) {
            return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
        }

        if (employee.salarySlips.length > 0) {
            return NextResponse.json({ error: 'Cannot delete employee with salary slips' }, { status: 400 });
        }

        await db.employee.delete({ where: { id } });

        // Audit log
        await logAudit({
            entityType: 'employee',
            entityId: id,
            action: 'DELETE',
            oldValue: employee,
            req
        });

        return NextResponse.json({ message: 'Employee deleted successfully' });
    } catch (error) {
        console.error('Employee deletion error:', error);
        return NextResponse.json({ error: 'Failed to delete employee' }, { status: 500 });
    }
}

