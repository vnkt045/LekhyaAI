'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Currency {
    id: string;
    code: string;
    name: string;
    symbol: string;
}

interface ExchangeRate {
    id: string;
    currency: Currency;
    date: string;
    rate: number;
}

export default function ExchangeRatePage() {
    const router = useRouter();
    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [rates, setRates] = useState<ExchangeRate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [filterCurrency, setFilterCurrency] = useState('');
    const [formData, setFormData] = useState({
        currencyId: '',
        date: new Date().toISOString().split('T')[0],
        rate: '',
    });

    useEffect(() => {
        fetchCurrencies();
        fetchRates();
    }, [filterCurrency]);

    const fetchCurrencies = async () => {
        try {
            const res = await fetch('/api/masters/currencies');
            if (!res.ok) throw new Error('Failed to fetch currencies');
            const data = await res.json();
            setCurrencies(data);
        } catch (err: any) {
            console.error('Error fetching currencies:', err);
        }
    };

    const fetchRates = async () => {
        try {
            const url = filterCurrency
                ? `/api/masters/exchange-rates?currencyId=${filterCurrency}`
                : '/api/masters/exchange-rates';
            const res = await fetch(url);
            if (!res.ok) throw new Error('Failed to fetch exchange rates');
            const data = await res.json();
            setRates(data);
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
            const url = '/api/masters/exchange-rates';
            const method = editingId ? 'PUT' : 'POST';
            const body = editingId
                ? { id: editingId, rate: parseFloat(formData.rate) }
                : { ...formData, rate: parseFloat(formData.rate) };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to save exchange rate');
            }

            fetchRates();
            setShowForm(false);
            setEditingId(null);
            setFormData({
                currencyId: '',
                date: new Date().toISOString().split('T')[0],
                rate: '',
            });
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleEdit = (rate: ExchangeRate) => {
        setEditingId(rate.id);
        setFormData({
            currencyId: rate.currency.id,
            date: rate.date.split('T')[0],
            rate: rate.rate.toString(),
        });
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this exchange rate?')) return;

        try {
            const res = await fetch(`/api/masters/exchange-rates?id=${id}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to delete exchange rate');
            }

            fetchRates();
            alert('Exchange rate deleted successfully');
        } catch (err: any) {
            alert(err.message);
        }
    };

    const cancelForm = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({
            currencyId: '',
            date: new Date().toISOString().split('T')[0],
            rate: '',
        });
        setError('');
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Exchange Rate Management</h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => router.push('/masters/currencies')}
                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                        ← Currencies
                    </button>
                    {!showForm && (
                        <button
                            onClick={() => setShowForm(true)}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            + Add Exchange Rate
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
                        {editingId ? 'Edit Exchange Rate' : 'Add New Exchange Rate'}
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Currency *</label>
                                <select
                                    value={formData.currencyId}
                                    onChange={(e) => setFormData({ ...formData, currencyId: e.target.value })}
                                    className="w-full px-3 py-2 border rounded"
                                    required
                                    disabled={!!editingId}
                                >
                                    <option value="">-- Select Currency --</option>
                                    {currencies.map((currency) => (
                                        <option key={currency.id} value={currency.id}>
                                            {currency.code} - {currency.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Date *</label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full px-3 py-2 border rounded"
                                    required
                                    disabled={!!editingId}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Rate (1 {formData.currencyId && currencies.find(c => c.id === formData.currencyId)?.code} = X INR) *</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        step="0.0001"
                                        value={formData.rate}
                                        onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                                        className="w-full px-3 py-2 border rounded"
                                        required
                                        placeholder="0.0000"
                                    />
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            const currencyCode = currencies.find(c => c.id === formData.currencyId)?.code;
                                            if (!currencyCode) {
                                                alert('Please select a currency first');
                                                return;
                                            }
                                            try {
                                                // Using open.er-api.com (Free, Open Source, No Key)
                                                setLoading(true);
                                                const res = await fetch(`https://open.er-api.com/v6/latest/${currencyCode}`);
                                                const data = await res.json();
                                                const rate = data.rates['INR']; // Target is always Base Currency (INR) for us
                                                if (rate) {
                                                    setFormData(prev => ({ ...prev, rate: rate.toString() }));
                                                } else {
                                                    alert('Rate not found for INR');
                                                }
                                            } catch (e) {
                                                console.error(e);
                                                alert('Failed to fetch live rate');
                                            } finally {
                                                setLoading(false);
                                            }
                                        }}
                                        className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-xs font-medium whitespace-nowrap"
                                        title="Fetch live rate from open.er-api.com"
                                    >
                                        Fetch Live
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 flex gap-2">
                            <button
                                type="submit"
                                className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                {editingId ? 'Update' : 'Add'} Rate
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

            {/* Filter */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
                <div className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-sm font-medium mb-1">Filter by Currency</label>
                        <select
                            value={filterCurrency}
                            onChange={(e) => setFilterCurrency(e.target.value)}
                            className="w-full px-3 py-2 border rounded"
                        >
                            <option value="">All Currencies</option>
                            {currencies.map((currency) => (
                                <option key={currency.id} value={currency.id}>
                                    {currency.code} - {currency.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading exchange rates...</div>
                ) : rates.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No exchange rates found. Click "Add Exchange Rate" to create one.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Currency</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Rate (to INR)</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {rates.map((rate) => (
                                    <tr key={rate.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {rate.currency.code} - {rate.currency.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(rate.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                                            ₹{rate.rate.toFixed(4)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                                            <button
                                                onClick={() => handleEdit(rate)}
                                                className="text-blue-600 hover:text-blue-800 mr-3"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(rate.id)}
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
                Total Exchange Rates: {rates.length}
            </div>
        </div>
    );
}
