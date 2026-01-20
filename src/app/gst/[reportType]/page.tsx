'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Download, Filter, Calendar } from 'lucide-react';
import Link from 'next/link';
import EmptyState from '@/components/EmptyState';
import { FileText } from 'lucide-react';

export default function GSTReportViewer() {
    const params = useParams();
    const router = useRouter();
    const rawType = params.reportType as string; // e.g. "gstr-1"
    const reportTitle = rawType.replace(/-/g, ' ').toUpperCase();

    // Mock data based on report type
    // In a real app, you'd fetch specific data here
    const isSales = rawType.includes('gstr-1');
    const isPurchase = rawType.includes('gstr-2');

    return (
        <div className="min-h-screen bg-lekhya-base flex flex-col font-sans">
            {/* Header */}
            <header className="bg-lekhya-primary text-white h-12 flex items-center justify-between px-4 border-b-[3px] border-lekhya-accent shadow-sm sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <Link href="/gst" className="hover:bg-white/10 p-1.5 rounded-full transition-colors" title="Back to GST Dashboard">
                        <ArrowLeft className="w-5 h-5 text-lekhya-accent" />
                    </Link>
                    <h1 className="text-lg font-bold tracking-wide">{reportTitle}</h1>
                </div>
                <div className="flex gap-2">
                    <button className="bg-lekhya-accent text-lekhya-primary px-3 py-1 text-xs font-bold rounded hover:bg-white transition-colors flex items-center gap-2">
                        <Download className="w-3 h-3" /> Export JSON
                    </button>
                    <button className="bg-white/10 text-white px-3 py-1 text-xs font-bold rounded hover:bg-white/20 transition-colors flex items-center gap-2">
                        <Filter className="w-3 h-3" /> Filter
                    </button>
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 p-6 max-w-7xl mx-auto w-full">

                {/* Filters */}
                <div className="bg-white p-4 rounded-sm border border-gray-200 mb-6 flex justify-between items-center shadow-sm">
                    <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2 text-slate-600">
                            <Calendar className="w-4 h-4" />
                            <span className="font-bold">Period:</span>
                            <select className="bg-gray-50 border border-gray-300 rounded px-2 py-1 outline-none text-slate-800">
                                <option>April 2024</option>
                                <option>May 2024</option>
                                <option>June 2024</option>
                            </select>
                        </div>
                        <div className="h-4 w-px bg-gray-300"></div>
                        <div className="text-slate-500">
                            GSTIN: <span className="font-mono font-bold text-slate-700">29AAAAA0000A1Z5</span>
                        </div>
                    </div>
                </div>

                {/* Report Table / Empty State */}
                <div className="bg-white border border-gray-300 rounded-sm shadow-sm min-h-[400px]">
                    {/* Placeholder Table Structure */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-100 border-b border-gray-200 text-xs uppercase font-bold text-slate-600">
                                <tr>
                                    <th className="px-4 py-3">GSTIN/UIN</th>
                                    <th className="px-4 py-3">Trade Name</th>
                                    <th className="px-4 py-3">Invoice No.</th>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3 text-right">Value</th>
                                    <th className="px-4 py-3 text-right">Taxable</th>
                                    <th className="px-4 py-3 text-right">IGST</th>
                                    <th className="px-4 py-3 text-right">{isPurchase ? 'CGST' : 'CGST'}</th>
                                    <th className="px-4 py-3 text-right">{isPurchase ? 'SGST' : 'SGST'}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Empty State Row */}
                                <tr>
                                    <td colSpan={9} className="p-12 text-center text-slate-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <FileText className="w-8 h-8 opacity-50" />
                                            <p>No transaction data found for this period.</p>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
