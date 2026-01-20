export interface AccountGroup {
    id: string;
    name: string;
    type: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
    parent?: string;
    isDefault: boolean;
}

// The 28 Standard Account Groups
export const DEFAULT_GROUPS: AccountGroup[] = [
    // Assets
    { id: 'CASH', name: 'Cash-in-Hand', type: 'Asset', isDefault: true },
    { id: 'BANK', name: 'Bank Accounts', type: 'Asset', isDefault: true },
    { id: 'BANK_OD', name: 'Bank OD A/c', type: 'Liability', isDefault: true },
    { id: 'DEPOSITS', name: 'Deposits (Asset)', type: 'Asset', isDefault: true },
    { id: 'FIXED_ASSETS', name: 'Fixed Assets', type: 'Asset', isDefault: true },
    { id: 'INVESTMENTS', name: 'Investments', type: 'Asset', isDefault: true },
    { id: 'LOANS_ADV_ASSET', name: 'Loans & Advances (Asset)', type: 'Asset', isDefault: true },
    { id: 'STOCK_IN_HAND', name: 'Stock-in-Hand', type: 'Asset', isDefault: true },
    { id: 'SUNDRY_DEBTORS', name: 'Sundry Debtors', type: 'Asset', isDefault: true },
    { id: 'CURRENT_ASSETS', name: 'Current Assets', type: 'Asset', isDefault: true },
    { id: 'MISC_EXP_ASSET', name: 'Misc. Expenses (ASSET)', type: 'Asset', isDefault: true },

    // Liabilities
    { id: 'CAPITAL', name: 'Capital Account', type: 'Equity', isDefault: true },
    { id: 'CURRENT_LIABILITIES', name: 'Current Liabilities', type: 'Liability', isDefault: true },
    { id: 'DUTIES_TAXES', name: 'Duties & Taxes', type: 'Liability', isDefault: true },
    { id: 'LOANS_LIABILITY', name: 'Loans (Liability)', type: 'Liability', isDefault: true },
    { id: 'SECURED_LOANS', name: 'Secured Loans', type: 'Liability', isDefault: true },
    { id: 'UNSECURED_LOANS', name: 'Unsecured Loans', type: 'Liability', isDefault: true },
    { id: 'SUNDRY_CREDITORS', name: 'Sundry Creditors', type: 'Liability', isDefault: true },
    { id: 'PROVISIONS', name: 'Provisions', type: 'Liability', isDefault: true },
    { id: 'RESERVES_SURPLUS', name: 'Reserves & Surplus', type: 'Equity', isDefault: true },
    { id: 'SUSPENSE', name: 'Suspense A/c', type: 'Liability', isDefault: true },

    // Income
    { id: 'SALES', name: 'Sales Accounts', type: 'Revenue', isDefault: true },
    { id: 'DIRECT_INCOME', name: 'Direct Incomes', type: 'Revenue', isDefault: true },
    { id: 'INDIRECT_INCOME', name: 'Indirect Incomes', type: 'Revenue', isDefault: true },

    // Expenses
    { id: 'PURCHASE', name: 'Purchase Accounts', type: 'Expense', isDefault: true },
    { id: 'DIRECT_EXPENSE', name: 'Direct Expenses', type: 'Expense', isDefault: true },
    { id: 'INDIRECT_EXPENSE', name: 'Indirect Expenses', type: 'Expense', isDefault: true },
];
