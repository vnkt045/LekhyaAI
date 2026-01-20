'use client';

import { useState } from 'react';
import { FileText, Download, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function GSTR1Page() {
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const generateReport = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/gst/gstr1?month=${month}&year=${year}`);
            if (res.ok) {
                setData(await res.json());
            }
        } catch (error) {
            console.error('Failed to generate GSTR-1:', error);
        } finally {
            setLoading(false);
        }
    };

    const exportJSON = () => {
        if (!data) return;
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `GSTR1_${month}_${year}.json`;
        a.click();
    };

    return (
        <div className="min-h-screen bg-lekhya-base p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-lekhya-primary flex items-center gap-2">
                            <FileText className="w-6 h-6" />
                            GSTR-1 Return
                        </h1>
                        <p className="text-sm text-slate-600">Outward supplies return</p>
                    </div>
                    <Link href="/reports" className="text-sm text-blue-600 hover:underline">
                        ← Back to Reports
                    </Link>
                </div>

                {/* Period Selection */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-slate-400" />
                            <label className="text-sm font-bold text-slate-700">Month:</label>
                            <select
                                className="border border-slate-300 rounded px-3 py-2 focus:ring-2 focus:ring-lekhya-accent outline-none"
                                value={month}
                                onChange={(e) => setMonth(parseInt(e.target.value))}
                            >
                                {Array.from({ length: 12 }, (_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                        {new Date(2024, i).toLocaleString('default', { month: 'long' })}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-bold text-slate-700">Year:</label>
                            <input
                                type="number"
                                className="border border-slate-300 rounded px-3 py-2 w-24 focus:ring-2 focus:ring-lekhya-accent outline-none"
                                value={year}
                                onChange={(e) => setYear(parseInt(e.target.value))}
                            />
                        </div>
                        <button
                            onClick={generateReport}
                            disabled={loading}
                            className="bg-lekhya-accent text-lekhya-primary px-6 py-2 rounded font-bold hover:scale-105 transition-transform disabled:opacity-50"
                        >
                            {loading ? 'Generating...' : 'Generate'}
                        </button>
                        {data && (
                            <button
                                onClick={exportJSON}
                                className="bg-green-600 text-white px-6 py-2 rounded font-bold flex items-center gap-2 hover:bg-green-700 transition-colors"
                            >
                                <Download className="w-4 h-4" />
                                Export JSON
                            </button>
                        )}
                    </div>
                </div>

                {/* Report Data */}
                {data && (
                    <div className="space-y-6">
                        {/* Summary */}
                        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                            <h2 className="text-lg font-bold text-lekhya-primary mb-4">Summary</h2>
                            <div className="grid grid-cols-4 gap-4">
                                <div>
                                    <p className="text-xs text-slate-500 uppercase font-bold">Total Invoices</p>
                                    <p className="text-2xl font-bold text-slate-800">{data.summary.totalInvoices}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase font-bold">Taxable Value</p>
                                    <p className="text-2xl font-bold text-slate-800">₹{data.summary.totalTaxableValue.toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase font-bold">Total CGST</p>
                                    <p className="text-2xl font-bold text-green-600">₹{data.summary.totalCGST.toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase font-bold">Total SGST</p>
                                    <p className="text-2xl font-bold text-green-600">₹{data.summary.totalSGST.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>

                        {/* B2B Invoices */}
                        {data.b2b.length > 0 && (
                            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                                <div className="bg-slate-50 px-6 py-3 border-b border-slate-200">
                                    <h3 className="font-bold text-slate-800">B2B Invoices ({data.b2b.length})</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-slate-100 border-b border-slate-200">
                                            <tr>
                                                <th className="px-4 py-2 text-left">GSTIN</th>
                                                <th className="px-4 py-2 text-left">Invoice No</th>
                                                <th className="px-4 py-2 text-left">Date</th>
                                                <th className="px-4 py-2 text-right">Taxable Value</th>
                                                <th className="px-4 py-2 text-right">CGST</th>
                                                <th className="px-4 py-2 text-right">SGST</th>
                                                <th className="px-4 py-2 text-right">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {data.b2b.map((inv: any, i: number) => (
                                                <tr key={i} className="hover:bg-slate-50">
                                                    <td className="px-4 py-2 font-mono text-xs">{inv.gstin}</td>
                                                    <td className="px-4 py-2">{inv.invoiceNumber}</td>
                                                    <td className="px-4 py-2 text-xs">{new Date(inv.invoiceDate).toLocaleDateString()}</td>
                                                    <td className="px-4 py-2 text-right font-mono">₹{inv.taxableValue.toFixed(2)}</td>
                                                    <td className="px-4 py-2 text-right font-mono">₹{inv.cgstAmount.toFixed(2)}</td>
                                                    <td className="px-4 py-2 text-right font-mono">₹{inv.sgstAmount.toFixed(2)}</td>
                                                    <td className="px-4 py-2 text-right font-mono font-bold">₹{inv.invoiceValue.toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* B2C Large */}
                        {data.b2cl.length > 0 && (
                            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                                <h3 className="font-bold text-slate-800 mb-4">B2C Large ({'>'}  ₹2.5 Lakhs) ({data.b2cl.length})</h3>
                                <div className="space-y-2">
                                    {data.b2cl.map((inv: any, i: number) => (
                                        <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded">
                                            <span className="font-medium">{inv.invoiceNumber}</span>
                                            <span className="font-mono">₹{inv.invoiceValue.toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* B2C Small */}
                        {data.b2cs.length > 0 && (
                            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                                <h3 className="font-bold text-slate-800 mb-4">B2C Small (Consolidated)</h3>
                                <div className="space-y-2">
                                    {data.b2cs.map((item: any, i: number) => (
                                        <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded">
                                            <span className="font-medium">{item.placeOfSupply}</span>
                                            <span className="font-mono">₹{item.taxableValue.toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
