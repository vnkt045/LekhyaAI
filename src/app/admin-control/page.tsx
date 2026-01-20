'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Server, Users, Key, Settings, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import CreateClientForm from '@/components/CreateClientForm';

interface Tenant {
    id: string;
    name: string;
    subdomain?: string;
    subscriptionPlan: string;
    maxUsers: number;
    status: string;
    licenseKey?: string;
    expiresAt?: string;
    dbInitialized: boolean;
    createdAt: string;
    provisioningJobs?: Array<{
        id: string;
        status: string;
        progress: number;
    }>;
}

export default function AdminControlPanel() {
    const router = useRouter();
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);

    useEffect(() => {
        fetchTenants();
    }, []);

    const fetchTenants = async () => {
        try {
            const res = await fetch('/api/admin/tenants');
            if (res.ok) {
                const data = await res.json();
                setTenants(data);
            }
        } catch (error) {
            console.error('Failed to fetch tenants:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'PROVISIONING':
                return <Clock className="w-5 h-5 text-blue-600 animate-spin" />;
            case 'SUSPENDED':
                return <XCircle className="w-5 h-5 text-red-600" />;
            case 'TRIAL':
                return <AlertCircle className="w-5 h-5 text-yellow-600" />;
            default:
                return <Server className="w-5 h-5 text-gray-600" />;
        }
    };

    const getPlanBadgeColor = (plan: string) => {
        switch (plan) {
            case 'ENTERPRISE':
                return 'bg-purple-100 text-purple-800';
            case 'PROFESSIONAL':
                return 'bg-blue-100 text-blue-800';
            case 'BASIC':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Admin Control Panel</h1>
                            <p className="text-sm text-gray-600 mt-1">Multi-Tenant SaaS Management</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link
                                href="/"
                                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Back to App
                            </Link>
                            <button
                                onClick={() => setShowCreateForm(true)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                New Client Instance
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Clients</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{tenants.length}</p>
                            </div>
                            <Server className="w-10 h-10 text-blue-600 opacity-20" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active</p>
                                <p className="text-3xl font-bold text-green-600 mt-2">
                                    {tenants.filter(t => t.status === 'ACTIVE').length}
                                </p>
                            </div>
                            <CheckCircle className="w-10 h-10 text-green-600 opacity-20" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Provisioning</p>
                            <p className="text-3xl font-bold text-blue-600 mt-2">
                                {tenants.filter(t => t.status === 'PROVISIONING').length}
                            </p>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Suspended</p>
                            <p className="text-3xl font-bold text-red-600 mt-2">
                                {tenants.filter(t => t.status === 'SUSPENDED').length}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tenants Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-bold text-gray-900">Client Instances</h2>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <p className="text-gray-600 mt-4">Loading clients...</p>
                        </div>
                    ) : tenants.length === 0 ? (
                        <div className="p-12 text-center">
                            <Server className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-600">No client instances yet</p>
                            <button
                                onClick={() => setShowCreateForm(true)}
                                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                            >
                                Create First Client
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Client</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Plan</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Users</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">License</th>
                                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {tenants.map((tenant) => (
                                        <tr key={tenant.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-medium text-gray-900">{tenant.name}</p>
                                                    {tenant.subdomain && (
                                                        <p className="text-xs text-gray-500">{tenant.subdomain}.lekhyaai.com</p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${getPlanBadgeColor(tenant.subscriptionPlan)}`}>
                                                    {tenant.subscriptionPlan}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(tenant.status)}
                                                    {tenant.status === 'PROVISIONING' && tenant.provisioningJobs && tenant.provisioningJobs[0] ? (
                                                        <Link
                                                            href={`/admin-control/provisioning/${tenant.provisioningJobs[0].id}`}
                                                            className="text-sm font-medium text-blue-600 hover:text-blue-800"
                                                        >
                                                            {tenant.status} ({tenant.provisioningJobs[0].progress}%)
                                                        </Link>
                                                    ) : (
                                                        <span className="text-sm font-medium text-gray-700">{tenant.status}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Users className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm text-gray-700">0 / {tenant.maxUsers}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {tenant.licenseKey ? (
                                                    <div className="flex items-center gap-2">
                                                        <Key className="w-4 h-4 text-green-600" />
                                                        <code className="text-xs text-gray-600">{tenant.licenseKey.substring(0, 12)}...</code>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400">Pending</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={`/admin-control/clients/${tenant.id}/rbac`}
                                                        className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                                                        title="Configure RBAC"
                                                    >
                                                        RBAC
                                                    </Link>
                                                    <span className="text-gray-300">|</span>
                                                    <Link
                                                        href={`/admin-control/clients/${tenant.id}`}
                                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                    >
                                                        Manage
                                                    </Link>
                                                    <Settings className="w-4 h-4 text-gray-400" />
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

            {/* Create Form Modal */}
            {showCreateForm && (
                <CreateClientForm
                    onClose={() => setShowCreateForm(false)}
                    onSuccess={() => {
                        fetchTenants();
                        setShowCreateForm(false);
                    }}
                />
            )}
        </div>
    );
}
