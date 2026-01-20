'use client';

import Link from 'next/link';
import { ArrowLeft, Info } from 'lucide-react';

export default function PayrollUnitsPage() {
    return (
        <div className="min-h-screen bg-lekhya-base font-sans p-8">
            <header className="mb-6 flex items-center gap-4">
                <Link href="/masters/payroll-info" className="p-2 bg-white rounded-full shadow-sm hover:bg-slate-50">
                    <ArrowLeft className="w-5 h-5 text-lekhya-primary" />
                </Link>
                <h1 className="text-2xl font-bold text-lekhya-primary">Units (Work)</h1>
            </header>

            <div className="bg-white rounded-lg p-8 max-w-2xl mx-auto text-center border border-gray-200 shadow-sm">
                <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Info className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">Integrated Units</h2>
                <p className="text-slate-600 mb-6">
                    In this version of LekhyaAI, Units (Days, Hours, Pcs) are defined directly within
                    <strong> Attendance / Production Types</strong>.
                </p>
                <Link href="/masters/payroll-info/attendance-types" className="btn btn-primary">
                    Go to Attendance Types
                </Link>
            </div>
        </div>
    );
}
