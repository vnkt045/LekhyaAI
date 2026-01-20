'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, User } from 'lucide-react';

export default function SalaryDetailsPage() {
    const [employees, setEmployees] = useState<any[]>([]);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
    const [payHeads, setPayHeads] = useState<any[]>([]);
    const [salaryDetails, setSalaryDetails] = useState<any>({}); // { payHeadId: amount }
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [empRes, phRes] = await Promise.all([
                fetch('/api/payroll/employees'),
                fetch('/api/payroll/pay-heads')
            ]);
            if (empRes.ok) setEmployees(await empRes.json());
            if (phRes.ok) setPayHeads(await phRes.json());
        } catch (error) {
            console.error(error);
        }
    };

    const fetchEmployeeDetails = async (empId: string) => {
        setSelectedEmployeeId(empId);
        if (!empId) return;

        try {
            const res = await fetch(`/api/payroll/salary-details?employeeId=${empId}`);
            if (res.ok) {
                const data = await res.json();
                // Convert array to object map
                const map: any = {};
                data.forEach((d: any) => map[d.payHeadId] = d.amount);
                setSalaryDetails(map);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleAmountChange = (payHeadId: string, value: string) => {
        setSalaryDetails((prev: any) => ({
            ...prev,
            [payHeadId]: parseFloat(value) || 0
        }));
    };

    const handleSave = async () => {
        if (!selectedEmployeeId) return;
        setLoading(true);
        try {
            // Convert map back to array
            const details = Object.keys(salaryDetails).map(phId => ({
                payHeadId: phId,
                amount: salaryDetails[phId]
            }));

            const res = await fetch('/api/payroll/salary-details', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ employeeId: selectedEmployeeId, details })
            });

            if (res.ok) {
                alert('Salary Structure Saved!');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-lekhya-base font-sans p-8">
            <header className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/masters/payroll-info" className="p-2 bg-white rounded-full shadow-sm hover:bg-slate-50">
                        <ArrowLeft className="w-5 h-5 text-lekhya-primary" />
                    </Link>
                    <h1 className="text-2xl font-bold text-lekhya-primary">Salary Details Definition</h1>
                </div>
            </header>

            <div className="bg-white rounded-lg shadow border border-gray-200 p-6 max-w-4xl mx-auto">
                {/* Employee Selection */}
                <div className="mb-8">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Select Employee / Group</label>
                    <select
                        className="input w-full md:w-1/2"
                        value={selectedEmployeeId}
                        onChange={(e) => fetchEmployeeDetails(e.target.value)}
                    >
                        <option value="">-- Select Employee --</option>
                        {employees.map(emp => (
                            <option key={emp.id} value={emp.id}>{emp.name} ({emp.code})</option>
                        ))}
                    </select>
                </div>

                {selectedEmployeeId && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <User className="w-5 h-5" /> Salary Structure
                        </h2>

                        <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 border-b border-gray-200 text-left">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold text-slate-600">Pay Head</th>
                                        <th className="px-4 py-3 font-semibold text-slate-600">Type</th>
                                        <th className="px-4 py-3 font-semibold text-slate-600">Calculation</th>
                                        <th className="px-4 py-3 font-semibold text-slate-600 w-40">Amount / Rate</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {payHeads.map(ph => (
                                        <tr key={ph.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 font-medium text-slate-800">{ph.name}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${ph.type === 'EARNINGS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {ph.type}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-slate-500">{ph.calculationType}</td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="number"
                                                    className="input py-1 text-right"
                                                    placeholder="0.00"
                                                    value={salaryDetails[ph.id] || ''}
                                                    onChange={(e) => handleAmountChange(ph.id, e.target.value)}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="btn btn-primary flex items-center gap-2"
                            >
                                <Save className="w-4 h-4" /> Save Salary Details
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
