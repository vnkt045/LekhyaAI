'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { Building, Save, ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';

export default function BankSetupPage() {
    const router = useRouter();
    // const { completeStep } = useAppStore();

    const handleSave = () => {
        router.push('/');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <header className="bg-white border-b border-slate-200 h-16 flex items-center px-6 sticky top-0 z-10">
                <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm font-medium">Back to Dashboard</span>
                </Link>
            </header>

            <div className="flex-1 p-6 md:p-12 max-w-3xl mx-auto w-full flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6">
                    <Building className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900">Bank Accounts</h1>
                <p className="text-slate-500 mt-2 max-w-md">Connect your bank accounts for automatic reconciliation or add them manually.</p>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg">
                    <button className="p-6 bg-white border border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all text-left group">
                        <h3 className="font-semibold text-slate-800 group-hover:text-blue-600">Manual Entry</h3>
                        <p className="text-sm text-slate-500 mt-1">Add details manually</p>
                    </button>
                    <button className="p-6 bg-white border border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all text-left group opacity-50 cursor-not-allowed">
                        <h3 className="font-semibold text-slate-800">Connect Bank API</h3>
                        <p className="text-sm text-slate-500 mt-1">Coming Soon</p>
                    </button>
                </div>

                <button
                    onClick={handleSave}
                    className="mt-12 text-sm text-slate-500 hover:text-slate-800 underline"
                >
                    Skip for now
                </button>
            </div>
        </div>
    );
}
