'use client';

import { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, Activity, DollarSign, Percent } from 'lucide-react';

interface RatioData {
    liquidity: {
        currentRatio: number;
        quickRatio: number;
    };
    profitability: {
        grossProfitMargin: number;
        netProfitMargin: number;
        returnOnEquity: number;
    };
    efficiency: {
        assetTurnover: number;
    };
    leverage: {
        debtToEquity: number;
    };
}

export default function RatioAnalysisPage() {
    const [data, setData] = useState<RatioData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch balance sheet and P&L data to calculate ratios
        fetchRatios();
    }, []);

    const fetchRatios = async () => {
        setLoading(true);
        try {
            // Fetch both balance sheet and P&L data
            const [bsRes, plRes] = await Promise.all([
                fetch('/api/reports/balance-sheet'),
                fetch('/api/reports/profit-loss')
            ]);

            if (bsRes.ok && plRes.ok) {
                const balanceSheet = await bsRes.json();
                const profitLoss = await plRes.json();

                // Calculate ratios
                const currentAssets = balanceSheet.assets.total;
                const currentLiabilities = balanceSheet.liabilities.total;
                const totalEquity = balanceSheet.equity.total;
                const totalRevenue = profitLoss.revenue.total;
                const totalExpenses = profitLoss.expenses.total;
                const netProfit = profitLoss.netProfit;
                const grossProfit = totalRevenue - (totalExpenses * 0.6); // Simplified COGS estimation

                setData({
                    liquidity: {
                        currentRatio: currentLiabilities > 0 ? currentAssets / currentLiabilities : 0,
                        quickRatio: currentLiabilities > 0 ? (currentAssets * 0.8) / currentLiabilities : 0 // Simplified
                    },
                    profitability: {
                        grossProfitMargin: totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0,
                        netProfitMargin: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0,
                        returnOnEquity: totalEquity > 0 ? (netProfit / totalEquity) * 100 : 0
                    },
                    efficiency: {
                        assetTurnover: balanceSheet.totals.assets > 0 ? totalRevenue / balanceSheet.totals.assets : 0
                    },
                    leverage: {
                        debtToEquity: totalEquity > 0 ? currentLiabilities / totalEquity : 0
                    }
                });
            }
        } catch (error) {
            console.error('Failed to calculate ratios', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-lekhya-base">
                <div className="text-center">
                    <Activity className="w-12 h-12 text-lekhya-accent animate-pulse mx-auto mb-4" />
                    <p className="text-slate-600">Calculating Financial Ratios...</p>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex items-center justify-center h-screen bg-lekhya-base">
                <p className="text-red-600">Failed to calculate ratios</p>
            </div>
        );
    }

    const getRatioStatus = (ratio: number, type: 'liquidity' | 'profitability' | 'leverage') => {
        if (type === 'liquidity') {
            if (ratio >= 2) return { color: 'green', status: 'Excellent' };
            if (ratio >= 1) return { color: 'yellow', status: 'Good' };
            return { color: 'red', status: 'Poor' };
        }
        if (type === 'profitability') {
            if (ratio >= 20) return { color: 'green', status: 'Excellent' };
            if (ratio >= 10) return { color: 'yellow', status: 'Good' };
            return { color: 'red', status: 'Poor' };
        }
        if (type === 'leverage') {
            if (ratio <= 0.5) return { color: 'green', status: 'Low Risk' };
            if (ratio <= 1) return { color: 'yellow', status: 'Moderate' };
            return { color: 'red', status: 'High Risk' };
        }
        return { color: 'gray', status: 'N/A' };
    };

    return (
        <div className="min-h-screen bg-lekhya-base p-8">
            {/* Header */}
            <div className="max-w-6xl mx-auto mb-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-lekhya-primary rounded-lg">
                            <Activity className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-lekhya-primary">Ratio Analysis</h1>
                            <p className="text-sm text-slate-600">Financial performance metrics and indicators</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Ratio Categories */}
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Liquidity Ratios */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <DollarSign className="w-6 h-6 text-blue-600" />
                        <h2 className="text-lg font-bold text-lekhya-primary">Liquidity Ratios</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-sm text-blue-700 font-medium mb-2">Current Ratio</p>
                            <p className="text-3xl font-bold text-blue-900 mb-1">
                                {data.liquidity.currentRatio.toFixed(2)}
                            </p>
                            <p className={`text-xs font-medium text-${getRatioStatus(data.liquidity.currentRatio, 'liquidity').color}-600`}>
                                {getRatioStatus(data.liquidity.currentRatio, 'liquidity').status}
                            </p>
                            <p className="text-xs text-slate-500 mt-2">Current Assets / Current Liabilities</p>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-sm text-blue-700 font-medium mb-2">Quick Ratio</p>
                            <p className="text-3xl font-bold text-blue-900 mb-1">
                                {data.liquidity.quickRatio.toFixed(2)}
                            </p>
                            <p className={`text-xs font-medium text-${getRatioStatus(data.liquidity.quickRatio, 'liquidity').color}-600`}>
                                {getRatioStatus(data.liquidity.quickRatio, 'liquidity').status}
                            </p>
                            <p className="text-xs text-slate-500 mt-2">(Current Assets - Inventory) / Current Liabilities</p>
                        </div>
                    </div>
                </div>

                {/* Profitability Ratios */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <TrendingUp className="w-6 h-6 text-green-600" />
                        <h2 className="text-lg font-bold text-lekhya-primary">Profitability Ratios</h2>
                    </div>
                    <div className="grid grid-cols-3 gap-6">
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-sm text-green-700 font-medium mb-2">Gross Profit Margin</p>
                            <p className="text-3xl font-bold text-green-900 mb-1">
                                {data.profitability.grossProfitMargin.toFixed(1)}%
                            </p>
                            <p className={`text-xs font-medium text-${getRatioStatus(data.profitability.grossProfitMargin, 'profitability').color}-600`}>
                                {getRatioStatus(data.profitability.grossProfitMargin, 'profitability').status}
                            </p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-sm text-green-700 font-medium mb-2">Net Profit Margin</p>
                            <p className="text-3xl font-bold text-green-900 mb-1">
                                {data.profitability.netProfitMargin.toFixed(1)}%
                            </p>
                            <p className={`text-xs font-medium text-${getRatioStatus(data.profitability.netProfitMargin, 'profitability').color}-600`}>
                                {getRatioStatus(data.profitability.netProfitMargin, 'profitability').status}
                            </p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-sm text-green-700 font-medium mb-2">Return on Equity (ROE)</p>
                            <p className="text-3xl font-bold text-green-900 mb-1">
                                {data.profitability.returnOnEquity.toFixed(1)}%
                            </p>
                            <p className={`text-xs font-medium text-${getRatioStatus(data.profitability.returnOnEquity, 'profitability').color}-600`}>
                                {getRatioStatus(data.profitability.returnOnEquity, 'profitability').status}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Efficiency & Leverage */}
                <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Percent className="w-6 h-6 text-purple-600" />
                            <h2 className="text-lg font-bold text-lekhya-primary">Efficiency Ratios</h2>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                            <p className="text-sm text-purple-700 font-medium mb-2">Asset Turnover</p>
                            <p className="text-3xl font-bold text-purple-900 mb-1">
                                {data.efficiency.assetTurnover.toFixed(2)}x
                            </p>
                            <p className="text-xs text-slate-500 mt-2">Revenue / Total Assets</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Activity className="w-6 h-6 text-orange-600" />
                            <h2 className="text-lg font-bold text-lekhya-primary">Leverage Ratios</h2>
                        </div>
                        <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                            <p className="text-sm text-orange-700 font-medium mb-2">Debt-to-Equity</p>
                            <p className="text-3xl font-bold text-orange-900 mb-1">
                                {data.leverage.debtToEquity.toFixed(2)}
                            </p>
                            <p className={`text-xs font-medium text-${getRatioStatus(data.leverage.debtToEquity, 'leverage').color}-600`}>
                                {getRatioStatus(data.leverage.debtToEquity, 'leverage').status}
                            </p>
                            <p className="text-xs text-slate-500 mt-2">Total Debt / Total Equity</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
