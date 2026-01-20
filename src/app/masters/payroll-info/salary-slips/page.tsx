'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Employee {
    id: string;
    code: string;
    name: string;
    designation: string;
}

interface PayHead {
    id: string;
    name: string;
    type: string;
}

interface SalaryDetail {
    payHeadId: string;
    amount: string;
    type: string;
}

interface SalarySlip {
    id: string;
    employee: Employee;
    month: number;
    year: number;
    totalEarnings: number;
    totalDeductions: number;
    netSalary: number;
    salaryDetails: {
        payHead: PayHead;
        amount: number;
    }[];
}

export default function SalarySlipsPage() {
    const router = useRouter();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [payHeads, setPayHeads] = useState<PayHead[]>([]);
    const [salarySlips, setSalarySlips] = useState<SalarySlip[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);

    const currentDate = new Date();
    const [formData, setFormData] = useState({
        employeeId: '',
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear(),
    });

    const [salaryDetails, setSalaryDetails] = useState<SalaryDetail[]>([]);

    useEffect(() => {
        fetchEmployees();
        fetchPayHeads();
        fetchSalarySlips();
    }, []);

    const fetchEmployees = async () => {
        try {
            const res = await fetch('/api/payroll/employees?isActive=true');
            if (!res.ok) throw new Error('Failed to fetch employees');
            const data = await res.json();
            setEmployees(data);
        } catch (err: any) {
            console.error('Error fetching employees:', err);
        }
    };

    const fetchPayHeads = async () => {
        try {
            const res = await fetch('/api/payroll/pay-heads');
            if (!res.ok) throw new Error('Failed to fetch pay heads');
            const data = await res.json();
            setPayHeads(data);

            // Initialize salary details with all pay heads
            setSalaryDetails(data.map((ph: PayHead) => ({
                payHeadId: ph.id,
                amount: '0',
                type: ph.type
            })));
        } catch (err: any) {
            console.error('Error fetching pay heads:', err);
        }
    };

    const fetchSalarySlips = async () => {
        try {
            const res = await fetch('/api/payroll/salary-slips');
            if (!res.ok) throw new Error('Failed to fetch salary slips');
            const data = await res.json();
            setSalarySlips(data);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleAmountChange = (payHeadId: string, amount: string) => {
        setSalaryDetails(prev =>
            prev.map(detail =>
                detail.payHeadId === payHeadId ? { ...detail, amount } : detail
            )
        );
    };

    const calculateTotals = () => {
        const earnings = salaryDetails
            .filter(d => d.type === 'EARNINGS')
            .reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);

        const deductions = salaryDetails
            .filter(d => d.type === 'DEDUCTIONS')
            .reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);

        return { earnings, deductions, netSalary: earnings - deductions };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/payroll/salary-slips', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    salaryDetails: salaryDetails.filter(d => parseFloat(d.amount) > 0)
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to generate salary slip');
            }

            alert('Salary slip generated successfully!');
            setShowForm(false);
            fetchSalarySlips();
            setFormData({
                employeeId: '',
                month: currentDate.getMonth() + 1,
                year: currentDate.getFullYear(),
            });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this salary slip?')) return;

        try {
            const res = await fetch(`/api/payroll/salary-slips?id=${id}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to delete salary slip');
            }

            fetchSalarySlips();
            alert('Salary slip deleted successfully');
        } catch (err: any) {
            alert(err.message);
        }
    };

    const totals = calculateTotals();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Salary Slips</h1>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        + Generate Salary Slip
                    </button>
                )}
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
                    {error}
                </div>
            )}

            {showForm && (
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Generate Salary Slip</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium mb-1">Employee *</label>
                                <select
                                    value={formData.employeeId}
                                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                                    className="w-full px-3 py-2 border rounded"
                                    required
                                >
                                    <option value="">-- Select Employee --</option>
                                    {employees.map((emp) => (
                                        <option key={emp.id} value={emp.id}>
                                            {emp.name} ({emp.code})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Month *</label>
                                <select
                                    value={formData.month}
                                    onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 border rounded"
                                    required
                                >
                                    {monthNames.map((month, index) => (
                                        <option key={index} value={index + 1}>{month}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Year *</label>
                                <input
                                    type="number"
                                    value={formData.year}
                                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 border rounded"
                                    required
                                />
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <h3 className="font-semibold mb-3">Salary Components</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Earnings */}
                                <div>
                                    <h4 className="text-sm font-medium text-green-700 mb-2">Earnings</h4>
                                    {payHeads.filter(ph => ph.type === 'EARNINGS').map((payHead) => {
                                        const detail = salaryDetails.find(d => d.payHeadId === payHead.id);
                                        return (
                                            <div key={payHead.id} className="flex justify-between items-center mb-2">
                                                <label className="text-sm">{payHead.name}</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={detail?.amount || '0'}
                                                    onChange={(e) => handleAmountChange(payHead.id, e.target.value)}
                                                    className="w-32 px-2 py-1 border rounded text-right"
                                                />
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Deductions */}
                                <div>
                                    <h4 className="text-sm font-medium text-red-700 mb-2">Deductions</h4>
                                    {payHeads.filter(ph => ph.type === 'DEDUCTIONS').map((payHead) => {
                                        const detail = salaryDetails.find(d => d.payHeadId === payHead.id);
                                        return (
                                            <div key={payHead.id} className="flex justify-between items-center mb-2">
                                                <label className="text-sm">{payHead.name}</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={detail?.amount || '0'}
                                                    onChange={(e) => handleAmountChange(payHead.id, e.target.value)}
                                                    className="w-32 px-2 py-1 border rounded text-right"
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="mt-4 p-4 bg-gray-50 rounded">
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Total Earnings:</span>
                                    <span className="font-semibold text-green-700">₹{totals.earnings.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Total Deductions:</span>
                                    <span className="font-semibold text-red-700">₹{totals.deductions.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg border-t pt-2">
                                    <span>Net Salary:</span>
                                    <span className="text-blue-700">₹{totals.netSalary.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex gap-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
                            >
                                {loading ? 'Generating...' : 'Generate Salary Slip'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Salary Slips List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {salarySlips.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No salary slips generated yet. Click "Generate Salary Slip" to create one.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Earnings</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Deductions</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Net Salary</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {salarySlips.map((slip) => (
                                    <tr key={slip.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{slip.employee.name}</div>
                                            <div className="text-sm text-gray-500">{slip.employee.designation}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {monthNames[slip.month - 1]} {slip.year}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-700">
                                            ₹{slip.totalEarnings.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-700">
                                            ₹{slip.totalDeductions.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-blue-700">
                                            ₹{slip.netSalary.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                                            <button
                                                onClick={() => handleDelete(slip.id)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="mt-4 text-sm text-gray-600">
                Total Salary Slips: {salarySlips.length}
            </div>
        </div>
    );
}
