'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, FolderTree } from 'lucide-react';
import Link from 'next/link';

interface StockGroup {
    id: string;
    name: string;
    description?: string;
    parentId?: string;
    parent?: StockGroup;
    children?: StockGroup[];
    items?: any[];
}

export default function StockGroupsPage() {
    const [groups, setGroups] = useState<StockGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        parentId: ''
    });

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        try {
            const res = await fetch('/api/inventory/stock-groups');
            if (res.ok) {
                setGroups(await res.json());
            }
        } catch (error) {
            console.error('Failed to fetch stock groups:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/inventory/stock-groups', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setShowForm(false);
                setFormData({ name: '', description: '', parentId: '' });
                fetchGroups();
            }
        } catch (error) {
            console.error('Failed to create stock group:', error);
        }
    };

    const renderGroupTree = (group: StockGroup, level = 0) => (
        <div key={group.id} className="border-b border-slate-200">
            <div
                className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                style={{ paddingLeft: `${level * 2 + 1}rem` }}
            >
                <div className="flex items-center gap-3">
                    <FolderTree className="w-5 h-5 text-lekhya-accent" />
                    <div>
                        <h3 className="font-bold text-slate-800">{group.name}</h3>
                        {group.description && (
                            <p className="text-xs text-slate-500">{group.description}</p>
                        )}
                        {group.items && group.items.length > 0 && (
                            <p className="text-xs text-slate-400 mt-1">
                                {group.items.length} items
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="p-2 hover:bg-blue-100 rounded-full transition-colors">
                        <Edit2 className="w-4 h-4 text-blue-600" />
                    </button>
                    <button className="p-2 hover:bg-red-100 rounded-full transition-colors">
                        <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                </div>
            </div>
            {group.children && group.children.map(child => renderGroupTree(child, level + 1))}
        </div>
    );

    return (
        <div className="min-h-screen bg-lekhya-base p-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-lekhya-primary">Stock Groups</h1>
                        <p className="text-sm text-slate-600">Organize inventory into hierarchical categories</p>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-lekhya-accent text-lekhya-primary px-4 py-2 rounded font-bold flex items-center gap-2 hover:scale-105 transition-transform"
                    >
                        <Plus className="w-4 h-4" />
                        New Group
                    </button>
                </div>

                {/* Form */}
                {showForm && (
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
                        <h2 className="text-lg font-bold text-lekhya-primary mb-4">Create Stock Group</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Group Name</label>
                                <input
                                    type="text"
                                    className="w-full border border-slate-300 rounded px-3 py-2 focus:ring-2 focus:ring-lekhya-accent outline-none"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                                <textarea
                                    className="w-full border border-slate-300 rounded px-3 py-2 focus:ring-2 focus:ring-lekhya-accent outline-none"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Parent Group</label>
                                <select
                                    className="w-full border border-slate-300 rounded px-3 py-2 focus:ring-2 focus:ring-lekhya-accent outline-none"
                                    value={formData.parentId}
                                    onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                                >
                                    <option value="">None (Root Level)</option>
                                    {groups.map(g => (
                                        <option key={g.id} value={g.id}>{g.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    className="bg-lekhya-accent text-lekhya-primary px-6 py-2 rounded font-bold hover:scale-105 transition-transform"
                                >
                                    Create Group
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

                {/* Groups List */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center text-slate-500">Loading...</div>
                    ) : groups.length === 0 ? (
                        <div className="p-12 text-center text-slate-400">
                            No stock groups yet. Create one to get started.
                        </div>
                    ) : (
                        <div>
                            {groups.filter(g => !g.parentId).map(group => renderGroupTree(group))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
