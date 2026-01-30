'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useAppStore } from '@/lib/store';
import Link from 'next/link';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import { X, Calendar } from 'lucide-react';
import CommandBox from '@/components/CommandBox';
import AIInsightsWidget from '@/components/AIInsightsWidget';

export default function Dashboard() {
    const router = useRouter();
    const { company } = useAppStore();
    const [lastEntryDate, setLastEntryDate] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);
    const [currentDate, setCurrentDate] = useState<string>('');

    useEffect(() => {
        setMounted(true);
        setCurrentDate(new Date().toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }));

        // Force Sync Company Data & Fetch Last Entry
        const syncData = async () => {
            try {
                // 1. Sync Company Settings
                const settingsRes = await fetch('/api/settings');
                if (settingsRes.ok) {
                    const data = await settingsRes.json();
                    if (data) useAppStore.getState().updateCompany(data);
                }

                // 2. Fetch Last Voucher Date
                const vouchersRes = await fetch('/api/vouchers');
                if (vouchersRes.ok) {
                    const vouchers = await vouchersRes.json();
                    if (vouchers && vouchers.length > 0) {
                        // Vouchers are already ordered by date desc in API
                        const lastDate = new Date(vouchers[0].date);
                        setLastEntryDate(lastDate.toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric'
                        }));
                    }
                }
            } catch (err) {
                console.error("Failed to sync dashboard data", err);
            }
        };
        syncData();
    }, []);

    // Keyboard simulation removed per user request

    if (!mounted) return null;

    return (
        <div className="flex flex-col h-screen bg-lekhya-base font-sans">

            {/* MAIN LAYOUT: GATEWAY OF LEKHYA */}
            <div className="flex flex-1 overflow-hidden">

                {/* LEFT PANEL: CURRENT PERIOD / DATE */}
                <div className="flex-1 bg-white p-6 border-r border-gray-200 flex flex-col">
                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <div>
                            <h3 className="text-lekhya-text text-xs font-bold uppercase mb-1">Current Period</h3>
                            <p className="font-medium text-sm text-lekhya-dark">
                                {company ? `${new Date(company.financialYearStart).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })} to ${new Date(company.financialYearEnd).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}` : 'Loading...'}
                            </p>
                        </div>
                        <div className="text-right">
                            <h3 className="text-lekhya-text text-xs font-bold uppercase mb-1">Current Date</h3>
                            <p className="font-medium text-sm text-lekhya-dark">{currentDate}</p>
                        </div>
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center justify-between border-b border-gray-200 pb-1 mb-2">
                            <h3 className="text-lekhya-text text-sm font-bold uppercase">Date of Last Entry</h3>
                        </div>
                        {lastEntryDate ? (
                            <p className="text-sm font-bold text-lekhya-dark">{lastEntryDate}</p>
                        ) : (
                            <p className="text-sm font-medium italic text-slate-400">No Vouchers Entered</p>
                        )}
                    </div>

                    {/* Dashboard Graphs / Stats Area */}
                    <div className="mt-8 h-48 bg-slate-50 border border-gray-200 p-0 flex flex-col rounded-sm overflow-hidden mb-8">
                        <AIInsightsWidget />
                    </div>


                </div>

                {/* CENTER PANEL: POS STYLE NAVIGATION GRID */}
                <div className="flex-[3] p-8 overflow-y-auto bg-slate-50">
                    <div className="max-w-5xl mx-auto space-y-8">

                        {/* Masters Section */}
                        <section>
                            <h3 className="text-lekhya-text text-sm font-bold uppercase mb-4 tracking-wider">Masters</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                <Link href="/masters/accounts-info" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-lekhya-primary/20 hover:scale-[1.02] transition-all flex flex-col items-center gap-3 group">
                                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                        <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-semibold text-lekhya-dark text-center">Chart of Accounts</span>
                                </Link>
                                <Link href="/masters/ledger/display" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-lekhya-primary/20 hover:scale-[1.02] transition-all flex flex-col items-center gap-3 group">
                                    <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                                        <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-semibold text-lekhya-dark text-center">Ledger</span>
                                </Link>
                                <Link href="/inventory/items" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-lekhya-primary/20 hover:scale-[1.02] transition-all flex flex-col items-center gap-3 group">
                                    <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                                        <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-semibold text-lekhya-dark text-center">Items (Stock)</span>
                                </Link>
                            </div>
                        </section>

                        {/* Transactions Section */}
                        <section>
                            <h3 className="text-lekhya-text text-sm font-bold uppercase mb-4 tracking-wider">Vouchers & Transactions</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                <Link href="/vouchers/new?type=Sales" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-lekhya-primary/20 hover:scale-[1.02] transition-all flex flex-col items-center gap-3 group">
                                    <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                                        <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-semibold text-lekhya-dark text-center">Sales Invoice</span>
                                </Link>
                                <Link href="/vouchers/new?type=Purchase" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-lekhya-primary/20 hover:scale-[1.02] transition-all flex flex-col items-center gap-3 group">
                                    <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center group-hover:bg-teal-100 transition-colors">
                                        <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-semibold text-lekhya-dark text-center">Purchase Bill</span>
                                </Link>
                                <Link href="/vouchers/new?type=Payment" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-lekhya-primary/20 hover:scale-[1.02] transition-all flex flex-col items-center gap-3 group">
                                    <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center group-hover:bg-rose-100 transition-colors">
                                        <svg className="w-6 h-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-semibold text-lekhya-dark text-center">Payment</span>
                                </Link>
                                <Link href="/vouchers/new?type=Receipt" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-lekhya-primary/20 hover:scale-[1.02] transition-all flex flex-col items-center gap-3 group">
                                    <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                                        <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-semibold text-lekhya-dark text-center">Receipt</span>
                                </Link>
                                <Link href="/vouchers" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-lekhya-primary/20 hover:scale-[1.02] transition-all flex flex-col items-center gap-3 group">
                                    <div className="w-12 h-12 rounded-full bg-violet-50 flex items-center justify-center group-hover:bg-violet-100 transition-colors">
                                        <svg className="w-6 h-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-semibold text-lekhya-dark text-center">All Vouchers</span>
                                </Link>
                            </div>
                        </section>

                        {/* Reports Section */}
                        <section>
                            <h3 className="text-lekhya-text text-sm font-bold uppercase mb-4 tracking-wider">Reports</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                <Link href="/reports/profit-loss" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-lekhya-primary/20 hover:scale-[1.02] transition-all flex flex-col items-center gap-3 group">
                                    <div className="w-12 h-12 rounded-full bg-cyan-50 flex items-center justify-center group-hover:bg-cyan-100 transition-colors">
                                        <svg className="w-6 h-6 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-semibold text-lekhya-dark text-center">Profit & Loss</span>
                                </Link>
                                <Link href="/reports/balance-sheet" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-lekhya-primary/20 hover:scale-[1.02] transition-all flex flex-col items-center gap-3 group">
                                    <div className="w-12 h-12 rounded-full bg-fuchsia-50 flex items-center justify-center group-hover:bg-fuchsia-100 transition-colors">
                                        <svg className="w-6 h-6 text-fuchsia-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-semibold text-lekhya-dark text-center">Balance Sheet</span>
                                </Link>
                                <Link href="/reports/trial-balance" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-lekhya-primary/20 hover:scale-[1.02] transition-all flex flex-col items-center gap-3 group">
                                    <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-slate-100 transition-colors">
                                        <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-semibold text-lekhya-dark text-center">Trial Balance</span>
                                </Link>
                                <Link href="/gst" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-lekhya-primary/20 hover:scale-[1.02] transition-all flex flex-col items-center gap-3 group">
                                    <div className="w-12 h-12 rounded-full bg-sky-50 flex items-center justify-center group-hover:bg-sky-100 transition-colors">
                                        <svg className="w-6 h-6 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-semibold text-lekhya-dark text-center">GST Reports</span>
                                </Link>
                            </div>
                        </section>

                        {/* Setup Section */}
                        <section>
                            <h3 className="text-lekhya-text text-sm font-bold uppercase mb-4 tracking-wider">Setup & Config</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                <Link href="/setup/company" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-lekhya-primary/20 hover:scale-[1.02] transition-all flex flex-col items-center gap-3 group">
                                    <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                                        <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-semibold text-lekhya-dark text-center">Company Profile</span>
                                </Link>
                                <Link href="/admin/users" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-lekhya-primary/20 hover:scale-[1.02] transition-all flex flex-col items-center gap-3 group">
                                    <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                                        <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-semibold text-lekhya-dark text-center">User Management</span>
                                </Link>
                            </div>
                        </section>
                    </div>
                </div>

                {/* <div className="hidden">Menu moved to Global Header</div> */}

            </div>

            {/* BOTTOM PANEL: CALCULATOR */}
            <div className="h-8 bg-lekhya-base border-t border-gray-200 flex items-center px-4 text-xs font-mono text-slate-500">
            </div>
        </div>
    );
}
