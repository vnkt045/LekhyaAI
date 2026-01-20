'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';

export default function AttendanceTypesPage() {
    const [types, setTypes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        unitName: 'Days',
        isLeave: false,
        isPaidLeave: false
    });

    useEffect(() => {
        fetchTypes();
    }, []);

    const fetchTypes = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/payroll/attendance-types');
            if (res.ok) setTypes(await res.json());
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/payroll/attendance-types', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                fetchTypes();
                setShowForm(false);
                setFormData({ name: '', unitName: 'Days', isLeave: false, isPaidLeave: false });
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
                    <h1 className="text-lg font-bold tracking-wide">Attendance / Production Types</h1>
                </div>
            </header>

            <div className="max-w-4xl mx-auto p-8">
                {showForm ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                        <h2 className="text-lg font-bold text-lekhya-primary mb-4">Create Type</h2>
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
                                        placeholder="e.g. Present"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Unit</label>
                                    <input
                                        type="text"
                                        required
                                        className="input"
                                        value={formData.unitName}
                                        onChange={e => setFormData({ ...formData, unitName: e.target.value })}
                                        placeholder="e.g. Days"
                                    />
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 mt-6">
                                        <input
                                            type="checkbox"
                                            checked={formData.isLeave}
                                            onChange={e => setFormData({ ...formData, isLeave: e.target.checked })}
                                        />
                                        <span className="text-sm font-medium text-slate-700">Is Leave (Attendance w/o Pay)?</span>
                                    </label>
                                </div>
                                {formData.isLeave && (
                                    <div>
                                        <label className="flex items-center gap-2 mt-6">
                                            <input
                                                type="checkbox"
                                                checked={formData.isPaidLeave}
                                                onChange={e => setFormData({ ...formData, isPaidLeave: e.target.checked })}
                                            />
                                            <span className="text-sm font-medium text-slate-700">Is Paid Leave?</span>
                                        </label>
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-2 justify-end mt-4">
                                <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">Cancel</button>
                                <button type="submit" className="btn btn-primary">Save</button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className="flex justify-end mb-6">
                        <button onClick={() => setShowForm(true)} className="btn btn-primary flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Create Type
                        </button>
                    </div>
                )}

                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-600 font-bold border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3">Name</th>
                                <th className="px-6 py-3">Unit</th>
                                <th className="px-6 py-3">Type</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {types.map(t => (
                                <tr key={t.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-3 font-medium text-slate-800">{t.name}</td>
                                    <td className="px-6 py-3">{t.unitName}</td>
                                    <td className="px-6 py-3">
                                        {t.isLeave ? (t.isPaidLeave ? 'Paid Leave' : 'Leave without Pay') : 'Attendance / Production'}
                                    </td>
                                </tr>
                            ))}
                            {types.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="px-6 py-8 text-center text-slate-500 italic">No types found. Create defaults like 'Present', 'Absent', 'Overtime'.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
