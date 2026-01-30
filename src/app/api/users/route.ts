import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { logAudit } from '@/lib/audit';

export async function GET(req: Request) {
    const session: any = await getServerSession(authOptions);
    if (!session || !session.user?.companyId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Fetch users belonging to the current company
        const userCompanies = await db.userCompany.findMany({
            where: { companyId: session.user.companyId },
            include: { user: true }
        });

        // Map to flat user objects with company-specific role
        const users = userCompanies.map(uc => ({
            id: uc.user.id,
            name: uc.user.name,
            email: uc.user.email,
            role: uc.role,
            createdAt: uc.createdAt
        }));

        return NextResponse.json(users);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session: any = await getServerSession(authOptions);
    if (!session || !session.user?.companyId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { name, email, password, role } = body;

        if (!name || !email || !password) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Transaction to ensure atomicity
        const result = await db.$transaction(async (tx) => {
            // 1. Create or Find User
            // Note: In a real multi-tenant app, if user exists, we might just link them.
            // For now, checks uniqueness globally for simplicity, or handle "invite".

            let user = await tx.user.findUnique({ where: { email } });

            if (user) {
                // Check if already in this company
                const existingLink = await tx.userCompany.findUnique({
                    where: {
                        userId_companyId: {
                            userId: user.id,
                            companyId: session.user.companyId
                        }
                    }
                });
                if (existingLink) {
                    throw new Error('User already exists in this company');
                }
                // If user exists but not in company, just link them (Logic for "Invite")
                // But for this simple flow, we proceed to link.
                // NOTE: We do NOT update password for existing global user here as it affects their other access.
            } else {
                // Create new user
                user = await tx.user.create({
                    data: {
                        name,
                        email,
                        password: hashedPassword,
                        role: 'user' // Default global role
                    }
                });
            }

            // 2. Link to Company
            await tx.userCompany.create({
                data: {
                    userId: user.id,
                    companyId: session.user.companyId,
                    role: role || 'user'
                }
            });

            return user;
        });

        // Log audit
        await logAudit({
            entityType: 'user',
            entityId: result.id,
            action: 'CREATE',
            newValue: { name, email, role, companyId: session.user.companyId },
            req
        });

        const { password: _, ...userWithoutPassword } = result;
        return NextResponse.json(userWithoutPassword);

    } catch (error: any) {
        console.error('Create User Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to create user' }, { status: 400 });
    }
}

export async function PUT(req: Request) {
    const session: any = await getServerSession(authOptions);
    if (!session || !session.user?.companyId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { id, name, role, password } = body;

        // Verify user belongs to this company
        const link = await db.userCompany.findUnique({
            where: {
                userId_companyId: {
                    userId: id,
                    companyId: session.user.companyId
                }
            }
        });

        if (!link) return NextResponse.json({ error: 'User not found in this company' }, { status: 404 });

        await db.$transaction(async (tx) => {
            // Update User details (Name)
            // Note: Changing name effectively changes it globally.
            await tx.user.update({
                where: { id },
                data: {
                    name,
                    // Only update password if provided
                    ...(password && { password: await bcrypt.hash(password, 10) })
                }
            });

            // Update Role in this company
            await tx.userCompany.update({
                where: {
                    userId_companyId: {
                        userId: id,
                        companyId: session.user.companyId
                    }
                },
                data: { role }
            });
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const session: any = await getServerSession(authOptions);
    if (!session || !session.user?.companyId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    try {
        // Prevent deleting yourself
        if (id === session.user.id) {
            return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 });
        }

        // Remove from company (UserCompany)
        // We do NOT delete the User record itself as they might belong to other companies.
        await db.userCompany.delete({
            where: {
                userId_companyId: {
                    userId: id,
                    companyId: session.user.companyId
                }
            }
        });

        await logAudit({
            entityType: 'user',
            entityId: id,
            action: 'DELETE',
            description: `Removed user from company ${session.user.companyId}`,
            req
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
}

