'use client';

import Link from 'next/link';
import { ArrowLeft, Book, Shield, Zap, Menu } from 'lucide-react';
import { useState } from 'react';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen flex flex-col font-sans bg-white text-slate-900">
            {/* Navigation */}
            <header className="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-gray-100 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <Link href="/marketing" className="flex items-center gap-2">
                            <span className="text-2xl font-black bg-gradient-to-r from-lekhya-primary to-blue-600 bg-clip-text text-transparent">
                                LekhyaAI
                            </span>
                        </Link>

                        {/* Desktop Nav */}
                        <nav className="hidden md:flex items-center gap-8">
                            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-lekhya-primary transition-colors">Features</a>
                            <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-lekhya-primary transition-colors">Pricing</a>
                            <Link href="/marketing/handbook" className="text-sm font-medium text-slate-600 hover:text-lekhya-primary transition-colors flex items-center gap-1">
                                <Book className="w-4 h-4" /> Handbook
                            </Link>
                            <Link href="/" className="px-4 py-2 bg-lekhya-primary text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 duration-200">
                                Launch App
                            </Link>
                        </nav>

                        {/* Mobile Menu Button */}
                        <button className="md:hidden p-2 text-slate-600" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-40 bg-white pt-20 px-6 md:hidden">
                    <nav className="flex flex-col gap-6 text-lg font-medium">
                        <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
                        <a href="#pricing" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
                        <Link href="/marketing/handbook" onClick={() => setMobileMenuOpen(false)}>Handbook</Link>
                        <Link href="/" onClick={() => setMobileMenuOpen(false)} className="bg-lekhya-primary text-white p-3 rounded text-center">Launch App</Link>
                        <button onClick={() => setMobileMenuOpen(false)} className="text-slate-500 text-sm mt-4">Close Menu</button>
                    </nav>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-grow pt-16">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-400 py-12">
                <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-2">
                        <span className="text-xl font-black text-white block mb-4">LekhyaAI</span>
                        <p className="max-w-sm">Ethical, intelligent accounting software built for the modern Indian business. GST-Ready, Audit-Proof, and Cloud-Enabled.</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-white mb-4">Product</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#features" className="hover:text-white">Features</a></li>
                            <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                            <li><Link href="/marketing/handbook" className="hover:text-white">Help Book</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-white mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-slate-800 text-center text-sm">
                    © 2026 LekhyaAI. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
