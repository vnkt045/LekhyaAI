'use client';

import { useState, useEffect } from 'react';
import { Shield, Key, Plus, CheckCircle, Copy } from 'lucide-react';

export default function OwnerDashboard() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [licenses, setLicenses] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Quick & Dirty Auth
    const checkAuth = () => {
        if (password === 'LekhyaOwner2026') {
            setIsAuthenticated(true);
            fetchLicenses();
        } else {
            alert('Invalid Password');
        }
    };

    const fetchLicenses = async () => {
        try {
            const res = await fetch('/api/owner/license');
            if (res.ok) {
                setLicenses(await res.json());
            }
        } catch (e) {
            console.error(e);
        }
    };

    const generateLicense = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const form = e.target as HTMLFormElement;
        const clientName = (form.elements.namedItem('clientName') as HTMLInputElement).value;
        const plan = (form.elements.namedItem('plan') as HTMLSelectElement).value;

        try {
            const res = await fetch('/api/owner/license', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clientName, plan })
            });

            if (res.ok) {
                await fetchLicenses();
                form.reset();
            } else {
                alert('Failed to generate license');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('License copied!');
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
                <div className="bg-slate-800 p-8 rounded-lg shadow-xl w-96">
                    <div className="flex justify-center mb-6">
                        <Shield className="w-12 h-12 text-lekhya-accent" />
                    </div>
                    <h1 className="text-xl font-bold text-center mb-6">Owner Access</h1>
                    <input
                        type="password"
                        placeholder="Enter Owner Password"
                        className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 mb-4 text-white placeholder-slate-400"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && checkAuth()}
                    />
                    <button
                        onClick={checkAuth}
                        className="w-full bg-lekhya-accent text-slate-900 font-bold py-2 rounded hover:bg-yellow-400"
                    >
                        Access Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans p-8">
            <header className="mb-8 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Shield className="w-8 h-8 text-slate-800" />
                    License Management
                </h1>
                <button onClick={() => setIsAuthenticated(false)} className="text-sm text-red-500 hover:text-red-700 underline">Logout</button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Generator */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Plus className="w-5 h-5 text-green-600" />
                            Generate New License
                        </h2>
                        <form onSubmit={generateLicense} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1">Client Name</label>
                                <input name="clientName" required className="w-full border p-2 rounded" placeholder="e.g. Acme Corp" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Plan Configuration</label>
                                <select name="plan" className="w-full border p-2 rounded">
                                    <option value="PRO">Pro License</option>
                                    <option value="ENTERPRISE">Enterprise (Unlimted)</option>
                                </select>
                            </div>
                            <button disabled={loading} className="w-full bg-slate-800 text-white font-bold py-2 rounded hover:bg-slate-700 disabled:opacity-50">
                                {loading ? 'Generating...' : 'Create License Key'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* List */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                        <div className="bg-slate-100 px-6 py-4 border-b border-slate-200">
                            <h2 className="font-bold text-slate-700">Active Licenses ({licenses.length})</h2>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {licenses.map(lic => (
                                <div key={lic.id} className="p-4 hover:bg-slate-50 flex items-center justify-between">
                                    <div>
                                        <div className="font-bold text-slate-800">{lic.clientName}</div>
                                        <div className="text-xs text-slate-500 font-mono mt-1">{lic.key}</div>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${lic.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {lic.status}
                                            </span>
                                            <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                                {lic.plan}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(lic.key)}
                                        className="text-slate-400 hover:text-slate-600 p-2"
                                        title="Copy Key"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            {licenses.length === 0 && (
                                <div className="p-8 text-center text-slate-400">No licenses generated yet.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
