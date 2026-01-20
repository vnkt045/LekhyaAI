'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Shield, Check, X } from 'lucide-react';
import Link from 'next/link';

const MODULES = [
    { id: 'vouchers', name: 'Vouchers', permissions: ['create', 'read', 'update', 'delete', 'post'] },
    { id: 'accounts', name: 'Accounts', permissions: ['create', 'read', 'update', 'delete'] },
    { id: 'reports', name: 'Reports', permissions: ['read', 'export'] },
    { id: 'inventory', name: 'Inventory', permissions: ['create', 'read', 'update', 'delete', 'adjust'] },
    { id: 'payroll', name: 'Payroll', permissions: ['create', 'read', 'update', 'delete', 'process'] },
    { id: 'gst', name: 'GST', permissions: ['read', 'file', 'export'] },
    { id: 'banking', name: 'Banking', permissions: ['read', 'reconcile', 'import'] },
    { id: 'users', name: 'Users', permissions: ['create', 'read', 'update', 'delete'] },
    { id: 'settings', name: 'Settings', permissions: ['read', 'update'] },
];

const ROLES = ['admin', 'user', 'viewer'];

interface RBACConfig {
    id: string;
    tenantId: string;
    permissions: Record<string, string[]>;
}

export default function RBACConfigPage({ params }: { params: { tenantId: string } }) {
    const router = useRouter();
    const [config, setConfig] = useState<RBACConfig | null>(null);
    const [permissions, setPermissions] = useState<Record<string, Record<string, boolean>>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [tenant, setTenant] = useState<any>(null);

    useEffect(() => {
        fetchConfig();
        fetchTenant();
    }, [params.tenantId]);

    const fetchTenant = async () => {
        try {
            const res = await fetch('/api/admin/tenants');
            if (res.ok) {
                const tenants = await res.json();
                const t = tenants.find((t: any) => t.id === params.tenantId);
                setTenant(t);
            }
        } catch (error) {
            console.error('Failed to fetch tenant:', error);
        }
    };

    const fetchConfig = async () => {
        try {
            const res = await fetch(`/api/admin/rbac/${params.tenantId}`);
            if (res.ok) {
                const data = await res.json();
                setConfig(data);

                // Convert permissions to flat structure for easier UI handling
                const flatPerms: Record<string, Record<string, boolean>> = {};
                ROLES.forEach(role => {
                    flatPerms[role] = {};
                    MODULES.forEach(module => {
                        module.permissions.forEach(perm => {
                            const key = `${module.id}:${perm}`;
                            const rolePerms = data.permissions[role] || [];
                            flatPerms[role][key] = Array.isArray(rolePerms[module.id])
                                ? rolePerms[module.id].includes(perm)
                                : false;
                        });
                    });
                });
                setPermissions(flatPerms);
            }
        } catch (error) {
            console.error('Failed to fetch RBAC config:', error);
        } finally {
            setLoading(false);
        }
    };

    const togglePermission = (role: string, module: string, permission: string) => {
        const key = `${module}:${permission}`;
        setPermissions(prev => ({
            ...prev,
            [role]: {
                ...prev[role],
                [key]: !prev[role]?.[key],
            },
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Convert flat permissions back to nested structure
            const nestedPerms: Record<string, Record<string, string[]>> = {};
            ROLES.forEach(role => {
                nestedPerms[role] = {};
                MODULES.forEach(module => {
                    const modulePerms = module.permissions.filter(perm => {
                        const key = `${module.id}:${perm}`;
                        return permissions[role]?.[key];
                    });
                    if (modulePerms.length > 0) {
                        nestedPerms[role][module.id] = modulePerms;
                    }
                });
            });

            const res = await fetch(`/api/admin/rbac/${params.tenantId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ permissions: nestedPerms }),
            });

            if (res.ok) {
                alert('RBAC configuration saved successfully!');
            } else {
                alert('Failed to save RBAC configuration');
            }
        } catch (error) {
            alert('Error saving RBAC configuration');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin-control"
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </Link>
                        <div className="flex-1">
                            <h1 className="text-xl font-bold text-gray-900">RBAC Configuration</h1>
                            <p className="text-sm text-gray-600">{tenant?.name || 'Loading...'}</p>
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Save Configuration
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 bg-purple-50">
                        <div className="flex items-center gap-3">
                            <Shield className="w-6 h-6 text-purple-600" />
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Permission Matrix</h2>
                                <p className="text-sm text-gray-600">Configure role-based access control for this tenant</p>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase sticky left-0 bg-gray-50 z-10">
                                        Module
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                                        Permissions
                                    </th>
                                    {ROLES.map(role => (
                                        <th key={role} className="px-6 py-3 text-center text-xs font-bold uppercase" style={{
                                            color: role === 'admin' ? '#9333ea' : role === 'user' ? '#2563eb' : '#6b7280'
                                        }}>
                                            {role}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {MODULES.map(module => (
                                    <tr key={module.id} className="hover:bg-blue-50/30 transition-colors">
                                        <td className="px-6 py-4 font-bold text-gray-800 text-sm sticky left-0 bg-white">
                                            {module.name}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {module.permissions.map(perm => (
                                                    <span key={perm} className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-[10px] font-bold uppercase">
                                                        {perm}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        {ROLES.map(role => (
                                            <td key={role} className="px-6 py-4">
                                                <div className="flex flex-col gap-1 items-center">
                                                    {module.permissions.map(perm => {
                                                        const key = `${module.id}:${perm}`;
                                                        const hasPermission = permissions[role]?.[key] ?? false;

                                                        return (
                                                            <label
                                                                key={perm}
                                                                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded w-full justify-center"
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={hasPermission}
                                                                    onChange={() => togglePermission(role, module.id, perm)}
                                                                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                                                                />
                                                                <span className="text-[10px] text-gray-600 uppercase">{perm}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-4 bg-gray-50 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6 text-xs text-gray-600">
                                <div className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-green-600" />
                                    <span>Allowed</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <X className="w-4 h-4 text-red-400" />
                                    <span>Denied</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
