'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { Building2, Save, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

import { useSearchParams } from 'next/navigation';

import { useGlobalAction } from '@/context/GlobalActionContext';
import { useEffect } from 'react';
import { fetchPincodeDetails, validateGSTIN, extractPANFromGSTIN } from '@/lib/smart-utils';

function CompanySetupContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const mode = searchParams.get('mode');

    const { createCompany, updateCompany, company } = useAppStore();
    const { registerSaveAction, unregisterSaveAction } = useGlobalAction();
    const [loading, setLoading] = useState(false);

    // Initial State Logic
    const isCreateMode = mode === 'create' || !company;

    const [formData, setFormData] = useState({
        id: (!isCreateMode && company?.id) ? company.id : '', // Preserve ID for updates
        name: (!isCreateMode && company?.name) ? company.name : '',
        gstin: (!isCreateMode && company?.gstin) ? company.gstin : '',
        pan: (!isCreateMode && company?.pan) ? company.pan : '',
        address: (!isCreateMode && company?.address) ? company.address : '',
        city: (!isCreateMode && company?.city) ? company.city : '',
        state: (!isCreateMode && company?.state) ? company.state : '',
        pincode: (!isCreateMode && company?.pincode) ? company.pincode : '',
        email: (!isCreateMode && company?.email) ? company.email : '',
        phone: (!isCreateMode && company?.phone) ? company.phone : '',
        financialYearStart: (!isCreateMode && company?.financialYearStart) ? company.financialYearStart : new Date().getFullYear() + '-04-01',
        financialYearEnd: (!isCreateMode && company?.financialYearEnd) ? company.financialYearEnd : (new Date().getFullYear() + 1) + '-03-31',
        booksBeginFrom: (!isCreateMode && company?.booksBeginFrom) ? company.booksBeginFrom : new Date().getFullYear() + '-04-01',
    });

    const handleSaveLogic = async () => {
        setLoading(true);
        try {
            // Determine method and URL based on mode
            const method = isCreateMode ? 'POST' : 'PUT';
            const res = await fetch('/api/setup/company', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!res.ok) throw new Error('Failed to save company profile');

            const savedData = await res.json();

            // Update local store as well
            if (isCreateMode) {
                createCompany(savedData);
            } else {
                updateCompany(savedData);
            }

            // Redirect after successful save
            router.push('/');
        } catch (error) {
            console.error(error);
            alert('Failed to save company profile');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await handleSaveLogic();
    };

    // Register global save action
    useEffect(() => {
        registerSaveAction(handleSaveLogic);
        return () => unregisterSaveAction();
    }, [registerSaveAction, unregisterSaveAction, formData, isCreateMode]);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 h-16 flex items-center px-6">
                <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm font-medium">Back to Dashboard</span>
                </Link>
            </header>

            <div className="flex-1 p-6 md:p-12 max-w-3xl mx-auto w-full">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-900">Setup Company Profile</h1>
                    <p className="text-slate-500 mt-2">Enter your business details to configure invoices and reports.</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-8 space-y-6">

                        {/* Basic Info */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 flex items-center gap-2">
                                <Building2 className="w-4 h-4" /> Business Details
                            </h3>

                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Company Name *</label>
                                    <input
                                        required
                                        type="text"
                                        className="input"
                                        placeholder="e.g. Acme Industries Pvt Ltd"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">GSTIN</label>
                                    <input
                                        type="text"
                                        className="input uppercase"
                                        placeholder="29AAAAA0000A1Z5"
                                        value={formData.gstin}
                                        maxLength={15}
                                        onChange={e => {
                                            const val = e.target.value.toUpperCase();
                                            const updates: any = { gstin: val };
                                            // Smart: Extract PAN
                                            if (val.length >= 10) {
                                                const pan = extractPANFromGSTIN(val);
                                                if (pan) updates.pan = pan;
                                            }
                                            setFormData(prev => ({ ...prev, ...updates }));
                                        }}
                                    />
                                    {formData.gstin.length === 15 && !validateGSTIN(formData.gstin) && (
                                        <p className="text-red-500 text-xs mt-1">Invalid GSTIN Format</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">PAN</label>
                                    <input
                                        type="text"
                                        className="input uppercase"
                                        placeholder="AAAAA0000A"
                                        value={formData.pan}
                                        maxLength={10}
                                        onChange={e => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-slate-100 pt-6 space-y-4">
                            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Contact & Address</h3>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                                <textarea
                                    className="input min-h-[80px]"
                                    placeholder="Street address"
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Pincode</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={formData.pincode}
                                        maxLength={6}
                                        placeholder="e.g. 560001"
                                        onChange={async (e) => {
                                            const val = e.target.value.replace(/\D/g, ''); // Numbers only
                                            setFormData(prev => ({ ...prev, pincode: val }));

                                            // Smart: Fetch City/State
                                            if (val.length === 6) {
                                                const details = await fetchPincodeDetails(val);
                                                if (details) {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        pincode: val,
                                                        city: details.city,
                                                        state: details.state
                                                    }));
                                                }
                                            }
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={formData.city}
                                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={formData.state}
                                        onChange={e => setFormData({ ...formData, state: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        className="input"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                                    <input
                                        type="tel"
                                        className="input"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Financial Period Section */}
                    <div className="border-t border-slate-100 pt-6 space-y-4">
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 flex items-center gap-2">
                            <span className="text-lekhya-accent">📅</span> Financial Period & Partitioning
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-yellow-50/50 p-4 rounded-lg border border-yellow-100">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Financial Year Begins From</label>
                                <input
                                    type="date"
                                    required
                                    className="input font-mono"
                                    value={formData.financialYearStart as string}
                                    onChange={e => {
                                        const newDate = e.target.value;
                                        const dateObj = new Date(newDate);
                                        const year = dateObj.getFullYear();
                                        const end = `${year + 1}-03-31`; // Auto-calc end date

                                        setFormData(prev => ({
                                            ...prev,
                                            financialYearStart: newDate,
                                            financialYearEnd: end,
                                            // Auto-sync books begin unless user changed it separately (simple logic: sync both)
                                            booksBeginFrom: newDate
                                        }));
                                    }}
                                />
                                <p className="text-[10px] text-slate-400 mt-1">Data partition starts from this date.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Books Begin From</label>
                                <input
                                    type="date"
                                    required
                                    className="input font-mono"
                                    value={formData.booksBeginFrom as string}
                                    onChange={e => setFormData({ ...formData, booksBeginFrom: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Auto-Calculated Assessment Year */}
                        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded border border-slate-200">
                            <span className="text-xs font-bold text-slate-600 uppercase">Assessment Year (Calculated)</span>
                            <span className="font-mono font-bold text-lekhya-primary">
                                {(() => {
                                    if (!formData.financialYearStart) return '-';
                                    const year = new Date(formData.financialYearStart).getFullYear();
                                    return `${year}-${year + 1}`;
                                })()}
                            </span>
                        </div>
                    </div>

                    <div className="bg-slate-50 px-8 py-4 border-t border-slate-200 flex justify-end gap-3">
                        <Link href="/" className="btn btn-secondary">
                            Cancel
                        </Link>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : (
                                <>
                                    <Save className="w-4 h-4" /> Save Company Profile
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function CompanySetupPage() {
    return (
        <Suspense fallback={<div>Loading Company Setup...</div>}>
            <CompanySetupContent />
        </Suspense>
    );
}
