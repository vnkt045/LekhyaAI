'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle, Clock, Filter, Calendar } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface PDC {
    id: string;
    voucherNumber: string;
    date: string; // Creation Date
    pdcDate: string; // Effective Date
    amount: number;
    narration: string;
    status: 'Pending' | 'Regularized';
    partyName: string;
}

export default function PDCManagementPage() {
    const router = useRouter();
    const [pdcs, setPdcs] = useState<PDC[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('PENDING'); // PENDING | REGULARIZED
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        fetchPDCs();
    }, [filterStatus]);

    const fetchPDCs = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/banking/pdc?status=${filterStatus}`);
            if (res.ok) {
                const data = await res.json();
                setPdcs(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleRegularize = async (id: string, pdcDate: string) => {
        if (!confirm(`Are you sure you want to regularize this PDC effective from ${new Date(pdcDate).toLocaleDateString()}?`)) return;

        setProcessingId(id);
        try {
            const res = await fetch('/api/banking/pdc/regularize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ voucherId: id })
            });

            if (res.ok) {
                // Remove from list or update local state
                setPdcs(prev => prev.filter(p => p.id !== id));
                alert('PDC Regularized Successfully!');
            } else {
                alert('Failed to regularize');
            }
        } catch (error) {
            console.error(error);
            alert('Error regularizing PDC');
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-10 px-6 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <Link href="/banking" className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Post-Dated Cheques (PDC)</h1>
                        <p className="text-xs text-slate-500">Manage future dated payments and receipts</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setFilterStatus('PENDING')}
                        className={cn("px-4 py-2 text-sm font-bold rounded-full transition-colors", filterStatus === 'PENDING' ? "bg-blue-100 text-blue-700" : "text-slate-500 hover:bg-slate-100")}
                    >
                        Pending
                    </button>
                    <button
                        onClick={() => setFilterStatus('REGULARIZED')}
                        className={cn("px-4 py-2 text-sm font-bold rounded-full transition-colors", filterStatus === 'REGULARIZED' ? "bg-green-100 text-green-700" : "text-slate-500 hover:bg-slate-100")}
                    >
                        Regularized
                    </button>
                    <Link href="/vouchers/new" className="ml-4 bg-lekhya-accent text-white px-4 py-2 rounded font-bold text-sm hover:bg-lekhya-accent/90 shadow-lg">
                        + New PDC
                    </Link>
                </div>
            </header>

            <main className="p-6 max-w-7xl mx-auto">
                {loading ? (
                    <div className="text-center py-20 text-slate-400">Loading PDCs...</div>
                ) : pdcs.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-lg border border-dashed border-slate-300">
                        <Calendar className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                        <h3 className="text-lg font-bold text-slate-700">No Post-Dated Cheques Found</h3>
                        <p className="text-slate-500 text-sm">Create a new voucher and mark it as 'Post-Dated' to see it here.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow border overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold border-b">
                                <tr>
                                    <th className="px-6 py-4">PDC Date</th>
                                    <th className="px-6 py-4">Voucher No</th>
                                    <th className="px-6 py-4">Party</th>
                                    <th className="px-6 py-4 text-right">Amount</th>
                                    <th className="px-6 py-4">Created On</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    {filterStatus === 'PENDING' && <th className="px-6 py-4 text-right">Action</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {pdcs.map((pdc) => (
                                    <tr key={pdc.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-mono font-bold text-lekhya-primary">
                                            {format(new Date(pdc.pdcDate), 'dd-MMM-yyyy')}
                                            {new Date(pdc.pdcDate) <= new Date() && filterStatus === 'PENDING' && (
                                                <span className="ml-2 text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">DUE</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium">{pdc.voucherNumber}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{pdc.partyName}</td>
                                        <td className="px-6 py-4 text-right font-bold text-slate-800">
                                            ₹{pdc.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-400">
                                            {format(new Date(pdc.date), 'dd-MMM-yyyy')}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={cn(
                                                "px-2 py-1 rounded-full text-xs font-bold",
                                                pdc.status === 'Regularized' ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                                            )}>
                                                {pdc.status}
                                            </span>
                                        </td>
                                        {filterStatus === 'PENDING' && (
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleRegularize(pdc.id, pdc.pdcDate)}
                                                    disabled={processingId === pdc.id}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded shadow-md disabled:opacity-50 flex items-center gap-2 ml-auto"
                                                >
                                                    {processingId === pdc.id ? 'Processing...' : (
                                                        <>
                                                            <CheckCircle className="w-3 h-3" /> Regularize
                                                        </>
                                                    )}
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
}
