
'use client';

import { useState, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, RefreshCw } from 'lucide-react';
import Barcode from 'react-barcode';

function NewInventoryItemForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialCode = searchParams.get('code') || '';

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        code: initialCode,
        name: '',
        category: 'Finished Goods',
        unit: 'pcs',
        hsnCode: '',
        purchaseRate: '',
        saleRate: '',
        openingStock: ''
    });

    const generateBarcode = () => {
        // Simple logic: timestamp + random suffix or just random if no naming convention
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const newCode = `ITM-${timestamp}-${random}`;
        setFormData(prev => ({ ...prev, code: newCode }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        // ... (existing submit logic)
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/inventory/items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg);
            }

            // Success
            router.push('/inventory/items');
        } catch (error: any) {
            console.error(error);
            alert('Failed to create item: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-8 py-5 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
                <Link href="/inventory/items" className="hover:bg-slate-100 p-2 rounded-full text-slate-500">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-xl font-bold text-slate-800">Create New Stock Item</h1>
            </div>

            <div className="flex-1 p-8 max-w-3xl mx-auto w-full">
                <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-sm border border-slate-200 space-y-6">

                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="block text-sm font-bold text-slate-700 mb-1 required-label">Item Name</label>
                            <input
                                required
                                type="text"
                                className="w-full border border-slate-300 rounded px-4 py-2 focus:ring-2 focus:ring-lekhya-primary focus:border-transparent"
                                placeholder="e.g. Wireless Mouse M105"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="block text-sm font-bold text-slate-700 mb-1 required-label">Item Code / SKU / Barcode</label>
                            <div className="flex gap-2">
                                <input
                                    required
                                    type="text"
                                    className="flex-1 border border-slate-300 rounded px-4 py-2 font-mono uppercase"
                                    placeholder="Scan or Generate..."
                                    value={formData.code}
                                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                                />
                                <button
                                    type="button"
                                    onClick={generateBarcode}
                                    className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 rounded border border-slate-300 transition-colors"
                                    title="Generate Random Barcode"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                </button>
                            </div>
                            {formData.code && (
                                <div className="mt-2 text-center bg-white p-2 border border-slate-100 rounded">
                                    <Barcode value={formData.code} width={1.5} height={40} fontSize={12} />
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1 required-label">Category</label>
                            <select
                                className="w-full border border-slate-300 rounded px-4 py-2 bg-white"
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option>Finished Goods</option>
                                <option>Raw Materials</option>
                                <option>Services</option>
                                <option>Trading Goods</option>
                            </select>
                        </div>
                    </div>

                    {/* Units & Tax */}
                    <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1 required-label">Unit of Measure</label>
                            <input
                                type="text"
                                className="w-full border border-slate-300 rounded px-4 py-2"
                                placeholder="pcs, kg, mtr..."
                                value={formData.unit}
                                onChange={e => setFormData({ ...formData, unit: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">HSN / SAC Code</label>
                            <input
                                type="text"
                                className="w-full border border-slate-300 rounded px-4 py-2"
                                placeholder="e.g. 8471"
                                value={formData.hsnCode}
                                onChange={e => setFormData({ ...formData, hsnCode: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="grid grid-cols-3 gap-6 pt-4 border-t border-slate-100">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1 required-label">Purchase Rate</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-slate-500">₹</span>
                                <input
                                    required
                                    type="number"
                                    className="w-full border border-slate-300 rounded pl-8 pr-4 py-2"
                                    placeholder="0.00"
                                    value={formData.purchaseRate}
                                    onChange={e => setFormData({ ...formData, purchaseRate: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1 required-label">Sale Rate</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-slate-500">₹</span>
                                <input
                                    required
                                    type="number"
                                    className="w-full border border-slate-300 rounded pl-8 pr-4 py-2"
                                    placeholder="0.00"
                                    value={formData.saleRate}
                                    onChange={e => setFormData({ ...formData, saleRate: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Opening Stock Qty</label>
                            <input
                                type="number"
                                className="w-full border border-slate-300 rounded px-4 py-2"
                                placeholder="0"
                                value={formData.openingStock}
                                onChange={e => setFormData({ ...formData, openingStock: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-lekhya-primary text-white px-8 py-3 rounded-sm font-bold shadow-md hover:bg-black hover:text-lekhya-accent transition-all flex items-center gap-2"
                        >
                            {loading ? 'Saving...' : <><Save className="w-5 h-5" /> Save Item</>}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}

export default function NewInventoryItemPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
            <NewInventoryItemForm />
        </Suspense>
    );
}
