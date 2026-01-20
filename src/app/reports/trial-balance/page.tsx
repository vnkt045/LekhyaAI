'use client';

import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation'; // Not used currently
import { ArrowLeft, Download, ChevronRight, ChevronDown, Filter } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { TrialBalancePDF } from '@/components/TrialBalancePDF';

// Types matching the API response
interface TrialBalanceNode {
    id: string;
    name: string;
    type: string;
    debit: number;
    credit: number;
    net: number;
    isGroup: boolean;
    children?: TrialBalanceNode[];
}

export default function TrialBalancePage() {
    // ... (existing state)
    const [data, setData] = useState<TrialBalanceNode[]>([]);
    const [loading, setLoading] = useState(true);
    const [generatingPDF, setGeneratingPDF] = useState(false);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [totals, setTotals] = useState({ debit: 0, credit: 0 });

    useEffect(() => {
        // Default to Current Fiscal Year (April 1st to Today)
        const today = new Date();
        const currentYear = today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1;
        const start = `${currentYear}-04-01`;
        const end = today.toISOString().split('T')[0];

        setFromDate(start);
        setToDate(end);

        // Initial Fetch
        fetchBalance(start, end);
    }, []);

    const fetchBalance = async (start: string, end: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/reports/trial-balance?from=${start}&to=${end}`);
            if (res.ok) {
                const json = await res.json();
                setData(json.nodes || []);
                setTotals(json.totals || { debit: 0, credit: 0 });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleApplyFilter = () => {
        fetchBalance(fromDate, toDate);
    };

    const exportToPDF = async () => {
        setGeneratingPDF(true);
        try {
            // Fetch company details
            let companyDetails = { name: 'Optima Enterprises', address: '', gstin: '' };
            try {
                const cRes = await fetch('/api/setup/company');
                if (cRes.ok) {
                    const cData = await cRes.json();
                    if (cData && cData.name) {
                        companyDetails = {
                            name: cData.name,
                            address: `${cData.address || ''}, ${cData.city || ''} ${cData.pincode || ''}`,
                            gstin: cData.gstin || ''
                        };
                    }
                }
            } catch (e) { console.error("Error fetching company", e); }

            const blob = await pdf(
                <TrialBalancePDF
                    date={new Date().toISOString()}
                    fromDate={fromDate}
                    toDate={toDate}
                    nodes={data}
                    totalDebit={totals.debit}
                    totalCredit={totals.credit}
                    companyName={companyDetails.name}
                    companyAddress={companyDetails.address}
                    companyGstin={companyDetails.gstin}
                />
            ).toBlob();
            saveAs(blob, `Trial_Balance_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error('PDF Generation failed:', error);
            alert('Failed to generate PDF');
        } finally {
            setGeneratingPDF(false);
        }
    };

    if (loading && data.length === 0) return (
        <div className="min-h-screen flex items-center justify-center text-slate-500">
            <div className="animate-pulse flex flex-col items-center">
                <div className="h-4 w-32 bg-slate-200 rounded mb-2"></div>
                <p>Generating Trial Balance...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-white font-sans flex flex-col">
            {/* Header */}
            <header className="bg-lekhya-primary text-white px-6 py-4 flex flex-col md:flex-row justify-between items-center shadow-sm print:hidden gap-4">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <Link href="/reports" className="hover:bg-white/10 p-2 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold tracking-wide">Trial Balance</h1>
                        <p className="text-xs text-lekhya-accent opacity-80">
                            {fromDate && toDate ? `${fromDate} to ${toDate}` : `As on ${new Date().toLocaleDateString()}`}
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2 bg-white/10 p-1.5 rounded-lg border border-white/20">
                    <input
                        type="date"
                        value={fromDate}
                        onChange={e => setFromDate(e.target.value)}
                        className="bg-transparent text-white text-sm px-2 py-1 outline-none [&::-webkit-calendar-picker-indicator]:invert"
                        placeholder="From"
                    />
                    <span className="text-white/50">-</span>
                    <input
                        type="date"
                        value={toDate}
                        onChange={e => setToDate(e.target.value)}
                        className="bg-transparent text-white text-sm px-2 py-1 outline-none [&::-webkit-calendar-picker-indicator]:invert"
                    />
                    <button
                        onClick={handleApplyFilter}
                        className="bg-lekhya-accent hover:bg-yellow-400 text-lekhya-primary p-1.5 rounded transition-colors"
                        title="Apply Filter"
                    >
                        <Filter className="w-4 h-4" />
                    </button>
                </div>

                <button
                    onClick={exportToPDF}
                    disabled={generatingPDF}
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded text-sm transition-colors disabled:opacity-50"
                >
                    {generatingPDF ? (
                        <span className="animate-spin text-xl">⟳</span>
                    ) : (
                        <Download className="w-4 h-4" />
                    )}
                    {generatingPDF ? 'Generating...' : 'Download PDF Report'}
                </button>
            </header>

            {/* Content */}
            <div className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full">
                <div className="border border-slate-300 shadow-sm bg-white min-h-[500px] flex flex-col">
                    {/* Table Header */}
                    <div className="grid grid-cols-[1fr_150px_150px] bg-slate-50 border-b border-slate-300 font-bold text-lekhya-primary text-sm uppercase sticky top-0 z-10">
                        <div className="p-3 border-r border-slate-300 pl-6">Particulars</div>
                        <div className="p-3 border-r border-slate-300 text-right">Debit</div>
                        <div className="p-3 text-right pr-6">Credit</div>
                    </div>

                    {/* Table Body */}
                    <div className="divide-y divide-slate-100 flex-1 overflow-auto">
                        {data.map((node) => (
                            <TrialBalanceRow key={node.id} node={node} level={0} />
                        ))}
                        {data.length === 0 && !loading && (
                            <div className="p-12 text-center text-slate-400 italic">No data found for this period</div>
                        )}
                    </div>

                    {/* Table Footer */}
                    <div className="grid grid-cols-[1fr_150px_150px] bg-lekhya-primary text-white font-bold text-sm uppercase border-t border-slate-300">
                        <div className="p-3 border-r border-blue-800 text-right pr-6">Grand Total</div>
                        <div className="p-3 border-r border-blue-800 text-right">
                            {formatCurrency(totals.debit)}
                        </div>
                        <div className="p-3 text-right pr-6">
                            {formatCurrency(totals.credit)}
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-center text-xs text-slate-400 print:hidden">
                    Generated by LekhyaAI Accounts
                </div>
            </div>
        </div>
    );
}

// Recursive Row Component
function TrialBalanceRow({ node, level }: { node: TrialBalanceNode, level: number }) {
    const [expanded, setExpanded] = useState(level < 1); // Auto-expand first level (roots)
    const hasChildren = node.isGroup && node.children && node.children.length > 0;

    // Indentation style
    const paddingLeft = `${level * 24 + 12}px`;

    // Font weight: Roots (0) = Bold, Groups (1) = Semi-bold, Accounts = Normal
    const fontWeight = level === 0 ? 'font-bold text-slate-900 uppercase' :
        (node.isGroup ? 'font-semibold text-slate-800' : 'font-normal text-slate-600');

    // Background: Roots get faint highlight
    const bgClass = level === 0 ? 'bg-slate-50/50' : '';

    return (
        <>
            <div className={`grid grid-cols-[1fr_150px_150px] text-sm hover:bg-yellow-50 transition-colors group ${bgClass}`}>
                <div
                    className={`p-2 border-r border-slate-200 flex items-center cursor-pointer select-none ${fontWeight}`}
                    style={{ paddingLeft }}
                    onClick={() => hasChildren && setExpanded(!expanded)}
                >
                    {hasChildren ? (
                        <span className="mr-1 text-slate-400 hover:text-lekhya-primary transition-colors">
                            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </span>
                    ) : (
                        <span className="w-5 mr-1"></span> // Spacer for alignment
                    )}

                    <span className={!node.isGroup ? "hover:underline hover:text-lekhya-primary cursor-pointer" : ""}>
                        {node.name}
                    </span>
                </div>

                <div className={`p-2 border-r border-slate-200 text-right ${fontWeight} ${node.debit > 0 ? 'text-slate-800' : 'text-slate-300'}`}>
                    {node.debit > 0 ? formatCurrency(node.debit) : '-'}
                </div>

                <div className={`p-2 text-right pr-6 ${fontWeight} ${node.credit > 0 ? 'text-slate-800' : 'text-slate-300'}`}>
                    {node.credit > 0 ? formatCurrency(node.credit) : '-'}
                </div>
            </div>

            {expanded && hasChildren && node.children?.map(child => (
                <TrialBalanceRow key={child.id} node={child} level={level + 1} />
            ))}
        </>
    );
}
