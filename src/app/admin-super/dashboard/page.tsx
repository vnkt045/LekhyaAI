'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Key, Activity, RefreshCw, Check, X, AlertCircle, Database } from 'lucide-react';
import DatabaseViewer from '@/components/DatabaseViewer';

interface Tenant {
    id: string;
    name: string;
    slug: string | null;
    email: string;
    gstin: string | null;
    licenseKey: string;
    licenseStatus: string;
    paymentStatus: string;
    userCount: number;
    voucherCount: number;
    lastLogin: string | null;
    createdAt: string;
}

interface LicenseKey {
    id: string;
    key: string;
    customerName: string;
    customerEmail: string;
    status: string;
    paymentStatus: string;
    company: { name: string } | null;
}

interface LoginActivity {
    id: string;
    userName: string;
    userEmail: string;
    companyName: string;
    loginTime: string;
    ipAddress: string;
}

export default function SuperAdminDashboard() {
    const router = useRouter();
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [licenseKeys, setLicenseKeys] = useState<LicenseKey[]>([]);
    const [activities, setActivities] = useState<LoginActivity[]>([]);
    const [loading, setLoading] = useState(true);

    // License Key Generation Form
    const [newKey, setNewKey] = useState({
        customerName: '',
        customerEmail: '',
        expiryDate: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [tenantsRes, keysRes, activityRes] = await Promise.all([
                fetch('/api/admin-super/tenants'),
                fetch('/api/admin-super/license-keys'),
                fetch('/api/admin-super/activity?limit=20')
            ]);

            if (tenantsRes.ok) {
                const data = await tenantsRes.json();
                setTenants(data.tenants || []);
            }

            if (keysRes.ok) {
                const data = await keysRes.json();
                setLicenseKeys(data.keys || []);
            }

            if (activityRes.ok) {
                const data = await activityRes.json();
                setActivities(data.activities || []);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateLicenseKey = async () => {
        if (!newKey.customerName || !newKey.customerEmail) {
            alert('Please enter customer name and email');
            return;
        }

        try {
            const res = await fetch('/api/admin-super/license-keys', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newKey)
            });

            if (res.ok) {
                alert('License key generated successfully!');
                setNewKey({ customerName: '', customerEmail: '', expiryDate: '' });
                fetchData();
            } else {
                alert('Failed to generate license key');
            }
        } catch (error) {
            console.error('Failed to generate key:', error);
            alert('Error generating license key');
        }
    };

    const updateTenantStatus = async (tenantId: string, licenseStatus: string, paymentStatus: string) => {
        try {
            const res = await fetch('/api/admin-super/tenants', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tenantId, licenseStatus, paymentStatus })
            });

            if (res.ok) {
                alert('Tenant status updated!');
                fetchData();
            } else {
                alert('Failed to update tenant');
            }
        } catch (error) {
            console.error('Failed to update tenant:', error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'text-green-600 bg-green-50';
            case 'DISABLED': return 'text-red-600 bg-red-50';
            case 'EXPIRED': return 'text-gray-600 bg-gray-50';
            case 'PAID': return 'text-green-600 bg-green-50';
            case 'OVERDUE': return 'text-orange-600 bg-orange-50';
            case 'FAILED': return 'text-red-600 bg-red-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const stats = {
        active: tenants.filter(t => t.licenseStatus === 'ACTIVE').length,
        disabled: tenants.filter(t => t.licenseStatus === 'DISABLED').length,
        overdue: tenants.filter(t => t.paymentStatus === 'OVERDUE').length
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">Super Admin Control Panel</h1>
                            <p className="text-indigo-100 mt-1">Manage tenants, licenses, and monitor activity</p>
                        </div>
                        <button
                            onClick={fetchData}
                            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Refresh
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Total Tenants</p>
                                <p className="text-3xl font-bold text-gray-900">{tenants.length}</p>
                            </div>
                            <Building2 className="w-10 h-10 text-indigo-600" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Active</p>
                                <p className="text-3xl font-bold text-green-600">{stats.active}</p>
                            </div>
                            <Check className="w-10 h-10 text-green-600" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Overdue</p>
                                <p className="text-3xl font-bold text-orange-600">{stats.overdue}</p>
                            </div>
                            <AlertCircle className="w-10 h-10 text-orange-600" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Disabled</p>
                                <p className="text-3xl font-bold text-red-600">{stats.disabled}</p>
                            </div>
                            <X className="w-10 h-10 text-red-600" />
                        </div>
                    </div>
                </div>

                {/* License Key Generator */}
                <div className="bg-white rounded-lg shadow mb-8 p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Key className="w-5 h-5 text-indigo-600" />
                        <h2 className="text-xl font-bold text-gray-900">Generate New License Key</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <input
                            type="text"
                            placeholder="Customer Name"
                            value={newKey.customerName}
                            onChange={(e) => setNewKey({ ...newKey, customerName: e.target.value })}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <input
                            type="email"
                            placeholder="Customer Email"
                            value={newKey.customerEmail}
                            onChange={(e) => setNewKey({ ...newKey, customerEmail: e.target.value })}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <input
                            type="date"
                            placeholder="Expiry Date (Optional)"
                            value={newKey.expiryDate}
                            onChange={(e) => setNewKey({ ...newKey, expiryDate: e.target.value })}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <button
                            onClick={generateLicenseKey}
                            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                        >
                            Generate Key
                        </button>
                    </div>
                </div>

                {/* Tenants Table */}
                <div className="bg-white rounded-lg shadow mb-8 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900">Tenant Management</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">License Key</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Users</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {tenants.map((tenant) => (
                                    <tr key={tenant.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-gray-900">{tenant.name}</p>
                                                <p className="text-sm text-gray-500">{tenant.email}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">{tenant.licenseKey}</code>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(tenant.licenseStatus)}`}>
                                                {tenant.licenseStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(tenant.paymentStatus)}`}>
                                                {tenant.paymentStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{tenant.userCount}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {tenant.lastLogin ? new Date(tenant.lastLogin).toLocaleString() : 'Never'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                {tenant.licenseStatus === 'ACTIVE' ? (
                                                    <button
                                                        onClick={() => updateTenantStatus(tenant.id, 'DISABLED', tenant.paymentStatus)}
                                                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                                                    >
                                                        Disable
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => updateTenantStatus(tenant.id, 'ACTIVE', tenant.paymentStatus)}
                                                        className="text-green-600 hover:text-green-800 text-sm font-medium"
                                                    >
                                                        Enable
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-indigo-600" />
                        <h2 className="text-xl font-bold text-gray-900">Recent Login Activity</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {activities.map((activity) => (
                                    <tr key={activity.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-gray-900">{activity.userName}</p>
                                                <p className="text-sm text-gray-500">{activity.userEmail}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{activity.companyName}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(activity.loginTime).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{activity.ipAddress}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Database Viewer */}
                <div className="mt-8">
                    <DatabaseViewer />
                </div>
            </div>
        </div>
    );
}
