'use client';

import { Terminal, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Import the same command list
const COMMANDS: Record<string, { route: string; description: string; category: string }> = {
    // Masters
    'MAS': { route: '/masters', description: 'Masters Menu', category: 'Masters' },
    'CRT': { route: '/setup/accounts', description: 'Create / Alter', category: 'Masters' },
    'LDG': { route: '/masters/ledger/create', description: 'Create Ledger', category: 'Masters' },
    'GRP': { route: '/masters/groups', description: 'Groups', category: 'Masters' },
    'COA': { route: '/setup/accounts', description: 'Chart of Accounts', category: 'Masters' },

    // Vouchers
    'VCH': { route: '/vouchers', description: 'Vouchers Menu', category: 'Vouchers' },
    'PMT': { route: '/vouchers?type=payment', description: 'Payment Voucher', category: 'Vouchers' },
    'RCT': { route: '/vouchers?type=receipt', description: 'Receipt Voucher', category: 'Vouchers' },
    'JRN': { route: '/vouchers?type=journal', description: 'Journal Voucher', category: 'Vouchers' },
    'SAL': { route: '/vouchers?type=sales', description: 'Sales Voucher', category: 'Vouchers' },
    'PUR': { route: '/vouchers?type=purchase', description: 'Purchase Voucher', category: 'Vouchers' },
    'CNT': { route: '/vouchers?type=contra', description: 'Contra Voucher', category: 'Vouchers' },
    'CDN': { route: '/vouchers?type=credit-note', description: 'Credit Note', category: 'Vouchers' },
    'DBN': { route: '/vouchers?type=debit-note', description: 'Debit Note', category: 'Vouchers' },
    'DAY': { route: '/daybook', description: 'Day Book', category: 'Vouchers' },

    // Company
    'COM': { route: '/companies', description: 'Select Company', category: 'Company' },
    'CMP': { route: '/setup/company?mode=update', description: 'Company Info', category: 'Company' },

    // Reports
    'RPT': { route: '/reports', description: 'Reports Menu', category: 'Reports' },
    'BAL': { route: '/reports/balance-sheet', description: 'Balance Sheet', category: 'Reports' },
    'PNL': { route: '/reports/profit-loss', description: 'Profit & Loss', category: 'Reports' },
    'STK': { route: '/reports/stock-summary', description: 'Stock Summary', category: 'Reports' },
    'RAT': { route: '/reports/ratio-analysis', description: 'Ratio Analysis', category: 'Reports' },

    // Utilities
    'GST': { route: '/gst', description: 'GST Reports', category: 'Utilities' },
    'BNK': { route: '/banking', description: 'Banking', category: 'Utilities' },
    'CAL': { route: 'CALCULATOR', description: 'Calculator', category: 'Utilities' },

    // System
    'HOM': { route: '/', description: 'Home/Dashboard', category: 'System' },
    'SET': { route: '/settings', description: 'Settings', category: 'System' },
    'QUT': { route: 'LOGOUT', description: 'Quit/Logout', category: 'System' },
};

export default function CommandIndexPage() {
    // Group commands by category
    const categories = ['Masters', 'Vouchers', 'Company', 'Reports', 'Utilities', 'System'];

    return (
        <div className="min-h-screen bg-lekhya-base p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-lekhya-accent hover:text-lekhya-dark mb-4">
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm">Back to Dashboard</span>
                    </Link>
                    <div className="flex items-center gap-3 mb-2">
                        <Terminal className="w-8 h-8 text-lekhya-accent" />
                        <h1 className="text-3xl font-bold text-lekhya-dark">Command Index</h1>
                    </div>
                    <p className="text-gray-600">
                        Complete list of all navigation commands. Press <kbd className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">Ctrl+G</kbd> to open Command Box.
                    </p>
                </div>

                {/* Command List by Category */}
                <div className="space-y-6">
                    {categories.map(category => {
                        const categoryCommands = Object.entries(COMMANDS).filter(
                            ([_, cmd]) => cmd.category === category
                        );

                        return (
                            <div key={category} className="bg-white rounded-lg shadow-md overflow-hidden">
                                <div className="bg-lekhya-dark text-white px-6 py-3">
                                    <h2 className="text-lg font-bold">{category}</h2>
                                </div>
                                <div className="divide-y divide-gray-200">
                                    {categoryCommands.map(([code, cmd]) => (
                                        <div key={code} className="px-6 py-4 hover:bg-lekhya-accent/5 transition-colors flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <span className="font-mono font-bold text-2xl text-lekhya-accent w-16">
                                                    {code}
                                                </span>
                                                <span className="text-gray-700">
                                                    {cmd.description}
                                                </span>
                                            </div>
                                            {cmd.route !== 'CALCULATOR' && cmd.route !== 'LOGOUT' && (
                                                <span className="text-xs text-gray-400 font-mono">
                                                    {cmd.route}
                                                </span>
                                            )}
                                            {cmd.route === 'CALCULATOR' && (
                                                <span className="text-xs text-lekhya-accent font-semibold">
                                                    Opens Calculator
                                                </span>
                                            )}
                                            {cmd.route === 'LOGOUT' && (
                                                <span className="text-xs text-red-500 font-semibold">
                                                    Logout Action
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer Help */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="font-bold text-blue-900 mb-2">How to Use Commands</h3>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                        <li>Press <kbd className="px-1 py-0.5 bg-white rounded font-mono text-xs">Ctrl+G</kbd> to open the Command Box</li>
                        <li>Type the 3-letter command code (e.g., <code className="px-1 py-0.5 bg-white rounded font-mono text-xs">PMT</code>)</li>
                        <li>Press <kbd className="px-1 py-0.5 bg-white rounded font-mono text-xs">Enter</kbd> to navigate</li>
                        <li>Leave the input empty to see all commands with suggestions</li>
                    </ol>
                </div>
            </div>
        </div>
    );
}
