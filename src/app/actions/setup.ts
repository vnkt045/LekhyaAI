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
        useDefaultCOA: formData.get('useDefaultCOA') === 'on',
    };

    const validatedFields = SetupSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to complete setup.',
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
        // 1. Create Company
        const fyStart = new Date(financialYearStart);
        const fyEnd = new Date(financialYearStart);
        fyEnd.setFullYear(fyEnd.getFullYear() + 1);
        fyEnd.setDate(fyEnd.getDate() - 1); // e.g. 1st April 2024 to 31st March 2025

        await prisma.company.create({
            data: {
                id: 'default-company', // Enforce singleton for now
                name: companyName,
                email: email,
                gstin: gstin || null,
                address: 'Edit Address in Settings', // Placeholder
                city: 'Mumbai', // Placeholder
                state: 'Maharashtra', // Placeholder
                pincode: '000000', // Placeholder
                phone: '',
                financialYearStart: fyStart,
                financialYearEnd: fyEnd,
            },
        });

        // 2. Create Admin User
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        await prisma.user.create({
            data: {
                name: adminName,
                email: adminEmail,
                password: hashedPassword,
                role: 'admin',
            },
        });

        // 3. Create Default COA if requested
        if (useDefaultCOA) {
            const accounts = [
                // Assets
                { code: 'CASH', name: 'Cash-in-Hand', type: 'Asset' },
                { code: 'BANK', name: 'Bank Accounts', type: 'Asset' },
                { code: 'FIXED_ASSETS', name: 'Fixed Assets', type: 'Asset' },
                { code: 'SUNDRY_DEBTORS', name: 'Sundry Debtors', type: 'Asset' },
                // Liabilities
                { code: 'CAPITAL', name: 'Capital Account', type: 'Equity' },
                { code: 'SUNDRY_CREDITORS', name: 'Sundry Creditors', type: 'Liability' },
                { code: 'DUTIES_TAXES', name: 'Duties & Taxes', type: 'Liability' },
                // Income
                { code: 'SALES', name: 'Sales Accounts', type: 'Revenue' },
                // Expenses
                { code: 'PURCHASE', name: 'Purchase Accounts', type: 'Expense' },
                { code: 'INDIRECT_EXPENSE', name: 'Indirect Expenses', type: 'Expense' },
            ];

            for (const acc of accounts) {
                await prisma.account.upsert({
                    where: { code: acc.code },
                    update: {},
                    create: acc
                });
            }
        }

        // 4. Create Default Godown (Required for inventory)
        await prisma.godown.create({
            data: { name: 'Main Location' }
        });

    } catch (e) {
        console.error('Setup Error:', e);
        return {
            message: 'Database Error: Failed to create setup data. check logs.',
        };
    }

    redirect('/login?setup=success');
}
