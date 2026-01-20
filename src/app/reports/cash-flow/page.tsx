'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, Calendar, Download } from 'lucide-react';
import Link from 'next/link';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { cn } from '@/lib/utils';

export default function CashFlowPage() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    const [fromDate, setFromDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
    const [toDate, setToDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));

    useEffect(() => {
        fetchCashFlow();
    }, [fromDate, toDate]);

    const fetchCashFlow = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/reports/cash-flow?fromDate=${fromDate}&toDate=${toDate}`);
            if (res.ok) {
                setData(await res.json());
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
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
                        <h1 className="text-xl font-bold text-slate-800">Cash Flow Statement</h1>
                        <p className="text-xs text-slate-500">Direct Method (Inflow/Outflow)</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="lekhya-input py-1 px-2 w-36 text-xs"
                    />
                    <span className="text-slate-400">-</span>
                    <input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="lekhya-input py-1 px-2 w-36 text-xs"
                    />
                    <button className="p-2 hover:bg-slate-100 rounded text-lekhya-primary" title="Export">
                        <Download className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <main className="flex-1 p-6 max-w-6xl mx-auto w-full">
                {loading ? (
                    <div className="text-center py-20 text-slate-400">Loading Cash Flow Analysis...</div>
                ) : !data ? (
                    <div className="text-center py-20 text-slate-400">No Data Available</div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Inflow Column */}
                        <div className="bg-white rounded-lg shadow-sm border border-green-100 flex flex-col h-full">
                            <div className="bg-green-50 px-6 py-4 border-b border-green-100 flex justify-between items-center">
                                <h2 className="font-bold text-green-800 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5" /> Cash Inflow
                                </h2>
                                <span className="text-lg font-bold text-green-700">₹{data.totalInflow.toLocaleString()}</span>
                            </div>
                            <div className="flex-1 overflow-auto p-0">
                                <table className="w-full text-left text-sm">
                                    <tbody className="divide-y divide-slate-50">
                                        {data.inflow.map((item: any, i: number) => (
                                            <tr key={i} className="hover:bg-green-50/30">
                                                <td className="px-6 py-3 text-slate-500 text-xs font-mono">{format(new Date(item.date), 'dd/MM')}</td>
                                                <td className="px-6 py-3 font-medium text-slate-700">{item.particulars}</td>
                                                <td className="px-6 py-3 text-right font-bold text-slate-800">₹{item.amount.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                        {data.inflow.length === 0 && (
                                            <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-400 italic">No inflows for this period</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Outflow Column */}
                        <div className="bg-white rounded-lg shadow-sm border border-red-100 flex flex-col h-full">
                            <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex justify-between items-center">
                                <h2 className="font-bold text-red-800 flex items-center gap-2">
                                    <TrendingDown className="w-5 h-5" /> Cash Outflow
                                </h2>
                                <span className="text-lg font-bold text-red-700">₹{data.totalOutflow.toLocaleString()}</span>
                            </div>
                            <div className="flex-1 overflow-auto p-0">
                                <table className="w-full text-left text-sm">
                                    <tbody className="divide-y divide-slate-50">
                                        {data.outflow.map((item: any, i: number) => (
                                            <tr key={i} className="hover:bg-red-50/30">
                                                <td className="px-6 py-3 text-slate-500 text-xs font-mono">{format(new Date(item.date), 'dd/MM')}</td>
                                                <td className="px-6 py-3 font-medium text-slate-700">{item.particulars}</td>
                                                <td className="px-6 py-3 text-right font-bold text-slate-800">₹{item.amount.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                        {data.outflow.length === 0 && (
                                            <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-400 italic">No outflows for this period</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Summary Card (Full Width) */}
                        <div className="lg:col-span-2 bg-slate-800 text-white rounded-lg p-6 flex justify-between items-center shadow-lg">
                            <div className="text-slate-300">
                                <div className="text-xs uppercase font-bold tracking-widest mb-1">Net Cash Flow</div>
                                <div className="text-sm opacity-70">For the selected period</div>
                            </div>
                            <div className={cn("text-3xl font-bold font-mono", data.netCashFlow >= 0 ? "text-green-400" : "text-red-400")}>
                                {data.netCashFlow >= 0 ? '+' : ''} ₹{data.netCashFlow.toLocaleString()}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
