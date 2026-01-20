'use client';

import { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/utils';
import { Landmark, RefreshCw, FileText, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface BankAccount {
    id: string;
    name: string;
    balance: number;
    lastReconciled: string | null;
}

export default function BankingPage() {
    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBankAccounts();
    }, []);

    const fetchBankAccounts = async () => {
        setLoading(true);
        try {
            // Fetch accounts with type 'Asset' and name containing 'Bank'
            const res = await fetch('/api/accounts?type=Asset');
            if (res.ok) {
                const accounts = await res.json();
                const banks = accounts.filter((acc: any) =>
                    acc.name.toLowerCase().includes('bank') ||
                    acc.name.toLowerCase().includes('hdfc') ||
                    acc.name.toLowerCase().includes('icici') ||
                    acc.name.toLowerCase().includes('sbi')
                );
                setBankAccounts(banks.map((acc: any) => ({
                    id: acc.id,
                    name: acc.name,
                    balance: acc.balance,
                    lastReconciled: null // TODO: Implement reconciliation tracking
                })));
            }
        } catch (error) {
            console.error('Failed to fetch bank accounts', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-lekhya-base">
                <div className="text-center">
                    <Landmark className="w-12 h-12 text-lekhya-accent animate-pulse mx-auto mb-4" />
                    <p className="text-slate-600">Loading Banking Module...</p>
                </div>
            </div>
        );
    }

    const totalBankBalance = bankAccounts.reduce((sum, acc) => sum + acc.balance, 0);

    return (
        <div className="min-h-screen bg-lekhya-base p-8">
            {/* Header */}
            <div className="max-w-6xl mx-auto mb-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-lekhya-primary rounded-lg">
                                <Landmark className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-lekhya-primary">Banking</h1>
                                <p className="text-sm text-slate-600">Manage bank accounts, reconciliation & cheques</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={fetchBankAccounts}
                                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="max-w-6xl mx-auto grid grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <p className="text-xs text-slate-500 uppercase font-medium mb-2">Total Bank Accounts</p>
                    <p className="text-3xl font-bold text-lekhya-primary">{bankAccounts.length}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <p className="text-xs text-slate-500 uppercase font-medium mb-2">Total Balance</p>
                    <p className="text-3xl font-bold text-green-600">{formatCurrency(totalBankBalance)}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <p className="text-xs text-slate-500 uppercase font-medium mb-2">Pending Reconciliation</p>
                    <p className="text-3xl font-bold text-orange-600">{bankAccounts.length}</p>
                    <p className="text-xs text-slate-400 mt-1">accounts</p>
                </div>
            </div>

            {/* Bank Accounts List */}
            <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-bold text-lekhya-primary">Bank Accounts</h2>
                    </div>

                    {bankAccounts.length === 0 ? (
                        <div className="p-12 text-center">
                            <Landmark className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-slate-600 mb-2">No Bank Accounts Found</h3>
                            <div className="max-w-md mx-auto">
                                <p className="text-sm text-slate-500 mb-4">
                                    To add bank accounts, create ledgers in the Chart of Accounts with account type "Asset" and include "Bank" in the name.
                                </p>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                                    <p className="text-sm font-medium text-blue-900 mb-2">How to create a bank account:</p>
                                    <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                                        <li>Go to <strong>Masters → Ledger → Create</strong></li>
                                        <li>Enter bank name (e.g., "HDFC Bank", "ICICI Current Account")</li>
                                        <li>Select Type: <strong>Asset</strong></li>
                                        <li>Enter opening balance if any</li>
                                        <li>Save the ledger</li>
                                    </ol>
                                </div>
                                <Link
                                    href="/masters/ledger"
                                    className="inline-flex items-center gap-2 px-6 py-3 mt-6 bg-lekhya-primary text-white rounded-lg hover:bg-blue-900 transition-colors"
                                >
                                    Go to Ledger Management
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {bankAccounts.map((account) => (
                                <div key={account.id} className="p-6 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-blue-50 rounded-lg">
                                                <Landmark className="w-6 h-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-800">{account.name}</h3>
                                                <p className="text-sm text-slate-500">
                                                    {account.lastReconciled
                                                        ? `Last reconciled: ${new Date(account.lastReconciled).toLocaleDateString()}`
                                                        : 'Never reconciled'
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <p className="text-xs text-slate-500 uppercase font-medium mb-1">Balance</p>
                                                <p className={`text-2xl font-bold ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {formatCurrency(account.balance)}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <label className="flex items-center gap-2 px-4 py-2 border border-blue-300 text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-sm cursor-pointer">
                                                    <FileText className="w-4 h-4" />
                                                    <span>Import CSV</span>
                                                    <input
                                                        type="file"
                                                        accept=".csv"
                                                        className="hidden"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                // Simulate Import Process
                                                                alert(`Importing ${file.name}... \n(Simulation: Statement Parsed & 5 Transactions Matched!)`);
                                                                // In real app, parse CSV and match with Vouchers
                                                            }
                                                        }}
                                                    />
                                                </label>
                                                <button className="flex items-center gap-2 px-4 py-2 bg-lekhya-primary text-white rounded-lg hover:bg-blue-900 transition-colors text-sm">
                                                    <CheckCircle className="w-4 h-4" />
                                                    Reconcile
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="max-w-6xl mx-auto mt-6 grid grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="font-bold text-blue-900 mb-2">Bank Reconciliation</h3>
                    <p className="text-sm text-blue-700 mb-4">
                        Match your bank statements with recorded transactions
                    </p>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                        Start Reconciliation
                    </button>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
                    <h3 className="font-bold text-green-900 mb-2">Cheque Management</h3>
                    <p className="text-sm text-green-700 mb-4">
                        Track issued and received cheques
                    </p>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                        Manage Cheques
                    </button>
                </div>
            </div>
        </div>
    );
}
