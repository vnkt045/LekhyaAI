'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import { ArrowLeft, CheckCircle, Save, Calendar, RefreshCcw } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface BRSData {
    bookBalance: number;
    balanceAsPerBank: number;
    unreconciledEntries: BRSEntry[];
    stats: {
        pendingDeposits: number;
        pendingWithdrawals: number;
    };
}

interface BRSEntry {
    id: string;
    date: string;
    voucherNumber: string;
    narration: string;
    debit: number;
    credit: number;
    isDebit: boolean;
    amount: number;
}

export default function BankReconciliationPage({ params }: { params: Promise<{ accountId: string }> }) {
    const { accountId } = use(params);
    const [data, setData] = useState<BRSData | null>(null);
    const [loading, setLoading] = useState(true);
    const [reconcilingIds, setReconcilingIds] = useState<Set<string>>(new Set());

    // Local state for dates being entered
    const [dates, setDates] = useState<Record<string, string>>({});

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/banking/brs?accountId=${accountId}`);
            if (res.ok) {
                const json = await res.json();
                setData(json);
            }
        } catch (error) {
            console.error('Failed to fetch BRS', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (accountId) fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accountId]);

    const handleDateChange = (id: string, value: string) => {
        setDates(prev => ({ ...prev, [id]: value }));
    };

    const handleReconcile = async (entry: BRSEntry) => {
        const bankDate = dates[entry.id];
        if (!bankDate) return;

        setReconcilingIds(prev => new Set(prev).add(entry.id));

        try {
            const res = await fetch('/api/banking/reconcile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    voucherEntryId: entry.id,
                    bankDate
                })
            });

            if (res.ok) {
                // Remove from local list or refresh
                fetchData(); // Refresh to update balances
                // Clear local date
                setDates(prev => {
                    const newDates = { ...prev };
                    delete newDates[entry.id];
                    return newDates;
                });
            }
        } catch (error) {
            console.error('Reconciliation failed', error);
        } finally {
            setReconcilingIds(prev => {
                const next = new Set(prev);
                next.delete(entry.id);
                return next;
            });
        }
    };

    const setToday = (id: string) => {
        const today = new Date().toISOString().split('T')[0];
        handleDateChange(id, today);
    };

    if (loading && !data) return <div className="p-12 text-center text-slate-500">Loading BRS...</div>;
    if (!data) return <div className="p-12 text-center text-red-500">Failed to load BRS data</div>;

    return (
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
            {/* Header */}
            <header className="bg-lekhya-primary text-white p-6 shadow-sm">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center gap-4 mb-4">
                        <Link href="/reports/balance-sheet" className="hover:bg-white/10 p-2 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">Bank Reconciliation</h1>
                            <p className="opacity-80 text-sm">Match your books with the bank statement</p>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        <div className="bg-white/10 border border-white/20 p-4 rounded-lg backdrop-blur-sm">
                            <p className="text-xs uppercase opacity-70 mb-1">Balance as per Company Books</p>
                            <p className="text-2xl font-mono font-bold">{formatCurrency(data.bookBalance)}</p>
                        </div>

                        <div className="bg-white/10 border border-white/20 p-4 rounded-lg backdrop-blur-sm">
                            <div className="flex flex-col gap-1 text-sm">
                                <div className="flex justify-between">
                                    <span className="opacity-70">Add: Amounts not reflected in Bank</span>
                                    <span>{formatCurrency(data.stats.pendingWithdrawals)}</span>
                                </div>
                                <div className="flex justify-between border-t border-white/10 pt-1 mt-1">
                                    <span className="opacity-70">Less: Amounts not reflected in Bank</span>
                                    <span>{formatCurrency(data.stats.pendingDeposits)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-lekhya-accent text-lekhya-primary p-4 rounded-lg shadow-lg">
                            <p className="text-xs uppercase font-bold opacity-70 mb-1">Balance as per Bank</p>
                            <p className="text-3xl font-mono font-bold">{formatCurrency(data.balanceAsPerBank)}</p>
                            <p className="text-xs mt-1 opacity-80 italic">Calculated dynamically based on reconciliation dates</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 p-6 max-w-6xl mx-auto w-full">
                <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                    <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                        <h2 className="font-bold text-slate-700">Unreconciled Transactions</h2>
                        <button onClick={fetchData} className="text-slate-500 hover:text-lekhya-primary transition-colors">
                            <RefreshCcw className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200 uppercase text-xs">
                                <tr>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3">Particulars</th>
                                    <th className="px-4 py-3">Voucher Type</th>
                                    <th className="px-4 py-3 text-right">Debit (Deposit)</th>
                                    <th className="px-4 py-3 text-right">Credit (Withdrawal)</th>
                                    <th className="px-4 py-3 w-[200px]">Bank Date</th>
                                    <th className="px-4 py-3 w-[50px]">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {data.unreconciledEntries.length > 0 ? (
                                    data.unreconciledEntries.map(entry => (
                                        <tr key={entry.id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="px-4 py-3 text-slate-600">
                                                {new Date(entry.date).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3 font-medium text-slate-800">
                                                {entry.narration || "No Narration"}
                                                <div className="text-xs text-slate-400 font-mono mt-0.5">{entry.voucherNumber}</div>
                                            </td>
                                            <td className="px-4 py-3 text-slate-500">
                                                {/* Voucher Type not in my flat Entry type, need backend to send it or just use number */}
                                                -
                                            </td>
                                            <td className="px-4 py-3 text-right font-mono text-green-700">
                                                {entry.debit > 0 ? formatCurrency(entry.debit) : ''}
                                            </td>
                                            <td className="px-4 py-3 text-right font-mono text-red-700">
                                                {entry.credit > 0 ? formatCurrency(entry.credit) : ''}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1">
                                                    <input
                                                        type="date"
                                                        className="border border-slate-300 rounded px-2 py-1 w-full text-xs focus:ring-1 focus:ring-lekhya-accent outline-none"
                                                        value={dates[entry.id] || ''}
                                                        onChange={(e) => handleDateChange(entry.id, e.target.value)}
                                                    />
                                                    <button
                                                        onClick={() => setToday(entry.id)}
                                                        className="text-xs text-slate-400 hover:text-lekhya-primary px-1"
                                                        title="Set Today"
                                                    >
                                                        Today
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {dates[entry.id] && (
                                                    <button
                                                        onClick={() => handleReconcile(entry)}
                                                        className="text-green-600 hover:text-green-700 p-1.5 hover:bg-green-50 rounded transition-colors"
                                                        disabled={reconcilingIds.has(entry.id)}
                                                        title="Save Bank Date"
                                                    >
                                                        {reconcilingIds.has(entry.id) ? (
                                                            <div className="w-4 h-4 rounded-full border-2 border-green-600 border-t-transparent animate-spin"></div>
                                                        ) : (
                                                            <Save className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-12 text-center text-slate-400 italic">
                                            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-200" />
                                            No unreconciled transactions found. <br />Your books match the bank records perfectly!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
