'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Godown {
    id: string;
    name: string;
    location: string | null;
    parentId: string | null;
    parent?: {
        id: string;
        name: string;
    } | null;
    children?: Godown[];
    stockMovements?: any[];
    voucherItems?: any[];
}

export default function GodownsDisplayPage() {
    const router = useRouter();
    const [godowns, setGodowns] = useState<Godown[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleteId, setDeleteId] = useState<string | null>(null);

    useEffect(() => {
        fetchGodowns();
    }, []);

    const fetchGodowns = async () => {
        try {
            const res = await fetch('/api/masters/godowns');
            if (!res.ok) throw new Error('Failed to fetch godowns');
            const data = await res.json();
            setGodowns(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this godown?')) return;

        try {
            const res = await fetch(`/api/masters/godowns?id=${id}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to delete godown');
            }

            setGodowns(godowns.filter((g) => g.id !== id));
            setDeleteId(null);
        } catch (err: any) {
            alert(err.message);
        }
    };

    const buildHierarchy = (items: Godown[], parentId: string | null = null): Godown[] => {
        return items
            .filter((item) => item.parentId === parentId)
            .map((item) => ({
                ...item,
                children: buildHierarchy(items, item.id),
            }));
    };

    const renderGodownRow = (godown: Godown, level: number = 0) => {
        const hasStock = (godown.stockMovements?.length || 0) > 0 || (godown.voucherItems?.length || 0) > 0;
        const hasChildren = (godown.children?.length || 0) > 0;

        return (
            <div key={godown.id}>
                <div className="flex items-center justify-between p-4 border-b hover:bg-gray-50">
                    <div className="flex items-center gap-4" style={{ paddingLeft: `${level * 2}rem` }}>
                        {level > 0 && <span className="text-gray-400">└─</span>}
                        <div>
                            <div className="font-medium">{godown.name}</div>
                            {godown.location && <div className="text-sm text-gray-500">{godown.location}</div>}
                            {godown.parent && (
                                <div className="text-xs text-gray-400">Parent: {godown.parent.name}</div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {hasStock && (
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                                Has Stock
                            </span>
                        )}
                        {hasChildren && (
                            <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded">
                                {godown.children?.length} Child{godown.children?.length !== 1 ? 'ren' : ''}
                            </span>
                        )}
                        <button
                            onClick={() => router.push(`/masters/godowns/create?id=${godown.id}`)}
                            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => handleDelete(godown.id)}
                            disabled={hasStock || hasChildren}
                            className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                            title={
                                hasStock
                                    ? 'Cannot delete: Has stock movements'
                                    : hasChildren
                                        ? 'Cannot delete: Has child godowns'
                                        : 'Delete godown'
                            }
                        >
                            Delete
                        </button>
                    </div>
                </div>
                {godown.children?.map((child) => renderGodownRow(child, level + 1))}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="p-8">
                <div className="animate-pulse">Loading godowns...</div>
            </div>
        );
    }

    const hierarchicalGodowns = buildHierarchy(godowns);

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Godowns (Warehouses)</h1>
                    <p className="text-gray-600 mt-1">Manage storage locations and warehouses</p>
                </div>
                <button
                    onClick={() => router.push('/masters/godowns/create')}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                    + Create Godown
                </button>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
                    {error}
                </div>
            )}

            <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b bg-gray-50">
                    <div className="flex justify-between items-center">
                        <h2 className="font-semibold">All Godowns ({godowns.length})</h2>
                        <div className="text-sm text-gray-600">
                            Hierarchical view - Parent godowns shown first
                        </div>
                    </div>
                </div>

                {godowns.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No godowns found. Create your first godown to get started.
                    </div>
                ) : (
                    <div>{hierarchicalGodowns.map((godown) => renderGodownRow(godown))}</div>
                )}
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
                <h3 className="font-semibold text-blue-900 mb-2">💡 Tips</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Create parent godowns first, then add child godowns for better organization</li>
                    <li>• Godowns with stock movements or child godowns cannot be deleted</li>
                    <li>• Use locations to specify physical addresses or warehouse sections</li>
                </ul>
            </div>
        </div>
    );
}
