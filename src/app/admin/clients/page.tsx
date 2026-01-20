'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Search, Plus, Eye, Edit, Trash2, CheckCircle, XCircle, Clock, Key, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Client {
    id: string;
    companyName: string;
    gstin?: string;
    pan?: string;
    email: string;
    phone: string;
    subscriptionPlan: string;
    licenseKey?: string;
    licenseStatus: string;
    kycStatus: string;
    status: string;
    createdAt: string;
}

export default function ClientsListPage() {
    const router = useRouter();
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const res = await fetch('/api/admin/clients');
            if (res.ok) {
                const data = await res.json();
                setClients(data);
            }
        } catch (error) {
            console.error('Failed to fetch clients:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const colors = {
            ACTIVE: 'bg-green-100 text-green-800',
            SUSPENDED: 'bg-red-100 text-red-800',
            TRIAL: 'bg-yellow-100 text-yellow-800',
        };
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    const getKYCBadge = (status: string) => {
        const colors = {
            VERIFIED: 'bg-green-100 text-green-800',
            PENDING: 'bg-yellow-100 text-yellow-800',
            REJECTED: 'bg-red-100 text-red-800',
        };
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    const filteredClients = clients.filter(client =>
        client.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.gstin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.pan?.toLowerCase().includes(searchTerm.toLowerCase())
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
                            <h1 className="text-2xl font-bold text-gray-900">Client Management</h1>
                            <p className="text-sm text-gray-600 mt-1">Manage all client accounts</p>
                        </div>
                        <Link
                            href="/admin/clients/create"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Add Client
                        </Link>
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
                            placeholder="Search by company name, email, GSTIN, or PAN..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>

                {/* Clients Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <p className="text-gray-600 mt-4">Loading clients...</p>
                        </div>
                    ) : filteredClients.length === 0 ? (
                        <div className="p-12 text-center">
                            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-600">No clients found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Company</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">GSTIN</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">PAN</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Plan</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">License</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">KYC</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredClients.map((client) => (
                                        <tr key={client.id} className="hover:bg-blue-50/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-medium text-gray-900">{client.companyName}</p>
                                                    <p className="text-xs text-gray-500">{client.email}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <code className="text-xs bg-gray-100 px-2 py-1 rounded">{client.gstin || 'N/A'}</code>
                                            </td>
                                            <td className="px-6 py-4">
                                                <code className="text-xs bg-gray-100 px-2 py-1 rounded">{client.pan || 'N/A'}</code>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-block px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-bold">
                                                    {client.subscriptionPlan}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {client.licenseKey ? (
                                                    <div className="flex items-center gap-2">
                                                        <Key className="w-4 h-4 text-green-600" />
                                                        <code className="text-xs text-gray-600">{client.licenseKey.substring(0, 8)}...</code>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400">Not generated</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${getKYCBadge(client.kycStatus)}`}>
                                                    {client.kycStatus}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${getStatusBadge(client.status)}`}>
                                                    {client.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={`/admin/clients/${client.id}`}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-4 h-4" />
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
