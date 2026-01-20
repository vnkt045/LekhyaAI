'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Save, Trash2, Edit, FolderTree, X, Check } from 'lucide-react';

export default function GroupsPage() {
    const router = useRouter();
    const [accounts, setAccounts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editFormData, setEditFormData] = useState({ name: '', type: '' });
    const [formData, setFormData] = useState({
        name: '',
        type: 'Asset', // Default
        parentGroup: ''
    });

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            const res = await fetch('/api/accounts');
            if (res.ok) {
                const data = await res.json();
                setAccounts(data);
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
            const res = await fetch('/api/accounts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    type: formData.type,
                    parentGroup: formData.parentGroup || null,
                    openingBalance: 0 // Groups usually don't have op val, strictly speaking
                })
            });

            if (res.ok) {
                setFormData({ name: '', type: 'Asset', parentGroup: '' });
                setIsCreating(false);
                fetchAccounts();
            } else {
                alert('Failed to create Group');
            }
        } catch (error) {
            console.error(error);
            alert('Error creating Group');
        }
    };

    const handleEdit = (account: any) => {
        setEditingId(account.id);
        setEditFormData({ name: account.name, type: account.type });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditFormData({ name: '', type: '' });
    };

    const handleSaveEdit = async (id: string) => {
        try {
            const res = await fetch(`/api/accounts/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editFormData)
            });

            if (res.ok) {
                setEditingId(null);
                fetchAccounts();
            } else {
                alert('Failed to update group');
            }
        } catch (error) {
            console.error(error);
            alert('Error updating group');
        }
    };

    return (
        <div className="min-h-screen bg-lekhya-base flex flex-col font-sans">
            <div className="lekhya-header z-10">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push('/masters/accounts-info')} className="hover:bg-white/10 p-1 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-lekhya-accent" />
                    </button>
                    <h1 className="font-bold text-lg tracking-wide pl-2">LekhyaAI <span className="text-gray-400 text-sm font-normal">/ Masters / Groups</span></h1>
                </div>
            </div>

            <div className="flex-1 p-8 overflow-auto">
                <div className="max-w-4xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-slate-800">List of Groups</h2>
                        <button
                            onClick={() => setIsCreating(true)}
                            className="bg-lekhya-primary text-white px-4 py-2 rounded-sm font-bold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" /> Create Group
                        </button>
                    </div>

                    {isCreating && (
                        <div className="mb-6 bg-white p-6 rounded-sm shadow-md border border-gray-200 animate-in slide-in-from-top-2">
                            <h3 className="font-bold text-lekhya-primary uppercase text-xs mb-4">Create New Group</h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Name</label>
                                        <input
                                            type="text"
                                            autoFocus
                                            className="lekhya-input w-full"
                                            placeholder="e.g. Sundry Debtors"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Type</label>
                                        <select
                                            className="lekhya-input w-full"
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        >
                                            <option value="Asset">Asset</option>
                                            <option value="Liability">Liability</option>
                                            <option value="Income">Income (Revenue)</option>
                                            <option value="Expense">Expense</option>
                                            <option value="Equity">Equity</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
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
                                    <th className="px-6 py-3">Group Name</th>
                                    <th className="px-6 py-3">Type</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan={3} className="px-6 py-4 text-center text-gray-500">Loading...</td></tr>
                                ) : accounts.length === 0 ? (
                                    <tr><td colSpan={3} className="px-6 py-4 text-center text-gray-500">No Groups found.</td></tr>
                                ) : (
                                    accounts.map((acc) => (
                                        <tr key={acc.id} className="hover:bg-blue-50 group transition-colors">
                                            {editingId === acc.id ? (
                                                <>
                                                    <td className="px-6 py-3">
                                                        <input
                                                            type="text"
                                                            className="lekhya-input w-full"
                                                            value={editFormData.name}
                                                            onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                                        />
                                                    </td>
                                                    <td className="px-6 py-3">
                                                        <select
                                                            className="lekhya-input w-full"
                                                            value={editFormData.type}
                                                            onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value })}
                                                        >
                                                            <option value="Asset">Asset</option>
                                                            <option value="Liability">Liability</option>
                                                            <option value="Revenue">Revenue</option>
                                                            <option value="Expense">Expense</option>
                                                            <option value="Equity">Equity</option>
                                                        </select>
                                                    </td>
                                                    <td className="px-6 py-3 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => handleSaveEdit(acc.id)}
                                                                className="text-green-600 hover:text-green-700 transition-colors"
                                                                title="Save"
                                                            >
                                                                <Check className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={handleCancelEdit}
                                                                className="text-red-600 hover:text-red-700 transition-colors"
                                                                title="Cancel"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td className="px-6 py-3 font-medium text-slate-700 flex items-center gap-2">
                                                        <FolderTree className="w-4 h-4 text-slate-400" />
                                                        {acc.name}
                                                    </td>
                                                    <td className="px-6 py-3 text-slate-500">{acc.type}</td>
                                                    <td className="px-6 py-3 text-right">
                                                        <button
                                                            onClick={() => handleEdit(acc)}
                                                            className="text-slate-400 hover:text-lekhya-primary transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </>
                                            )}
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
