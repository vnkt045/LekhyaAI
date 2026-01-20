'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchIFSCDetails } from '@/lib/smart-utils';

import { Suspense } from 'react';

function EmployeeCreateContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const isEdit = !!id;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        designation: '',
        department: '',
        dateOfJoining: new Date().toISOString().split('T')[0],
        dateOfLeaving: '',
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        panNumber: '',
        aadharNumber: '',
        uanNumber: '',
        esiNumber: '',
        isActive: true,
    });

    useEffect(() => {
        if (isEdit) {
            fetchEmployee();
        }
    }, [id]);

    const fetchEmployee = async () => {
        try {
            const res = await fetch('/api/payroll/employees');
            if (!res.ok) throw new Error('Failed to fetch employees');
            const employees = await res.json();
            const employee = employees.find((e: any) => e.id === id);
            if (employee) {
                setFormData({
                    code: employee.code,
                    name: employee.name,
                    designation: employee.designation,
                    department: employee.department || '',
                    dateOfJoining: employee.dateOfJoining.split('T')[0],
                    dateOfLeaving: employee.dateOfLeaving ? employee.dateOfLeaving.split('T')[0] : '',
                    bankName: employee.bankName || '',
                    accountNumber: employee.accountNumber || '',
                    ifscCode: employee.ifscCode || '',
                    panNumber: employee.panNumber || '',
                    aadharNumber: employee.aadharNumber || '',
                    uanNumber: employee.uanNumber || '',
                    esiNumber: employee.esiNumber || '',
                    isActive: employee.isActive,
                });
            }
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const url = '/api/payroll/employees';
            const method = isEdit ? 'PUT' : 'POST';
            const body = isEdit ? { id, ...formData } : formData;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to save employee');
            }

            router.push('/masters/payroll-info/employees/display');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">{isEdit ? 'Edit' : 'Create'} Employee</h1>
                <button
                    onClick={() => router.push('/masters/payroll-info/employees/display')}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                    ← Back to List
                </button>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Information */}
                    <div className="md:col-span-2">
                        <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Employee Code *</label>
                        <input
                            type="text"
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                            className="input"
                            required
                            disabled={isEdit}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Full Name *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="input"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Designation *</label>
                        <input
                            type="text"
                            value={formData.designation}
                            onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                            className="input"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Department</label>
                        <input
                            type="text"
                            value={formData.department}
                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                            className="input"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Date of Joining *</label>
                        <input
                            type="date"
                            value={formData.dateOfJoining}
                            onChange={(e) => setFormData({ ...formData, dateOfJoining: e.target.value })}
                            className="input"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Date of Leaving</label>
                        <input
                            type="date"
                            value={formData.dateOfLeaving}
                            onChange={(e) => setFormData({ ...formData, dateOfLeaving: e.target.value })}
                            className="input"
                        />
                    </div>

                    {/* Bank Details */}
                    <div className="md:col-span-2 mt-4">
                        <h2 className="text-lg font-semibold mb-4">Bank Details</h2>
                    </div>


                    <div>
                        <label className="block text-sm font-medium mb-1">Bank Name</label>
                        <input
                            type="text"
                            value={formData.bankName}
                            onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                            className="input"
                            placeholder="Auto-filled from IFSC"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Account Number</label>
                        <input
                            type="text"
                            value={formData.accountNumber}
                            onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                            className="input"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">IFSC Code</label>
                        <input
                            type="text"
                            value={formData.ifscCode}
                            onChange={(e) => {
                                const val = e.target.value.toUpperCase();
                                setFormData(prev => ({ ...prev, ifscCode: val }));
                                if (val.length === 11) {
                                    fetchIFSCDetails(val).then(details => {
                                        if (details) {
                                            setFormData(prev => ({
                                                ...prev,
                                                bankName: details.bank + (details.branch ? ` - ${details.branch}` : '')
                                            }));
                                        }
                                    });
                                }
                            }}
                            className="input uppercase"
                            maxLength={11}
                            placeholder="e.g. SBIN0001234"
                        />
                    </div>

                    {/* Statutory Details */}
                    <div className="md:col-span-2 mt-4">
                        <h2 className="text-lg font-semibold mb-4">Statutory Details</h2>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">PAN Number</label>
                        <input
                            type="text"
                            value={formData.panNumber}
                            onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
                            className="input"
                            maxLength={10}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Aadhar Number</label>
                        <input
                            type="text"
                            value={formData.aadharNumber}
                            onChange={(e) => setFormData({ ...formData, aadharNumber: e.target.value })}
                            className="input"
                            maxLength={12}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">UAN Number (PF)</label>
                        <input
                            type="text"
                            value={formData.uanNumber}
                            onChange={(e) => setFormData({ ...formData, uanNumber: e.target.value })}
                            className="input"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">ESI Number</label>
                        <input
                            type="text"
                            value={formData.esiNumber}
                            onChange={(e) => setFormData({ ...formData, esiNumber: e.target.value })}
                            className="w-full px-3 py-2 border rounded"
                        />
                    </div>

                    {/* Status */}
                    <div className="md:col-span-2 mt-4">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={formData.isActive}
                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                className="mr-2"
                            />
                            <span className="text-sm font-medium">Active Employee</span>
                        </label>
                    </div>
                </div>

                <div className="mt-6 flex gap-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
                    >
                        {loading ? 'Saving...' : isEdit ? 'Update Employee' : 'Create Employee'}
                    </button>
                    <button
                        type="button"
                        onClick={() => router.push('/masters/payroll-info/employees/display')}
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function EmployeeCreatePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <EmployeeCreateContent />
        </Suspense>
    );
}
