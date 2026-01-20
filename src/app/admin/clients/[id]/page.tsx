'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Building2, FileText, CreditCard, Key, Users, Shield, Save, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

interface Client {
    id: string;
    companyName: string;
    tradeName?: string;
    pan?: string;
    gstin?: string;
    tan?: string;
    cin?: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    businessType: string;
    subscriptionPlan: string;
    subscriptionStart: string;
    subscriptionEnd?: string;
    maxUsers: number;
    enabledModules: string;
    licenseKey?: string;
    licenseStatus: string;
    kycStatus: string;
    kycVerifiedAt?: string;
    kycVerifiedBy?: string;
    status: string;
}

export default function ClientDetailPage() {
    const params = useParams();
    const clientId = params.id as string;
    const router = useRouter();
    const [client, setClient] = useState<Client | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('info');

    useEffect(() => {
        if (clientId) {
            fetchClient();
        }
    }, [clientId]);

    const fetchClient = async () => {
        try {
            const res = await fetch(`/api/admin/clients/${clientId}`);
            if (res.ok) {
                const data = await res.json();
                setClient(data);
            }
        } catch (error) {
            console.error('Failed to fetch client:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveKYC = async () => {
        try {
            const res = await fetch(`/api/admin/clients/${clientId}/kyc/approve`, {
                method: 'POST',
            });
            if (res.ok) {
                fetchClient();
                alert('KYC approved successfully!');
            }
        } catch (error) {
            alert('Failed to approve KYC');
        }
    };

    const handleRejectKYC = async () => {
        try {
            const res = await fetch(`/api/admin/clients/${clientId}/kyc/reject`, {
                method: 'POST',
            });
            if (res.ok) {
                fetchClient();
                alert('KYC rejected');
            }
        } catch (error) {
            alert('Failed to reject KYC');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!client) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <p className="text-gray-600">Client not found</p>
            </div>
        );
    }

    const tabs = [
        { id: 'info', label: 'Basic Info', icon: Building2 },
        { id: 'kyc', label: 'KYC Details', icon: FileText },
        { id: 'subscription', label: 'Subscription', icon: CreditCard },
        { id: 'license', label: 'License', icon: Key },
        { id: 'users', label: 'Users & RBAC', icon: Users },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/clients" className="p-2 hover:bg-gray-100 rounded-lg">
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </Link>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-gray-900">{client.companyName}</h1>
                            <p className="text-sm text-gray-600 mt-1">{client.email}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${client.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                            {client.status}
                        </span>
                    </div>
                </div>
            </header>

            {/* Tabs */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex gap-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${activeTab === tab.id
                                    ? 'border-blue-600 text-blue-600 font-medium'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {activeTab === 'info' && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-6">Company Information</h2>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Company Name</label>
                                <p className="text-gray-900">{client.companyName}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Trade Name</label>
                                <p className="text-gray-900">{client.tradeName || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                                <p className="text-gray-900">{client.email}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
                                <p className="text-gray-900">{client.phone}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Business Type</label>
                                <p className="text-gray-900">{client.businessType}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Address</label>
                                <p className="text-gray-900">{client.address}, {client.city}, {client.state} - {client.pincode}</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'kyc' && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-gray-900">KYC Details</h2>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${client.kycStatus === 'VERIFIED' ? 'bg-green-100 text-green-800' :
                                client.kycStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                {client.kycStatus}
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">PAN</label>
                                <code className="block bg-gray-100 px-3 py-2 rounded">{client.pan || 'Not provided'}</code>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">GSTIN</label>
                                <code className="block bg-gray-100 px-3 py-2 rounded">{client.gstin || 'Not provided'}</code>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">TAN</label>
                                <code className="block bg-gray-100 px-3 py-2 rounded">{client.tan || 'Not provided'}</code>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">CIN</label>
                                <code className="block bg-gray-100 px-3 py-2 rounded">{client.cin || 'Not provided'}</code>
                            </div>
                        </div>

                        {client.kycStatus === 'PENDING' && (
                            <div className="flex gap-3 pt-4 border-t border-gray-200">
                                <button
                                    onClick={handleApproveKYC}
                                    className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex items-center gap-2"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    Approve KYC
                                </button>
                                <button
                                    onClick={handleRejectKYC}
                                    className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 flex items-center gap-2"
                                >
                                    <XCircle className="w-4 h-4" />
                                    Reject KYC
                                </button>
                            </div>
                        )}

                        {client.kycVerifiedAt && (
                            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-sm text-green-800">
                                    Verified on {new Date(client.kycVerifiedAt).toLocaleDateString()}
                                    {client.kycVerifiedBy && ` by ${client.kycVerifiedBy}`}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'subscription' && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-6">Subscription Details</h2>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Plan</label>
                                <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded font-bold">
                                    {client.subscriptionPlan}
                                </span>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Max Users</label>
                                <p className="text-gray-900">{client.maxUsers}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Start Date</label>
                                <p className="text-gray-900">{new Date(client.subscriptionStart).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">End Date</label>
                                <p className="text-gray-900">
                                    {client.subscriptionEnd ? new Date(client.subscriptionEnd).toLocaleDateString() : 'Perpetual'}
                                </p>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-600 mb-2">Enabled Modules</label>
                                <div className="flex flex-wrap gap-2">
                                    {JSON.parse(client.enabledModules).map((module: string) => (
                                        <span key={module} className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                                            {module}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'license' && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-6">License Key</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-2">License Key</label>
                                <div className="flex items-center gap-3">
                                    <code className="flex-1 bg-gray-100 px-4 py-3 rounded font-mono text-lg">
                                        {client.licenseKey || 'Not generated'}
                                    </code>
                                    {client.licenseKey && (
                                        <button
                                            onClick={() => navigator.clipboard.writeText(client.licenseKey!)}
                                            className="px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
                                        >
                                            Copy
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                                <span className={`inline-block px-3 py-1 rounded font-bold ${client.licenseStatus === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                    {client.licenseStatus}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-gray-900">Users & RBAC</h2>
                            <Link
                                href={`/admin/clients/${clientId}/users/rbac`}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 flex items-center gap-2"
                            >
                                <Shield className="w-4 h-4" />
                                Configure RBAC
                            </Link>
                        </div>
                        <p className="text-gray-600">User management and per-user RBAC configuration will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
