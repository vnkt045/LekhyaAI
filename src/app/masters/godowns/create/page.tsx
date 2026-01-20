'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface Godown {
    id: string;
    name: string;
    location: string | null;
    parentId: string | null;
}

function GodownCreateForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams?.get('id');

    const [formData, setFormData] = useState({
        name: '',
        location: '',
        parentId: '',
    });
    const [godowns, setGodowns] = useState<Godown[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchGodowns();
        if (editId) {
            fetchGodownDetails(editId);
        }
    }, [editId]);

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

    const fetchGodownDetails = async (id: string) => {
        try {
            const res = await fetch('/api/masters/godowns');
            if (!res.ok) throw new Error('Failed to fetch godown');
            const data = await res.json();
            const godown = data.find((g: Godown) => g.id === id);
            if (godown) {
                setFormData({
                    name: godown.name,
                    location: godown.location || '',
                    parentId: godown.parentId || '',
                });
            }
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const url = '/api/masters/godowns';
            const method = editId ? 'PUT' : 'POST';
            const body = editId
                ? { id: editId, ...formData }
                : formData;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to save godown');
            }

            router.push('/masters/godowns/display');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const availableParents = godowns.filter((g) => g.id !== editId);

    return (
        <div className="p-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">
                    {editId ? 'Edit Godown' : 'Create Godown'}
                </h1>
                <p className="text-gray-600 mt-1">
                    {editId ? 'Update godown details' : 'Add a new warehouse or storage location'}
                </p>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="max-w-2xl bg-white rounded-lg shadow p-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Godown Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="input"
                            placeholder="e.g., Main Warehouse, Section A"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Location</label>
                        <input
                            type="text"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            className="input"
                            placeholder="e.g., Building 1, Floor 2"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Optional: Physical location or address
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Parent Godown</label>
                        <select
                            value={formData.parentId}
                            onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                            className="input"
                        >
                            <option value="">-- None (Top Level) --</option>
                            {availableParents.map((godown) => (
                                <option key={godown.id} value={godown.id}>
                                    {godown.name}
                                    {godown.location ? ` (${godown.location})` : ''}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                            Optional: Select a parent godown for hierarchical organization
                        </p>
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Saving...' : editId ? 'Update Godown' : 'Create Godown'}
                    </button>
                    <button
                        type="button"
                        onClick={() => router.push('/masters/godowns/display')}
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    >
                        Cancel
                    </button>
                </div>
            </form>

            <div className="mt-6 max-w-2xl p-4 bg-yellow-50 border border-yellow-200 rounded">
                <h3 className="font-semibold text-yellow-900 mb-2">📋 Guidelines</h3>
                <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• Godown names must be unique across the system</li>
                    <li>• Use hierarchical structure for better organization (e.g., Main Warehouse → Section A)</li>
                    <li>• Once a godown has stock movements, it cannot be deleted</li>
                </ul>
            </div>
        </div>
    );
}

export default function GodownCreatePage() {
    return (
        <Suspense fallback={<div className="p-8">Loading...</div>}>
            <GodownCreateForm />
        </Suspense>
    );
}
