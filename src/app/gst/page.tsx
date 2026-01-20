'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, ArrowLeft, Calendar, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { useGlobalAction } from '@/context/GlobalActionContext';

export default function GSTReportsPage() {
    const router = useRouter();
    const [summary, setSummary] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchGSTR1 = async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/reports/gst/gstr1');
                if (res.ok) {
                    const data = await res.json();
                    setSummary(data.data);
                }
            } catch (error) {
                console.error("Failed to fetch GSTR-1", error);
            } finally {
                setLoading(false);
            }
        };
        fetchGSTR1();
    }, []);

    return (
        <div className="min-h-screen bg-lekhya-base flex flex-col font-sans">
            {/* Header */}
            <header className="bg-lekhya-primary text-white h-12 flex items-center justify-between px-4 border-b-[3px] border-lekhya-accent shadow-sm sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <Link href="/" className="hover:bg-white/10 p-1.5 rounded-full transition-colors" title="Back to Gateway">
                        <ArrowLeft className="w-5 h-5 text-lekhya-accent" />
                    </Link>
                    <h1 className="text-lg font-bold tracking-wide">GST Reports</h1>
                </div>
                <div className="text-xs bg-white/10 px-3 py-1 rounded font-mono">
                    LekhyaAI Enterprise
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 p-8 max-w-6xl mx-auto w-full">

                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-lekhya-primary font-bold text-xl">Statutory Reports</h2>
                        <p className="text-slate-500 text-sm">Select a report to view details or file returns.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12 flex flex-col items-center text-slate-500">
                        <Loader2 className="w-8 h-8 animate-spin mb-2" />
                        Fetching GST Data...
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* GSTR-1 Card with Real Data */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                <FileText className="w-24 h-24 text-blue-600" />
                            </div>
                            <div className="flex justify-between items-start mb-4 relative">
                                <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-orange-100 text-orange-700">
                                    Pending
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 mb-1 relative">GSTR-1</h3>
                            <p className="text-xs text-gray-500 mb-4 h-8 relative">Details of Outward Supplies (Sales)</p>

                            <div className="bg-slate-50 p-3 rounded mb-4 relative">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-500">Taxable Value</span>
                                    <span className="font-bold text-slate-700">{summary ? formatCurrency(summary.totalSales) : '₹0.00'}</span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button className="flex-1 py-2 bg-lekhya-primary text-white text-sm font-bold rounded hover:bg-blue-800 transition-colors">
                                    View
                                </button>
                                <a
                                    href="/api/reports/gst/gstr1/export"
                                    target="_blank"
                                    className="flex-1 py-2 bg-orange-600 text-white text-sm font-bold rounded hover:bg-orange-700 transition-colors text-center"
                                >
                                    Export JSON
                                </a>
                            </div>
                        </div>

                        {/* GSTR-3B */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                <FileText className="w-24 h-24 text-green-600" />
                            </div>
                            <div className="flex justify-between items-start mb-4 relative">
                                <div className="p-3 rounded-lg bg-green-50 text-green-600">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-slate-100 text-slate-500">
                                    Not Started
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 mb-1 relative">GSTR-3B</h3>
                            <p className="text-xs text-gray-500 mb-4 h-8 relative">Monthly Summary Return</p>

                            <div className="bg-slate-50 p-3 rounded mb-4 relative flex items-center justify-center h-[52px]">
                                <span className="text-xs text-slate-400 italic">No data available</span>
                            </div>

                            <button className="relative w-full py-2 border border-slate-300 text-slate-600 text-sm font-bold rounded hover:bg-slate-50 transition-colors">
                                File Return
                            </button>
                        </div>

                        {/* GSTR-2A */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                            <div className="flex justify-between items-start mb-4 relative">
                                <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
                                    <Calendar className="w-6 h-6" />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-green-100 text-green-700">
                                    Auto-Drafted
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 mb-1 relative">GSTR-2A / 2B</h3>
                            <p className="text-xs text-gray-500 mb-4 h-8 relative">Input Tax Credit (Purchase View)</p>

                            <div className="bg-slate-50 p-3 rounded mb-4 relative flex items-center justify-center h-[52px]">
                                <span className="text-xs text-slate-400 italic">Synced from Portal</span>
                            </div>

                            <button className="relative w-full py-2 border border-slate-300 text-slate-600 text-sm font-bold rounded hover:bg-slate-50 transition-colors">
                                Reconcile
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
