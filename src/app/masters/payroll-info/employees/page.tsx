'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, UserPlus, Search, Building2, Wallet } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function EmployeesListPage() {
    const router = useRouter();
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const res = await fetch('/api/payroll/employees');
            if (res.ok) {
                const data = await res.json();
                setEmployees(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filtered = employees.filter(e =>
        e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col h-screen bg-lekhya-base font-sans">
            {/* Header */}
            <div className="lekhya-header z-10 sticky top-0">
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.push('/masters/payroll-info')} className="hover:text-white transition-colors">
                            <ArrowLeft className="w-5 h-5 text-lekhya-accent" />
                        </button>
                        <h1 className="font-bold text-lg tracking-wide pl-2">List of Employees</h1>
                    </div>
                    <Link href="/masters/payroll-info/employees/new" className="bg-lekhya-accent text-lekhya-primary px-4 py-1.5 text-sm font-bold rounded-sm hover:bg-white transition-colors flex items-center gap-2">
                        <UserPlus className="w-4 h-4" /> Create Employee
                    </Link>
                </div>
            </div>

            <div className="flex-1 p-8 max-w-5xl mx-auto w-full">
                {/* Search Bar */}
                <div className="mb-6 relative">
                    <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by Name or Code..."
                        className="w-full pl-10 pr-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lekhya-primary"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                    />
                </div>

                {/* List */}
                <div className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-[#E0E8F0] text-lekhya-primary font-bold border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 text-left">Code</th>
                                <th className="px-4 py-3 text-left">Name</th>
                                <th className="px-4 py-3 text-left">Designation</th>
                                <th className="px-4 py-3 text-left">Department</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={4} className="p-8 text-center text-slate-500">Loading Employees...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={4} className="p-8 text-center text-slate-500 font-medium">No Employees Found</td></tr>
                            ) : (
                                filtered.map(emp => (
                                    <tr key={emp.id} className="hover:bg-blue-50 cursor-pointer" onClick={() => router.push(`/masters/payroll-info/employees/${emp.id}`)}>
                                        <td className="px-4 py-3 font-mono text-slate-600">{emp.code}</td>
                                        <td className="px-4 py-3 font-bold text-slate-800">{emp.name}</td>
                                        <td className="px-4 py-3 text-slate-600">{emp.designation}</td>
                                        <td className="px-4 py-3 text-slate-600 flex items-center gap-1">
                                            {emp.department && <Building2 className="w-3 h-3 text-slate-400" />} {emp.department || '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
