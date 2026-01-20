'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { Building2, Plus, ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import EmptyState from '@/components/EmptyState';

export default function SelectCompanyPage() {
    const router = useRouter();
    const { companies, selectCompany, activeCompanyId } = useAppStore();
    const [mounted, setMounted] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        setMounted(true);
    }, []);

    const filteredCompanies = companies.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (id: string) => {
        selectCompany(id);
        router.push('/');
    };

    // Hotkey: Esc to back (if logged in, maybe logout? or dashboard if active)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') router.push('/');
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [router]);

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-lekhya-base flex flex-col font-sans">
            {/* Premium Header */}
            <header className="bg-lekhya-primary text-white h-12 flex items-center justify-between px-4 border-b-[3px] border-lekhya-accent shadow-sm sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <Link href="/" className="hover:bg-white/10 p-1.5 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-lekhya-accent" />
                    </Link>
                    <h1 className="text-lg font-bold tracking-wide">Select Company</h1>
                </div>
            </header>

            <div className="flex-1 p-6 md:p-12 max-w-4xl mx-auto w-full">

                {companies.length === 0 ? (
                    <EmptyState
                        icon={Building2}
                        title="No Companies Found"
                        description="Welcome to LekhyaAI. Create your first company to get started."
                        actionLabel="Create Company"
                        onAction={() => router.push('/setup/company')}
                    />
                ) : (
                    <div className="bg-white rounded-sm shadow-sm border border-[#BDCDD6] overflow-hidden">
                        <div className="bg-[#F8FAFC] px-6 py-4 border-b border-[#E2E8F0] flex justify-between items-center">
                            <h2 className="text-lekhya-primary font-bold text-sm uppercase tracking-wide">List of Companies</h2>
                            <Link href="/setup/company?mode=create" className="text-sm font-bold text-lekhya-accent hover:text-orange-600 flex items-center gap-1">
                                <Plus className="w-4 h-4" /> Create Company
                            </Link>
                        </div>

                        <div className="p-4 bg-[#1A3E5C] text-white">
                            <input
                                type="text"
                                placeholder="Search Company..."
                                className="w-full bg-white/10 border border-white/20 text-white placeholder-slate-400 px-4 py-2 text-sm focus:outline-none focus:border-lekhya-accent"
                                autoFocus
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="divide-y divide-slate-100">
                            {filteredCompanies.map((c, idx) => (
                                <div
                                    key={c.id}
                                    onClick={() => handleSelect(c.id)}
                                    className={`px-6 py-4 flex items-center justify-between hover:bg-yellow-50 cursor-pointer group transition-colors ${c.id === activeCompanyId ? 'bg-blue-50' : ''}`}
                                >
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-base font-bold text-lekhya-primary group-hover:text-blue-700">{c.name}</h3>
                                            {c.id === activeCompanyId && <span className="text-[10px] bg-lekhya-accent text-lekhya-primary px-2 rounded-full font-bold">Active</span>}
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1 font-mono">FY: {new Date(c.financialYearStart).getFullYear()}</p>
                                    </div>
                                    <div className="text-right text-xs text-slate-400">
                                        <div className="font-mono">{c.id.substring(0, 6)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-[#F8FAFC] px-6 py-3 border-t border-[#E2E8F0] text-xs text-slate-400 italic">
                            {filteredCompanies.length} companies found
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-[#1A3E5C] text-white/70 text-xs py-1 px-4 fixed bottom-0 w-full flex justify-between items-center">
                <div className="flex gap-4">
                    <span><strong className="text-lekhya-accent">Enter</strong> Select</span>
                    <span><strong className="text-lekhya-accent">Alt+C</strong> Create Company</span>
                </div>
                <button
                    onClick={() => {
                        if (confirm('FACTORY RESET: Remove all local data and start fresh?')) {
                            localStorage.clear();
                            window.location.reload();
                        }
                    }}
                    className="text-red-400 hover:text-red-200 cursor-pointer text-[10px] uppercase font-bold tracking-wider"
                >
                    Clear Data
                </button>
            </div>
        </div>
    );
}
