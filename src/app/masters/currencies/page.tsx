'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Currency {
    id: string;
    code: string;
    name: string;
    symbol: string;
    exchangeRates: {
        date: string;
        rate: number;
    }[];
}

export default function CurrencyManagementPage() {
    const router = useRouter();
    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        symbol: '',
    });

    useEffect(() => {
        fetchCurrencies();
    }, []);

    const fetchCurrencies = async () => {
        try {
            const res = await fetch('/api/masters/currencies');
            if (!res.ok) throw new Error('Failed to fetch currencies');
            const data = await res.json();
            setCurrencies(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const url = '/api/masters/currencies';
            const method = editingId ? 'PUT' : 'POST';
            const body = editingId ? { id: editingId, ...formData } : formData;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to save currency');
            }

            fetchCurrencies();
            setShowForm(false);
            setEditingId(null);
            setFormData({ code: '', name: '', symbol: '' });
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleEdit = (currency: Currency) => {
        setEditingId(currency.id);
        setFormData({
            code: currency.code,
            name: currency.name,
            symbol: currency.symbol,
        });
        setShowForm(true);
    };

    const handleDelete = async (id: string, code: string) => {
        if (!confirm(`Are you sure you want to delete currency "${code}"?`)) return;

        try {
            const res = await fetch(`/api/masters/currencies?id=${id}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to delete currency');
            }

            fetchCurrencies();
            alert('Currency deleted successfully');
        } catch (err: any) {
            alert(err.message);
        }
    };

    const cancelForm = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({ code: '', name: '', symbol: '' });
        setError('');
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Currency Management</h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => router.push('/masters/exchange-rates')}
                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                        Exchange Rates
                    </button>
                    {!showForm && (
                        <button
                            onClick={() => setShowForm(true)}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            + Add Currency
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
                    {error}
                </div>
            )}

            {showForm && (
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">
                        {editingId ? 'Edit Currency' : 'Add New Currency'}
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Currency Code *</label>
                                <input
                                    type="text"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    className="w-full px-3 py-2 border rounded"
                                    required
                                    maxLength={3}
                                    placeholder="USD"
                                    disabled={!!editingId}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Currency Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border rounded"
                                    required
                                    placeholder="US Dollar"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Symbol *</label>
                                <input
                                    type="text"
                                    value={formData.symbol}
                                    onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                                    className="w-full px-3 py-2 border rounded"
                                    required
                                    maxLength={5}
                                    placeholder="$"
                                />
                            </div>
                        </div>

                        <div className="mt-4 flex gap-2">
                            <button
                                type="submit"
                                className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                {editingId ? 'Update' : 'Add'} Currency
                            </button>
                            <button
                                type="button"
                                onClick={cancelForm}
                                className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-lg shadow overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading currencies...</div>
                ) : currencies.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No currencies found. Click "Add Currency" to create one.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Symbol</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Latest Rate</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currencies.map((currency) => (
                                    <tr key={currency.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {currency.code}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {currency.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {currency.symbol}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {currency.exchangeRates?.[0] ? (
                                                <>
                                                    ₹{currency.exchangeRates[0].rate.toFixed(4)}
                                                    <span className="text-xs text-gray-400 ml-2">
                                                        ({new Date(currency.exchangeRates[0].date).toLocaleDateString()})
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="text-gray-400">No rate set</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                                            <button
                                                onClick={() => handleEdit(currency)}
                                                className="text-blue-600 hover:text-blue-800 mr-3"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(currency.id, currency.code)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="mt-4 text-sm text-gray-600">
                Total Currencies: {currencies.length}
            </div>
        </div>
    );
}
