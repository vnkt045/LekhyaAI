'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
// import { useAppStore } from '@/lib/store';
import { FileText, Plus, Search, Filter, Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils';
import EmptyState from '@/components/EmptyState';

import { Suspense } from 'react';

function VouchersContent() {
    const router = useRouter();
    // const { vouchers } = useAppStore(); // Removed mock store

    // Local State
    const [vouchers, setVouchers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [mounted, setMounted] = useState(false);
    const searchParams = useSearchParams();
    const search = searchParams.get('search');

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        fetchVouchers();
    }, [search]); // Re-fetch when URL search param changes

    const fetchVouchers = async () => {
        setLoading(true);
        try {
            const query = search ? `?search=${encodeURIComponent(search)}` : '';
            const res = await fetch(`/api/vouchers${query}`);
            if (res.ok) {
                const data = await res.json();
                setVouchers(data);
            }
        } catch (error) {
            console.error('Failed to fetch vouchers', error);
        } finally {
            setLoading(false);
        }
    };

    // Removed client-side filteredVouchers, using vouchers directly
    const filteredVouchers = vouchers;

    // Hotkey listener for 'Escape' to go back
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') router.push('/');
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [router]);

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-lekhya-base flex flex-col font-sans">
            {/* Premium Tally-Style Header */}
            <header className="bg-lekhya-primary text-white h-12 flex items-center justify-between px-4 border-b-[3px] border-lekhya-accent shadow-sm sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <Link href="/" className="hover:bg-white/10 p-1.5 rounded-full transition-colors" title="Back to Gateway">
                        <ArrowLeft className="w-5 h-5 text-lekhya-accent" />
                    </Link>
                    <h1 className="text-lg font-bold tracking-wide">Vouchers Register</h1>
                </div>

                <div className="flex gap-4">
                    <Link href="/vouchers/new" className="bg-lekhya-accent text-lekhya-primary px-4 py-1.5 text-sm font-bold rounded-sm hover:bg-white hover:text-lekhya-primary transition-colors flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Add Voucher
                    </Link>
                </div>
            </header>

            <div className="p-6 max-w-7xl mx-auto w-full">
                {loading ? (
                    <div className="text-center py-12 text-slate-500">Loading Vouchers...</div>
                ) : vouchers.length === 0 ? (
                    <EmptyState
                        icon={FileText}
                        title="No vouchers recorded"
                        description="Create your first financial transaction to start tracking your business."
                        actionLabel="Create Voucher"
                        onAction={() => router.push('/vouchers/new')}
                    />
                ) : (
                    <div className="bg-white rounded-sm border border-[#BDCDD6] shadow-sm overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-[#F1F5F9] border-b border-[#E2E8F0]">
                                <tr>
                                    <th className="px-6 py-3 font-semibold text-lekhya-primary uppercase text-xs tracking-wider">Date</th>
                                    <th className="px-6 py-3 font-semibold text-lekhya-primary uppercase text-xs tracking-wider">Voucher No.</th>
                                    <th className="px-6 py-3 font-semibold text-lekhya-primary uppercase text-xs tracking-wider">Type</th>
                                    <th className="px-6 py-3 font-semibold text-lekhya-primary uppercase text-xs tracking-wider">Narration</th>
                                    <th className="px-6 py-3 font-semibold text-lekhya-primary uppercase text-xs tracking-wider text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredVouchers.map((v: any) => (
                                    <tr key={v.id} className="hover:bg-blue-50/50 cursor-pointer transition-colors group">
                                        <td className="px-6 py-3 text-slate-600 font-medium">
                                            <div className="flex items-center gap-2">
                                                {formatDate(v.date)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 font-medium text-lekhya-primary group-hover:text-blue-600">
                                            <Link href={`/vouchers/${v.id}`} className="hover:underline">
                                                {v.voucherNumber}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-3">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${v.voucherType === 'RECEIPT' ? 'bg-green-50 text-green-700 border-green-200' :
                                                v.voucherType === 'PAYMENT' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                                    v.voucherType === 'SALES' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                        'bg-slate-100 text-slate-700 border-slate-200'
                                                }`}>
                                                {v.voucherType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-slate-500 max-w-md truncate italic">{v.narration}</td>
                                        <td className="px-6 py-3 font-bold text-lekhya-primary text-right">{formatCurrency(v.totalDebit)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>


        </div>
    );
}

export default function VouchersPage() {
    return (
        <Suspense fallback={<div className="text-center py-12 text-slate-500">Loading...</div>}>
            <VouchersContent />
        </Suspense>
    );
}
