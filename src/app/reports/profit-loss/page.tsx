'use client';

import { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown, ArrowLeft, Download, Filter, ChevronRight, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { ProfitLossPDF } from '@/components/ProfitLossPDF';
import AnalyticsChart from '@/components/AnalyticsChart';

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

export default function ProfitLossPage() {
    const [generatingPDF, setGeneratingPDF] = useState(false);
    const [showChart, setShowChart] = useState(false);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [revenueNodes, setRevenueNodes] = useState<TrialBalanceNode[]>([]);
    const [expenseNodes, setExpenseNodes] = useState<TrialBalanceNode[]>([]);
    const [netProfit, setNetProfit] = useState(0);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [totalExpense, setTotalExpense] = useState(0);

    // Derived state for UI
    const isProfit = netProfit >= 0;

    const fetchData = async () => {
        try {
            const query = new URLSearchParams();
            if (fromDate) query.append('from', fromDate);
            if (toDate) query.append('to', toDate);

            const res = await fetch(`/api/reports/profit-loss?${query.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setRevenueNodes(data.revenue || []);
                setExpenseNodes(data.expenses || []);
                setNetProfit(data.netProfit || 0);
                setTotalRevenue(data.totalRevenue || 0);
                setTotalExpense(data.totalExpense || 0);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        // Set default dates (current financial year) if needed, or just fetch all
        fetchData();
    }, []);

    const handleApplyFilter = () => {
        fetchData();
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
                <ProfitLossPDF
                    date={new Date().toISOString()}
                    fromDate={fromDate}
                    toDate={toDate}
                    revenueNodes={revenueNodes}
                    expenseNodes={expenseNodes}
                    netProfit={netProfit}
                    totalRevenue={totalRevenue}
                    totalExpense={totalExpense}
                    companyName={companyDetails.name}
                    companyAddress={companyDetails.address}
                    companyGstin={companyDetails.gstin}
                />
            ).toBlob();
            saveAs(blob, `Profit_Loss_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error('PDF Generation failed:', error);
            alert('Failed to generate PDF');
        } finally {
            setGeneratingPDF(false);
        }
    };

    // ... (rest of component)

    return (
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
            {/* Header */}
            <header className="bg-lekhya-primary text-white px-6 py-4 flex flex-col md:flex-row justify-between items-center shadow-sm print:hidden gap-4">
                {/* ... (Header left part remains same) */}
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <Link href="/reports" className="hover:bg-white/10 p-2 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold tracking-wide">Profit & Loss A/c</h1>
                        <p className="text-xs text-lekhya-accent opacity-80">
                            {fromDate && toDate ? `${fromDate} to ${toDate}` : `Statement of Financial Performance`}
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

            <div className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full space-y-6">

                {/* Net Profit Card */}
                <div className={`rounded-xl shadow-lg p-6 text-white transition-all ${isProfit ? 'bg-gradient-to-br from-green-600 to-green-700' : 'bg-gradient-to-br from-red-600 to-red-700'}`}>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="bg-white/20 p-3 rounded-lg">
                                {isProfit ? <TrendingUp className="w-8 h-8" /> : <TrendingDown className="w-8 h-8" />}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">{isProfit ? 'NET PROFIT' : 'NET LOSS'}</h2>
                                <p className="opacity-80 text-sm">
                                    {isProfit ? 'Income exceeds Expenses' : 'Expenses exceed Income'}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-4xl font-mono font-bold tracking-tight">{formatCurrency(Math.abs(netProfit))}</p>
                            <div className="flex gap-4 text-sm opacity-80 justify-end mt-1">
                                <span>Rev: {formatCurrency(totalRevenue)}</span>
                                <span>Exp: {formatCurrency(totalExpense)}</span>
                            </div>
                        </div>
                    </div>
                </div>


                {/* Visual Analytics Toggle */}
                <div className="flex justify-end mb-2">
                    <label className="flex items-center gap-2 text-sm text-slate-600 bg-white px-3 py-1.5 rounded-full border border-slate-200 cursor-pointer hover:bg-slate-50">
                        <input type="checkbox" checked={showChart} onChange={e => setShowChart(e.target.checked)} className="rounded text-lekhya-primary focus:ring-0" />
                        <span>Show Visual Analysis</span>
                    </label>
                </div>

                {showChart && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <AnalyticsChart
                            title="Income vs Expenses"
                            data={[
                                { name: 'Total', income: totalRevenue, expense: totalExpense }
                            ]}
                            dataKeys={[
                                { key: 'income', name: 'Total Income', color: '#10B981' },
                                { key: 'expense', name: 'Total Expense', color: '#EF4444' }
                            ]}
                            xAxisKey="name"
                            type="bar" // Default
                        />
                        <AnalyticsChart
                            title="Revenue Breakdown"
                            data={revenueNodes.map(n => ({ name: n.name, value: n.credit - n.debit })).filter(d => d.value > 0)}
                            dataKeys={[
                                { key: 'value', name: 'Amount', color: '#10B981' }
                            ]}
                            xAxisKey="name"
                            type="pie"
                        />
                    </div>
                )}

                {/* T-Format Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

                    {/* Expenses (Left Side) */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
                        <div className="bg-red-50 p-4 border-b border-red-100 flex justify-between items-center">
                            <h3 className="font-bold text-red-800">EXPENSES</h3>
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-mono">Dr</span>
                        </div>
                        <div className="p-4 flex-1 space-y-1">
                            {expenseNodes.length > 0 ? (
                                expenseNodes.map(node => (
                                    <PLRow key={node.id} node={node} type="expense" />
                                ))
                            ) : (
                                <p className="text-slate-400 italic text-sm text-center py-8">No direct/indirect expenses</p>
                            )}
                        </div>
                        <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-between font-bold text-slate-800">
                            <span>Total Expenses</span>
                            <span>{formatCurrency(totalExpense)}</span>
                        </div>
                    </div>

                    {/* Revenue (Right Side) */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
                        <div className="bg-green-50 p-4 border-b border-green-100 flex justify-between items-center">
                            <h3 className="font-bold text-green-800">INCOME</h3>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-mono">Cr</span>
                        </div>
                        <div className="p-4 flex-1 space-y-1">
                            {revenueNodes.length > 0 ? (
                                revenueNodes.map(node => (
                                    <PLRow key={node.id} node={node} type="income" />
                                ))
                            ) : (
                                <p className="text-slate-400 italic text-sm text-center py-8">No direct/indirect income</p>
                            )}
                        </div>
                        <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-between font-bold text-slate-800">
                            <span>Total Income</span>
                            <span>{formatCurrency(totalRevenue)}</span>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}

// Recursive function to show hierarchy if needed, OR just flatten them.
// For P&L, usually we just show root groups like "Direct Expenses", "Indirect Expenses".
// Let's make it recursive but simple.

function PLRow({ node, type, level = 0 }: { node: TrialBalanceNode, type: 'income' | 'expense', level?: number }) {
    // Value: 
    // If Income: Credit - Debit
    // If Expense: Debit - Credit
    const val = type === 'income' ? (node.credit - node.debit) : (node.debit - node.credit);

    // Auto-expand logic could be added here
    const [expanded, setExpanded] = useState(true);
    const hasChildren = node.children && node.children.length > 0;

    if (val === 0 && !hasChildren) return null; // Hide empty rows

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
                <PLRow key={child.id} node={child} type={type} level={level + 1} />
            ))}
        </div>
    );
}
