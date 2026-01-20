'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, Plus, Edit2, Trash2, XCircle } from 'lucide-react';
import CreateVoucherTypeModal from '@/components/voucher-types/CreateVoucherTypeModal';

interface VoucherType {
    id: string;
    name: string;
    abbreviation: string;
    category: string;
    isSystemDefined: boolean;
    isActive: boolean;
    prefix?: string;
    startingNumber: number;
    affectsInventory: boolean;
    requiresGST: boolean;
}

export default function VoucherTypesPage() {
    const router = useRouter();
    const [voucherTypes, setVoucherTypes] = useState<VoucherType[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editData, setEditData] = useState<VoucherType | null>(null);

    const fetchVoucherTypes = async () => {
        try {
            const response = await fetch('/api/voucher-types');
            if (response.ok) {
                const data = await response.json();
                setVoucherTypes(data);
            }
        } catch (error) {
            console.error('Error fetching voucher types:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVoucherTypes();
    }, []);

    const handleEdit = (vt: VoucherType) => {
        setEditData(vt);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to deactivate this voucher type?')) return;

        try {
            const response = await fetch(`/api/voucher-types/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                fetchVoucherTypes();
            }
        } catch (error) {
            console.error('Error deleting voucher type:', error);
        }
    };

    const handleToggleActive = async (vt: VoucherType) => {
        try {
            const response = await fetch(`/api/voucher-types/${vt.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...vt, isActive: !vt.isActive }),
            });

            if (response.ok) {
                fetchVoucherTypes();
            }
        } catch (error) {
            console.error('Error toggling voucher type:', error);
        }
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setEditData(null);
    };

    const handleModalSuccess = () => {
        fetchVoucherTypes();
    };

    return (
        <div className="min-h-screen bg-lekhya-base flex flex-col font-sans">
            <div className="lekhya-header z-10">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push('/masters/accounts-info')} className="hover:bg-white/10 p-1 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-lekhya-accent" />
                    </button>
                    <h1 className="font-bold text-lg tracking-wide pl-2">LekhyaAI <span className="text-gray-400 text-sm font-normal">/ Masters / Voucher Types</span></h1>
                </div>
            </div>

            <div className="flex-1 p-8 overflow-auto">
                <div className="max-w-6xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-slate-800">Voucher Types</h2>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Create Custom Type
                        </button>
                    </div>

                    {loading ? (
                        <div className="text-center py-12 text-gray-500">Loading...</div>
                    ) : (
                        <div className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-[#E0E8F0] text-lekhya-primary font-bold border-b border-gray-300">
                                    <tr>
                                        <th className="px-6 py-3">Name</th>
                                        <th className="px-6 py-3">Abbreviation</th>
                                        <th className="px-6 py-3">Category</th>
                                        <th className="px-6 py-3">Type</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {voucherTypes.map((vt) => (
                                        <tr key={vt.id} className="hover:bg-blue-50 transition-colors">
                                            <td className="px-6 py-3 font-bold text-slate-700">{vt.name}</td>
                                            <td className="px-6 py-3 text-slate-500 font-mono text-xs">{vt.abbreviation}</td>
                                            <td className="px-6 py-3 text-slate-600">{vt.category}</td>
                                            <td className="px-6 py-3">
                                                {vt.isSystemDefined ? (
                                                    <span className="inline-flex items-center text-[10px] font-bold uppercase text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded border border-yellow-200">
                                                        System
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center text-[10px] font-bold uppercase text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                                                        Custom
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-3">
                                                <button
                                                    onClick={() => !vt.isSystemDefined && handleToggleActive(vt)}
                                                    disabled={vt.isSystemDefined}
                                                    className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${vt.isActive
                                                            ? 'text-green-600 bg-green-50 border-green-100'
                                                            : 'text-gray-600 bg-gray-50 border-gray-100'
                                                        } ${!vt.isSystemDefined && 'cursor-pointer hover:opacity-75'}`}
                                                >
                                                    {vt.isActive ? (
                                                        <>
                                                            <CheckCircle2 className="w-3 h-3" /> Active
                                                        </>
                                                    ) : (
                                                        <>
                                                            <XCircle className="w-3 h-3" /> Inactive
                                                        </>
                                                    )}
                                                </button>
                                            </td>
                                            <td className="px-6 py-3 text-right">
                                                {!vt.isSystemDefined && (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleEdit(vt)}
                                                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                                            title="Edit"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(vt.id)}
                                                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                            title="Deactivate"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            <CreateVoucherTypeModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                onSuccess={handleModalSuccess}
                editData={editData}
            />
        </div>
    );
}
