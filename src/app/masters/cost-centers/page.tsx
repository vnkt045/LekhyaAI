'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, FolderTree, Building } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Category {
    id: string;
    name: string;
}

interface Center {
    id: string;
    name: string;
    category: Category;
    categoryId: string;
}

export default function CostCentersPage() {
    const router = useRouter();
    const [centers, setCenters] = useState<Center[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState<'CATEGORY' | 'CENTER'>('CENTER');

    // Form State
    const [name, setName] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [catRes, centerRes] = await Promise.all([
                fetch('/api/masters/cost-categories'),
                fetch('/api/masters/cost-centers')
            ]);

            if (catRes.ok) setCategories(await catRes.json());
            if (centerRes.ok) setCenters(await centerRes.json());
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            if (modalMode === 'CATEGORY') {
                const res = await fetch('/api/masters/cost-categories', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name })
                });
                if (res.ok) {
                    const newCat = await res.json();
                    setCategories([...categories, newCat]);
                    setShowModal(false);
                    setName('');
                }
            } else {
                const res = await fetch('/api/masters/cost-centers', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, categoryId: selectedCategory })
                });
                if (res.ok) {
                    const newCenter = await res.json();
                    // Need full object with category
                    const fullCenter: Center = {
                        ...newCenter,
                        category: categories.find(c => c.id === selectedCategory) || { id: '', name: 'Unknown' }
                    };
                    setCenters([...centers, fullCenter]);
                    setShowModal(false);
                    setName('');
                    setSelectedCategory('');
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const openCategoryModal = () => {
        setModalMode('CATEGORY');
        setName('');
        setShowModal(true);
    };

    const openCenterModal = () => {
        setModalMode('CENTER');
        setName('');
        // Default to first category if exists
        if (categories.length > 0) setSelectedCategory(categories[0].id);
        setShowModal(true);
    };

    if (loading) return <div className="p-12 text-center text-slate-500">Loading Masters...</div>;

    return (
        <div className="min-h-screen bg-lekhya-base p-8 font-sans flex flex-col">
            {/* Header */}
            <div className="max-w-4xl mx-auto mb-6 w-full">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/masters" className="hover:bg-slate-100 p-2 rounded-full transition-colors">
                                <ArrowLeft className="w-5 h-5 text-slate-600" />
                            </Link>
                            <div className="p-3 bg-lekhya-primary rounded-lg">
                                <FolderTree className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-lekhya-primary">Cost Centers</h1>
                                <p className="text-sm text-slate-600">Manage Projects, Departments & Allocation Units</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={openCategoryModal}
                                className="flex items-center gap-2 px-4 py-2 border border-lekhya-accent text-lekhya-accent rounded-lg hover:bg-orange-50 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Category
                            </button>
                            <button
                                onClick={openCenterModal}
                                className="flex items-center gap-2 px-4 py-2 bg-lekhya-accent text-white rounded-lg hover:bg-orange-600 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Cost Center
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content - Grouped by Category */}
            <div className="max-w-4xl mx-auto w-full grid gap-6">
                {categories.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">
                        <p>No Cost Categories defined.</p>
                        <button onClick={openCategoryModal} className="text-lekhya-primary underline mt-2">Create Primary Category</button>
                    </div>
                ) : (
                    categories.map(cat => {
                        const catCenters = centers.filter(c => c.categoryId === cat.id);
                        return (
                            <div key={cat.id} className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                                <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex justify-between items-center">
                                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                        <FolderTree className="w-4 h-4 text-slate-400" />
                                        {cat.name}
                                    </h3>
                                    <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded-full">{catCenters.length} Centers</span>
                                </div>
                                <div className="divide-y divide-slate-100">
                                    {catCenters.length > 0 ? (
                                        catCenters.map(center => (
                                            <div key={center.id} className="px-6 py-4 flex items-center gap-3 hover:bg-slate-50 group">
                                                <Building className="w-5 h-5 text-slate-300 group-hover:text-lekhya-primary transition-colors" />
                                                <span className="text-slate-700 font-medium">{center.name}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="px-6 py-4 text-sm text-slate-400 italic">No cost centers in this category</div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                        <h2 className="text-lg font-bold mb-4">
                            {modalMode === 'CATEGORY' ? 'Create Cost Category' : 'Create Cost Center'}
                        </h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            {modalMode === 'CENTER' && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                                    <select
                                        className="w-full border border-slate-300 rounded p-2 text-sm"
                                        value={selectedCategory}
                                        onChange={e => setSelectedCategory(e.target.value)}
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    className="w-full border border-slate-300 rounded p-2 text-sm"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder={modalMode === 'CATEGORY' ? "e.g. Projects" : "e.g. Project Alpha"}
                                    required
                                    autoFocus
                                />
                            </div>

                            <div className="flex justify-end gap-2 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm bg-lekhya-accent text-white rounded hover:bg-orange-600 disabled:opacity-50"
                                    disabled={saving}
                                >
                                    {saving ? 'Creating...' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
