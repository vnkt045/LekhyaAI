'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Package, Save, X } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export default function CreateItem() {
    const router = useRouter();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        description: '',
        category: 'Raw Material',
        unit: 'pcs',
        hsnCode: '',
        gstRate: '18',
        purchaseRate: '',
        saleRate: '',
        mrp: '',
        openingStock: '0',
        reorderLevel: '10',
        valuationMethod: 'FIFO'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/inventory/items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                showToast('Item created successfully', 'success');
                router.push('/inventory/items');
            } else {
                const error = await res.json();
                showToast(error.error || 'Failed to create item', 'error');
            }
        } catch (error) {
            showToast('Failed to create item', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-lekhya-base p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-lekhya-primary rounded-lg">
                            <Package className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-lekhya-primary">Create Inventory Item</h1>
                            <p className="text-sm text-slate-600">Add new item to inventory</p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="grid grid-cols-2 gap-6">
                        {/* Basic Info */}
                        <div className="col-span-2">
                            <h3 className="text-lg font-bold text-lekhya-primary mb-4">Basic Information</h3>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Item Code <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lekhya-primary focus:border-transparent"
                                placeholder="e.g., ITEM001"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Item Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lekhya-primary focus:border-transparent"
                                placeholder="e.g., Steel Rod"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lekhya-primary focus:border-transparent"
                                placeholder="Item description..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lekhya-primary focus:border-transparent"
                            >
                                <option>Raw Material</option>
                                <option>Finished Goods</option>
                                <option>Trading Goods</option>
                                <option>Consumables</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
                            <select
                                value={formData.unit}
                                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lekhya-primary focus:border-transparent"
                            >
                                <option value="pcs">Pieces (pcs)</option>
                                <option value="kg">Kilograms (kg)</option>
                                <option value="ltr">Liters (ltr)</option>
                                <option value="mtr">Meters (mtr)</option>
                                <option value="box">Box</option>
                            </select>
                        </div>

                        {/* GST & Pricing */}
                        <div className="col-span-2 mt-4">
                            <h3 className="text-lg font-bold text-lekhya-primary mb-4">GST & Pricing</h3>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">HSN Code</label>
                            <input
                                type="text"
                                value={formData.hsnCode}
                                onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lekhya-primary focus:border-transparent"
                                placeholder="e.g., 7213"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">GST Rate (%)</label>
                            <select
                                value={formData.gstRate}
                                onChange={(e) => setFormData({ ...formData, gstRate: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lekhya-primary focus:border-transparent"
                            >
                                <option value="0">0%</option>
                                <option value="5">5%</option>
                                <option value="12">12%</option>
                                <option value="18">18%</option>
                                <option value="28">28%</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Purchase Rate <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                value={formData.purchaseRate}
                                onChange={(e) => setFormData({ ...formData, purchaseRate: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lekhya-primary focus:border-transparent"
                                placeholder="0.00"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Sale Rate <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                value={formData.saleRate}
                                onChange={(e) => setFormData({ ...formData, saleRate: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lekhya-primary focus:border-transparent"
                                placeholder="0.00"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">MRP</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.mrp}
                                onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lekhya-primary focus:border-transparent"
                                placeholder="0.00"
                            />
                        </div>

                        {/* Stock */}
                        <div className="col-span-2 mt-4">
                            <h3 className="text-lg font-bold text-lekhya-primary mb-4">Stock Information</h3>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Opening Stock</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.openingStock}
                                onChange={(e) => setFormData({ ...formData, openingStock: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lekhya-primary focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Reorder Level</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.reorderLevel}
                                onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lekhya-primary focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Valuation Method</label>
                            <select
                                value={formData.valuationMethod}
                                onChange={(e) => setFormData({ ...formData, valuationMethod: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lekhya-primary focus:border-transparent"
                            >
                                <option value="FIFO">FIFO (First In First Out)</option>
                                <option value="WEIGHTED_AVG">Weighted Average</option>
                            </select>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <X className="w-5 h-5" />
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-3 bg-lekhya-accent text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                        >
                            <Save className="w-5 h-5" />
                            {loading ? 'Creating...' : 'Create Item'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
