'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface InventoryItem {
    id: string;
    code: string;
    name: string;
    unit: string;
}

interface Component {
    itemId: string;
    quantity: number;
    wastagePercent: number;
}

import { Suspense } from 'react';

function BOMCreateContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const isEdit = !!id;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        finishedItemId: '',
    });
    const [components, setComponents] = useState<Component[]>([]);
    const [selectedItemId, setSelectedItemId] = useState('');
    const [quantity, setQuantity] = useState('');
    const [wastage, setWastage] = useState('0');

    useEffect(() => {
        fetchItems();
        if (isEdit) {
            fetchBOM();
        }
    }, [id]);

    const fetchItems = async () => {
        try {
            const res = await fetch('/api/inventory/items');
            if (!res.ok) throw new Error('Failed to fetch items');
            const data = await res.json();
            setItems(data);
        } catch (err: any) {
            console.error('Error fetching items:', err);
        }
    };

    const fetchBOM = async () => {
        try {
            const res = await fetch('/api/manufacturing/bom');
            if (!res.ok) throw new Error('Failed to fetch BOM');
            const boms = await res.json();
            const bom = boms.find((b: any) => b.id === id);
            if (bom) {
                setFormData({
                    name: bom.name,
                    finishedItemId: bom.finishedItemId,
                });
                setComponents(bom.components.map((c: any) => ({
                    itemId: c.item.id,
                    quantity: c.quantity,
                    wastagePercent: c.wastagePercent,
                })));
            }
        } catch (err: any) {
            setError(err.message);
        }
    };

    const addComponent = () => {
        if (!selectedItemId || !quantity || parseFloat(quantity) <= 0) {
            alert('Please select an item and enter a valid quantity');
            return;
        }

        const existingIndex = components.findIndex(c => c.itemId === selectedItemId);
        if (existingIndex >= 0) {
            alert('This item is already added as a component');
            return;
        }

        setComponents([
            ...components,
            {
                itemId: selectedItemId,
                quantity: parseFloat(quantity),
                wastagePercent: parseFloat(wastage),
            },
        ]);

        setSelectedItemId('');
        setQuantity('');
        setWastage('0');
    };

    const removeComponent = (itemId: string) => {
        setComponents(components.filter(c => c.itemId !== itemId));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (components.length === 0) {
            setError('Please add at least one component');
            setLoading(false);
            return;
        }

        try {
            const url = '/api/manufacturing/bom';
            const method = isEdit ? 'PUT' : 'POST';
            const body = isEdit ? { id, ...formData, components } : { ...formData, components };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to save BOM');
            }

            router.push('/manufacturing/bom');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">{isEdit ? 'Edit' : 'Create'} Bill of Materials</h1>
                <button
                    onClick={() => router.push('/manufacturing/bom')}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                    ← Back to List
                </button>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-1">BOM Name *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 border rounded"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Finished Item *</label>
                        <select
                            value={formData.finishedItemId}
                            onChange={(e) => setFormData({ ...formData, finishedItemId: e.target.value })}
                            className="w-full px-3 py-2 border rounded"
                            required
                        >
                            <option value="">-- Select Finished Item --</option>
                            {items.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.name} ({item.code})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="mt-6 border-t pt-6">
                    <h2 className="text-lg font-semibold mb-4">Components</h2>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1">Component Item</label>
                            <select
                                value={selectedItemId}
                                onChange={(e) => setSelectedItemId(e.target.value)}
                                className="w-full px-3 py-2 border rounded"
                            >
                                <option value="">-- Select Component --</option>
                                {items.filter(item => item.id !== formData.finishedItemId).map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.name} ({item.code}) - {item.unit}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Quantity</label>
                            <input
                                type="number"
                                step="0.01"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                className="w-full px-3 py-2 border rounded"
                                placeholder="0.00"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Wastage %</label>
                            <input
                                type="number"
                                step="0.01"
                                value={wastage}
                                onChange={(e) => setWastage(e.target.value)}
                                className="w-full px-3 py-2 border rounded"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={addComponent}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                        + Add Component
                    </button>

                    {components.length > 0 && (
                        <div className="mt-4">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Item</th>
                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Quantity</th>
                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Wastage %</th>
                                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {components.map((comp) => {
                                        const item = items.find(i => i.id === comp.itemId);
                                        return (
                                            <tr key={comp.itemId}>
                                                <td className="px-4 py-2 text-sm">{item?.name} ({item?.code})</td>
                                                <td className="px-4 py-2 text-sm text-right">{comp.quantity}</td>
                                                <td className="px-4 py-2 text-sm text-right">{comp.wastagePercent}%</td>
                                                <td className="px-4 py-2 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeComponent(comp.itemId)}
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        Remove
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="mt-6 flex gap-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
                    >
                        {loading ? 'Saving...' : isEdit ? 'Update BOM' : 'Create BOM'}
                    </button>
                    <button
                        type="button"
                        onClick={() => router.push('/manufacturing/bom')}
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function BOMCreatePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <BOMCreateContent />
        </Suspense>
    );
}
