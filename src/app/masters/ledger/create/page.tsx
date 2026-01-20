'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// import { useAppStore } from '@/lib/store'; // Removed mock store
import { cn } from '@/lib/utils';

export default function LedgerCreatePage() {
    const router = useRouter();
    // const { groups, createLedger } = useAppStore(); // Removed mock store

    // Local State
    const [groups, setGroups] = useState<any[]>([]); // Fetch from API
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        parentGroup: '', // ID
        openingBalance: 0,
        type: 'Asset', // Changed from 'Dr' to match dropdown options
        mailingName: '',
        address: '',
        state: '',
        pincode: '',
        pan: '',

        gstin: '',
        isCostCenterEnabled: false
    });

    // Refs for keyboard navigation
    const nameRef = useRef<HTMLInputElement>(null);
    const groupRef = useRef<HTMLSelectElement>(null);
    const opBalRef = useRef<HTMLInputElement>(null);

    // Fetch Groups (Accounts acting as groups) on mount
    useEffect(() => {
        const fetchGroups = async () => {
            try {
                // For now, fetch all accounts. In real app, filter by isGroup=true
                const res = await fetch('/api/accounts');
                if (res.ok) {
                    const data = await res.json();
                    setGroups(data);
                }
            } catch (error) {
                console.error('Failed to fetch groups', error);
            }
        };
        fetchGroups();
        nameRef.current?.focus();
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent, nextRef?: React.RefObject<any>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            nextRef?.current?.focus();
        }
    };

    const handleSubmit = async () => {
        if (!formData.name) {
            alert('Name is required');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/accounts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.status === 401) {
                alert('Session expired. Please log in again.');
                router.push('/login');
                return;
            }

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to create ledger');
            }

            // Success - Navigate to ledger list
            alert('Ledger Created Successfully!');
            router.push('/masters/ledger/display');

        } catch (error: any) {
            alert(`Error: ${error.message || 'Failed to create ledger'}`);
            console.error('Ledger creation error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-lekhya-base font-sans text-sm">
            {/* Top Header Strip */}
            <div className="bg-[#1E293B] text-white px-4 py-1 flex justify-between items-center text-xs">
                <span>LekhyaAI Enterprise</span>
                <span>Ctrl+M: Main Menu</span>
            </div>

            {/* Title Bar */}
            <div className="lekhya-header shadow-lg">
                <h1 className="font-bold tracking-wider uppercase">Ledger Creation</h1>
                <div className="text-lekhya-accent text-xs bg-white/10 px-2 py-1 rounded">
                    Masters {'>'} Ledgers {'>'} Create
                </div>
            </div>

            {/* Main Form Area */}
            <div className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-4xl mx-auto grid grid-cols-2 gap-12 bg-white p-8 shadow-sm border border-gray-200 rounded">

                    {/* Left Column: Core Info */}
                    <div className="space-y-6">
                        <div className="grid grid-cols-[100px_1fr] gap-4 items-center">
                            <label className="text-slate-600 font-bold required-label">Name</label>
                            <input
                                ref={nameRef}
                                type="text"
                                className="lekhya-input"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                onKeyDown={(e) => handleKeyDown(e, groupRef)}
                                disabled={loading}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-[100px_1fr] gap-4 items-center">
                            <label className="text-slate-600 required-label">Type/Group</label>
                            <select
                                ref={groupRef}
                                className="lekhya-input uppercase"
                                value={formData.type} // Using type directly for now since we don't have nested groups yet
                                onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                                onKeyDown={(e) => handleKeyDown(e, opBalRef)}
                            >
                                <option value="Asset">Asset</option>
                                <option value="Liability">Liability</option>
                                <option value="Equity">Equity</option>
                                <option value="Revenue">Revenue</option>
                                <option value="Expense">Expense</option>
                            </select>
                        </div>
                    </div>

                    {/* Right Column: Mailing Details */}
                    <div className="space-y-6 border-l border-gray-100 pl-8">
                        <h3 className="text-slate-400 text-xs font-bold uppercase mb-4 border-b border-gray-200 pb-1">Mailing Details</h3>

                        <div className="grid grid-cols-[100px_1fr] gap-4 items-center">
                            <label className="text-slate-600">Name</label>
                            <input
                                type="text"
                                className="lekhya-input text-gray-500"
                                placeholder="(Same as Ledger Name)"
                                value={formData.mailingName}
                                onChange={e => setFormData({ ...formData, mailingName: e.target.value })}
                            />
                        </div>

                        {/* Simplified for brevity in Phase 3 */}

                    </div>
                </div>

                {/* Footer Section: Opening Balance */}
                <div className="mt-8 pt-6 border-t border-gray-200 max-w-4xl mx-auto">
                    <div className="bg-slate-50 p-4 border border-gray-200 rounded flex justify-end">
                        <div className="flex items-center gap-4">
                            <label className="text-slate-700 font-bold">Opening Balance</label>
                            <div className="flex items-center gap-2 bg-white px-2 border border-gray-300 rounded shadow-sm">
                                <span className="text-gray-400 font-mono">₹</span>
                                <input
                                    ref={opBalRef}
                                    type="number"
                                    className="outline-none px-2 py-1 w-32 text-right font-bold text-slate-800"
                                    value={formData.openingBalance || ''}
                                    onChange={e => setFormData({ ...formData, openingBalance: Number(e.target.value) })}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleSubmit();
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Controls - Made Sticky */}
            <div className="bg-white border-t border-gray-200 px-6 py-3 flex justify-between items-center text-xs font-bold text-slate-600 sticky bottom-0 shadow-lg z-10">
                <button onClick={() => router.back()} className="px-4 py-2 hover:bg-slate-100 rounded border border-gray-300 transition-all">
                    Cancel
                </button>
                <div className="flex gap-4">
                    <span className="text-gray-400 self-center">Esc: Quit | Enter: Accept</span>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-6 py-2 bg-green-600 text-white rounded shadow-sm hover:bg-green-700 transition-all disabled:opacity-50 font-bold"
                    >
                        {loading ? 'Creating...' : '✓ Create Ledger'}
                    </button>
                </div>
            </div>
        </div>
    );
}
