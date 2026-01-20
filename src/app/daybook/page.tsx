'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Filter } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils';
import AnalyticsChart from '@/components/AnalyticsChart';

export default function DayBookPage() {
    const router = useRouter();
    const [vouchers, setVouchers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [showChart, setShowChart] = useState(false);

    useEffect(() => {
        fetchVouchers();
    }, [selectedDate]);

    const fetchVouchers = async () => {
        try {
            const res = await fetch('/api/vouchers');
            if (res.ok) {
                const data = await res.json();
                // Filter by selected date
                const filtered = data.filter((v: any) => {
                    const vDate = new Date(v.date).toISOString().split('T')[0];
                    return vDate === selectedDate;
                });
                setVouchers(filtered);
            }
        } catch (error) {
            console.error('Failed to fetch vouchers', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-lekhya-base flex flex-col font-sans">
            {/* Header */}
            <header className="bg-lekhya-primary text-white h-12 flex items-center justify-between px-4 border-b-[3px] border-lekhya-accent shadow-sm sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <Link href="/" className="hover:bg-white/10 p-1.5 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-lekhya-accent" />
                    </Link>
                    <h1 className="text-lg font-bold tracking-wide">Day Book</h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="bg-white/10 border border-white/20 rounded-sm px-3 py-1 text-sm focus:outline-none focus:border-lekhya-accent"
                        />
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 p-6">
                <div className="max-w-7xl mx-auto space-y-4">

                    {/* Visual Analytics Toggle */}
                    <div className="flex justify-end">
                        <label className="flex items-center gap-2 text-sm text-slate-600 bg-white px-3 py-1.5 rounded-full border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                            <input type="checkbox" checked={showChart} onChange={e => setShowChart(e.target.checked)} className="rounded text-lekhya-primary focus:ring-0" />
                            <span>Show Visual Analysis</span>
                        </label>
                    </div>

                    {showChart && vouchers.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <AnalyticsChart
                                title="Transaction Volume (Debit vs Credit)"
                                data={[
                                    {
                                        name: 'Today',
                                        debit: vouchers.reduce((sum, v) => sum + v.totalDebit, 0),
                                        credit: vouchers.reduce((sum, v) => sum + v.totalCredit, 0)
                                    }
                                ]}
                                dataKeys={[
                                    { key: 'debit', name: 'Total Debit', color: '#EF4444' }, // Red for Debit (outflow/expense usually)
                                    { key: 'credit', name: 'Total Credit', color: '#10B981' } // Green for Credit (inflow/income usually)
                                ]}
                                xAxisKey="name"
                                type="bar"
                            />
                            <AnalyticsChart
                                title="Voucher Count by Type"
                                data={Object.entries(vouchers.reduce((acc: any, v) => {
                                    acc[v.voucherType] = (acc[v.voucherType] || 0) + 1;
                                    return acc;
                                }, {})).map(([type, count]) => ({ name: type, value: count }))}
                                dataKeys={[{ key: 'value', name: 'Count', color: '#3B82F6' }]}
                                xAxisKey="name"
                                type="pie"
                            />
                        </div>
                    )}

                    <div className="bg-white rounded-sm shadow-sm border border-[#BDCDD6] overflow-hidden">
                        {loading ? (
                            <div className="p-12 text-center text-slate-500">Loading...</div>
                        ) : vouchers.length === 0 ? (
                            <div className="p-12 text-center">
                                <p className="text-slate-500 mb-4">No transactions for {formatDate(new Date(selectedDate))}</p>
                                <Link href="/vouchers/new" className="text-lekhya-primary hover:underline">
                                    Create a voucher
                                </Link>
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                                    <tr>
                                        <th className="px-6 py-3 text-left font-semibold text-lekhya-primary uppercase text-xs tracking-wider">Voucher No.</th>
                                        <th className="px-6 py-3 text-left font-semibold text-lekhya-primary uppercase text-xs tracking-wider">Type</th>
                                        <th className="px-6 py-3 text-left font-semibold text-lekhya-primary uppercase text-xs tracking-wider">Particulars</th>
                                        <th className="px-6 py-3 text-right font-semibold text-lekhya-primary uppercase text-xs tracking-wider">Debit</th>
                                        <th className="px-6 py-3 text-right font-semibold text-lekhya-primary uppercase text-xs tracking-wider">Credit</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {vouchers.map((v) => (
                                        <tr key={v.id} className="hover:bg-blue-50/50 transition-colors">
                                            <td className="px-6 py-3">
                                                <Link href={`/vouchers/${v.id}`} className="text-lekhya-primary hover:underline font-medium">
                                                    {v.voucherNumber}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-3">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${v.voucherType === 'RECEIPT' ? 'bg-green-50 text-green-700 border-green-200' :
                                                    v.voucherType === 'PAYMENT' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                                        v.voucherType === 'SALES' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                            'bg-slate-100 text-slate-700 border-slate-200'
                                                    }`}>
                                                    {v.voucherType}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 text-slate-700 italic">{v.narration}</td>
                                            <td className="px-6 py-3 text-right font-medium text-slate-800">
                                                {v.totalDebit > 0 ? formatCurrency(v.totalDebit) : '-'}
                                            </td>
                                            <td className="px-6 py-3 text-right font-medium text-slate-800">
                                                {v.totalCredit > 0 ? formatCurrency(v.totalCredit) : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                    <tr className="bg-slate-50 font-bold">
                                        <td colSpan={3} className="px-6 py-3 text-right">Total:</td>
                                        <td className="px-6 py-3 text-right text-lekhya-primary">
                                            {formatCurrency(vouchers.reduce((sum, v) => sum + v.totalDebit, 0))}
                                        </td>
                                        <td className="px-6 py-3 text-right text-lekhya-primary">
                                            {formatCurrency(vouchers.reduce((sum, v) => sum + v.totalCredit, 0))}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
