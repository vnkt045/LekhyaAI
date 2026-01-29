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

                    {/* QUICK ACTIONS */}
                    <div>
                        <h3 className="text-lekhya-text text-sm font-bold uppercase mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <Link href="/vouchers/new?type=Journal" className="bg-lekhya-accent text-white p-4 rounded-md shadow hover:bg-opacity-90 transition-colors flex flex-col items-center justify-center text-center">
                                <span className="text-lg font-bold mb-1">+ Journal</span>
                                <span className="text-xs opacity-80">Double Entry Adjustment</span>
                            </Link>
                            <Link href="/vouchers/new?type=Sales" className="bg-white border border-gray-200 text-lekhya-dark p-4 rounded-md shadow-sm hover:border-lekhya-accent transition-colors flex flex-col items-center justify-center text-center">
                                <span className="font-bold mb-1">+ Sales</span>
                                <span className="text-xs text-slate-500">Create Invoice</span>
                            </Link>
                            <Link href="/vouchers/new?type=Purchase" className="bg-white border border-gray-200 text-lekhya-dark p-4 rounded-md shadow-sm hover:border-lekhya-accent transition-colors flex flex-col items-center justify-center text-center">
                                <span className="font-bold mb-1">+ Purchase</span>
                                <span className="text-xs text-slate-500">Record Bill</span>
                            </Link>
                            <Link href="/vouchers/new?type=Payment" className="bg-white border border-gray-200 text-lekhya-dark p-4 rounded-md shadow-sm hover:border-lekhya-accent transition-colors flex flex-col items-center justify-center text-center">
                                <span className="font-bold mb-1">+ Payment</span>
                                <span className="text-xs text-slate-500">Make Payment</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* CENTER PANEL: GATEWAY MENU - Removed in favor of Global Header */}
                {/* <div className="hidden">Menu moved to Global Header</div> */}

            </div>

            {/* BOTTOM PANEL: CALCULATOR */}
            <div className="h-8 bg-lekhya-base border-t border-gray-200 flex items-center px-4 text-xs font-mono text-slate-500">
            </div>
        </div>
    );
}
