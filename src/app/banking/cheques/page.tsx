'use client';

import { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/utils';
import { ArrowLeft, Plus, Wallet, Book } from 'lucide-react';
import Link from 'next/link';

interface ChequeBook {
    id: string;
    name: string;
    fromNumber: number;
    toNumber: number;
    numberOfLeaves: number;
    account: {
        name: string;
    };
    _count: {
        leaves: number;
    };
}

interface Account {
    id: string;
    name: string;
}

export default function ChequeManagementPage() {
    const [books, setBooks] = useState<ChequeBook[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // Form State
    const [selectedAccount, setSelectedAccount] = useState('');
    const [fromNumber, setFromNumber] = useState('');
    const [numberOfLeaves, setNumberOfLeaves] = useState('50');
    const [bookName, setBookName] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchBooks();
        fetchAccounts();
    }, []);

    const fetchBooks = async () => {
        try {
            const res = await fetch('/api/banking/cheques');
            if (res.ok) setBooks(await res.json());
        } catch (error) {
            console.error('Failed to fetch books', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAccounts = async () => {
        try {
            // Fetch only Bank accounts (Asset + 'Bank' in name usually, or explicit type)
            // For now fetching all assets or filtering client side.
            // Ideally backend filter. Let's fetch all accounts and filter.
            const res = await fetch('/api/accounts?type=Asset');
            if (res.ok) {
                const all = await res.json();
                // Rudimentary filter for "Bank" in name or explicit Bank group logic if we had it
                // For now, let user pick any Asset (tally style flexibility)
                setAccounts(all);
            }
        } catch (error) {
            console.error('Failed to fetch accounts', error);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch('/api/banking/cheques', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    accountId: selectedAccount,
                    name: bookName,
                    fromNumber: parseInt(fromNumber),
                    numberOfLeaves: parseInt(numberOfLeaves)
                })
            });

            if (res.ok) {
                setShowForm(false);
                setBookName('');
                setFromNumber('');
                fetchBooks();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-12 text-center text-slate-500">Loading Banking Module...</div>;

    return (
        <div className="min-h-screen bg-lekhya-base p-8 font-sans flex flex-col">
            {/* Header */}
            <div className="max-w-4xl mx-auto mb-6 w-full">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/reports" className="hover:bg-slate-100 p-2 rounded-full transition-colors">
                                <ArrowLeft className="w-5 h-5 text-slate-600" />
                            </Link>
                            <div className="p-3 bg-lekhya-primary rounded-lg">
                                <Wallet className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-lekhya-primary">Cheque Management</h1>
                                <p className="text-sm text-slate-600">Track Cheque Books & Leaves</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowForm(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-lekhya-accent text-white rounded-lg hover:bg-orange-600 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            New Cheque Book
                        </button>
                    </div>
                </div>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                        <h2 className="text-lg font-bold mb-4">Add New Cheque Book</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Bank Account</label>
                                <select
                                    className="w-full border border-slate-300 rounded p-2 text-sm"
                                    value={selectedAccount}
                                    onChange={e => setSelectedAccount(e.target.value)}
                                    required
                                >
                                    <option value="">Select Bank Account</option>
                                    {accounts.map(acc => (
                                        <option key={acc.id} value={acc.id}>{acc.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">From Number</label>
                                    <input
                                        type="number"
                                        className="w-full border border-slate-300 rounded p-2 text-sm"
                                        value={fromNumber}
                                        onChange={e => setFromNumber(e.target.value)}
                                        placeholder="e.g. 100001"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Total Leaves</label>
                                    <input
                                        type="number"
                                        className="w-full border border-slate-300 rounded p-2 text-sm"
                                        value={numberOfLeaves}
                                        onChange={e => setNumberOfLeaves(e.target.value)}
                                        placeholder="50"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Book Name (Optional)</label>
                                <input
                                    type="text"
                                    className="w-full border border-slate-300 rounded p-2 text-sm"
                                    value={bookName}
                                    onChange={e => setBookName(e.target.value)}
                                    placeholder="e.g. HDFC 2024 Series A"
                                />
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm bg-lekhya-accent text-white rounded hover:bg-orange-600 disabled:opacity-50"
                                    disabled={saving}
                                >
                                    {saving ? 'Creating...' : 'Create Book'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Book List */}
            <div className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                {books.length > 0 ? (
                    books.map(book => (
                        <div key={book.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 hover:border-lekhya-accent transition-colors group cursor-pointer relative">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="bg-slate-100 p-2 rounded text-slate-500">
                                        <Book className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800">{book.name}</h3>
                                        <p className="text-xs text-slate-500">{book.account.name}</p>
                                    </div>
                                </div>
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium">Active</span>
                            </div>
                            <div className="mt-4 flex justify-between items-end border-t border-slate-100 pt-3">
                                <div className="text-sm text-slate-600">
                                    <p>Range: <span className="font-mono text-slate-900">{book.fromNumber} - {book.toNumber}</span></p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-bold text-lekhya-primary">{book.numberOfLeaves}</p>
                                    <p className="text-xs text-slate-400">Leaves</p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-2 p-12 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">
                        <Wallet className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No Cheque Books Found</p>
                        <p className="text-sm mt-1">Create your first cheque book to start tracking.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
