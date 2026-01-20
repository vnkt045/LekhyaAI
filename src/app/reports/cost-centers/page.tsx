'use client';

import { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/utils';
import { ArrowLeft, PieChart, Filter } from 'lucide-react';
import Link from 'next/link';

interface Transaction {
    id: string;
    date: string;
    voucherNumber: string;
    ledgerName: string;
    amount: number;
    type: string;
}

interface CostCenterData {
    id: string;
    name: string;
    categoryName: string;
    totalAmount: number;
    transactions: Transaction[];
}

export default function CostCenterReportPage() {
    const [data, setData] = useState<CostCenterData[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch Categories for Filter
        fetch('/api/masters/cost-categories')
            .then(res => res.json())
            .then(setCategories)
            .catch(console.error);
    }, []);

    useEffect(() => {
        fetchReport();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCategory]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const url = selectedCategory
                ? `/api/reports/cost-centers?categoryId=${selectedCategory}`
                : '/api/reports/cost-centers';
            const res = await fetch(url);
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
        <div className="min-h-screen bg-lekhya-base p-8 font-sans flex flex-col">
            {/* Header */}
            <div className="max-w-5xl mx-auto mb-6 w-full">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Link href="/reports" className="hover:bg-slate-200 p-2 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5 text-slate-600" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-lekhya-primary flex items-center gap-2">
                                <PieChart className="w-6 h-6" /> Cost Center Break-up
                            </h1>
                            <p className="text-sm text-slate-600">Expense analysis by Project/Department</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 bg-white px-3 py-2 rounded shadow-sm border border-slate-200">
                        <Filter className="w-4 h-4 text-slate-400" />
                        <select
                            className="bg-transparent text-sm outline-none text-slate-700"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            <option value="">All Categories</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="text-center p-12 text-slate-500">Loading Report...</div>
                ) : (
                    <div className="space-y-6">
                        {data.length === 0 ? (
                            <div className="p-12 text-center bg-white rounded-lg border border-dashed border-slate-300 text-slate-400">
                                No Cost Center transactions found.
                            </div>
                        ) : (
                            data.map(cc => (
                                <div key={cc.id} className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center group cursor-pointer">
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-800">{cc.name}</h3>
                                            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">{cc.categoryName}</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-bold font-mono text-lekhya-primary">{formatCurrency(cc.totalAmount)}</p>
                                            <p className="text-xs text-slate-500">Total Allocation</p>
                                        </div>
                                    </div>

                                    {/* Transactions Table */}
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-slate-100 text-slate-500 font-semibold border-b border-slate-200 text-xs uppercase">
                                                <tr>
                                                    <th className="px-6 py-2">Date</th>
                                                    <th className="px-6 py-2">Voucher No.</th>
                                                    <th className="px-6 py-2">Particulars</th>
                                                    <th className="px-6 py-2 text-right">Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {cc.transactions.length > 0 ? (
                                                    cc.transactions.map(t => (
                                                        <tr key={t.id} className="hover:bg-blue-50/50 transition-colors">
                                                            <td className="px-6 py-2 text-slate-600 font-mono text-xs">
                                                                {new Date(t.date).toLocaleDateString()}
                                                            </td>
                                                            <td className="px-6 py-2 text-lekhya-accent font-medium text-xs">
                                                                {t.voucherNumber}
                                                            </td>
                                                            <td className="px-6 py-2 text-slate-800">
                                                                {t.ledgerName}
                                                            </td>
                                                            <td className="px-6 py-2 text-right font-mono font-medium">
                                                                {formatCurrency(t.amount)}
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={4} className="px-6 py-4 text-center text-slate-400 italic">No transactions</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
