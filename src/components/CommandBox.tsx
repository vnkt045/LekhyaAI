'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Terminal, X, ChevronRight } from 'lucide-react';

// Command mapping: code -> route
const COMMANDS: Record<string, { route: string; description: string }> = {
    // Masters
    'MAS': { route: '/masters', description: 'Masters Menu' },
    'CRT': { route: '/setup/accounts', description: 'Create / Alter' },
    'LDG': { route: '/masters/ledger/create', description: 'Create Ledger' },
    'GRP': { route: '/masters/groups', description: 'Groups' },
    'COA': { route: '/setup/accounts', description: 'Chart of Accounts' },

    // Vouchers
    'VCH': { route: '/vouchers', description: 'Vouchers Menu' },
    'PMT': { route: '/vouchers?type=payment', description: 'Payment Voucher' },
    'RCT': { route: '/vouchers?type=receipt', description: 'Receipt Voucher' },
    'JRN': { route: '/vouchers?type=journal', description: 'Journal Voucher' },
    'SAL': { route: '/vouchers?type=sales', description: 'Sales Voucher' },
    'PUR': { route: '/vouchers?type=purchase', description: 'Purchase Voucher' },
    'CNT': { route: '/vouchers?type=contra', description: 'Contra Voucher' },
    'CDN': { route: '/vouchers?type=credit-note', description: 'Credit Note' },
    'DBN': { route: '/vouchers?type=debit-note', description: 'Debit Note' },
    'DAY': { route: '/daybook', description: 'Day Book' },

    // Company
    'COM': { route: '/companies', description: 'Select Company' },
    'CMP': { route: '/setup/company?mode=update', description: 'Company Info' },

    // Reports
    'RPT': { route: '/reports', description: 'Reports Menu' },
    'BAL': { route: '/reports/balance-sheet', description: 'Balance Sheet' },
    'PNL': { route: '/reports/profit-loss', description: 'Profit & Loss' },
    'STK': { route: '/reports/stock-summary', description: 'Stock Summary' },
    'RAT': { route: '/reports/ratio-analysis', description: 'Ratio Analysis' },

    // Utilities
    'GST': { route: '/gst', description: 'GST Reports' },
    'BNK': { route: '/banking', description: 'Banking' },
    'CAL': { route: 'CALCULATOR', description: 'Calculator' },
    'CMD': { route: '/commands', description: 'Command Index' },

    // System
    'HOM': { route: 'HOME', description: 'Home/Dashboard' },
    'SET': { route: '/settings', description: 'Settings' },
    'QUT': { route: 'LOGOUT', description: 'Quit/Logout' },
};

export default function CommandBox() {
    const [command, setCommand] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsFocused(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Update suggestions as user types
    useEffect(() => {
        if (command.length > 0) {
            const matches = Object.keys(COMMANDS).filter(code =>
                code.startsWith(command.toUpperCase())
            );
            setSuggestions(matches.slice(0, 5));
        } else {
            setSuggestions([]);
        }
    }, [command]);

    const executeCommand = (code: string) => {
        const cmd = COMMANDS[code.toUpperCase()];
        if (cmd) {
            // Handle special commands
            if (cmd.route === 'CALCULATOR') {
                window.dispatchEvent(new CustomEvent('openCalculator'));
                setCommand('');
                setIsFocused(false);
                return;
            }
            if (cmd.route === 'LOGOUT') {
                import('next-auth/react').then(({ signOut }) => signOut());
                setCommand('');
                setIsFocused(false);
                return;
            }
            if (cmd.route === 'HOME') {
                router.push('/');
                setCommand('');
                setIsFocused(false);
                return;
            }
            // Normal navigation
            router.push(cmd.route);
            setCommand('');
            setIsFocused(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (command.trim()) {
            executeCommand(command.trim());
        }
    };

    return (
        <div ref={wrapperRef} className="relative z-50">
            {/* Input Field - Permanent Header Element */}
            <form onSubmit={handleSubmit} className="relative">
                <div className={`
                    flex items-center w-[300px] h-8 rounded transition-all duration-200
                    ${isFocused
                        ? 'bg-white text-gray-900 ring-2 ring-lekhya-accent shadow-lg'
                        : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'}
                `}>
                    <div className="pl-2 pr-2">
                        <Terminal className={`w-4 h-4 ${isFocused ? 'text-lekhya-accent' : 'text-white/70'}`} />
                    </div>
                    <input
                        type="text"
                        value={command}
                        onChange={(e) => setCommand(e.target.value.toUpperCase())}
                        onFocus={() => setIsFocused(true)}
                        placeholder={isFocused ? "TYPE CMD..." : "COMMAND"}
                        className={`
                            bg-transparent border-none outline-none w-full pr-2 text-sm font-bold font-mono uppercase
                            placeholder:font-normal placeholder:text-xs
                            ${isFocused ? 'placeholder:text-gray-400' : 'placeholder:text-white/50'}
                        `}
                        maxLength={3}
                    />
                    {command && (
                        <button
                            type="button"
                            onClick={() => { setCommand(''); setIsFocused(false); }}
                            className="mr-2 p-0.5 hover:bg-gray-200 rounded-full text-gray-500"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    )}
                </div>
            </form>

            {/* Dropdown Results */}
            {isFocused && (
                <div className="absolute top-full right-0 mt-2 w-[400px] bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-right">

                    {/* Suggestions Header */}
                    <div className="bg-gray-50 px-3 py-2 border-b border-gray-100 flex justify-between items-center text-xs text-gray-500">
                        <span className="font-bold">AVAILABLE COMMANDS</span>
                        <span>Press Enter to Select</span>
                    </div>

                    <div className="p-2 max-h-[300px] overflow-y-auto">
                        {suggestions.length > 0 ? (
                            <div className="space-y-1">
                                {suggestions.map((code) => (
                                    <button
                                        key={code}
                                        onClick={() => executeCommand(code)}
                                        className="w-full text-left px-3 py-2 hover:bg-lekhya-accent/5 rounded flex items-center justify-between group transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="font-mono font-bold text-lekhya-accent bg-lekhya-accent/10 px-1.5 py-0.5 rounded text-sm min-w-[40px] text-center">
                                                {code}
                                            </span>
                                            <span className="text-sm text-gray-700 font-medium group-hover:text-gray-900">
                                                {COMMANDS[code].description}
                                            </span>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-lekhya-accent opacity-0 group-hover:opacity-100 transition-all" />
                                    </button>
                                ))}
                            </div>
                        ) : command.length === 0 ? (
                            /* Show All Commands when empty */
                            <div className="grid grid-cols-1 gap-1">
                                {Object.entries(COMMANDS).map(([code, { description }]) => (
                                    <button
                                        key={code}
                                        onClick={() => executeCommand(code)}
                                        className="w-full text-left px-3 py-1.5 hover:bg-gray-50 rounded flex items-center gap-3 group"
                                    >
                                        <span className="font-mono text-xs font-bold text-gray-400 group-hover:text-lekhya-accent w-8">
                                            {code}
                                        </span>
                                        <span className="text-xs text-gray-600 group-hover:text-gray-900 truncate">
                                            {description}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="py-4 text-center text-gray-500 text-sm">
                                No commands found for "{command}"
                            </div>
                        )}
                    </div>

                    {/* Command Index Link */}
                    <div className="bg-gray-50 px-3 py-2 border-t border-gray-100 text-center">
                        <button
                            onClick={() => executeCommand('CMD')}
                            className="text-xs text-lekhya-accent hover:underline font-medium"
                        >
                            View Full Command Index
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
