'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Godown {
    id: string;
    name: string;
    location: string | null;
}

interface InventoryItem {
    id: string;
    code: string;
    name: string;
    unit: string;
    currentStock: number;
}

interface TransferItem {
    itemId: string;
    itemName: string;
    quantity: number;
    batchNumber?: string;
}

interface StockTransfer {
    id: string;
    transferNumber: string;
    date: string;
    fromGodown: Godown;
    toGodown: Godown;
    status: string;
    items: {
        item: InventoryItem;
        quantity: number;
        batchNumber: string | null;
    }[];
    createdAt: string;
    completedAt: string | null;
}

export default function StockTransferPage() {
    const router = useRouter();
    const [godowns, setGodowns] = useState<Godown[]>([]);
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [transfers, setTransfers] = useState<StockTransfer[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        transferNumber: '',
        date: new Date().toISOString().split('T')[0],
        fromGodownId: '',
        toGodownId: '',
        status: 'PENDING',
    });

    const [transferItems, setTransferItems] = useState<TransferItem[]>([]);
    const [selectedItemId, setSelectedItemId] = useState('');
    const [quantity, setQuantity] = useState('');
    const [batchNumber, setBatchNumber] = useState('');

    useEffect(() => {
        fetchGodowns();
        fetchItems();
        fetchTransfers();
        generateTransferNumber();
    }, []);

    const fetchGodowns = async () => {
        try {
            const res = await fetch('/api/masters/godowns');
            if (!res.ok) throw new Error('Failed to fetch godowns');
            const data = await res.json();
            setGodowns(data);
        } catch (err: any) {
            console.error('Error fetching godowns:', err);
        }
    };

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

    const fetchTransfers = async () => {
        try {
            const res = await fetch('/api/inventory/stock-transfer');
            if (!res.ok) throw new Error('Failed to fetch transfers');
            const data = await res.json();
            setTransfers(data);
        } catch (err: any) {
            console.error('Error fetching transfers:', err);
        }
    };

    const generateTransferNumber = () => {
        const num = `ST-${Date.now().toString().slice(-8)}`;
        setFormData((prev) => ({ ...prev, transferNumber: num }));
    };

    const addItem = () => {
        if (!selectedItemId || !quantity || parseFloat(quantity) <= 0) {
            alert('Please select an item and enter a valid quantity');
            return;
        }

        const item = items.find((i) => i.id === selectedItemId);
        if (!item) return;

        const existingIndex = transferItems.findIndex((ti) => ti.itemId === selectedItemId);
        if (existingIndex >= 0) {
            const updated = [...transferItems];
            updated[existingIndex].quantity += parseFloat(quantity);
            setTransferItems(updated);
        } else {
            setTransferItems([
                ...transferItems,
                {
                    itemId: selectedItemId,
                    itemName: item.name,
                    quantity: parseFloat(quantity),
                    batchNumber: batchNumber || undefined,
                },
            ]);
        }

        setSelectedItemId('');
        setQuantity('');
        setBatchNumber('');
    };

    const removeItem = (itemId: string) => {
        setTransferItems(transferItems.filter((ti) => ti.itemId !== itemId));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (transferItems.length === 0) {
            setError('Please add at least one item to transfer');
            setLoading(false);
            return;
        }

        if (formData.fromGodownId === formData.toGodownId) {
            setError('Source and destination godowns must be different');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/inventory/stock-transfer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    items: transferItems,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to create transfer');
            }

            // Reset form
            generateTransferNumber();
            setFormData({
                ...formData,
                fromGodownId: '',
                toGodownId: '',
                status: 'PENDING',
            });
            setTransferItems([]);
            fetchTransfers();
            alert('Stock transfer created successfully!');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const completeTransfer = async (id: string) => {
        if (!confirm('Are you sure you want to complete this transfer? Stock movements will be created.')) return;

        try {
            const res = await fetch('/api/inventory/stock-transfer', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to complete transfer');
            }

            fetchTransfers();
            alert('Transfer completed successfully!');
        } catch (err: any) {
            alert(err.message);
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Stock Transfer</h1>

            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Create Transfer Form */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Create New Transfer</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Transfer Number</label>
                            <input
                                type="text"
                                value={formData.transferNumber}
                                onChange={(e) => setFormData({ ...formData, transferNumber: e.target.value })}
                                className="w-full px-3 py-2 border rounded bg-gray-50"
                                readOnly
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Date</label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full px-3 py-2 border rounded"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">From Godown *</label>
                            <select
                                value={formData.fromGodownId}
                                onChange={(e) => setFormData({ ...formData, fromGodownId: e.target.value })}
                                className="w-full px-3 py-2 border rounded"
                                required
                            >
                                <option value="">-- Select Source --</option>
                                {godowns.map((g) => (
                                    <option key={g.id} value={g.id}>
                                        {g.name} {g.location ? `(${g.location})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">To Godown *</label>
                            <select
                                value={formData.toGodownId}
                                onChange={(e) => setFormData({ ...formData, toGodownId: e.target.value })}
                                className="w-full px-3 py-2 border rounded"
                                required
                            >
                                <option value="">-- Select Destination --</option>
                                {godowns.map((g) => (
                                    <option key={g.id} value={g.id}>
                                        {g.name} {g.location ? `(${g.location})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full px-3 py-2 border rounded"
                            >
                                <option value="PENDING">Pending</option>
                                <option value="COMPLETED">Completed</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                Completed transfers will immediately create stock movements
                            </p>
                        </div>

                        <div className="border-t pt-4">
                            <h3 className="font-medium mb-2">Add Items</h3>
                            <div className="space-y-2">
                                <select
                                    value={selectedItemId}
                                    onChange={(e) => setSelectedItemId(e.target.value)}
                                    className="w-full px-3 py-2 border rounded"
                                >
                                    <option value="">-- Select Item --</option>
                                    {items.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.name} ({item.code}) - Stock: {item.currentStock} {item.unit}
                                        </option>
                                    ))}
                                </select>

                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        placeholder="Quantity"
                                        className="px-3 py-2 border rounded"
                                    />
                                    <input
                                        type="text"
                                        value={batchNumber}
                                        onChange={(e) => setBatchNumber(e.target.value)}
                                        placeholder="Batch (optional)"
                                        className="px-3 py-2 border rounded"
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={addItem}
                                    className="w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    + Add Item
                                </button>
                            </div>
                        </div>

                        {transferItems.length > 0 && (
                            <div className="border-t pt-4">
                                <h3 className="font-medium mb-2">Transfer Items ({transferItems.length})</h3>
                                <div className="space-y-2">
                                    {transferItems.map((ti) => (
                                        <div key={ti.itemId} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                            <div>
                                                <div className="font-medium">{ti.itemName}</div>
                                                <div className="text-sm text-gray-600">
                                                    Qty: {ti.quantity}
                                                    {ti.batchNumber && ` | Batch: ${ti.batchNumber}`}
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeItem(ti.itemId)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300"
                        >
                            {loading ? 'Creating...' : 'Create Transfer'}
                        </button>
                    </form>
                </div>

                {/* Transfer History */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Transfer History</h2>
                    <div className="space-y-3 max-h-[600px] overflow-y-auto">
                        {transfers.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No transfers yet</p>
                        ) : (
                            transfers.map((transfer) => (
                                <div key={transfer.id} className="border rounded p-3">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <div className="font-medium">{transfer.transferNumber}</div>
                                            <div className="text-sm text-gray-600">
                                                {new Date(transfer.date).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <span
                                            className={`px-2 py-1 text-xs rounded ${transfer.status === 'COMPLETED'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-yellow-100 text-yellow-700'
                                                }`}
                                        >
                                            {transfer.status}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-700 mb-2">
                                        <div>From: {transfer.fromGodown.name}</div>
                                        <div>To: {transfer.toGodown.name}</div>
                                        <div>Items: {transfer.items.length}</div>
                                    </div>
                                    {transfer.status === 'PENDING' && (
                                        <button
                                            onClick={() => completeTransfer(transfer.id)}
                                            className="text-sm px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                        >
                                            Complete Transfer
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
