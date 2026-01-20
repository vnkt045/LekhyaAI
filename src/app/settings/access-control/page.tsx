'use client';

import { useState } from 'react';
import { ArrowLeft, Shield, Lock, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

// Mock Data for Roles and Permissions
const ROLES = [
    { id: 'ADMIN', name: 'Administrator', description: 'Full access to all modules' },
    { id: 'MANAGER', name: 'Manager', description: 'Can approve vouchers and view reports' },
    { id: 'ACCOUNTANT', name: 'Accountant', description: 'Data entry and basic reporting' },
    { id: 'AUDITOR', name: 'Auditor', description: 'Read-only access to financial data' },
];

const MODULES = [
    { id: 'DASHBOARD', name: 'Dashboard' },
    { id: 'VOUCHERS', name: 'Voucher Entry' },
    { id: 'MASTERS', name: 'Master Data (Ledgers, Items)' },
    { id: 'REPORTS', name: 'Financial Reports' },
    { id: 'GST', name: 'GST Returns' },
    { id: 'SETTINGS', name: 'System Settings' },
    { id: 'APPROVALS', name: 'Voucher Approvals' },
];

// Initial Matrix State (flat map: roleId_moduleId -> boolean)
const INITIAL_PERMISSIONS: Record<string, boolean> = {
    'ADMIN_DASHBOARD': true, 'ADMIN_VOUCHERS': true, 'ADMIN_MASTERS': true, 'ADMIN_REPORTS': true, 'ADMIN_GST': true, 'ADMIN_SETTINGS': true, 'ADMIN_APPROVALS': true,
    'MANAGER_DASHBOARD': true, 'MANAGER_VOUCHERS': true, 'MANAGER_MASTERS': true, 'MANAGER_REPORTS': true, 'MANAGER_GST': true, 'MANAGER_SETTINGS': false, 'MANAGER_APPROVALS': true,
    'ACCOUNTANT_DASHBOARD': true, 'ACCOUNTANT_VOUCHERS': true, 'ACCOUNTANT_MASTERS': true, 'ACCOUNTANT_REPORTS': false, 'ACCOUNTANT_GST': false, 'ACCOUNTANT_SETTINGS': false, 'ACCOUNTANT_APPROVALS': false,
    'AUDITOR_DASHBOARD': true, 'AUDITOR_VOUCHERS': false, 'AUDITOR_MASTERS': false, 'AUDITOR_REPORTS': true, 'AUDITOR_GST': true, 'AUDITOR_SETTINGS': false, 'AUDITOR_APPROVALS': false,
};

export default function AccessControlPage() {
    const [permissions, setPermissions] = useState(INITIAL_PERMISSIONS);
    const [saving, setSaving] = useState(false);

    const togglePermission = (roleId: string, moduleId: string) => {
        const key = `${roleId}_${moduleId}`;
        // Admin always has full access (simulate immutable admin)
        if (roleId === 'ADMIN') return;

        setPermissions(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleSave = () => {
        setSaving(true);
        // Simulate API Call
        setTimeout(() => {
            setSaving(false);
            alert('Permissions Matrix Updated Successfully!');
        }, 800);
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Simple Header for context */}
            <div className="bg-lekhya-primary text-white p-4 shadow-md flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/settings" className="hover:bg-white/10 p-2 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-lg font-bold">Access Control Matrix</h1>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-lekhya-accent text-lekhya-primary px-6 py-2 rounded font-bold hover:bg-white transition-colors disabled:opacity-50"
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <div className="max-w-7xl mx-auto p-8">
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="bg-orange-100 p-2 rounded text-orange-600">
                                <Shield className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">Role-Based Access Control (RBAC)</h2>
                                <p className="text-slate-500 text-sm">Define granular permissions for each user role across the application.</p>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-6 py-4 text-left font-bold text-slate-700 w-64 uppercase text-xs tracking-wider">Features / Modules</th>
                                    {ROLES.map(role => (
                                        <th key={role.id} className="px-6 py-4 text-center font-bold text-slate-700 border-l border-slate-100 min-w-[140px]">
                                            <div className="flex flex-col items-center gap-1">
                                                <span className="uppercase text-xs tracking-wider">{role.name}</span>
                                                <span className="text-[10px] font-normal text-slate-400 max-w-[120px]">{role.description}</span>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {MODULES.map(module => (
                                    <tr key={module.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-800">{module.name}</div>
                                            <div className="text-xs text-slate-400">ID: {module.id}</div>
                                        </td>
                                        {ROLES.map(role => {
                                            const key = `${role.id}_${module.id}`;
                                            const isAllowed = permissions[key];
                                            const isAdmin = role.id === 'ADMIN';

                                            return (
                                                <td key={role.id} className="px-6 py-4 border-l border-slate-100 text-center">
                                                    <div
                                                        onClick={() => togglePermission(role.id, module.id)}
                                                        className={`
                                                            inline-flex items-center justify-center w-10 h-10 rounded-full cursor-pointer transition-all duration-200
                                                            ${isAdmin ? 'opacity-50 cursor-not-allowed bg-slate-100' : 'hover:scale-110 active:scale-95'}
                                                            ${isAllowed ? 'bg-green-100 text-green-600 shadow-sm' : 'bg-red-50 text-red-400'}
                                                        `}
                                                        title={isAdmin ? 'Admin has full access' : (isAllowed ? 'Click to Revoke' : 'Click to Grant')}
                                                    >
                                                        {isAdmin ? (
                                                            <Lock className="w-5 h-5 text-slate-400" />
                                                        ) : isAllowed ? (
                                                            <CheckCircle className="w-6 h-6" />
                                                        ) : (
                                                            <XCircle className="w-6 h-6" />
                                                        )}
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
