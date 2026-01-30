'use server';

import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';

const prisma = new PrismaClient();

const SetupSchema = z.object({
    companyName: z.string().min(1, 'Company Name is required'),
    email: z.string().email('Invalid email address'),
    gstin: z.string().optional(),
    financialYearStart: z.string(),
    adminName: z.string().min(1, 'Admin Name is required'),
    adminEmail: z.string().email('Invalid email address'),
    adminPassword: z.string().min(6, 'Password must be at least 6 characters'),
    useDefaultCOA: z.boolean().default(true),
});

export type SetupState = {
    message?: string;
    errors?: {
        [key: string]: string[];
    };
};

export async function completeSetup(prevState: SetupState, formData: FormData) {
    const rawData = {
        companyName: formData.get('companyName'),
        email: formData.get('email'),
        gstin: formData.get('gstin'),
        financialYearStart: formData.get('financialYearStart'),
        adminName: formData.get('adminName'),
        adminEmail: formData.get('adminEmail'),
        adminPassword: formData.get('adminPassword'),
        useDefaultCOA: formData.get('useDefaultCOA') === 'true' || formData.get('useDefaultCOA') === 'on',
    };

    const validatedFields = SetupSchema.safeParse(rawData);

    if (!validatedFields.success) {
        console.error('Setup Validation Errors:', validatedFields.error.flatten().fieldErrors);
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Validation failed. Please check your inputs.',
        };
    }

    const {
        companyName,
        email,
        gstin,
        financialYearStart,
        adminName,
        adminEmail,
        adminPassword,
        useDefaultCOA,
    } = validatedFields.data;

    try {
        // 1. Create or Update Company
        const fyStart = new Date(financialYearStart);
        const fyEnd = new Date(financialYearStart);
        fyEnd.setFullYear(fyEnd.getFullYear() + 1);
        fyEnd.setDate(fyEnd.getDate() - 1);

        await prisma.company.upsert({
            where: { id: 'default-company' },
            update: {
                name: companyName,
                email: email,
                gstin: gstin || null,
                financialYearStart: fyStart,
                financialYearEnd: fyEnd,
            },
            create: {
                id: 'default-company',
                name: companyName,
                email: email,
                gstin: gstin || null,
                address: 'Edit Address in Settings',
                city: 'Mumbai',
                state: 'Maharashtra',
                pincode: '000000',
                phone: '',
                financialYearStart: fyStart,
                financialYearEnd: fyEnd,
            },
        });

        // 2. Create or Update Admin User
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        const user = await prisma.user.upsert({
            where: { email: adminEmail },
            update: {
                name: adminName,
                password: hashedPassword,
                role: 'admin',
            },
            create: {
                name: adminName,
                email: adminEmail,
                password: hashedPassword,
                role: 'admin',
            },
        });

        // 2.5 Link User to Company (CRITICAL FIX)
        await prisma.userCompany.upsert({
            where: {
                userId_companyId: {
                    userId: user.id,
                    companyId: 'default-company'
                }
            },
            update: {
                role: 'admin'
            },
            create: {
                userId: user.id,
                companyId: 'default-company',
                role: 'admin',
                isDefault: true
            }
        });

        // 3. Create Default COA if requested
        if (useDefaultCOA) {
            const accounts = [
                { code: 'CASH', name: 'Cash-in-Hand', type: 'Asset' },
                { code: 'BANK', name: 'Bank Accounts', type: 'Asset' },
                { code: 'FIXED_ASSETS', name: 'Fixed Assets', type: 'Asset' },
                { code: 'SUNDRY_DEBTORS', name: 'Sundry Debtors', type: 'Asset' },
                { code: 'CAPITAL', name: 'Capital Account', type: 'Equity' },
                { code: 'SUNDRY_CREDITORS', name: 'Sundry Creditors', type: 'Liability' },
                { code: 'DUTIES_TAXES', name: 'Duties & Taxes', type: 'Liability' },
                { code: 'SALES', name: 'Sales Accounts', type: 'Revenue' },
                { code: 'PURCHASE', name: 'Purchase Accounts', type: 'Expense' },
                { code: 'INDIRECT_EXPENSE', name: 'Indirect Expenses', type: 'Expense' },
            ];

            for (const acc of accounts) {
                // Check if account exists first to avoid duplicate errors
                // or just ignore if validation fails for code unique constraint
                const existing = await prisma.account.findFirst({
                    where: { code: acc.code, companyId: 'default-company' }
                });

                if (!existing) {
                    await prisma.account.create({
                        data: {
                            ...acc,
                            companyId: 'default-company',
                            isActive: true
                        }
                    });
                }
            }
        }

        // 4. Create Default Godown
        const existingGodown = await prisma.godown.findFirst({
            where: { name: 'Main Location', companyId: 'default-company' }
        });

        if (!existingGodown) {
            await prisma.godown.create({
                data: {
                    name: 'Main Location',
                    companyId: 'default-company'
                }
            });
        }

    } catch (e: any) {
        console.error('Setup Error:', e);
        return {
            message: e.message || 'Database Error: Failed to create setup data.',
        };
    }

    redirect('/login?setup=success');
}
