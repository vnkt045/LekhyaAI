import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // Create default user
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const user = await prisma.user.upsert({
        where: { email: 'admin@lekhyaai.com' },
        update: {},
        create: {
            email: 'admin@lekhyaai.com',
            password: hashedPassword,
            name: 'Admin User'
        }
    });

    console.log('✅ Created user:', user.email);

    // Calculate Financial Year Dynamically
    const today = new Date();
    const currentMonth = today.getMonth(); // 0-11
    const currentYear = today.getFullYear();
    const startYear = currentMonth >= 3 ? currentYear : currentYear - 1;
    const fyStart = new Date(`${startYear}-04-01`);
    const fyEnd = new Date(`${startYear + 1}-03-31`);

    console.log(`📅 Current Financial Year: ${startYear}-${startYear + 1}`);

    // Note: Company setup should be done by user during onboarding
    // No default company data is seeded

    // Create default godown
    await prisma.godown.upsert({
        where: { name: 'Main Location' },
        update: {},
        create: { name: 'Main Location' }
    });

    // Create Default Cost Category
    await prisma.costCategory.upsert({
        where: { name: 'Primary Cost Category' },
        update: {},
        create: {
            name: 'Primary Cost Category',
            allocateRevenue: true,
            allocateNonRevenue: false
        }
    });

    // Create default accounts
    const accounts = [
        // Assets
        { code: 'CASH', name: 'Cash-in-Hand', type: 'Asset' },
        { code: 'BANK', name: 'Bank Accounts', type: 'Asset' },
        { code: 'BANK_OD', name: 'Bank OD A/c', type: 'Liability' },
        { code: 'DEPOSITS', name: 'Deposits (Asset)', type: 'Asset' },
        { code: 'FIXED_ASSETS', name: 'Fixed Assets', type: 'Asset' },
        { code: 'INVESTMENTS', name: 'Investments', type: 'Asset' },
        { code: 'LOANS_ADV_ASSET', name: 'Loans & Advances (Asset)', type: 'Asset' },
        { code: 'STOCK_IN_HAND', name: 'Stock-in-Hand', type: 'Asset' },
        { code: 'SUNDRY_DEBTORS', name: 'Sundry Debtors', type: 'Asset' },
        { code: 'CURRENT_ASSETS', name: 'Current Assets', type: 'Asset' },
        { code: 'MISC_EXP_ASSET', name: 'Misc. Expenses (ASSET)', type: 'Asset' },

        // Liabilities
        { code: 'CAPITAL', name: 'Capital Account', type: 'Equity' },
        { code: 'CURRENT_LIABILITIES', name: 'Current Liabilities', type: 'Liability' },
        { code: 'DUTIES_TAXES', name: 'Duties & Taxes', type: 'Liability' },
        { code: 'LOANS_LIABILITY', name: 'Loans (Liability)', type: 'Liability' },
        { code: 'SECURED_LOANS', name: 'Secured Loans', type: 'Liability' },
        { code: 'UNSECURED_LOANS', name: 'Unsecured Loans', type: 'Liability' },
        { code: 'SUNDRY_CREDITORS', name: 'Sundry Creditors', type: 'Liability' },
        { code: 'PROVISIONS', name: 'Provisions', type: 'Liability' },
        { code: 'RESERVES_SURPLUS', name: 'Reserves & Surplus', type: 'Equity' },
        { code: 'SUSPENSE', name: 'Suspense A/c', type: 'Liability' },

        // Income
        { code: 'SALES', name: 'Sales Accounts', type: 'Revenue' },
        { code: 'DIRECT_INCOME', name: 'Direct Incomes', type: 'Revenue' },
        { code: 'INDIRECT_INCOME', name: 'Indirect Incomes', type: 'Revenue' },
        { code: 'INCOME_DIRECT', name: 'Income (Direct)', type: 'Revenue' },
        { code: 'INCOME_INDIRECT', name: 'Income (Indirect)', type: 'Revenue' },

        // Expenses
        { code: 'PURCHASE', name: 'Purchase Accounts', type: 'Expense' },
        { code: 'DIRECT_EXPENSE', name: 'Direct Expenses', type: 'Expense' },
        { code: 'INDIRECT_EXPENSE', name: 'Indirect Expenses', type: 'Expense' },
        { code: 'EXPENSE_DIRECT', name: 'Expenses (Direct)', type: 'Expense' },
        { code: 'EXPENSE_INDIRECT', name: 'Expenses (Indirect)', type: 'Expense' },
    ];

    for (const acc of accounts) {
        await prisma.account.upsert({
            where: { code: acc.code },
            update: {},
            create: acc
        });
    }

    console.log(`✅ Created ${accounts.length} default accounts`);

    // Create default voucher types
    const voucherTypes = [
        { name: 'Payment', abbreviation: 'Pymt', category: 'Payment', isSystemDefined: true },
        { name: 'Receipt', abbreviation: 'Rcpt', category: 'Receipt', isSystemDefined: true },
        { name: 'Sales', abbreviation: 'Sale', category: 'Sales', isSystemDefined: true },
        { name: 'Purchase', abbreviation: 'Purc', category: 'Purchase', isSystemDefined: true },
        { name: 'Contra', abbreviation: 'Cntr', category: 'Contra', isSystemDefined: true },
        { name: 'Journal', abbreviation: 'Jrnl', category: 'Journal', isSystemDefined: true },
        { name: 'Credit Note', abbreviation: 'C/N', category: 'Other', isSystemDefined: true },
        { name: 'Debit Note', abbreviation: 'D/N', category: 'Other', isSystemDefined: true },
    ];

    for (const vt of voucherTypes) {
        await prisma.voucherType.upsert({
            where: { name: vt.name },
            update: {},
            create: vt
        });
    }

    console.log(`✅ Created ${voucherTypes.length} default voucher types`);

    console.log('🎉 Database seeded successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
