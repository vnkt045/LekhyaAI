'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Shield, Save, User, CheckCircle } from 'lucide-react';
import Link from 'next/link';

const MODULES = [
    { id: 'vouchers', name: 'Vouchers', permissions: ['create', 'read', 'update', 'delete', 'post', 'cancel'] },
    { id: 'accounts', name: 'Accounts & Ledgers', permissions: ['create', 'read', 'update', 'delete'] },
    { id: 'reports', name: 'Reports', permissions: ['read', 'export'] },
    { id: 'inventory', name: 'Inventory', permissions: ['create', 'read', 'update', 'delete', 'adjust'] },
    { id: 'payroll', name: 'Payroll', permissions: ['create', 'read', 'update', 'delete', 'process'] },
    { id: 'gst', name: 'GST', permissions: ['read', 'file', 'export'] },
    { id: 'banking', name: 'Banking', permissions: ['read', 'reconcile', 'import'] },
    { id: 'users', name: 'User Management', permissions: ['create', 'read', 'update', 'delete'] },
    { id: 'settings', name: 'Settings', permissions: ['read', 'update'] },
];

const ROLE_TEMPLATES = {
    'Full Admin': { vouchers: ['create', 'read', 'update', 'delete', 'post', 'cancel'], accounts: ['create', 'read', 'update', 'delete'], reports: ['read', 'export'], inventory: ['create', 'read', 'update', 'delete', 'adjust'], payroll: ['create', 'read', 'update', 'delete', 'process'], gst: ['read', 'file', 'export'], banking: ['read', 'reconcile', 'import'], users: ['create', 'read', 'update', 'delete'], settings: ['read', 'update'] },
    'Accountant': { vouchers: ['create', 'read', 'update', 'post'], accounts: ['create', 'read', 'update'], reports: ['read', 'export'], gst: ['read', 'file', 'export'], banking: ['read', 'reconcile'] },
    'Data Entry': { vouchers: ['create', 'read'], inventory: ['create', 'read', 'update'] },
    'Viewer': { vouchers: ['read'], accounts: ['read'], reports: ['read', 'export'], inventory: ['read'], payroll: ['read'], gst: ['read'], banking: ['read'] },
};

interface ClientUser {
    id: string;
    name: string;
    email: string;
    role: string;
    moduleAccess: Record<string, string[]>;
}

export default function UserRBACPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [users, setUsers] = useState<ClientUser[]>([]);
    const [selectedUser, setSelectedUser] = useState<ClientUser | null>(null);
    const [permissions, setPermissions] = useState<Record<string, string[]>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, [params.id]);

    const fetchUsers = async () => {
        try {
            const res = await fetch(`/api/admin/clients/${params.id}/users`);
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
                if (data.length > 0) {
                    selectUser(data[0]);
                }
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    const selectUser = (user: ClientUser) => {
        setSelectedUser(user);
        setPermissions(user.moduleAccess || {});
    };

    const togglePermission = (moduleId: string, permission: string) => {
        setPermissions(prev => {
            const modulePerms = prev[moduleId] || [];
            const hasPermission = modulePerms.includes(permission);

            return {
                ...prev,
                [moduleId]: hasPermission
                    ? modulePerms.filter(p => p !== permission)
                    : [...modulePerms, permission],
            };
        });
    };

    const applyTemplate = (templateName: string) => {
        const template = ROLE_TEMPLATES[templateName as keyof typeof ROLE_TEMPLATES];
        if (template) {
            setPermissions(template);
        }
    };

    const handleSave = async () => {
        if (!selectedUser) return;

        setSaving(true);
        try {
            const res = await fetch(`/api/admin/client-users/${selectedUser.id}/rbac`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ moduleAccess: permissions }),
            });

            if (res.ok) {
                alert('Permissions saved successfully!');
                fetchUsers();
            } else {
                alert('Failed to save permissions');
            }
        } catch (error) {
            alert('Error saving permissions');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center gap-4">
                        <Link href={`/admin/clients/${params.id}`} className="p-2 hover:bg-gray-100 rounded-lg">
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </Link>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-gray-900">Per-User RBAC Configuration</h1>
                            <p className="text-sm text-gray-600 mt-1">Configure module access for individual users</p>
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={saving || !selectedUser}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                        >
                            {saving ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Save Permissions
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-4 gap-6">
                    {/* User List */}
                    <div className="col-span-1">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Users
                            </h3>
                            {loading ? (
                                <p className="text-sm text-gray-500">Loading...</p>
                            ) : users.length === 0 ? (
                                <p className="text-sm text-gray-500">No users found</p>
                            ) : (
                                <div className="space-y-2">
                                    {users.map((user) => (
                                        <button
                                            key={user.id}
                                            onClick={() => selectUser(user)}
                                            className={`w-full text-left p-3 rounded-lg transition-colors ${selectedUser?.id === user.id
                                                ? 'bg-purple-100 border-2 border-purple-600'
                                                : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                                                }`}
                                        >
                                            <p className="font-medium text-sm text-gray-900">{user.name}</p>
                                            <p className="text-xs text-gray-500">{user.email}</p>
                                            <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-[10px] font-bold">
                                                {user.role}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Role Templates */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mt-4">
                            <h3 className="font-bold text-gray-900 mb-3 text-sm">Quick Templates</h3>
                            <div className="space-y-2">
                                {Object.keys(ROLE_TEMPLATES).map((template) => (
                                    <button
                                        key={template}
                                        onClick={() => applyTemplate(template)}
                                        className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded text-xs font-medium text-gray-700 transition-colors"
                                    >
                                        {template}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Permission Matrix */}
                    <div className="col-span-3">
                        {selectedUser ? (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                <div className="p-6 border-b border-gray-200 bg-purple-50">
                                    <div className="flex items-center gap-3">
                                        <Shield className="w-6 h-6 text-purple-600" />
                                        <div>
                                            <h2 className="text-lg font-bold text-gray-900">Permission Matrix</h2>
                                            <p className="text-sm text-gray-600">Configuring for: <span className="font-medium">{selectedUser.name}</span></p>
                                        </div>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Module</th>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Available Permissions</th>
                                                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Access Control</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {MODULES.map((module) => (
                                                <tr key={module.id} className="hover:bg-purple-50/30 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <p className="font-bold text-gray-900">{module.name}</p>
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
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-wrap gap-2 justify-center">
                                                            {module.permissions.map(perm => {
                                                                const hasPermission = (permissions[module.id] || []).includes(perm);
                                                                return (
                                                                    <label
                                                                        key={perm}
                                                                        className="flex items-center gap-1.5 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded"
                                                                    >
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={hasPermission}
                                                                            onChange={() => togglePermission(module.id, perm)}
                                                                            className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                                                                        />
                                                                        <span className="text-[10px] text-gray-600 uppercase font-medium">{perm}</span>
                                                                    </label>
                                                                );
                                                            })}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="p-4 bg-gray-50 border-t border-gray-200">
                                    <div className="flex items-center gap-4 text-xs text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                            <span>Checked = Permission Granted</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-gray-300 rounded"></div>
                                            <span>Unchecked = Permission Denied</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                                <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-600">Select a user to configure permissions</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
