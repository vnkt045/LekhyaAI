'use client';

import Link from 'next/link';
import { ArrowLeft, Users, Briefcase, Clock, FileText, Banknote } from 'lucide-react';

const MENU_ITEMS = [
    { label: 'Employees', href: '/masters/payroll-info/employees', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Pay Heads', href: '/masters/payroll-info/pay-heads', icon: Banknote, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Salary Slips', href: '/masters/payroll-info/salary-slips', icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Units (Work)', href: '/masters/payroll-info/units', icon: Briefcase, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Attendance / Production Types', href: '/masters/payroll-info/attendance-types', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Salary Details', href: '/masters/payroll-info/salary-details', icon: FileText, color: 'text-teal-600', bg: 'bg-teal-50' },
];

export default function PayrollInfoPage() {
    return (
        <div className="min-h-screen bg-lekhya-base font-sans">
            {/* Header */}
            <header className="bg-lekhya-primary text-white h-12 flex items-center justify-between px-4 border-b-[3px] border-lekhya-accent shadow-sm sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <Link href="/masters" className="hover:bg-white/10 p-1.5 rounded-full transition-colors" title="Back to Masters">
                        <ArrowLeft className="w-5 h-5 text-lekhya-accent" />
                    </Link>
                    <h1 className="text-lg font-bold tracking-wide">Payroll Info</h1>
                </div>
                <div className="text-xs bg-white/10 px-3 py-1 rounded font-mono">
                    LekhyaAI Enterprise
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto p-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-slate-50">
                        <h2 className="font-bold text-slate-700">LekhyaAI {'>'} Masters {'>'} Payroll Info</h2>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {MENU_ITEMS.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className="flex items-center gap-4 p-4 hover:bg-yellow-50 transition-colors group"
                            >
                                <div className={`p-2 rounded-lg ${item.bg} ${item.color} group-hover:scale-110 transition-transform`}>
                                    <item.icon className="w-5 h-5" />
                                </div>
                                <span className="font-medium text-slate-700 group-hover:text-black group-hover:font-bold transition-all">
                                    <span className="text-tally-orange font-bold">{item.label.charAt(0)}</span>{item.label.slice(1)}
                                </span>
                            </Link>
                        ))}

                        <Link
                            href="/masters"
                            className="flex items-center gap-4 p-4 hover:bg-yellow-50 transition-colors group"
                        >
                            <div className="p-2 rounded-lg bg-red-50 text-red-600 group-hover:scale-110 transition-transform">
                                <ArrowLeft className="w-5 h-5" />
                            </div>
                            <span className="font-medium text-slate-700 group-hover:text-black group-hover:font-bold transition-all">
                                <span className="text-tally-orange font-bold">Q</span>uit
                            </span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
