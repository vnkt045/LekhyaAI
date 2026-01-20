'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, FileText, ChevronLeft, ChevronRight, Printer } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { format, addDays, subDays } from 'date-fns';

interface DayBookEntry {
    id: string;
    date: string;
    voucherNumber: string;
    voucherType: string;
    particulars: string;
    amount: number;
    narration: string;
}

export default function DayBookPage() {
    const router = useRouter();
    const [entries, setEntries] = useState<DayBookEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    // Stats
    const [totalTransactions, setTotalTransactions] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);

    useEffect(() => {
        fetchDayBook(selectedDate);
    }, [selectedDate]);

    const fetchDayBook = async (date: Date) => {
        setLoading(true);
        const dateStr = format(date, 'yyyy-MM-dd');
        try {
            const res = await fetch(`/api/reports/day-book?date=${dateStr}`);
            if (res.ok) {
                const data = await res.json();
                setEntries(data);

                // Calc stats
                setTotalTransactions(data.length);
                setTotalAmount(data.reduce((sum: number, e: any) => sum + e.amount, 0));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrevDay = () => setSelectedDate(prev => subDays(prev, 1));
    const handleNextDay = () => setSelectedDate(prev => addDays(prev, 1));

    const getVoucherColor = (type: string) => {
        switch (type) {
            case 'PAYMENT': return 'text-orange-600 bg-orange-50';
            case 'RECEIPT': return 'text-green-600 bg-green-50';
            case 'SALES': return 'text-blue-600 bg-blue-50';
            case 'PURCHASE': return 'text-purple-600 bg-purple-50';
            case 'CONTRA': return 'text-slate-600 bg-slate-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    return (
        <div className="min-h-screen bg-lekhya-base font-sans flex flex-col">
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-10 px-6 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <Link href="/reports" className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Day Book</h1>
                        <p className="text-xs text-slate-500">Daily Transaction Register</p>
                    </div>
                </div>

                {/* Date Navigator */}
                <div className="flex items-center gap-4 bg-slate-100 p-1 rounded-lg">
                    <button onClick={handlePrevDay} className="p-1 hover:bg-white rounded shadow-sm text-slate-600">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-2 px-2 font-mono font-bold text-slate-700">
                        <Calendar className="w-4 h-4 text-lekhya-primary" />
                        {format(selectedDate, 'dd MMM yyyy')}
                    </div>
                    <button onClick={handleNextDay} className="p-1 hover:bg-white rounded shadow-sm text-slate-600">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded hover:bg-slate-50 text-slate-700 font-bold text-xs"
                    >
                        <Printer className="w-4 h-4" /> Print
                    </button>
                </div>
            </header>

            <main className="flex-1 p-6 max-w-6xl mx-auto w-full">

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                        <div className="text-xs text-slate-500 uppercase font-bold">Transactions</div>
                        <div className="text-2xl font-bold text-slate-800">{totalTransactions}</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                        <div className="text-xs text-slate-500 uppercase font-bold">Total Turnover</div>
                        <div className="text-2xl font-bold text-lekhya-primary">₹{totalAmount.toLocaleString('en-IN')}</div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden min-h-[400px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lekhya-primary mb-4"></div>
                            Loading entries...
                        </div>
                    ) : entries.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                            <FileText className="w-12 h-12 mb-4 opacity-20" />
                            <p>No transactions found for {format(selectedDate, 'dd MMM yyyy')}</p>
                            <Link href="/vouchers/new" className="mt-4 text-lekhya-accent hover:underline text-sm font-bold">Create Voucher</Link>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-[#E0E8F0] text-slate-600 text-xs uppercase font-bold border-b border-slate-300">
                                <tr>
                                    <th className="px-6 py-3 w-32">Date</th>
                                    <th className="px-6 py-3 w-40">Voucher No</th>
                                    <th className="px-6 py-3">Particulars</th>
                                    <th className="px-6 py-3 w-40">Voucher Type</th>
                                    <th className="px-6 py-3 text-right w-40">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {entries.map((entry) => (
                                    <tr key={entry.id} className="hover:bg-blue-50/50 transition-colors group cursor-pointer" onClick={() => router.push(`/vouchers/${entry.id}`)}>
                                        <td className="px-6 py-3 text-xs text-slate-500 font-mono">
                                            {format(new Date(entry.date), 'dd-MM-yyyy')}
                                        </td>
                                        <td className="px-6 py-3 text-sm font-medium text-slate-700">
                                            {entry.voucherNumber}
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className="font-bold text-slate-800 text-sm">{entry.particulars}</div>
                                            <div className="text-xs text-slate-500 truncate max-w-md italic">{entry.narration}</div>
                                        </td>
                                        <td className="px-6 py-3">
                                            <span className={cn("px-2 py-1 rounded text-[10px] font-bold uppercase", getVoucherColor(entry.voucherType))}>
                                                {entry.voucherType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-right font-bold text-slate-800 font-mono">
                                            ₹{entry.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>
        </div>
    );
}
