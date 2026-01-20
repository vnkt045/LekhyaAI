'use client';

import { useState } from 'react';
import { X, Plus, Check } from 'lucide-react';

interface CreateClientFormProps {
    onClose: () => void;
    onSuccess: () => void;
}

const SUBSCRIPTION_PLANS = [
    { value: 'BASIC', label: 'Basic', color: 'gray' },
    { value: 'PROFESSIONAL', label: 'Professional', color: 'blue' },
    { value: 'ENTERPRISE', label: 'Enterprise', color: 'purple' },
];

const ALL_MODULES = [
    { id: 'vouchers', name: 'Voucher Management', plans: ['BASIC', 'PROFESSIONAL', 'ENTERPRISE'] },
    { id: 'accounts', name: 'Accounts & Ledgers', plans: ['BASIC', 'PROFESSIONAL', 'ENTERPRISE'] },
    { id: 'reports', name: 'Financial Reports', plans: ['BASIC', 'PROFESSIONAL', 'ENTERPRISE'] },
    { id: 'inventory', name: 'Inventory Management', plans: ['PROFESSIONAL', 'ENTERPRISE'] },
    { id: 'gst', name: 'GST Compliance', plans: ['PROFESSIONAL', 'ENTERPRISE'] },
    { id: 'banking', name: 'Banking Integration', plans: ['PROFESSIONAL', 'ENTERPRISE'] },
    { id: 'payroll', name: 'Payroll Management', plans: ['ENTERPRISE'] },
    { id: 'users', name: 'User Management', plans: ['ENTERPRISE'] },
    { id: 'settings', name: 'Advanced Settings', plans: ['ENTERPRISE'] },
];

export default function CreateClientForm({ onClose, onSuccess }: CreateClientFormProps) {
    const [formData, setFormData] = useState({
        name: '',
        subdomain: '',
        subscriptionPlan: 'PROFESSIONAL',
        maxUsers: 10,
        expiresAt: '',
    });
    const [selectedModules, setSelectedModules] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handlePlanChange = (plan: string) => {
        setFormData({ ...formData, subscriptionPlan: plan });

        // Auto-select modules based on plan
        const planModules = ALL_MODULES
            .filter(m => m.plans.includes(plan))
            .map(m => m.id);
        setSelectedModules(planModules);
    };

    const toggleModule = (moduleId: string) => {
        if (selectedModules.includes(moduleId)) {
            setSelectedModules(selectedModules.filter(id => id !== moduleId));
        } else {
            setSelectedModules([...selectedModules, moduleId]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/admin/tenants', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    enabledModules: JSON.stringify(selectedModules),
                }),
            });

            if (res.ok) {
                onSuccess();
                onClose();
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to create client');
            }
        } catch (err) {
            setError('Network error occurred');
        } finally {
            setLoading(false);
        }
    };

    const availableModules = ALL_MODULES.filter(m =>
        m.plans.includes(formData.subscriptionPlan)
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Create New Client Instance</h3>
                        <p className="text-sm text-gray-600 mt-1">Configure and provision a new client</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900">Basic Information</h4>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Client Name *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Acme Corporation"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Subdomain (Optional)
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={formData.subdomain}
                                    onChange={(e) => setFormData({ ...formData, subdomain: e.target.value })}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="acme"
                                />
                                <span className="text-gray-500 text-sm">.lekhyaai.com</span>
                            </div>
                        </div>
                    </div>

                    {/* Subscription Plan */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900">Subscription Plan</h4>

                        <div className="grid grid-cols-3 gap-3">
                            {SUBSCRIPTION_PLANS.map((plan) => (
                                <button
                                    key={plan.value}
                                    type="button"
                                    onClick={() => handlePlanChange(plan.value)}
                                    className={`p-4 border-2 rounded-lg text-center transition-all ${formData.subscriptionPlan === plan.value
                                            ? 'border-blue-600 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="font-semibold text-gray-900">{plan.label}</div>
                                    {formData.subscriptionPlan === plan.value && (
                                        <Check className="w-5 h-5 text-blue-600 mx-auto mt-2" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* User Limits */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900">User Limits</h4>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Maximum Users *
                            </label>
                            <input
                                type="number"
                                required
                                min="1"
                                max="999"
                                value={formData.maxUsers}
                                onChange={(e) => setFormData({ ...formData, maxUsers: parseInt(e.target.value) })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    {/* Module Selection */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900">Enabled Modules</h4>
                        <p className="text-sm text-gray-600">
                            Select modules based on subscription plan
                        </p>

                        <div className="grid grid-cols-2 gap-3">
                            {availableModules.map((module) => (
                                <label
                                    key={module.id}
                                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${selectedModules.includes(module.id)
                                            ? 'border-blue-600 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedModules.includes(module.id)}
                                        onChange={() => toggleModule(module.id)}
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-900">
                                        {module.name}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* License Expiry */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900">License Expiry</h4>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Expiration Date (Optional)
                            </label>
                            <input
                                type="date"
                                value={formData.expiresAt}
                                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Leave empty for perpetual license
                            </p>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Provisioning...
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4" />
                                    Create & Provision
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
