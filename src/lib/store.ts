'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
export interface CompanyProfile {
    id: string; // Added ID for selection
    name: string;
    gstin: string;
    pan: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    email: string;
    phone: string;
    financialYearStart: string | Date;
    financialYearEnd: string | Date;
    booksBeginFrom: string | Date;
}

import { DEFAULT_GROUPS, AccountGroup } from './account-defaults';

// ... Account / Voucher definitions ...

export interface Account {
    id: string;
    name: string;
    parentGroup: string; // ID of the parent group (e.g. Current Assets)
    openingBalance: number;
    type: 'Dr' | 'Cr';
    mailingName?: string;
    address?: string;
    state?: string;
    pincode?: string;
    pan?: string;
    gstin?: string;
}

export interface Voucher {
    id: string;
    date: string;
    number: string;
    type: 'PAYMENT' | 'RECEIPT' | 'SALES' | 'PURCHASE' | 'JOURNAL';
    amount: number;
    narration: string;
}

interface AppState {
    // Multi-company support
    companies: CompanyProfile[];
    activeCompanyId: string | null;
    company: CompanyProfile | null;

    groups: AccountGroup[]; // Custom + Default groups
    accounts: Account[];
    vouchers: Voucher[];

    // Actions
    createCompany: (profile: CompanyProfile) => void;
    selectCompany: (id: string) => void;
    updateCompany: (profile: CompanyProfile) => void;

    // Master Actions
    createGroup: (group: AccountGroup) => void;
    createLedger: (ledger: Account) => void;

    // Legacy Support (Aliases)
    setCompany: (profile: CompanyProfile) => void;
    addAccount: (account: Account) => void;
    setAccounts: (accounts: Account[]) => void;
    addVoucher: (voucher: Voucher) => void;
    deleteVoucher: (id: string) => void;
    updateVoucher: (voucher: Voucher) => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            companies: [],
            activeCompanyId: null,
            company: null,
            groups: [...DEFAULT_GROUPS], // Initialize with defaults
            accounts: [],
            vouchers: [],

            createCompany: (profile) => set((state) => {
                const newProfile = { ...profile, id: profile.id || Math.random().toString(36).substr(2, 9) };
                return {
                    companies: [...state.companies, newProfile],
                    activeCompanyId: newProfile.id,
                    company: newProfile,
                    // In real app, we would re-init groups per company here
                    // For now, shared groups or we filter by companyId if added to Group interface
                };
            }),
            selectCompany: (id) => set((state) => {
                const selected = state.companies.find(c => c.id === id) || null;
                return {
                    activeCompanyId: id,
                    company: selected
                };
            }),
            updateCompany: (profile) => set((state) => ({
                company: profile,
                companies: state.companies.map(c => c.id === profile.id ? profile : c)
            })),

            // Master Actions
            createGroup: (group) => set((state) => ({
                groups: [...state.groups, { ...group, id: Math.random().toString(36).substr(2, 9) }]
            })),
            createLedger: (ledger) => set((state) => ({
                accounts: [...state.accounts, { ...ledger, id: ledger.id || Math.random().toString(36).substr(2, 9) }]
            })),

            // Legacy
            setCompany: (profile) => get().createCompany(profile),
            addAccount: (account) => get().createLedger(account),
            setAccounts: (accounts) => set({ accounts }),
            addVoucher: (voucher) => set((state) => ({
                vouchers: [...state.vouchers, voucher]
            })),
            deleteVoucher: (id) => set((state) => ({
                vouchers: state.vouchers.filter(v => v.id !== id)
            })),
            updateVoucher: (voucher) => set((state) => ({
                vouchers: state.vouchers.map(v => v.id === voucher.id ? voucher : v)
            })),
        }),
        {
            name: 'lekhya-storage',
        }
    )
);
