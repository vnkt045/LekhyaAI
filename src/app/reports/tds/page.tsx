'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, FileText, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function TDSReportsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [quarter, setQuarter] = useState('Q1-2024');
    const [financialYear, setFinancialYear] = useState('2023-24');
    const [tdsData, setTdsData] = useState<any>(null);

    useEffect(() => {
        fetchTDSData();
    }, [quarter, financialYear]);

    const fetchTDSData = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/tds/entries?quarter=${quarter}&financialYear=${financialYear}`);
            if (res.ok) {
                const data = await res.json();
                setTdsData(data);
            }
        } catch (error) {
            console.error('Failed to fetch TDS data', error);
        } finally {
            setLoading(false);
        }
    };

    const generateForm26Q = async () => {
        try {
            const res = await fetch(`/api/tds/form26q?quarter=${quarter}&financialYear=${financialYear}`);
            if (res.ok) {
                const data = await res.json();
                // Download as JSON for now (can be converted to proper format later)
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Form26Q-${quarter}-${financialYear}.json`;
                a.click();
            }
        } catch (error) {
            console.error('Failed to generate Form 26Q', error);
            alert('Failed to generate Form 26Q');
        }
    };

    return (
        <div className="flex flex-col h-screen bg-lekhya-base">
            <div className="lekhya-header z-10">
                <div className="flex items-center gap-4">
                    <Link href="/reports" className="hover:bg-white/10 p-1.5 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-lekhya-accent" />
                    </Link>
                    <h1 className="font-bold text-lg tracking-wide">
                        TDS Reports <span className="text-gray-400 text-sm font-normal">/ Tax Deducted at Source</span>
                    </h1>
                </div>
            </div>

            <div className="flex-1 p-8 overflow-auto">
                <div className="max-w-7xl mx-auto">
                    {/* Filters */}
                    <div className="bg-white rounded-sm shadow-sm border border-gray-200 p-4 mb-4">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <select
                                    value={quarter}
                                    onChange={(e) => setQuarter(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-lekhya-accent outline-none"
                                >
                                    <option value="Q1-2024">Q1 (Apr-Jun) 2024</option>
                                    <option value="Q2-2024">Q2 (Jul-Sep) 2024</option>
                                    <option value="Q3-2024">Q3 (Oct-Dec) 2024</option>
                                    <option value="Q4-2023">Q4 (Jan-Mar) 2024</option>
                                </select>
                            </div>

                            <select
                                value={financialYear}
                                onChange={(e) => setFinancialYear(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-lekhya-accent outline-none"
                            >
                                <option value="2023-24">FY 2023-24</option>
                                <option value="2024-25">FY 2024-25</option>
                                <option value="2025-26">FY 2025-26</option>
                            </select>

                            <button
                                onClick={generateForm26Q}
                                className="ml-auto flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm font-medium"
                            >
                                <Download className="w-4 h-4" />
                                Generate Form 26Q
                            </button>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    {tdsData && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-white rounded-sm shadow-sm border border-gray-200 p-6">
                                <div className="text-xs font-bold text-gray-500 uppercase mb-2">Total Entries</div>
                                <div className="text-3xl font-bold text-lekhya-primary">{tdsData.summary.totalEntries}</div>
                            </div>
                            <div className="bg-white rounded-sm shadow-sm border border-gray-200 p-6">
                                <div className="text-xs font-bold text-gray-500 uppercase mb-2">Taxable Amount</div>
                                <div className="text-3xl font-bold text-blue-600">₹{tdsData.summary.totalTaxableAmount.toLocaleString()}</div>
                            </div>
                            <div className="bg-white rounded-sm shadow-sm border border-gray-200 p-6">
                                <div className="text-xs font-bold text-gray-500 uppercase mb-2">TDS Deducted</div>
                                <div className="text-3xl font-bold text-green-600">₹{tdsData.summary.totalTDSAmount.toLocaleString()}</div>
                            </div>
                        </div>
                    )}

                    {/* Section-wise Breakdown */}
                    <div className="bg-white rounded-sm shadow-sm border border-gray-200">
                        <div className="p-4 border-b border-gray-200 bg-lekhya-dark text-white">
                            <h2 className="text-lg font-bold">TDS Deductions by Section</h2>
                        </div>

                        {loading ? (
                            <div className="p-12 text-center text-gray-500">Loading TDS data...</div>
                        ) : !tdsData || Object.keys(tdsData.summary.bySection).length === 0 ? (
                            <div className="p-12 text-center text-gray-500">
                                No TDS entries found for {quarter} {financialYear}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Section</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Description</th>
                                            <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Entries</th>
                                            <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Total Amount</th>
                                            <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">TDS Amount</th>
                                            <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Avg Rate</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {Object.entries(tdsData.summary.bySection).map(([sectionCode, data]: [string, any]) => (
                                            <tr key={sectionCode} className="hover:bg-blue-50/50 transition-colors">
                                                <td className="px-4 py-3 text-sm font-mono font-bold text-lekhya-primary">{sectionCode}</td>
                                                <td className="px-4 py-3 text-sm text-gray-700">{data.section.description}</td>
                                                <td className="px-4 py-3 text-sm text-right font-medium">{data.count}</td>
                                                <td className="px-4 py-3 text-sm text-right font-mono">₹{data.totalAmount.toLocaleString()}</td>
                                                <td className="px-4 py-3 text-sm text-right font-mono font-bold text-green-600">
                                                    ₹{data.totalTDS.toLocaleString()}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-right font-mono">
                                                    {((data.totalTDS / data.totalAmount) * 100).toFixed(2)}%
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                                        <tr>
                                            <td colSpan={3} className="px-4 py-3 text-sm font-bold text-gray-700 uppercase">Total</td>
                                            <td className="px-4 py-3 text-sm text-right font-mono font-bold">
                                                ₹{tdsData.summary.totalTaxableAmount.toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right font-mono font-bold text-green-600">
                                                ₹{tdsData.summary.totalTDSAmount.toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right font-mono font-bold">
                                                {((tdsData.summary.totalTDSAmount / tdsData.summary.totalTaxableAmount) * 100).toFixed(2)}%
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
