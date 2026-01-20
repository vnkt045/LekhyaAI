'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Trash2, Plus, Banknote } from 'lucide-react';

export default function PayHeadsPage() {
    const [payHeads, setPayHeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        type: 'EARNINGS', // EARNINGS, DEDUCTIONS
        calculationType: 'FLAT_RATE', // FLAT_RATE, COMPUTED_VALUE
        ledgerName: ''
    });

    useEffect(() => {
        fetchPayHeads();
    }, []);

    const fetchPayHeads = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/payroll/pay-heads');
            if (res.ok) {
                const data = await res.json();
                setPayHeads(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/payroll/pay-heads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                fetchPayHeads();
                setShowForm(false);
                setFormData({ name: '', type: 'EARNINGS', calculationType: 'FLAT_RATE', ledgerName: '' });
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="min-h-screen bg-lekhya-base font-sans">
            <header className="bg-lekhya-primary text-white h-12 flex items-center justify-between px-4 border-b-[3px] border-lekhya-accent shadow-sm sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <Link href="/masters/payroll-info" className="hover:bg-white/10 p-1.5 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-lekhya-accent" />
                    </Link>
                    <h1 className="text-lg font-bold tracking-wide">Pay Heads</h1>
                </div>
            </header>

            <div className="max-w-5xl mx-auto p-8">
                {showForm ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                        <h2 className="text-lg font-bold text-lekhya-primary mb-4">Create Pay Head</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="input"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Basic Salary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Pay Head Type</label>
                                    <select
                                        className="input"
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        <option value="EARNINGS">Earnings for Employees</option>
                                        <option value="DEDUCTIONS">Deductions from Employees</option>
                                        <option value="REIMBURSEMENTS">Reimbursements</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Calculation Type</label>
                                    <select
                                        className="input"
                                        value={formData.calculationType}
                                        onChange={e => setFormData({ ...formData, calculationType: e.target.value })}
                                    >
                                        <option value="FLAT_RATE">As User Defined Value (Flat Rate)</option>
                                        <option value="ON_ATTENDANCE">On Attendance</option>
                                        <option value="COMPUTED_VALUE">As Computed Value (Formula)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Under Ledger (Accounting)</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={formData.ledgerName}
                                        onChange={e => setFormData({ ...formData, ledgerName: e.target.value })}
                                        placeholder="e.g. Salary Expense"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2 justify-end mt-4">
                                <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">Cancel</button>
                                <button type="submit" className="btn btn-primary">Save Pay Head</button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className="flex justify-end mb-6">
                        <button onClick={() => setShowForm(true)} className="btn btn-primary flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Create Pay Head
                        </button>
                    </div>
                )}

                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-600 font-bold border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3">Name</th>
                                <th className="px-6 py-3">Type</th>
                                <th className="px-6 py-3">Calculation</th>
                                <th className="px-6 py-3">Ledger</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {payHeads.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500 italic">No Pay Heads found. Create one (e.g. Basic Salary).</td>
                                </tr>
                            ) : (
                                payHeads.map(ph => (
                                    <tr key={ph.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-3 font-medium text-lekhya-primary">{ph.name}</td>
                                        <td className="px-6 py-3">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${ph.type === 'EARNINGS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {ph.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3">{ph.calculationType}</td>
                                        <td className="px-6 py-3 text-slate-500">{ph.ledgerName || '-'}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
