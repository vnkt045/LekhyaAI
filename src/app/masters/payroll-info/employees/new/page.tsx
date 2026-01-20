'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, User, Briefcase, IndianRupee, Landmark, FileText } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function NewEmployeePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'general' | 'statutory' | 'bank'>('general');

    const [formData, setFormData] = useState({
        code: '',
        name: '',
        designation: '',
        department: '',
        dateOfJoining: new Date().toISOString().split('T')[0],

        // Statutory
        panNumber: '',
        aadharNumber: '',
        uanNumber: '',
        esiNumber: '',

        // Bank
        bankName: '',
        accountNumber: '',
        ifscCode: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/payroll/employees', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                alert('Employee Created Successfully!');
                router.push('/masters/payroll-info/employees');
            } else {
                const err = await res.json();
                alert(err.error || 'Failed to create employee');
            }
        } catch (error) {
            console.error(error);
            alert('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-lekhya-base font-sans">
            {/* Header */}
            <div className="lekhya-header z-10 sticky top-0">
                <div className="flex items-center gap-4">
                    <Link href="/masters/payroll-info/employees" className="hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5 text-lekhya-accent" />
                    </Link>
                    <h1 className="font-bold text-lg tracking-wide pl-2">Create Employee</h1>
                </div>
            </div>

            <div className="flex-1 overflow-hidden flex">
                {/* Sidebar Navigation */}
                <div className="w-64 bg-white border-r border-gray-200 p-4">
                    <nav className="space-y-1">
                        <button onClick={() => setActiveTab('general')} className={cn("w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors", activeTab === 'general' ? "bg-blue-50 text-lekhya-primary" : "text-slate-600 hover:bg-slate-50")}>
                            <User className="w-4 h-4" /> General Info
                        </button>
                        <button onClick={() => setActiveTab('statutory')} className={cn("w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors", activeTab === 'statutory' ? "bg-blue-50 text-lekhya-primary" : "text-slate-600 hover:bg-slate-50")}>
                            <FileText className="w-4 h-4" /> Statutory Info
                        </button>
                        <button onClick={() => setActiveTab('bank')} className={cn("w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors", activeTab === 'bank' ? "bg-blue-50 text-lekhya-primary" : "text-slate-600 hover:bg-slate-50")}>
                            <Landmark className="w-4 h-4" /> Bank Details
                        </button>
                    </nav>
                </div>

                {/* Form Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    <form onSubmit={handleSubmit} className="max-w-3xl space-y-8 pb-20">
                        {/* GENERAL */}
                        <div className={activeTab === 'general' ? 'block' : 'hidden'}>
                            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><User className="text-lekhya-primary" /> General Information</h2>
                            <div className="grid grid-cols-2 gap-6 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Employee Code *</label>
                                    <input required name="code" value={formData.code} onChange={handleChange} className="lekhya-input w-full" placeholder="e.g. EMP-001" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Full Name *</label>
                                    <input required name="name" value={formData.name} onChange={handleChange} className="lekhya-input w-full" placeholder="e.g. Rahul Sharma" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Date of Joining</label>
                                    <input type="date" name="dateOfJoining" value={formData.dateOfJoining} onChange={handleChange} className="lekhya-input w-full" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Designation</label>
                                    <input name="designation" value={formData.designation} onChange={handleChange} className="lekhya-input w-full" placeholder="e.g. Senior Developer" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Department</label>
                                    <input name="department" value={formData.department} onChange={handleChange} className="lekhya-input w-full" placeholder="e.g. Engineering" />
                                </div>
                            </div>
                        </div>

                        {/* STATUTORY */}
                        <div className={activeTab === 'statutory' ? 'block' : 'hidden'}>
                            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><FileText className="text-lekhya-primary" /> Statutory Details</h2>
                            <div className="grid grid-cols-2 gap-6 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">PAN Number</label>
                                    <input name="panNumber" value={formData.panNumber} onChange={handleChange} className="lekhya-input w-full uppercase" placeholder="ABCDE1234F" maxLength={10} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Aadhar Number</label>
                                    <input name="aadharNumber" value={formData.aadharNumber} onChange={handleChange} className="lekhya-input w-full" maxLength={12} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">UAN (PF)</label>
                                    <input name="uanNumber" value={formData.uanNumber} onChange={handleChange} className="lekhya-input w-full" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">ESI Number</label>
                                    <input name="esiNumber" value={formData.esiNumber} onChange={handleChange} className="lekhya-input w-full" />
                                </div>
                            </div>
                        </div>

                        {/* BANK */}
                        <div className={activeTab === 'bank' ? 'block' : 'hidden'}>
                            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><Landmark className="text-lekhya-primary" /> Bank Information</h2>
                            <div className="grid grid-cols-2 gap-6 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Bank Name</label>
                                    <input name="bankName" value={formData.bankName} onChange={handleChange} className="lekhya-input w-full" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Account Number</label>
                                    <input name="accountNumber" value={formData.accountNumber} onChange={handleChange} className="lekhya-input w-full" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">IFSC Code</label>
                                    <input name="ifscCode" value={formData.ifscCode} onChange={handleChange} className="lekhya-input w-full uppercase" />
                                </div>
                            </div>
                        </div>

                        {/* FOOTER ACTION */}
                        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 shadow-lg z-20 flex justify-end gap-4">
                            <Link href="/masters/payroll-info/employees" className="px-6 py-2 text-slate-600 font-bold hover:bg-slate-50 rounded">
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-lekhya-primary text-white px-8 py-2 font-bold rounded hover:bg-blue-800 disabled:opacity-50 flex items-center gap-2"
                            >
                                <Save className="w-4 h-4" /> {loading ? 'Saving...' : 'Save Employee'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
