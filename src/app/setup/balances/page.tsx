'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { Wallet, Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function BalancesSetupPage() {
    const router = useRouter();
    const { accounts, setAccounts } = useAppStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleBalanceChange = (id: string, value: string) => {
        const numValue = parseFloat(value) || 0;
        setAccounts(accounts.map(a => a.id === id ? { ...a, openingBalance: numValue } : a));
    };

    const handleSave = () => {
        // Migration to API based setup would happen here
        router.push('/');
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <header className="bg-white border-b border-slate-200 h-16 flex items-center px-6 sticky top-0 z-10">
                <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm font-medium">Back to Dashboard</span>
                </Link>
            </header>

            <div className="flex-1 p-6 md:p-12 max-w-4xl mx-auto w-full">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Opening Balances</h1>
                        <p className="text-slate-500 mt-2">Enter the starting balances for your accounts as of 1st April.</p>
                    </div>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center gap-2"
                    >
                        <Save className="w-4 h-4" /> Save Balances
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3 font-semibold text-slate-700">Account Name</th>
                                <th className="px-6 py-3 font-semibold text-slate-700">Type</th>
                                <th className="px-6 py-3 font-semibold text-slate-700 text-right">Opening Balance (₹)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {accounts.map((acc) => (
                                <tr key={acc.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-3 font-medium text-slate-900">{acc.name}</td>
                                    <td className="px-6 py-3 text-slate-500">{acc.type}</td>
                                    <td className="px-6 py-2 text-right">
                                        <input
                                            type="number"
                                            className="input w-32 text-right py-1"
                                            placeholder="0.00"
                                            value={acc.openingBalance || ''}
                                            onChange={(e) => handleBalanceChange(acc.id, e.target.value)}
                                        />
                                    </td>
                                </tr>
                            ))}
                            {accounts.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                                        No accounts found. Please complete the "Chart of Accounts" step first.
                                        <div className="mt-2">
                                            <Link href="/setup/accounts" className="text-blue-600 hover:underline">Go to Setup</Link>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
