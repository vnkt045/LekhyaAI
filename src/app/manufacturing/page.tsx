'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package, Factory } from 'lucide-react';

export default function ManufacturingPage() {
    const router = useRouter();

    const menuItems: { label: string; path: string; key: string }[] = [
        { label: 'Bill of Materials (BOM)', path: '/manufacturing/bom', key: 'B' },
        { label: 'Production Entry', path: '/manufacturing/production', key: 'P' },
    ];

    return (
        <div className="flex flex-col h-screen bg-lekhya-base">
            {/* Header */}
            <div className="lekhya-header z-10">
                <div className="flex items-center gap-4">
                    <Link href="/masters" className="hover:bg-white/10 p-1.5 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-lekhya-accent" />
                    </Link>
                    <h1 className="font-bold text-lg tracking-wide pl-2">LekhyaAI <span className="text-gray-400 text-sm font-normal">/ Manufacturing</span></h1>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Main Content Area */}
                <div className="flex-1 flex" onClick={() => router.push('/masters')}>
                    {/* Left Panel */}
                    <div className="flex-1 bg-white border-r border-gray-200 p-8 text-gray-400">
                        {/* Optional content */}
                    </div>

                    {/* Right Panel (Menu) */}
                    <div className="w-[400px] bg-white border-l-4 border-lekhya-accent flex flex-col font-sans text-sm relative shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="bg-lekhya-dark text-white p-2 text-center font-bold tracking-wider uppercase border-b border-lekhya-accent">
                            Manufacturing
                        </div>

                        <div className="flex-1 py-4 flex flex-col gap-1 items-center justify-center">
                            {menuItems.map((item) => (
                                <button
                                    key={item.label}
                                    onClick={() => router.push(item.path)}
                                    className="w-3/4 py-2 px-4 rounded transition-all text-center relative group hover:bg-lekhya-accent hover:text-white cursor-pointer border border-transparent hover:border-lekhya-accent/50"
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

                        <div className="bg-slate-50 p-1 text-[10px] text-center text-slate-400 border-t border-gray-100">
                            LekhyaAI Enterprise
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
