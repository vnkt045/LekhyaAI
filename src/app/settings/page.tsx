'use client';

import { useState, useEffect } from 'react';
import { Save, Settings as SettingsIcon, Building, FileText, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        gstin: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        email: '',
        phone: '',
        financialYearStart: new Date().toISOString().split('T')[0],
        financialYearEnd: new Date().toISOString().split('T')[0],
        voucherPrefix: 'VCH',
        isAutoNumbering: true,
        dateFormat: 'DD-MM-YYYY'
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings');
            if (res.ok) {
                const data = await res.json();
                if (data.id) { // If data exists
                    setFormData({
                        ...data,
                        financialYearStart: data.financialYearStart ? new Date(data.financialYearStart).toISOString().split('T')[0] : '',
                        financialYearEnd: data.financialYearEnd ? new Date(data.financialYearEnd).toISOString().split('T')[0] : '',
                    });
                }
            }
        } catch (error) {
            console.error('Failed to fetch settings', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                alert('Settings saved successfully!');
            } else {
                throw new Error('Failed to save');
            }
        } catch (error) {
            console.error(error);
            alert('Failed to save settings.');
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    if (loading) return <div className="p-10 text-center text-slate-500">Loading Settings...</div>;

    return (
        <div className="min-h-screen bg-lekhya-base font-sans">
            {/* Simple Header for Settings Page (or reuse GlobalHeader if wrapped in layout) */}
            {/* Assuming GlobalHeader is in Layout, so we focus on Content */}

            <div className="p-6 max-w-5xl mx-auto">
                <header className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-lekhya-primary flex items-center gap-2">
                            <SettingsIcon className="w-8 h-8" />
                            System Configuration
                        </h1>
                        <p className="text-slate-500 mt-1">Manage company details, financial year, and numbering preferences.</p>
                    </div>
                </header>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Company Details Section */}
                    <section className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                            <Building className="w-5 h-5 text-lekhya-primary" />
                            <h2 className="font-bold text-lekhya-primary">Company Details</h2>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Company Name</label>
                                <input name="name" value={formData.name} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 focus:ring-2 focus:ring-lekhya-primary focus:border-transparent" required />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">GSTIN</label>
                                <input name="gstin" value={formData.gstin || ''} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 uppercase focus:ring-2 focus:ring-lekhya-primary focus:border-transparent" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Address</label>
                                <input name="address" value={formData.address || ''} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 focus:ring-2 focus:ring-lekhya-primary focus:border-transparent" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">City</label>
                                <input name="city" value={formData.city || ''} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 focus:ring-2 focus:ring-lekhya-primary focus:border-transparent" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Pincode</label>
                                <input name="pincode" value={formData.pincode || ''} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 focus:ring-2 focus:ring-lekhya-primary focus:border-transparent" />
                            </div>
                        </div>
                    </section>

                    {/* Financial Year & Dates */}
                    <section className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-lekhya-primary" />
                            <h2 className="font-bold text-lekhya-primary">Financial Year</h2>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Financial Year From</label>
                                <input type="date" name="financialYearStart" value={formData.financialYearStart} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2" required />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Books Beginning From</label>
                                <input type="date" name="financialYearEnd" value={formData.financialYearEnd} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2" required />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Date Format (Display Only)</label>
                                <select name="dateFormat" value={formData.dateFormat} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2">
                                    <option value="DD-MM-YYYY">DD-MM-YYYY (31-12-2024)</option>
                                    <option value="MM-DD-YYYY">MM-DD-YYYY (12-31-2024)</option>
                                    <option value="YYYY-MM-DD">YYYY-MM-DD (2024-12-31)</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* Voucher Configuration */}
                    <section className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-lekhya-primary" />
                            <h2 className="font-bold text-lekhya-primary">Voucher Configuration</h2>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                            <div>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="isAutoNumbering"
                                        checked={formData.isAutoNumbering}
                                        onChange={handleChange}
                                        className="w-5 h-5 text-lekhya-primary rounded border-slate-300 focus:ring-lekhya-primary"
                                    />
                                    <div>
                                        <span className="block font-semibold text-slate-700">Automatic Voucher Numbering</span>
                                        <span className="text-xs text-slate-500">System will generate unique sequential numbers.</span>
                                    </div>
                                </label>
                            </div>

                            <div className={!formData.isAutoNumbering ? 'opacity-50 pointer-events-none' : ''}>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Voucher Prefix</label>
                                <input
                                    name="voucherPrefix"
                                    value={formData.voucherPrefix}
                                    onChange={handleChange}
                                    className="w-full border border-slate-300 rounded px-3 py-2 uppercase placeholder-slate-400"
                                    placeholder="e.g. VCH, INV, BILL"
                                    disabled={!formData.isAutoNumbering}
                                />
                                <p className="text-xs text-slate-500 mt-1">Example Result: {formData.voucherPrefix}-010124000001</p>
                            </div>
                        </div>
                    </section>

                    {/* System Diagnostics */}
                    <section className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                            <Building className="w-5 h-5 text-lekhya-primary" />
                            {/* Reusing Building icon, or import Shield/Activity if available. 
                               SettingsIcon imported at top is mapped to 'lucide-react' Settings.
                               Let's use SettingsIcon or FileText if Shield not imported.
                            */}
                            <h2 className="font-bold text-lekhya-primary">System Diagnostics & Export</h2>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-slate-800">System Integrity Report Card</h3>
                                    <p className="text-sm text-slate-500">View detailed health status of modules and export technical audit PDF.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => router.push('/settings/system-report')}
                                    className="px-4 py-2 border border-lekhya-primary text-lekhya-primary rounded hover:bg-slate-50 transition-colors"
                                >
                                    View & Export Report
                                </button>
                            </div>
                        </div>
                    </section>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-lekhya-accent text-lekhya-primary font-bold px-8 py-3 rounded hover:bg-yellow-400 transition-colors shadow-sm flex items-center gap-2"
                        >
                            {saving ? 'Saving...' : <><Save className="w-5 h-5" /> Save Configuration</>}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
