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
        id: string;
        item: {
            code: string;
            name: string;
        };
        quantity: number;
        wastagePercent: number;
    }[];
    manufacturingJournals: any[];
}

export default function BOMListPage() {
    const router = useRouter();
    const [boms, setBoms] = useState<BOM[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchBOMs();
    }, []);

    const fetchBOMs = async () => {
        try {
            const res = await fetch('/api/manufacturing/bom');
            if (!res.ok) throw new Error('Failed to fetch BOMs');
            const data = await res.json();
            setBoms(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete BOM "${name}"?`)) return;

        try {
            const res = await fetch(`/api/manufacturing/bom?id=${id}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to delete BOM');
            }

            fetchBOMs();
            alert('BOM deleted successfully');
        } catch (err: any) {
            alert(err.message);
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Bill of Materials (BOM)</h1>
                <button
                    onClick={() => router.push('/manufacturing/bom/create')}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    + Create BOM
                </button>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
                    {error}
                </div>
            )}

            <div className="bg-white rounded-lg shadow overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading BOMs...</div>
                ) : boms.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No BOMs found. Click "Create BOM" to add one.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">BOM Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Finished Item</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Components</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Productions</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {boms.map((bom) => (
                                    <tr key={bom.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {bom.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {bom.finishedItem.name} ({bom.finishedItem.code})
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                                            {bom.components.length}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                                            {bom.manufacturingJournals?.length || 0}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                                            <button
                                                onClick={() => router.push(`/manufacturing/bom/create?id=${bom.id}`)}
                                                className="text-blue-600 hover:text-blue-800 mr-3"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(bom.id, bom.name)}
                                                className="text-red-600 hover:text-red-800"
                                                disabled={bom.manufacturingJournals?.length > 0}
                                                title={bom.manufacturingJournals?.length > 0 ? 'Cannot delete BOM with productions' : ''}
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
                Total BOMs: {boms.length}
            </div>
        </div>
    );
}
