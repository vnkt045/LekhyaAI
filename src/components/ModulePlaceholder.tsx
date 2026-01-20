'use client';

import { ArrowLeft, Construction } from 'lucide-react';
import Link from 'next/link';

interface ModulePlaceholderProps {
    title: string;
    description: string;
    icon?: React.ReactNode;
}

export default function ModulePlaceholder({ title, description, icon }: ModulePlaceholderProps) {
    return (
        <div className="min-h-screen bg-lekhya-base flex flex-col font-sans">
            {/* Standard Header */}
            <header className="bg-lekhya-primary text-white h-12 flex items-center justify-between px-4 border-b-[3px] border-lekhya-accent shadow-sm sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <Link href="/" className="hover:bg-white/10 p-1.5 rounded-full transition-colors" title="Back to Gateway">
                        <ArrowLeft className="w-5 h-5 text-lekhya-accent" />
                    </Link>
                    <h1 className="text-lg font-bold tracking-wide">{title}</h1>
                </div>
                <div className="text-xs bg-white/10 px-3 py-1 rounded font-mono">
                    LekhyaAI Enterprise
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="bg-white p-12 rounded-lg shadow-sm border border-slate-200 max-w-lg w-full">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
                        {icon || <Construction className="w-10 h-10" />}
                    </div>
                    <h2 className="text-2xl font-bold text-lekhya-primary mb-2">{title}</h2>
                    <p className="text-slate-500 mb-8">{description}</p>

                    <div className="p-4 bg-yellow-50 border border-yellow-100 rounded text-sm text-yellow-800">
                        This module is currently under development. <br />
                        Check back in the next update.
                    </div>

                    <Link
                        href="/"
                        className="mt-8 inline-flex items-center justify-center px-6 py-2 bg-lekhya-primary text-white font-bold rounded hover:bg-blue-800 transition-colors"
                    >
                        Return to Gateway
                    </Link>
                </div>
            </div>
        </div>
    );
}
