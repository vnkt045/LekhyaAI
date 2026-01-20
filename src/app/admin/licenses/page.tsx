'use client';

import { useState, useEffect } from 'react';
import { Key, Copy, RefreshCw, CheckCircle, XCircle, ArrowLeft, Search } from 'lucide-react';
import Link from 'next/link';

interface License {
    id: string;
    companyName: string;
    licenseKey: string;
    subscriptionPlan: string;
    licenseStatus: string;
    subscriptionStart: string;
    subscriptionEnd?: string;
    createdAt: string;
}

export default function LicensesPage() {
    const [licenses, setLicenses] = useState<License[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [copiedKey, setCopiedKey] = useState('');

    useEffect(() => {
        fetchLicenses();
    }, []);

    const fetchLicenses = async () => {
        try {
            const res = await fetch('/api/admin/licenses');
            if (res.ok) {
                const data = await res.json();
                setLicenses(data);
            }
        } catch (error) {
            console.error('Failed to fetch licenses:', error);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (key: string) => {
        navigator.clipboard.writeText(key);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(''), 2000);
    };

    const getStatusBadge = (status: string) => {
        const colors = {
            ACTIVE: 'bg-green-100 text-green-800',
            SUSPENDED: 'bg-red-100 text-red-800',
            EXPIRED: 'bg-gray-100 text-gray-800',
        };
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    const filteredLicenses = licenses.filter(license =>
        license.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        license.licenseKey.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/dashboard" className="p-2 hover:bg-gray-100 rounded-lg">
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </Link>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-gray-900">License Key Management</h1>
                            <p className="text-sm text-gray-600 mt-1">View and manage all license keys</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Search */}
                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by company name or license key..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                    </div>
                </div>

                {/* Licenses Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                            <p className="text-gray-600 mt-4">Loading licenses...</p>
                        </div>
                    ) : filteredLicenses.length === 0 ? (
                        <div className="p-12 text-center">
                            <Key className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-600">No licenses found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Company</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">License Key</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Plan</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Valid Until</th>
                                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredLicenses.map((license) => (
                                        <tr key={license.id} className="hover:bg-green-50/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="font-medium text-gray-900">{license.companyName}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <code className="text-sm bg-gray-100 px-3 py-1 rounded font-mono">
                                                        {license.licenseKey}
                                                    </code>
                                                    <button
                                                        onClick={() => copyToClipboard(license.licenseKey)}
                                                        className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                                                        title="Copy to clipboard"
                                                    >
                                                        {copiedKey === license.licenseKey ? (
                                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                                        ) : (
                                                            <Copy className="w-4 h-4 text-gray-400" />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-block px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-bold">
                                                    {license.subscriptionPlan}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${getStatusBadge(license.licenseStatus)}`}>
                                                    {license.licenseStatus}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-600">
                                                    {license.subscriptionEnd
                                                        ? new Date(license.subscriptionEnd).toLocaleDateString()
                                                        : 'Perpetual'
                                                    }
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                        title="Regenerate Key"
                                                    >
                                                        <RefreshCw className="w-4 h-4" />
                                                    </button>
                                                    <Link
                                                        href={`/admin/clients/${license.id}`}
                                                        className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                    >
                                                        View Client
                                                    </Link>
                                                </div>
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
    );
}
