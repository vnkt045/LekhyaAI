'use client';

import { useState } from 'react';
import { FileText, Download, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function GSTR3BPage() {
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const generateReport = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/gst/gstr3b?month=${month}&year=${year}`);
            if (res.ok) {
                setData(await res.json());
            }
        } catch (error) {
            console.error('Failed to generate GSTR-3B:', error);
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
        a.download = `GSTR3B_${month}_${year}.json`;
        a.click();
    };

    return (
        <div className="min-h-screen bg-lekhya-base p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-lekhya-primary flex items-center gap-2">
                            <FileText className="w-6 h-6" />
                            GSTR-3B Return
                        </h1>
                        <p className="text-sm text-slate-600">Monthly summary return</p>
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
                        {/* Table 3.1 - Outward Supplies */}
                        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                            <div className="bg-slate-50 px-6 py-3 border-b border-slate-200">
                                <h3 className="font-bold text-slate-800">Table 3.1 - Outward Supplies</h3>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-5 gap-4">
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase font-bold mb-1">Taxable Value</p>
                                        <p className="text-xl font-bold text-slate-800">₹{data.outwardSupplies.taxableValue.toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase font-bold mb-1">IGST</p>
                                        <p className="text-xl font-bold text-blue-600">₹{data.outwardSupplies.integratedTax.toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase font-bold mb-1">CGST</p>
                                        <p className="text-xl font-bold text-green-600">₹{data.outwardSupplies.centralTax.toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase font-bold mb-1">SGST</p>
                                        <p className="text-xl font-bold text-green-600">₹{data.outwardSupplies.stateTax.toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase font-bold mb-1">Cess</p>
                                        <p className="text-xl font-bold text-slate-600">₹{data.outwardSupplies.cess.toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Table 4 - ITC Available */}
                        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                            <div className="bg-slate-50 px-6 py-3 border-b border-slate-200">
                                <h3 className="font-bold text-slate-800">Table 4 - ITC Available</h3>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-4 gap-4">
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase font-bold mb-1">IGST</p>
                                        <p className="text-xl font-bold text-blue-600">₹{data.itcAvailable.total.igst.toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase font-bold mb-1">CGST</p>
                                        <p className="text-xl font-bold text-green-600">₹{data.itcAvailable.total.cgst.toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase font-bold mb-1">SGST</p>
                                        <p className="text-xl font-bold text-green-600">₹{data.itcAvailable.total.sgst.toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase font-bold mb-1">Cess</p>
                                        <p className="text-xl font-bold text-slate-600">₹{data.itcAvailable.total.cess.toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Table 6.1 - Net ITC */}
                        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                            <div className="bg-slate-50 px-6 py-3 border-b border-slate-200">
                                <h3 className="font-bold text-slate-800">Table 6.1 - Net ITC Available</h3>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-4 gap-4">
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase font-bold mb-1">IGST</p>
                                        <p className="text-xl font-bold text-blue-600">₹{data.netITC.igst.toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase font-bold mb-1">CGST</p>
                                        <p className="text-xl font-bold text-green-600">₹{data.netITC.cgst.toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase font-bold mb-1">SGST</p>
                                        <p className="text-xl font-bold text-green-600">₹{data.netITC.sgst.toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase font-bold mb-1">Cess</p>
                                        <p className="text-xl font-bold text-slate-600">₹{data.netITC.cess.toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Table 6.2 - Tax Payable */}
                        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg shadow-md border-2 border-red-200 overflow-hidden">
                            <div className="bg-red-100 px-6 py-3 border-b border-red-200">
                                <h3 className="font-bold text-red-800">Table 6.2 - Tax Payable</h3>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-4 gap-4">
                                    <div>
                                        <p className="text-xs text-red-600 uppercase font-bold mb-1">IGST</p>
                                        <p className="text-2xl font-bold text-red-700">₹{data.taxPayable.igst.toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-red-600 uppercase font-bold mb-1">CGST</p>
                                        <p className="text-2xl font-bold text-red-700">₹{data.taxPayable.cgst.toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-red-600 uppercase font-bold mb-1">SGST</p>
                                        <p className="text-2xl font-bold text-red-700">₹{data.taxPayable.sgst.toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-red-600 uppercase font-bold mb-1">Cess</p>
                                        <p className="text-2xl font-bold text-red-700">₹{data.taxPayable.cess.toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
