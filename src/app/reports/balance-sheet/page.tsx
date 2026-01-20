'use client';

import { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/utils';
import { Scale, Download, ArrowLeft, Filter, ChevronRight, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { BalanceSheetPDF } from '@/components/BalanceSheetPDF';

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

export default function BalanceSheetPage() {
    const [loading, setLoading] = useState(true);
    const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);

    // Categorized Data
    const [assetNodes, setAssetNodes] = useState<TrialBalanceNode[]>([]);
    const [liabilityNodes, setLiabilityNodes] = useState<TrialBalanceNode[]>([]);
    const [equityNodes, setEquityNodes] = useState<TrialBalanceNode[]>([]);

    // Totals
    const [totalAssets, setTotalAssets] = useState(0);
    const [totalLiabilities, setTotalLiabilities] = useState(0);
    const [totalEquity, setTotalEquity] = useState(0);
    const [netProfit, setNetProfit] = useState(0);
    const [generatingPDF, setGeneratingPDF] = useState(false);

    const [company, setCompany] = useState<any>(null);

    const exportToPDF = async () => {
        setGeneratingPDF(true);
        try {
            const blob = await pdf(
                <BalanceSheetPDF
                    date={asOfDate}
                    assets={assetNodes}
                    liabilities={liabilityNodes}
                    equity={equityNodes}
                    netProfit={netProfit}
                    totalAssets={totalAssets}
                    totalLiabilitiesAndEquity={totalLiabilities + totalEquity + netProfit}
                    companyName={company?.name}
                    companyAddress={company ? `${company.address}, ${company.city}, ${company.state} - ${company.pincode}` : undefined}
                    companyGstin={company?.gstin}
                />
            ).toBlob();
            saveAs(blob, `Balance_Sheet_${asOfDate}.pdf`);
        } catch (error) {
            console.error('PDF Gen Error:', error);
            alert('Failed to generate PDF');
        } finally {
            setGeneratingPDF(false);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            // Parallel fetch for data and company info
            // (Company info could be globally cached but per-page fetch is safer for now)
            const [trialRes, companyRes] = await Promise.all([
                fetch(`/api/reports/trial-balance?to=${asOfDate}`),
                fetch('/api/setup/company')
            ]);

            if (companyRes.ok) {
                const companyData = await companyRes.json();
                setCompany(companyData);
            }

            if (trialRes.ok) {
                const roots: TrialBalanceNode[] = await trialRes.json();

                // ... rest of processing ...

                // 1. Calculate Net Profit (Income - Expense) to add to Equity
                const incomeNodes = roots.filter(n => ['Income', 'Revenue'].includes(n.type));
                const expenseNodes = roots.filter(n => n.type === 'Expense');

                let totalIncome = 0;
                incomeNodes.forEach(n => totalIncome += (n.credit - n.debit));

                let totalExpense = 0;
                expenseNodes.forEach(n => totalExpense += (n.debit - n.credit));

                const calculatedNetProfit = totalIncome - totalExpense;
                setNetProfit(calculatedNetProfit);

                // 2. Filter BS Items
                const assets = roots.filter(n => n.type === 'Asset');
                const liabilities = roots.filter(n => n.type === 'Liability');
                const equity = roots.filter(n => n.type === 'Equity' || n.type === 'Capital'); // Adjust based on exact schema types used

                // 3. Calculate Totals
                let tAssets = 0;
                assets.forEach(n => tAssets += (n.debit - n.credit)); // Assets are Debit

                let tLiabilities = 0;
                liabilities.forEach(n => tLiabilities += (n.credit - n.debit)); // Liabilities are Credit

                let tEquity = 0;
                equity.forEach(n => tEquity += (n.credit - n.debit)); // Equity is Credit

                setAssetNodes(assets);
                setLiabilityNodes(liabilities);
                setEquityNodes(equity);

                setTotalAssets(tAssets);
                setTotalLiabilities(tLiabilities);
                setTotalEquity(tEquity);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleApplyFilter = () => {
        fetchData();
    };

    // Net Profit is added to Liabilities side
    const totalLiabilitiesAndEquity = totalLiabilities + totalEquity + netProfit;
    const isBalanced = Math.abs(totalAssets - totalLiabilitiesAndEquity) < 1; // Tolerance for float

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center text-slate-500">
            <div className="animate-pulse flex flex-col items-center">
                <div className="h-4 w-32 bg-slate-200 rounded mb-2"></div>
                <p>Generating Balance Sheet...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-lekhya-base p-8 font-sans flex flex-col">
            {/* Header */}
            <div className="max-w-6xl mx-auto mb-6 w-full">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <Link href="/reports" className="hover:bg-slate-100 p-2 rounded-full transition-colors">
                                <ArrowLeft className="w-5 h-5 text-slate-600" />
                            </Link>
                            <div className="p-3 bg-lekhya-primary rounded-lg">
                                <Scale className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-lekhya-primary">Balance Sheet</h1>
                                <p className="text-sm text-slate-600">Statement of Financial Position</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-lg border border-slate-200">
                                <span className="text-sm font-medium text-slate-600 px-2">As of:</span>
                                <input
                                    type="date"
                                    value={asOfDate}
                                    onChange={(e) => setAsOfDate(e.target.value)}
                                    className="bg-transparent text-sm outline-none"
                                />
                                <button
                                    onClick={handleApplyFilter}
                                    className="bg-lekhya-accent text-white p-1 rounded hover:bg-orange-600 transition-colors"
                                >
                                    <Filter className="w-4 h-4" />
                                </button>
                            </div>
                            <button
                                onClick={exportToPDF}
                                disabled={generatingPDF}
                                className="flex items-center gap-2 px-4 py-2 bg-lekhya-primary text-white rounded-lg hover:bg-[#0f2d4a] transition-colors disabled:opacity-70 disabled:cursor-wait shadow-sm"
                            >
                                <Download className="w-4 h-4" />
                                {generatingPDF ? 'Generating PDF...' : 'Download PDF Report'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Balance Sheet Content */}
            <div className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

                {/* Left Side (Liabilities & Equity - Indian/Tally Convention often puts Liabilities Left, Assets Right) 
                    But standard International is Assets Left. Let's stick to Tally style: Liabilities Left, Assets Right.
                */}

                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
                    <div className="bg-slate-100 p-4 border-b border-slate-200">
                        <h2 className="text-lg font-bold text-slate-800">LIABILITIES</h2>
                    </div>
                    <div className="p-4 flex-1 space-y-4">
                        {/* Capital / Equity */}
                        <div>
                            <h3 className="font-bold text-slate-700 mb-2 uppercase text-sm border-b border-slate-100 pb-1">Capital Account</h3>
                            <div className="space-y-1">
                                {equityNodes.map(node => <BSRow key={node.id} node={node} side="liability" />)}
                            </div>
                        </div>

                        {/* Net Profit (Added to Capital) */}
                        <div className="flex justify-between py-1.5 px-2 font-medium text-slate-800">
                            <span>Profit & Loss A/c</span>
                            <span>{formatCurrency(netProfit)}</span>
                        </div>

                        {/* Liabilities */}
                        <div className="mt-4">
                            <h3 className="font-bold text-slate-700 mb-2 uppercase text-sm border-b border-slate-100 pb-1">Loans & Liabilities</h3>
                            <div className="space-y-1">
                                {liabilityNodes.map(node => <BSRow key={node.id} node={node} side="liability" />)}
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-between font-bold text-lekhya-primary text-lg">
                        <span>Total</span>
                        <span>{formatCurrency(totalLiabilitiesAndEquity)}</span>
                    </div>
                </div>

                {/* Right Side (Assets) */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
                    <div className="bg-slate-100 p-4 border-b border-slate-200">
                        <h2 className="text-lg font-bold text-slate-800">ASSETS</h2>
                    </div>
                    <div className="p-4 flex-1 space-y-1">
                        {assetNodes.map(node => <BSRow key={node.id} node={node} side="asset" />)}
                    </div>
                    <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-between font-bold text-lekhya-primary text-lg">
                        <span>Total</span>
                        <span>{formatCurrency(totalAssets)}</span>
                    </div>
                </div>

            </div>

            {/* Balance Check Warning */}
            {!isBalanced && (
                <div className="max-w-6xl mx-auto mt-6 w-full print:hidden">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center animate-pulse">
                        <p className="text-red-800 font-bold">
                            ⚠️ Difference in Books: {formatCurrency(Math.abs(totalAssets - totalLiabilitiesAndEquity))}
                        </p>
                        <p className="text-red-600 text-sm">Please check for opening balance discrepancies.</p>
                    </div>
                </div>
            )}

        </div>
    );
}

function BSRow({ node, side, level = 0 }: { node: TrialBalanceNode, side: 'asset' | 'liability', level?: number }) {
    const val = side === 'asset' ? (node.debit - node.credit) : (node.credit - node.debit);
    const [expanded, setExpanded] = useState(true);
    const hasChildren = node.children && node.children.length > 0;

    if (val === 0 && !hasChildren) return null;

    return (
        <div className="text-sm">
            <div
                className={`flex justify-between py-1.5 px-2 rounded hover:bg-slate-50 cursor-pointer ${level === 0 ? 'font-semibold text-slate-800' : 'text-slate-600'}`}
                style={{ paddingLeft: `${level * 16 + 8}px` }}
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-1">
                    {hasChildren && (
                        expanded ? <ChevronDown className="w-3 h-3 text-slate-400" /> : <ChevronRight className="w-3 h-3 text-slate-400" />
                    )}
                    <span>{node.name}</span>
                </div>
                <span className="font-mono">{formatCurrency(val)}</span>
            </div>
            {expanded && hasChildren && node.children?.map(child => (
                <BSRow key={child.id} node={child} side={side} level={level + 1} />
            ))}
        </div>
    );
}
