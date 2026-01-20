'use client';

import { useState, useEffect } from 'react';
import { Package, Plus, TrendingDown, AlertTriangle, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

interface StockSummary {
    items: any[];
    totals: {
        totalItems: number;
        totalValue: number;
        lowStockCount: number;
    };
}

export default function InventoryDashboard() {
    const [summary, setSummary] = useState<StockSummary | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSummary();
    }, []);

    const fetchSummary = async () => {
        try {
            const res = await fetch('/api/inventory/stock-summary');
            if (res.ok) {
                const data = await res.json();
                setSummary(data);
            }
        } catch (error) {
            console.error('Failed to fetch inventory summary', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-lekhya-base">
                <Package className="w-12 h-12 text-lekhya-accent animate-pulse" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-lekhya-base p-8">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-lekhya-primary rounded-lg">
                                <Package className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-lekhya-primary">Inventory Management</h1>
                                <p className="text-sm text-slate-600">Stock tracking, valuation & reports</p>
                            </div>
                        </div>
                        <Link
                            href="/inventory/items/create"
                            className="flex items-center gap-2 px-6 py-3 bg-lekhya-accent text-white rounded-lg hover:bg-orange-600 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Add Item
                        </Link>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="max-w-7xl mx-auto grid grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Package className="w-5 h-5 text-blue-600" />
                        <p className="text-xs text-slate-500 uppercase font-medium">Total Items</p>
                    </div>
                    <p className="text-3xl font-bold text-lekhya-primary">{summary?.totals.totalItems || 0}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        <p className="text-xs text-slate-500 uppercase font-medium">Stock Value</p>
                    </div>
                    <p className="text-3xl font-bold text-green-600">
                        {formatCurrency(summary?.totals.totalValue || 0)}
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <AlertTriangle className="w-5 h-5 text-orange-600" />
                        <p className="text-xs text-slate-500 uppercase font-medium">Low Stock Alerts</p>
                    </div>
                    <p className="text-3xl font-bold text-orange-600">{summary?.totals.lowStockCount || 0}</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="max-w-7xl mx-auto grid grid-cols-4 gap-4 mb-6">
                <Link href="/inventory/items" className="bg-white p-6 rounded-lg border border-gray-200 hover:border-lekhya-primary transition-colors">
                    <Package className="w-8 h-8 text-lekhya-primary mb-3" />
                    <h3 className="font-bold text-slate-800 mb-1">Item Master</h3>
                    <p className="text-xs text-slate-500">Manage inventory items</p>
                </Link>
                <Link href="/inventory/movements" className="bg-white p-6 rounded-lg border border-gray-200 hover:border-lekhya-primary transition-colors">
                    <TrendingDown className="w-8 h-8 text-green-600 mb-3" />
                    <h3 className="font-bold text-slate-800 mb-1">Stock Movements</h3>
                    <p className="text-xs text-slate-500">Track IN/OUT/Adjust</p>
                </Link>
                <Link href="/inventory/reports/stock-summary" className="bg-white p-6 rounded-lg border border-gray-200 hover:border-lekhya-primary transition-colors">
                    <DollarSign className="w-8 h-8 text-purple-600 mb-3" />
                    <h3 className="font-bold text-slate-800 mb-1">Stock Summary</h3>
                    <p className="text-xs text-slate-500">Current stock report</p>
                </Link>
                <Link href="/inventory/reports/valuation" className="bg-white p-6 rounded-lg border border-gray-200 hover:border-lekhya-primary transition-colors">
                    <AlertTriangle className="w-8 h-8 text-orange-600 mb-3" />
                    <h3 className="font-bold text-slate-800 mb-1">Valuation</h3>
                    <p className="text-xs text-slate-500">Stock valuation report</p>
                </Link>
            </div>

            {/* Low Stock Items */}
            {summary && summary.totals.lowStockCount > 0 && (
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-lg font-bold text-lekhya-primary flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-orange-600" />
                                Low Stock Alerts
                            </h2>
                        </div>
                        <div className="divide-y divide-gray-200">
                            {summary.items.filter(item => item.isLowStock).slice(0, 5).map((item) => (
                                <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                                    <div>
                                        <p className="font-bold text-slate-800">{item.name}</p>
                                        <p className="text-sm text-slate-500">{item.code}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-slate-600">Current: <span className="font-bold text-orange-600">{item.currentStock} {item.unit}</span></p>
                                        <p className="text-xs text-slate-400">Reorder: {item.reorderLevel} {item.unit}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
