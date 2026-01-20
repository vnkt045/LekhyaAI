'use client';

import { useState, useEffect } from 'react';
import { Users, Download, FileText, Calendar } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { exportToPDF } from '@/lib/pdf-export';
import { exportToExcel } from '@/lib/excel-export';

interface AgingData {
    asOfDate: string;
    agingData: Array<{
        partyName: string;
        totalOutstanding: number;
        current: number;
        days31to60: number;
        days61to90: number;
        days91to180: number;
        over180: number;
    }>;
    totals: {
        totalOutstanding: number;
        current: number;
        days31to60: number;
        days61to90: number;
        days91to180: number;
        over180: number;
    };
    partyCount: number;
}

export default function ReceivablesAging() {
    const [data, setData] = useState<AgingData | null>(null);
    const [loading, setLoading] = useState(true);
    const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        fetchData();
    }, [asOfDate]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/reports/receivables-aging?asOfDate=${asOfDate}`);
            if (res.ok) {
                const result = await res.json();
                setData(result);
            }
        } catch (error) {
            console.error('Failed to fetch aging data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExportPDF = () => {
        if (!data) return;

        exportToPDF({
            title: 'Receivables Aging Analysis',
            subtitle: `As of ${data.asOfDate}`,
            data: data.agingData,
            columns: [
                { header: 'Party Name', dataKey: 'partyName' },
                { header: 'Total', dataKey: 'totalOutstanding' },
                { header: '0-30 Days', dataKey: 'current' },
                { header: '31-60 Days', dataKey: 'days31to60' },
                { header: '61-90 Days', dataKey: 'days61to90' },
                { header: '91-180 Days', dataKey: 'days91to180' },
                { header: '180+ Days', dataKey: 'over180' }
            ],
            filename: `receivables-aging-${data.asOfDate}.pdf`,
            orientation: 'landscape'
        });
    };

    const handleExportExcel = () => {
        if (!data) return;

        const excelData = data.agingData.map(item => ({
            'Party Name': item.partyName,
            'Total Outstanding': item.totalOutstanding,
            '0-30 Days': item.current,
            '31-60 Days': item.days31to60,
            '61-90 Days': item.days61to90,
            '91-180 Days': item.days91to180,
            '180+ Days': item.over180
        }));

        exportToExcel({
            data: excelData,
            sheetName: 'Receivables Aging',
            filename: `receivables-aging-${data.asOfDate}.xlsx`
        });
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-lekhya-base p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-lekhya-primary rounded-lg">
                                <Users className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-lekhya-primary">Receivables Aging Analysis</h1>
                                <p className="text-sm text-slate-600">Outstanding debtors by aging buckets</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleExportPDF}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                <FileText className="w-4 h-4" />
                                PDF
                            </button>
                            <button
                                onClick={handleExportExcel}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                                <Download className="w-4 h-4" />
                                Excel
                            </button>
                        </div>
                    </div>
                </div>

                {/* Date Selection */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                    <div className="flex items-center gap-4">
                        <Calendar className="w-5 h-5 text-gray-500" />
                        <label className="text-sm font-medium text-gray-700">As of Date:</label>
                        <input
                            type="date"
                            value={asOfDate}
                            onChange={(e) => setAsOfDate(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                </div>

                {/* Summary Cards */}
                {data && (
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <p className="text-sm text-gray-600 mb-1">Total Outstanding</p>
                            <p className="text-2xl font-bold text-lekhya-primary">{formatCurrency(data.totals.totalOutstanding)}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <p className="text-sm text-gray-600 mb-1">Number of Debtors</p>
                            <p className="text-2xl font-bold text-lekhya-primary">{data.partyCount}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm border border-orange-200 p-4">
                            <p className="text-sm text-gray-600 mb-1">Overdue (90+ days)</p>
                            <p className="text-2xl font-bold text-orange-600">
                                {formatCurrency(data.totals.days91to180 + data.totals.over180)}
                            </p>
                        </div>
                    </div>
                )}

                {/* Aging Table */}
                {data && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-lekhya-primary text-white">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">Party Name</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase">Total</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase">0-30 Days</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase">31-60 Days</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase">61-90 Days</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase">91-180 Days</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase">180+ Days</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {data.agingData.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.partyName}</td>
                                        <td className="px-6 py-4 text-sm text-right font-bold">{formatCurrency(item.totalOutstanding)}</td>
                                        <td className="px-6 py-4 text-sm text-right text-green-600">{formatCurrency(item.current)}</td>
                                        <td className="px-6 py-4 text-sm text-right text-yellow-600">{formatCurrency(item.days31to60)}</td>
                                        <td className="px-6 py-4 text-sm text-right text-orange-600">{formatCurrency(item.days61to90)}</td>
                                        <td className="px-6 py-4 text-sm text-right text-red-600">{formatCurrency(item.days91to180)}</td>
                                        <td className="px-6 py-4 text-sm text-right text-red-700 font-bold">{formatCurrency(item.over180)}</td>
                                    </tr>
                                ))}
                                <tr className="bg-gray-100 font-bold">
                                    <td className="px-6 py-4 text-sm">TOTAL</td>
                                    <td className="px-6 py-4 text-sm text-right">{formatCurrency(data.totals.totalOutstanding)}</td>
                                    <td className="px-6 py-4 text-sm text-right text-green-600">{formatCurrency(data.totals.current)}</td>
                                    <td className="px-6 py-4 text-sm text-right text-yellow-600">{formatCurrency(data.totals.days31to60)}</td>
                                    <td className="px-6 py-4 text-sm text-right text-orange-600">{formatCurrency(data.totals.days61to90)}</td>
                                    <td className="px-6 py-4 text-sm text-right text-red-600">{formatCurrency(data.totals.days91to180)}</td>
                                    <td className="px-6 py-4 text-sm text-right text-red-700">{formatCurrency(data.totals.over180)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
