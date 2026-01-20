
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Package, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StockItem {
    id: string;
    code: string;
    name: string;
    category: string;
    unit: string;
    currentStock: number;
    purchaseRate: number;
    valuation: number;
}

export default function StockSummaryPage() {
    const [items, setItems] = useState<StockItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const res = await fetch('/api/inventory/summary');
                if (res.ok) {
                    const data = await res.json();
                    setItems(data);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSummary();
    }, []);

    const totalStockValue = items.reduce((sum, item) => sum + item.valuation, 0);

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Header */}
            <div className="bg-lekhya-primary text-white px-8 py-5 flex justify-between items-center shadow-md sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <Link href="/reports" className="hover:bg-white/10 p-2 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-lekhya-accent" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold tracking-wide">Stock Summary</h1>
                        <p className="text-xs text-indigo-200">Closing Stock Valuation (FIFO/Avg)</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-xs text-indigo-200 uppercase tracking-widest mb-1">Total Valuation</div>
                    <div className="text-2xl font-bold font-mono text-lekhya-accent">₹ {totalStockValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto p-4 md:p-8">
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden min-h-[500px]">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[#E4F2FF] text-lekhya-primary font-bold uppercase tracking-wider border-b-2 border-slate-200">
                            <tr>
                                <th className="px-6 py-4">Particulars (Item Name)</th>
                                <th className="px-6 py-4 text-center">Category</th>
                                <th className="px-6 py-4 text-right">Quantity</th>
                                <th className="px-6 py-4 text-right">Avg. Rate</th>
                                <th className="px-6 py-4 text-right bg-blue-50/50">Value</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr><td colSpan={5} className="px-6 py-20 text-center text-slate-500">Loading Stock Data...</td></tr>
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center text-slate-500">
                                        <div className="flex flex-col items-center gap-4">
                                            <Package className="w-12 h-12 text-slate-300 opacity-50" />
                                            <p>No stock items found.</p>
                                            <Link href="/inventory/items/new" className="text-lekhya-primary font-bold hover:underline">
                                                Add Opening Stock
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                items.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-3 font-bold text-slate-800 flex flex-col">
                                            <span>{item.name}</span>
                                            <span className="text-[10px] text-slate-400 font-mono font-normal">SKU: {item.code}</span>
                                        </td>
                                        <td className="px-6 py-3 text-center">
                                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-xs text-slate-600 border border-slate-200">{item.category}</span>
                                        </td>
                                        <td className="px-6 py-3 text-right font-bold text-slate-700">
                                            {item.currentStock.toFixed(2)} <span className="text-xs font-normal text-slate-400">{item.unit}</span>
                                        </td>
                                        <td className="px-6 py-3 text-right font-mono text-slate-600">
                                            {item.purchaseRate.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-3 text-right font-bold font-mono text-lekhya-primary bg-blue-50/20 group-hover:bg-blue-50/50 transition-colors">
                                            {item.valuation.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                        <tfoot className="bg-slate-50 border-t-2 border-slate-300 font-bold text-lekhya-primary">
                            <tr>
                                <td colSpan={4} className="px-6 py-4 text-right uppercase text-slate-600">Grand Total</td>
                                <td className="px-6 py-4 text-right bg-blue-50">
                                    {totalStockValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
}
