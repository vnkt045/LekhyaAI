'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Package } from 'lucide-react';

interface Unit {
    id: string;
    name: string;
    symbol: string;
    decimalPlaces: number;
}

export default function UnitsPage() {
    const [units, setUnits] = useState<Unit[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        symbol: '',
        decimalPlaces: 2
    });

    useEffect(() => {
        fetchUnits();
    }, []);

    const fetchUnits = async () => {
        try {
            const res = await fetch('/api/inventory/units');
            if (res.ok) {
                setUnits(await res.json());
            }
        } catch (error) {
            console.error('Failed to fetch units:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/inventory/units', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setShowForm(false);
                setFormData({ name: '', symbol: '', decimalPlaces: 2 });
                fetchUnits();
            }
        } catch (error) {
            console.error('Failed to create unit:', error);
        }
    };

    return (
        <div className="min-h-screen bg-lekhya-base p-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-lekhya-primary">Units of Measure</h1>
                        <p className="text-sm text-slate-600">Define measurement units for inventory items</p>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-lekhya-accent text-lekhya-primary px-4 py-2 rounded font-bold flex items-center gap-2 hover:scale-105 transition-transform"
                    >
                        <Plus className="w-4 h-4" />
                        New Unit
                    </button>
                </div>

                {/* Form */}
                {showForm && (
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
                        <h2 className="text-lg font-bold text-lekhya-primary mb-4">Create Unit</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Unit Name</label>
                                    <input
                                        type="text"
                                        className="w-full border border-slate-300 rounded px-3 py-2 focus:ring-2 focus:ring-lekhya-accent outline-none"
                                        placeholder="e.g., Kilogram"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Symbol</label>
                                    <input
                                        type="text"
                                        className="w-full border border-slate-300 rounded px-3 py-2 focus:ring-2 focus:ring-lekhya-accent outline-none"
                                        placeholder="e.g., kg"
                                        value={formData.symbol}
                                        onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Decimal Places</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="4"
                                    className="w-full border border-slate-300 rounded px-3 py-2 focus:ring-2 focus:ring-lekhya-accent outline-none"
                                    value={formData.decimalPlaces}
                                    onChange={(e) => setFormData({ ...formData, decimalPlaces: parseInt(e.target.value) })}
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    className="bg-lekhya-accent text-lekhya-primary px-6 py-2 rounded font-bold hover:scale-105 transition-transform"
                                >
                                    Create Unit
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="bg-slate-200 text-slate-700 px-6 py-2 rounded font-bold hover:bg-slate-300 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Units List */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Unit Name</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Symbol</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Decimal Places</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-slate-700 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="p-12 text-center text-slate-500">Loading...</td>
                                </tr>
                            ) : units.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-12 text-center text-slate-400">
                                        No units defined yet. Create one to get started.
                                    </td>
                                </tr>
                            ) : (
                                units.map(unit => (
                                    <tr key={unit.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-slate-800 font-medium">{unit.name}</td>
                                        <td className="px-6 py-4 text-slate-600 font-mono">{unit.symbol}</td>
                                        <td className="px-6 py-4 text-slate-600">{unit.decimalPlaces}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex gap-2 justify-end">
                                                <button className="p-2 hover:bg-blue-100 rounded-full transition-colors">
                                                    <Edit2 className="w-4 h-4 text-blue-600" />
                                                </button>
                                                <button className="p-2 hover:bg-red-100 rounded-full transition-colors">
                                                    <Trash2 className="w-4 h-4 text-red-600" />
                                                </button>
                                            </div>
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
