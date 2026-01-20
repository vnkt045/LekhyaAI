'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface BOM {
    id: string;
    name: string;
    finishedItem: {
        id: string;
        code: string;
        name: string;
    };
    components: {
        item: {
            id: string;
            code: string;
            name: string;
            purchaseRate: number;
        };
        quantity: number;
        wastagePercent: number;
    }[];
}

interface Godown {
    id: string;
    name: string;
}

interface ProductionJournal {
    id: string;
    journalNumber: string;
    date: string;
    bom: {
        name: string;
        finishedItem: {
            name: string;
        };
    };
    quantityProduced: number;
    totalCost: number;
}

export default function ManufacturingProductionPage() {
    const router = useRouter();
    const [boms, setBoms] = useState<BOM[]>([]);
    const [godowns, setGodowns] = useState<Godown[]>([]);
    const [journals, setJournals] = useState<ProductionJournal[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        bomId: '',
        quantityProduced: '',
        godownId: '',
        date: new Date().toISOString().split('T')[0],
    });

    const [selectedBOM, setSelectedBOM] = useState<BOM | null>(null);
    const [estimatedCost, setEstimatedCost] = useState(0);

    useEffect(() => {
        fetchBOMs();
        fetchGodowns();
        fetchJournals();
    }, []);

    useEffect(() => {
        if (formData.bomId) {
            const bom = boms.find(b => b.id === formData.bomId);
            setSelectedBOM(bom || null);
            calculateEstimatedCost(bom, parseFloat(formData.quantityProduced) || 0);
        } else {
            setSelectedBOM(null);
            setEstimatedCost(0);
        }
    }, [formData.bomId, formData.quantityProduced, boms]);

    const calculateEstimatedCost = (bom: BOM | undefined, quantity: number) => {
        if (!bom || quantity <= 0) {
            setEstimatedCost(0);
            return;
        }

        const cost = bom.components.reduce((total, comp) => {
            const wastageMultiplier = 1 + (comp.wastagePercent / 100);
            const componentCost = comp.item.purchaseRate * comp.quantity * wastageMultiplier * quantity;
            return total + componentCost;
        }, 0);

        setEstimatedCost(cost);
    };

    const fetchBOMs = async () => {
        try {
            const res = await fetch('/api/manufacturing/bom');
            if (!res.ok) throw new Error('Failed to fetch BOMs');
            const data = await res.json();
            setBoms(data);
        } catch (err: any) {
            console.error('Error fetching BOMs:', err);
        }
    };

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

    const fetchJournals = async () => {
        try {
            const res = await fetch('/api/manufacturing/production');
            if (!res.ok) throw new Error('Failed to fetch production journals');
            const data = await res.json();
            setJournals(data);
        } catch (err: any) {
            console.error('Error fetching journals:', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/manufacturing/production', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    quantityProduced: parseFloat(formData.quantityProduced),
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to create production entry');
            }

            alert('Production entry created successfully!');
            setFormData({
                bomId: '',
                quantityProduced: '',
                godownId: '',
                date: new Date().toISOString().split('T')[0],
            });
            fetchJournals();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Manufacturing Production</h1>

            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Production Entry Form */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">New Production Entry</h2>

                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">BOM *</label>
                                <select
                                    value={formData.bomId}
                                    onChange={(e) => setFormData({ ...formData, bomId: e.target.value })}
                                    className="w-full px-3 py-2 border rounded"
                                    required
                                >
                                    <option value="">-- Select BOM --</option>
                                    {boms.map((bom) => (
                                        <option key={bom.id} value={bom.id}>
                                            {bom.name} - {bom.finishedItem.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Quantity Produced *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.quantityProduced}
                                    onChange={(e) => setFormData({ ...formData, quantityProduced: e.target.value })}
                                    className="w-full px-3 py-2 border rounded"
                                    required
                                    placeholder="0.00"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Godown *</label>
                                <select
                                    value={formData.godownId}
                                    onChange={(e) => setFormData({ ...formData, godownId: e.target.value })}
                                    className="w-full px-3 py-2 border rounded"
                                    required
                                >
                                    <option value="">-- Select Godown --</option>
                                    {godowns.map((godown) => (
                                        <option key={godown.id} value={godown.id}>
                                            {godown.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Production Date *</label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full px-3 py-2 border rounded"
                                    required
                                />
                            </div>

                            {selectedBOM && formData.quantityProduced && (
                                <div className="bg-blue-50 border border-blue-200 rounded p-4">
                                    <h3 className="font-semibold mb-2">Estimated Cost Breakdown</h3>
                                    <div className="space-y-1 text-sm">
                                        {selectedBOM.components.map((comp) => {
                                            const qty = parseFloat(formData.quantityProduced);
                                            const wastageMultiplier = 1 + (comp.wastagePercent / 100);
                                            const totalQty = comp.quantity * wastageMultiplier * qty;
                                            const cost = comp.item.purchaseRate * totalQty;
                                            return (
                                                <div key={comp.item.id} className="flex justify-between">
                                                    <span>{comp.item.name}: {totalQty.toFixed(2)}</span>
                                                    <span>₹{cost.toFixed(2)}</span>
                                                </div>
                                            );
                                        })}
                                        <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
                                            <span>Total Cost:</span>
                                            <span>₹{estimatedCost.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
                            >
                                {loading ? 'Creating...' : 'Create Production Entry'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Production History */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Recent Production</h2>

                    {journals.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No production entries yet</p>
                    ) : (
                        <div className="space-y-3 max-h-[600px] overflow-y-auto">
                            {journals.map((journal) => (
                                <div key={journal.id} className="border rounded p-4 hover:bg-gray-50">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <div className="font-semibold">{journal.journalNumber}</div>
                                            <div className="text-sm text-gray-600">{journal.bom.finishedItem.name}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm text-gray-500">
                                                {new Date(journal.date).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Qty: {journal.quantityProduced}</span>
                                        <span className="font-semibold">₹{journal.totalCost.toFixed(2)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
