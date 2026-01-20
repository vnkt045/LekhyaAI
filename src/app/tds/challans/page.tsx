'use client';

import { useState, useEffect } from 'react';
import { Calendar, Plus, FileText, CheckCircle } from 'lucide-react';

export default function ChallansPage() {
    const [challans, setChallans] = useState<any[]>([]);
    const [unpaidEntries, setUnpaidEntries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showRecordForm, setShowRecordForm] = useState(false);
    const [formData, setFormData] = useState({
        challanNo: '',
        challanDate: new Date().toISOString().split('T')[0],
        selectedEntries: [] as string[]
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [challansRes, entriesRes] = await Promise.all([
                fetch('/api/tds/challans'),
                fetch('/api/tds/entries')
            ]);

            if (challansRes.ok) {
                const data = await challansRes.json();
                setChallans(data);
            }

            if (entriesRes.ok) {
                const data = await entriesRes.json();
                // Filter entries without challan
                const unpaid = data.entries?.filter((e: any) => !e.challanNo) || [];
                setUnpaidEntries(unpaid);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRecordChallan = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.selectedEntries.length === 0) {
            alert('Please select at least one TDS entry');
            return;
        }

        try {
            const res = await fetch('/api/tds/challans', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    entryIds: formData.selectedEntries,
                    challanNo: formData.challanNo,
                    challanDate: formData.challanDate
                })
            });

            if (res.ok) {
                alert('Challan recorded successfully!');
                setShowRecordForm(false);
                setFormData({
                    challanNo: '',
                    challanDate: new Date().toISOString().split('T')[0],
                    selectedEntries: []
                });
                fetchData();
            } else {
                alert('Failed to record challan');
            }
        } catch (error) {
            alert('Failed to record challan');
        }
    };

    const toggleEntrySelection = (entryId: string) => {
        setFormData(prev => ({
            ...prev,
            selectedEntries: prev.selectedEntries.includes(entryId)
                ? prev.selectedEntries.filter(id => id !== entryId)
                : [...prev.selectedEntries, entryId]
        }));
    };

    return (
        <div className="flex flex-col h-screen bg-lekhya-base">
            <div className="lekhya-header">
                <h1 className="font-bold text-lg tracking-wide">
                    LekhyaAI <span className="text-gray-400 text-sm font-normal">/ TDS / Challan Management</span>
                </h1>
            </div>

            <div className="flex-1 p-8 overflow-auto">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">TDS Challan Management</h2>
                            <p className="text-sm text-gray-600 mt-1">Track and manage TDS payment challans</p>
                        </div>
                        <button
                            onClick={() => setShowRecordForm(!showRecordForm)}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 font-medium"
                        >
                            <Plus className="w-4 h-4" />
                            Record Challan
                        </button>
                    </div>

                    {/* Record Challan Form */}
                    {showRecordForm && (
                        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border border-gray-200">
                            <h3 className="text-lg font-bold mb-4">Record New Challan</h3>
                            <form onSubmit={handleRecordChallan}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                                            Challan Number
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full border border-gray-300 rounded px-3 py-2"
                                            value={formData.challanNo}
                                            onChange={(e) => setFormData({ ...formData, challanNo: e.target.value })}
                                            placeholder="e.g., 0123456789"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                                            Challan Date
                                        </label>
                                        <input
                                            type="date"
                                            required
                                            className="w-full border border-gray-300 rounded px-3 py-2"
                                            value={formData.challanDate}
                                            onChange={(e) => setFormData({ ...formData, challanDate: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                                        Select TDS Entries ({formData.selectedEntries.length} selected)
                                    </label>
                                    <div className="border border-gray-300 rounded max-h-64 overflow-y-auto">
                                        {unpaidEntries.length === 0 ? (
                                            <div className="p-4 text-center text-gray-500">
                                                No unpaid TDS entries found
                                            </div>
                                        ) : (
                                            unpaidEntries.map((entry: any) => (
                                                <div
                                                    key={entry.id}
                                                    className="flex items-center gap-3 p-3 hover:bg-gray-50 border-b border-gray-100"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.selectedEntries.includes(entry.id)}
                                                        onChange={() => toggleEntrySelection(entry.id)}
                                                        className="w-4 h-4"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="font-medium text-sm">{entry.party?.name || 'N/A'}</div>
                                                        <div className="text-xs text-gray-500">
                                                            {entry.section?.section} - {entry.quarter} {entry.financialYear}
                                                        </div>
                                                    </div>
                                                    <div className="font-bold text-sm">₹{entry.tdsAmount.toFixed(2)}</div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium"
                                    >
                                        Record Challan
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowRecordForm(false)}
                                        className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded font-medium"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Challans List */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="p-4 border-b border-gray-200 bg-gray-50">
                            <h3 className="font-bold text-gray-900">Recorded Challans</h3>
                        </div>

                        {loading ? (
                            <div className="p-8 text-center text-gray-500">Loading challans...</div>
                        ) : challans.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <FileText className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                                <p>No challans recorded yet</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                                                Challan No
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                                                Date
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                                                Quarter
                                            </th>
                                            <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase">
                                                Amount
                                            </th>
                                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase">
                                                Entries
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {challans.map((challan: any, idx: number) => (
                                            <tr key={idx} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 font-mono text-sm font-medium">
                                                    {challan.challanNo}
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    {new Date(challan.challanDate).toLocaleDateString('en-IN')}
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    {challan.quarter} {challan.financialYear}
                                                </td>
                                                <td className="px-4 py-3 text-right font-bold text-green-600">
                                                    ₹{challan.totalAmount.toFixed(2)}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                                                        {challan.entries.length} entries
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
