'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import Link from 'next/link';
import ConfirmDialog from '@/components/ConfirmDialog';

function AlterLedgerContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const accountId = searchParams.get('id');

    const [formData, setFormData] = useState({
        code: '',
        name: '',
        type: 'Asset',
        group: '',
        openingBalance: 0,
        isActive: true,
        isCostCenterEnabled: false
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (accountId) {
            fetchAccount();
        } else {
            router.push('/masters/ledger/display');
        }
    }, [accountId]);

    const fetchAccount = async () => {
        try {
            const res = await fetch(`/api/accounts/${accountId}`);
            if (res.ok) {
                const data = await res.json();
                setFormData({
                    code: data.code,
                    name: data.name,
                    type: data.type,
                    group: data.group || '',
                    openingBalance: data.openingBalance || 0,
                    isActive: data.isActive ?? true,
                    isCostCenterEnabled: data.isCostCenterEnabled ?? false
                });
            } else {
                setError('Failed to load ledger');
            }
        } catch (error) {
            setError('Failed to load ledger');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            const res = await fetch(`/api/accounts/${accountId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                router.push('/masters/ledger/display');
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to update ledger');
            }
        } catch (error) {
            setError('Failed to update ledger');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            const res = await fetch(`/api/accounts/${accountId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                router.push('/masters/ledger/display');
            } else {
                alert('Failed to delete ledger');
            }
        } catch (error) {
            alert('Failed to delete ledger');
        }
        setShowDeleteConfirm(false);
    };

    if (loading) {
        return (
            <div className="flex flex-col h-screen bg-lekhya-base items-center justify-center">
                <div className="text-gray-500">Loading ledger...</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-lekhya-base">
            <div className="lekhya-header z-10">
                <div className="flex items-center gap-4">
                    <Link href="/masters/ledger/display" className="hover:bg-white/10 p-1.5 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-lekhya-accent" />
                    </Link>
                    <h1 className="font-bold text-lg tracking-wide">LekhyaAI <span className="text-gray-400 text-sm font-normal">/ Masters / Ledgers / Alter</span></h1>
                </div>
            </div>

            <div className="flex-1 p-8 overflow-auto">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white rounded-sm shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-200 bg-lekhya-dark text-white">
                            <h2 className="text-lg font-bold">Alter Ledger</h2>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Ledger Code</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-lekhya-accent outline-none"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Ledger Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-lekhya-accent outline-none"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Type</label>
                                    <select
                                        className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-lekhya-accent outline-none"
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        <option value="Asset">Asset</option>
                                        <option value="Liability">Liability</option>
                                        <option value="Equity">Equity</option>
                                        <option value="Revenue">Revenue</option>
                                        <option value="Expense">Expense</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Group (Optional)</label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-lekhya-accent outline-none"
                                        value={formData.group}
                                        onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Opening Balance</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-lekhya-accent outline-none"
                                        value={formData.openingBalance}
                                        onChange={(e) => setFormData({ ...formData, openingBalance: parseFloat(e.target.value) })}
                                    />
                                </div>

                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                                    />
                                    <label htmlFor="isActive" className="text-sm font-bold text-gray-700">Active Ledger</label>
                                </div>
                            </div>

                            {error && <p className="text-red-500 text-sm font-bold mt-4">{error}</p>}

                            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="px-6 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded flex items-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete Ledger
                                </button>

                                <div className="flex gap-3">
                                    <Link
                                        href="/masters/ledger/display"
                                        className="px-6 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded"
                                    >
                                        Cancel
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="px-6 py-2 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded flex items-center gap-2 disabled:opacity-50"
                                    >
                                        <Save className="w-4 h-4" />
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <ConfirmDialog
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDelete}
                title="Delete Ledger?"
                message={`Are you sure you want to delete ${formData.name}? This action cannot be undone and may affect your financial records.`}
                confirmText="Delete Ledger"
                cancelText="Cancel"
                variant="danger"
            />
        </div>
    );
}

export default function AlterLedgerPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
            <AlterLedgerContent />
        </Suspense>
    );
}
