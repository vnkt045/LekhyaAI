'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { StockAgingPDF } from '@/components/StockAgingPDF';

interface AgingItem {
    itemId: string;
    itemCode: string;
    itemName: string;
    currentStock: number;
    unit: string;
    purchaseRate: number;
    value: number;
    lastMovementDate: string;
    ageInDays: number;
    ageBracket: string;
}

interface AgingSummary {
    '0-30': { count: number; value: number };
    '31-60': { count: number; value: number };
    '61-90': { count: number; value: number };
    '90+': { count: number; value: number };
}

interface StockAgingData {
    asOfDate: string;
    summary: AgingSummary;
    items: AgingItem[];
}

export default function StockAgingReportPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<StockAgingData | null>(null);
    const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);
    const [error, setError] = useState('');
    const [generatingPDF, setGeneratingPDF] = useState(false);

    const fetchReport = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`/api/reports/stock-aging?asOfDate=${asOfDate}`);
            if (!res.ok) throw new Error('Failed to fetch report');
            const reportData = await res.json();
            setData(reportData);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, []);

    const exportToCSV = () => {
        if (!data) return;

        const headers = ['Item Code', 'Item Name', 'Stock', 'Unit', 'Rate', 'Value', 'Last Movement', 'Age (Days)', 'Age Bracket'];
        const rows = data.items.map(item => [
            item.itemCode,
            item.itemName,
            item.currentStock,
            item.unit,
            item.purchaseRate,
            item.value.toFixed(2),
            new Date(item.lastMovementDate).toLocaleDateString(),
            item.ageInDays,
            item.ageBracket
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `stock-aging-report-${asOfDate}.csv`;
        a.click();
    };

    const exportToPDF = async () => {
        if (!data) return;
        setGeneratingPDF(true);
        try {
            const blob = await pdf(<StockAgingPDF data={data} />).toBlob();
            saveAs(blob, `Stock_Aging_Report_${asOfDate}.pdf`);
        } catch (error) {
            console.error('PDF Generation failed:', error);
            setError('Failed to generate PDF');
        } finally {
            setGeneratingPDF(false);
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Stock Aging Report</h1>
                <button
                    onClick={() => router.push('/reports')}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                    ← Back to Reports
                </button>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
                    {error}
                </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-sm font-medium mb-1">As of Date</label>
                        <input
                            type="date"
                            value={asOfDate}
                            onChange={(e) => setAsOfDate(e.target.value)}
                            className="w-full px-3 py-2 border rounded"
                        />
                    </div>
                    <button
                        onClick={fetchReport}
                        disabled={loading}
                        className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
                    >
                        {loading ? 'Loading...' : 'Generate Report'}
                    </button>
                    <button
                        onClick={exportToCSV}
                        disabled={!data}
                        className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300"
                    >
                        Export CSV
                    </button>
                    <button
                        onClick={exportToPDF}
                        disabled={!data || generatingPDF}
                        className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-300 flex items-center gap-2"
                    >
                        {generatingPDF ? 'Generating...' : 'Download PDF'}
                    </button>
                </div>
            </div>

            {data && (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        {Object.entries(data.summary).map(([bracket, stats]) => (
                            <div key={bracket} className="bg-white rounded-lg shadow p-6">
                                <div className="text-sm text-gray-600 mb-1">{bracket} Days</div>
                                <div className="text-2xl font-bold text-gray-900">{stats.count}</div>
                                <div className="text-sm text-gray-500 mt-2">
                                    Value: ₹{stats.value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Detailed Table */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Code</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Name</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Stock</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Rate</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Value</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Movement</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Age (Days)</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Bracket</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {data.items.length === 0 ? (
                                        <tr>
                                            <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                                                No items with stock found
                                            </td>
                                        </tr>
                                    ) : (
                                        data.items.map((item) => (
                                            <tr key={item.itemId} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {item.itemCode}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {item.itemName}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                                                    {item.currentStock}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {item.unit}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                                                    ₹{item.purchaseRate.toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                                                    ₹{item.value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(item.lastMovementDate).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                                                    {item.ageInDays}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <span className={`px-2 py-1 text-xs rounded ${item.ageBracket === '0-30' ? 'bg-green-100 text-green-700' :
                                                        item.ageBracket === '31-60' ? 'bg-yellow-100 text-yellow-700' :
                                                            item.ageBracket === '61-90' ? 'bg-orange-100 text-orange-700' :
                                                                'bg-red-100 text-red-700'
                                                        }`}>
                                                        {item.ageBracket}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Summary Footer */}
                    <div className="mt-4 text-sm text-gray-600 text-right">
                        Total Items: {data.items.length} | Total Value: ₹{data.items.reduce((sum, item) => sum + item.value, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                </>
            )}
        </div>
    );
}
