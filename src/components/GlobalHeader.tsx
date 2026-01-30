'use client';

import {
    Home, AlertCircle, Save, X, Menu, Search, LogOut, User, ChevronDown,
    // Category Icons
    FileText, Receipt, BarChart3, Settings, Landmark,
    // Item Icons
    List, BookOpen, PlusCircle, Files, PlusSquare, Scale, TrendingUp, Package, Building2, Users, CreditCard, Upload
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import ConfirmDialog from './ConfirmDialog';

export default function GlobalHeader() {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session } = useSession();
    const [showModal, setShowModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isMounted, setIsMounted] = useState(false);

    // Set mounted state
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Update clock every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Only hide on login page, marketing site, and setup flow
    if (pathname === '/login' || pathname?.startsWith('/marketing') || pathname?.startsWith('/setup') || pathname?.startsWith('/activate')) {
        return null;
    }

    const handleHomeClick = (e: React.MouseEvent) => {
        e.preventDefault();
        router.push('/');
    };

    const menuItems = [
        {
            category: 'Masters',
            icon: FileText,
            items: [
                { label: 'Chart of Accounts', href: '/masters/accounts-info', icon: List },
                { label: 'Ledger', href: '/masters/ledger', icon: BookOpen },
                { label: 'Create Ledger', href: '/masters/ledger/create', icon: PlusCircle },
            ]
        },
        {
            category: 'Vouchers',
            icon: Receipt,
            items: [
                { label: 'All Vouchers', href: '/vouchers', icon: Files },
                { label: 'New Voucher', href: '/vouchers/new', icon: PlusSquare },
                { label: 'Day Book', href: '/daybook', icon: BookOpen },
            ]
        },
        {
            category: 'Reports',
            icon: BarChart3,
            items: [
                { label: 'GST Reports', href: '/gst', icon: FileText },
                { label: 'Trial Balance', href: '/reports/trial-balance', icon: Scale },
                { label: 'Balance Sheet', href: '/reports/balance-sheet', icon: Landmark },
                { label: 'Profit & Loss', href: '/reports/profit-loss', icon: TrendingUp },
                { label: 'Stock Summary', href: '/reports/stock-summary', icon: Package },
                { label: 'Ratio Analysis', href: '/reports/ratio-analysis', icon: BarChart3 },
            ]
        },
        {
            category: 'Setup',
            icon: Settings,
            items: [
                { label: 'Company Profile', href: '/setup/company', icon: Building2 },
                { label: 'User Management', href: '/admin/users', icon: Users },
                { label: 'System Configuration', href: '/settings', icon: Settings },
            ]
        },
        {
            category: 'Banking',
            icon: Landmark,
            items: [
                { label: 'Banking Module', href: '/banking', icon: CreditCard },
            ]
        },
    ];

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const handleLogout = () => {
        setShowUserMenu(false);
        setShowLogoutConfirm(true);
    };

    const confirmLogout = () => {
        // Use window.location.origin to ensure we redirect to the current domain/port
        // This prevents redirection to localhost:3000 if running on 3001 or LAN
        signOut({ callbackUrl: `${window.location.origin}/login` });
    };

    return (
        <>
            <header className="bg-lekhya-primary text-white h-16 flex items-center justify-between px-6 border-b-[3px] border-lekhya-accent shadow-lg relative z-[100]">
                {/* Left Section - Home & Menu */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleHomeClick}
                        className="p-2.5 hover:bg-white/20 rounded-lg transition-colors bg-white/10 border-2 border-white/40"
                        title="Go to Home"
                    >
                        <Home className="w-6 h-6" color="white" strokeWidth={2.5} />
                    </button>

                    <button
                        onClick={() => window.dispatchEvent(new CustomEvent('openCalculator'))}
                        className="p-2.5 hover:bg-white/20 rounded-lg transition-colors bg-white/10 border-2 border-white/40"
                        title="Calculator (Ctrl+N)"
                    >
                        <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <rect x="4" y="2" width="16" height="20" rx="2" fill="none" stroke="white" strokeWidth="2" />
                            <line x1="8" y1="6" x2="16" y2="6" stroke="white" strokeWidth="2" />
                            <line x1="8" y1="10" x2="16" y2="10" stroke="white" strokeWidth="2" />
                            <circle cx="7" cy="14" r="1" fill="white" />
                            <circle cx="12" cy="14" r="1" fill="white" />
                            <circle cx="17" cy="14" r="1" fill="white" />
                            <circle cx="7" cy="18" r="1" fill="white" />
                            <circle cx="12" cy="18" r="1" fill="white" />
                            <circle cx="17" cy="18" r="1" fill="white" />
                        </svg>
                    </button>

                    <div className="h-10 w-px bg-white/30"></div>



                    <div className="h-10 w-px bg-white/30"></div>
                    <span className="font-bold text-xl tracking-wide">LekhyaAI</span>
                </div>

                {/* Right Section - Search, User Profile & Clock */}
                <div className="flex items-center gap-6">
                    {/* Global Search */}
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-white/60 group-focus-within:text-lekhya-accent transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search Vouchers..."
                            className="pl-9 pr-4 py-1.5 bg-white/10 border border-white/20 rounded-md text-sm w-64 text-white placeholder-white/50 focus:outline-none focus:border-lekhya-accent focus:ring-1 focus:ring-lekhya-accent transition-all"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    const target = e.target as HTMLInputElement;
                                    if (target.value.trim()) {
                                        router.push(`/vouchers?search=${encodeURIComponent(target.value)}`);
                                    }
                                }
                            }}
                        />
                    </div>

                    {/* User Profile Dropdown */}
                    {session?.user && (
                        <div className="relative">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center gap-2 px-3 py-2 hover:bg-white/20 rounded-lg transition-colors bg-white/10 border border-white/20"
                            >
                                <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center">
                                    <User className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-medium max-w-[120px] truncate">
                                    {session.user.name || session.user.email}
                                </span>
                                <ChevronDown className="w-4 h-4" />
                            </button>

                            {showUserMenu && (
                                <>
                                    <div
                                        className="fixed inset-0 z-[110]"
                                        onClick={() => setShowUserMenu(false)}
                                    />
                                    <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-2xl border border-slate-200 z-[120] overflow-hidden">
                                        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                                            <p className="text-sm font-semibold text-slate-900 truncate">
                                                {session.user.name}
                                            </p>
                                            <p className="text-xs text-slate-500 truncate">
                                                {session.user.email}
                                            </p>
                                        </div>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Logout
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Live Clock - Only render after mount to avoid hydration mismatch */}
                    {isMounted && (
                        <div className="flex flex-col items-end border-l border-white/20 pl-6 h-10 justify-center min-w-[120px]">
                            <div className="font-bold text-sm leading-tight tabular-nums">{formatTime(currentTime)}</div>
                            <div className="text-[10px] opacity-75 font-medium tracking-wide tabular-nums">{formatDate(currentTime)}</div>
                        </div>
                    )}
                </div>
            </header>

            {/* Save Confirmation Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
                        <div className="p-6">
                            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4 text-yellow-600">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Save Your Work?</h3>
                            <p className="text-slate-500 text-sm">
                                You have unsaved changes. Would you like to save before going home?
                            </p>
                        </div>

                        <div className="bg-slate-50 px-6 py-4 flex flex-col gap-2">
                            <button
                                onClick={() => {
                                    setIsSaving(true);
                                    setTimeout(() => router.push('/'), 500);
                                }}
                                disabled={isSaving}
                                className="w-full bg-lekhya-primary text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                            >
                                {isSaving ? 'Saving...' : <><Save className="w-4 h-4" /> Save & Go Home</>}
                            </button>

                            <button
                                onClick={() => router.push('/')}
                                disabled={isSaving}
                                className="w-full bg-white text-slate-700 border border-slate-200 py-2.5 rounded-lg font-medium hover:bg-slate-50 hover:text-red-600 transition-colors flex items-center justify-center gap-2"
                            >
                                <X className="w-4 h-4" /> Discard Changes
                            </button>

                            <button
                                onClick={() => setShowModal(false)}
                                disabled={isSaving}
                                className="w-full text-slate-400 text-sm py-2 hover:text-slate-600"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Logout Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showLogoutConfirm}
                onClose={() => setShowLogoutConfirm(false)}
                onConfirm={confirmLogout}
                title="Logout Confirmation"
                message="Are you sure you want to logout? Any unsaved changes will be lost."
                confirmText="Logout"
                cancelText="Stay Logged In"
                variant="warning"
            />
        </>
    );
}

