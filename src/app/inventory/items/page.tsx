
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Search, Barcode, Package, Edit2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InventoryItem {
    id: string;
    code: string;
    name: string;
    category: string;
    unit: string;
    currentStock: number;
    purchaseRate: number;
    saleRate: number;
}

export default function InventoryItemsPage() {
    const router = useRouter();
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchItems();
        // Autofocus for barcode scanner
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, []);

    const fetchItems = async () => {
        try {
            const res = await fetch('/api/inventory/items');
            if (res.ok) {
                const data = await res.json();
                setItems(data);
            }
        } catch (error) {
            console.error('Failed to fetch items', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Filter logic
    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Handle "Scan" - if user scans a code that doesn't exist, prompt to create?
    // For now, simple filter is enough. Scanners usually type characters + Enter.

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-8 py-5 flex justify-between items-center sticky top-0 z-10 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Package className="w-6 h-6 text-lekhya-primary" /> Inventory Items
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Manage stock items, prices, and barcodes</p>
                </div>
                <Link href="/inventory/items/new" className="bg-lekhya-primary text-white px-6 py-2.5 rounded-sm font-bold shadow-md hover:bg-lekhya-primary/90 flex items-center gap-2 transition-all">
                    <Plus className="w-4 h-4" /> Create New Item
                </Link>
            </div>

            <div className="max-w-[1400px] mx-auto p-8">

                {/* Search Bar (Scanner Friendly) */}
                <div className="bg-white p-4 rounded-lg shadow-sm mb-6 border border-slate-200 flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Scan Barcode or Search Item..."
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lekhya-accent focus:border-transparent text-lg font-medium"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono border border-slate-200 px-2 py-1 rounded">
                            <Barcode className="w-3 h-3 inline mr-1" /> SCAN READY
                        </div>
                    </div>
                </div>

                {/* Data Table */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">Item Code (SKU)</th>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4 text-right">Stock Qty</th>
                                <th className="px-6 py-4 text-right">Purchase Rate</th>
                                <th className="px-6 py-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">Loading Inventory...</td>
                                </tr>
                            ) : filteredItems.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <Package className="w-8 h-8 text-slate-300" />
                                            <p>No items found.</p>
                                            {searchQuery && (
                                                <Link href={`/inventory/items/new?code=` + searchQuery} className="text-lekhya-primary font-bold hover:underline">
                                                    Create item with code "{searchQuery}"?
                                                </Link>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredItems.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-slate-500">{item.code}</td>
                                        <td className="px-6 py-4 font-bold text-slate-800">{item.name}</td>
                                        <td className="px-6 py-4">
                                            <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-semibold">
                                                {item.category}
                                            </span>
                                        </td>
                                        <td className={cn("px-6 py-4 text-right font-bold", item.currentStock <= 0 ? "text-red-500" : "text-green-600")}>
                                            {item.currentStock} <span className="text-xs font-normal text-slate-400">{item.unit}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono">₹{item.purchaseRate}</td>
                                        <td className="px-6 py-4 flex justify-center gap-2">
                                            <button className="p-2 text-slate-400 hover:text-lekhya-primary transition-colors" title="Edit">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Delete">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
