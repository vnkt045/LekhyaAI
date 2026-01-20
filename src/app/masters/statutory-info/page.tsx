'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function StatutoryInfoPage() {
    const router = useRouter();

    const menuItems = [
        { label: 'GST Details', path: '/setup/company', key: 'G' },
        { label: 'PAN Details', path: '/setup/company', key: 'P' },
        { label: 'Tax Configuration', path: '/setup/company', key: 'T' },
    ];

    return (
        <div className="flex flex-col h-screen bg-lekhya-base">
            {/* Header */}
            <div className="lekhya-header z-10">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5 text-lekhya-accent" />
                    </button>
                    <h1 className="font-bold text-lg tracking-wide pl-2">LekhyaAI <span className="text-gray-400 text-sm font-normal">/ Masters / Statutory Info</span></h1>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Main Content Area */}
                <div className="flex-1 flex" onClick={() => router.push('/masters')}>
                    {/* Left Panel */}
                    <div className="flex-1 bg-white border-r border-gray-200 p-8 text-gray-400">
                    </div>

                    {/* Right Panel (Menu) */}
                    <div className="w-[400px] bg-white border-l-4 border-lekhya-accent flex flex-col font-sans text-sm relative shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="bg-lekhya-dark text-white p-2 text-center font-bold tracking-wider uppercase border-b border-lekhya-accent">
                            Statutory Info
                        </div>

                        <div className="flex-1 py-4 flex flex-col gap-1 items-center justify-center">
                            {menuItems.map((item) => (
                                <button
                                    key={item.label}
                                    onClick={() => router.push(item.path)}
                                    className="w-3/4 py-2 px-4 rounded hover:bg-lekhya-accent hover:text-white cursor-pointer transition-all text-center relative group border border-transparent hover:border-lekhya-accent/50"
                                >
                                    <span className="text-slate-700 group-hover:text-white font-bold">
                                        <span className="text-lekhya-accent group-hover:text-white">{item.key}</span>{item.label.substring(1)}
                                    </span>
                                </button>
                            ))}

                            <div className="mt-8 mb-4 w-3/4 border-t border-gray-100"></div>

                            <button
                                onClick={() => router.push('/masters')}
                                className="w-3/4 py-2 px-4 rounded hover:bg-lekhya-accent hover:text-white cursor-pointer text-center group"
                            >
                                <span className="text-slate-700 group-hover:text-white font-bold">
                                    <span className="text-lekhya-accent group-hover:text-white">Q</span>uit
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
