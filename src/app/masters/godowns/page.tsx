'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Save, Edit } from 'lucide-react';

export default function GodownsPage() {
    const router = useRouter();
    const [godowns, setGodowns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState({ name: '', location: '' });

    useEffect(() => {
        fetchGodowns();
    }, []);

    const fetchGodowns = async () => {
        try {
            const res = await fetch('/api/godowns');
            if (res.ok) {
                const data = await res.json();
                setGodowns(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/godowns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setFormData({ name: '', location: '' });
                setIsCreating(false);
                fetchGodowns();
            } else {
                alert('Failed to create Godown');
            }
        } catch (error) {
            console.error(error);
            alert('Error creating Godown');
        }
    };

    return (
        <div className="min-h-screen bg-lekhya-base flex flex-col font-sans">
            <div className="lekhya-header z-10">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push('/masters/inventory-info')} className="hover:bg-white/10 p-1 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-lekhya-accent" />
                    </button>
                    <h1 className="font-bold text-lg tracking-wide pl-2">LekhyaAI <span className="text-gray-400 text-sm font-normal">/ Masters / Godowns</span></h1>
                </div>
            </div>

            <div className="flex-1 p-8 overflow-auto">
                <div className="max-w-4xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-slate-800">List of Godowns / Locations</h2>
                        <button
                            onClick={() => setIsCreating(true)}
                            className="bg-lekhya-primary text-white px-4 py-2 rounded-sm font-bold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" /> Create Location
                        </button>
                    </div>

                    {isCreating && (
                        <div className="mb-6 bg-white p-6 rounded-sm shadow-md border border-gray-200 animate-in slide-in-from-top-2">
                            <h3 className="font-bold text-lekhya-primary uppercase text-xs mb-4">Create New Godown</h3>
                            <form onSubmit={handleSubmit} className="flex gap-4 items-end">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Name</label>
                                    <input
                                        type="text"
                                        autoFocus
                                        className="w-full border border-gray-300 rounded p-2 outline-none focus:border-lekhya-primary focus:ring-1 focus:ring-lekhya-primary/20"
                                        placeholder="e.g. Warehouse 1, Store Room..."
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Address/Location (Optional)</label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 rounded p-2 outline-none focus:border-lekhya-primary focus:ring-1 focus:ring-lekhya-primary/20"
                                        placeholder="e.g. 1st Floor, Building A"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreating(false)}
                                        className="px-4 py-2 text-slate-600 font-bold text-sm hover:bg-slate-100 rounded"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-lekhya-primary text-white px-6 py-2 rounded-sm font-bold text-sm hover:bg-black hover:text-lekhya-accent transition-colors flex items-center gap-2"
                                    >
                                        <Save className="w-4 h-4" /> Save
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#E0E8F0] text-lekhya-primary font-bold border-b border-gray-300">
                                <tr>
                                    <th className="px-6 py-3">Name</th>
                                    <th className="px-6 py-3">Location</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan={3} className="px-6 py-4 text-center text-gray-500">Loading...</td></tr>
                                ) : godowns.length === 0 ? (
                                    <tr><td colSpan={3} className="px-6 py-4 text-center text-gray-500">No Godowns found.</td></tr>
                                ) : (
                                    godowns.map((g) => (
                                        <tr key={g.id} className="hover:bg-blue-50 group transition-colors">
                                            <td className="px-6 py-3 font-medium text-slate-700">{g.name}</td>
                                            <td className="px-6 py-3 text-slate-500">{g.location || '-'}</td>
                                            <td className="px-6 py-3 text-right">
                                                <button
                                                    onClick={() => router.push(`/masters/godowns/create?id=${g.id}`)}
                                                    className="text-slate-400 hover:text-lekhya-primary transition-colors"
                                                    title="Edit godown"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
