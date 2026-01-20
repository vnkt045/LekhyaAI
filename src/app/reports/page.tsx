'use client';

import { FileBarChart, PieChart, TrendingUp, ArrowRight, FileText } from 'lucide-react';
import Link from 'next/link';

export default function ReportsPage() {
    const reports = [
        {
            title: 'Trial Balance',
            description: 'Summary of all ledger balances to check arithmetic accuracy.',
            icon: <FileBarChart className="w-8 h-8 text-lekhya-primary" />,
            href: '/reports/trial-balance'
        },
        {
            title: 'GSTR-1',
            description: 'Outward supplies (Sales) return stats.',
            icon: <PieChart className="w-8 h-8 text-lekhya-primary" />,
            href: '/gst'
        },
        {
            title: 'Day Book',
            description: 'Chronological view of daily transactions.',
            icon: <FileText className="w-8 h-8 text-lekhya-primary" />,
            href: '/reports/day-book'
        },
        {
            title: 'Cash Flow',
            description: 'Inflow & Outflow analysis (Direct Method).',
            icon: <TrendingUp className="w-8 h-8 text-lekhya-primary" />,
            href: '/reports/cash-flow'
        },
        // Add P&L, Balance Sheet placeholders later
    ];

    return (
        <div className="min-h-screen bg-lekhya-base font-sans p-6 md:p-12">
            <h1 className="text-3xl font-bold text-lekhya-primary mb-2">Reports Centre</h1>
            <p className="text-slate-500 mb-8">Access financial statements and compliance reports.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reports.map((report) => (
                    <Link key={report.title} href={report.href} className="bg-white p-6 rounded-sm shadow-sm border border-[#BDCDD6] hover:border-lekhya-accent hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-blue-50 p-3 rounded-full group-hover:bg-yellow-50 transition-colors">
                                {report.icon}
                            </div>
                            <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-lekhya-primary transition-colors" />
                        </div>
                        <h3 className="text-lg font-bold text-lekhya-primary mb-2 group-hover:text-blue-700">{report.title}</h3>
                        <p className="text-sm text-slate-600">{report.description}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
