'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, Edit } from 'lucide-react';
import Link from 'next/link';

export default function DisplayLedgerPage() {
    const router = useRouter();
    const [accounts, setAccounts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            const res = await fetch('/api/accounts');
            if (res.ok) {
                const data = await res.json();
                setAccounts(data);
            }
        } catch (error) {
            console.error('Failed to fetch accounts', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredAccounts = accounts.filter(acc =>
        acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        acc.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col h-screen bg-lekhya-base">
            <div className="lekhya-header z-10">
                <div className="flex items-center gap-4">
                    <Link href="/masters/ledger" className="hover:bg-white/10 p-1.5 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-lekhya-accent" />
                    </Link>
                    <h1 className="font-bold text-lg tracking-wide">LekhyaAI <span className="text-gray-400 text-sm font-normal">/ Masters / Ledgers / Display</span></h1>
                </div>
            </div>

            <div className="flex-1 p-8 overflow-auto">
                <div className="max-w-6xl mx-auto">
                    <div className="bg-white rounded-sm shadow-sm border border-gray-200">
                        <div className="p-4 border-b border-gray-200 bg-lekhya-dark text-white">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-bold">All Ledgers</h2>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search ledgers..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 pr-4 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-lekhya-accent outline-none text-gray-800"
                                    />
                                </div>
                            </div>
                        </div>

                        {loading ? (
                            <div className="p-12 text-center text-gray-500">Loading ledgers...</div>
                        ) : filteredAccounts.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">
                                {searchTerm ? 'No ledgers found matching your search.' : 'No ledgers created yet.'}
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Code</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Ledger Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Group</th>
                                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredAccounts.map((account) => (
                                        <tr key={account.id} className="hover:bg-blue-50/50 transition-colors">
                                            <td className="px-6 py-3 text-sm font-mono text-gray-600">{account.code}</td>
                                            <td className="px-6 py-3 text-sm font-bold text-gray-800">{account.name}</td>
                                            <td className="px-6 py-3 text-sm">
                                                <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase ${account.type === 'Asset' ? 'bg-green-100 text-green-700' :
                                                        account.type === 'Liability' ? 'bg-red-100 text-red-700' :
                                                            account.type === 'Equity' ? 'bg-purple-100 text-purple-700' :
                                                                account.type === 'Revenue' ? 'bg-blue-100 text-blue-700' :
                                                                    'bg-orange-100 text-orange-700'
                                                    }`}>
                                                    {account.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 text-sm text-gray-600">{account.group || '-'}</td>
                                            <td className="px-6 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => router.push(`/masters/ledger/alter?id=${account.id}`)}
                                                        className="text-gray-400 hover:text-blue-600 transition-colors"
                                                        title="Edit Ledger"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
