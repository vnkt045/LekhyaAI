'use client';

import { Printer, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function HandbookPage() {
    return (
        <div className="bg-white min-h-screen text-slate-800 font-serif leading-relaxed print:p-0">
            {/* Nav (Hidden in Print) */}
            <div className="print:hidden sticky top-0 bg-white/90 backdrop-blur border-b border-gray-100 p-4 flex justify-between items-center z-10">
                <Link href="/marketing" className="flex items-center gap-2 text-slate-600 hover:text-lekhya-primary font-sans font-bold">
                    <ArrowLeft className="w-5 h-5" /> Back to Site
                </Link>
                <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 bg-lekhya-primary text-white px-4 py-2 rounded-lg font-sans font-bold hover:bg-blue-700"
                >
                    <Printer className="w-4 h-4" /> Download as PDF
                </button>
            </div>

            <article className="max-w-4xl mx-auto p-12 print:max-w-none print:p-8">
                {/* Title Page */}
                <div className="text-center py-20 border-b border-gray-200 mb-12">
                    <h1 className="text-5xl font-black mb-4 font-sans text-lekhya-primary">LekhyaAI</h1>
                    <p className="text-2xl text-slate-500 font-sans">Official User Handbook</p>
                    <p className="mt-8 text-slate-400 text-sm font-sans">Version 1.0 • Updated Jan 2026</p>
                </div>

                {/* TOC */}
                <div className="mb-16 bg-slate-50 p-8 rounded-xl print:bg-white print:border print:border-gray-200">
                    <h3 className="font-bold text-xl mb-6 font-sans">Table of Contents</h3>
                    <ul className="grid grid-cols-2 gap-y-2 gap-x-8 font-sans text-sm">
                        <li>1. Getting Started</li>
                        <li>2. Creating Masters (Ledgers)</li>
                        <li>3. Voucher Entry</li>
                        <li>4. GST Compliance</li>
                        <li>5. Banking & Reconciliation</li>
                        <li>6. Payroll Management</li>
                        <li>7. Keyboard Shortcuts</li>
                        <li>8. Support</li>
                    </ul>
                </div>

                {/* Content */}
                <div className="prose prose-slate max-w-none font-sans">
                    <h2>1. Getting Started</h2>
                    <p>Welcome to LekhyaAI. This platform is designed to provide fast, efficient accounting while providing modern web capabilities.</p>
                    <ul>
                        <li><b>Dashboard:</b> Your central hub for financial insights.</li>
                        <li><b>Global Header:</b> Accessible everywhere. Press <code>Ctrl+K</code> to search vouchers.</li>
                    </ul>

                    <h2 className="mt-12">2. Creating Masters</h2>
                    <p>Masters are the building blocks. Navigate to <b>Masters &gt; Ledger &gt; Create</b>.</p>
                    <p>Key fields:</p>
                    <ul>
                        <li><b>Name:</b> Unique name of the ledger (e.g. "HDFC Bank").</li>
                        <li><b>Group:</b> The parent group (e.g. "Bank Accounts"). This determines where it sits in the Balance Sheet.</li>
                        <li><b>Opening Balance:</b> Positive for Debit (Receivable/Asset), Negative for Credit (Payable/Liability).</li>
                    </ul>

                    <h2 className="mt-12">3. Voucher Entry</h2>
                    <p>Record transactions via <b>Vouchers &gt; New Voucher</b>.</p>
                    <p>Types supported:</p>
                    <ul>
                        <li><b>Receipt:</b> Money coming in.</li>
                        <li><b>Payment:</b> Money going out.</li>
                        <li><b>Sales:</b> Billing a customer.</li>
                        <li><b>Purchase:</b> Buying goods/services.</li>
                        <li><b>Contra:</b> Cash to Bank or Bank to Bank.</li>
                        <li><b>Journal:</b> Adjustments.</li>
                    </ul>
                    <div className="bg-yellow-50 p-4 rounded border-l-4 border-yellow-400 my-4 text-sm">
                        <b>Tip:</b> Use "Credit Note" for Sales Returns and "Debit Note" for Purchase Returns.
                    </div>

                    <h2 className="mt-12">4. GST Compliance</h2>
                    <p>LekhyaAI automates your GST returns.</p>
                    <ul>
                        <li>Ensure your Company GSTIN is set in <b>Setup &gt; Company</b>.</li>
                        <li>Enter Party GSTINs in Ledger Masters.</li>
                        <li>Go to <b>GST &gt; GSTR-1</b> to view your Sales tax liability. Click "Export JSON" to file on the government portal.</li>
                    </ul>

                    <h2 className="mt-12">5. Payroll Management (New)</h2>
                    <p>Manage your workforce payments efficiently.</p>
                    <ol>
                        <li><b>Pay Heads:</b> Define Earnings (Basic, HRA) and Deductions (PF).</li>
                        <li><b>Employees:</b> specific details like Bank Account and PAN.</li>
                        <li><b>Salary Details:</b> Link Pay Heads to Employees with specific amounts.</li>
                        <li><b>Attendance:</b> Mark Present/Absent days.</li>
                    </ol>

                    <h2 className="mt-12">6. Keyboard Shortcuts</h2>
                    <table className="w-full text-sm text-left border-collapse border border-gray-200 mt-4">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-2 border">Key</th>
                                <th className="p-2 border">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td className="p-2 border">Alt + C</td><td className="p-2 border">Create Ledger (Popup)</td></tr>
                            <tr><td className="p-2 border">Ctrl + Enter</td><td className="p-2 border">Submit Vouchers</td></tr>
                            <tr><td className="p-2 border">Esc</td><td className="p-2 border">Back / Close Modal</td></tr>
                        </tbody>
                    </table>
                </div>

                <div className="mt-20 pt-10 border-t border-gray-200 text-center text-sm text-slate-500 font-sans">
                    <p>Generated by LekhyaAI System • support@lekhya.ai</p>
                </div>
            </article>
        </div>
    );
}
