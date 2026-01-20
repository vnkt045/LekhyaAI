'use client';

import { useState, useEffect } from 'react';
import { Sparkles, AlertTriangle, Info, TrendingUp } from 'lucide-react';

interface Insight {
    id: string;
    type: 'WARNING' | 'INFO' | 'OPPORTUNITY';
    title: string;
    message: string;
    metric?: string;
}

export default function AIInsightsWidget() {
    const [insights, setInsights] = useState<Insight[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInsights = async () => {
            try {
                const res = await fetch('/api/ai/insights');
                if (res.ok) {
                    const data = await res.json();
                    setInsights(data);
                }
            } catch (error) {
                console.error('Failed to fetch AI insights', error);
            } finally {
                setLoading(false);
            }
        };
        fetchInsights();
    }, []);

    if (loading) {
        return (
            <div className="bg-gradient-to-br from-slate-50 to-orange-50 border border-lekhya-accent/20 rounded-lg p-6 shadow-sm animate-pulse h-48">
                <div className="h-4 bg-lekhya-accent/30 rounded w-1/3 mb-4"></div>
                <div className="space-y-3">
                    <div className="h-2 bg-slate-200 rounded w-full"></div>
                    <div className="h-2 bg-slate-200 rounded w-5/6"></div>
                </div>
            </div>
        );
    }

    if (insights.length === 0) {
        return (
            <div className="bg-gradient-to-br from-slate-50 to-orange-50 border border-lekhya-accent/20 rounded-lg p-6 shadow-sm flex flex-col items-center justify-center text-center h-full min-h-[180px]">
                <Sparkles className="w-8 h-8 text-lekhya-accent mb-2" />
                <h3 className="text-lekhya-primary font-bold text-sm">Lekhya Intelligence</h3>
                <p className="text-slate-600 text-xs mt-1">Everything looks good! No anomalies detected in your ledger.</p>
            </div>
        );
    }

    return (
        <div className="bg-white border border-lekhya-accent/20 rounded-lg shadow-sm overflow-hidden flex flex-col h-full">
            <div className="bg-gradient-to-r from-lekhya-primary to-lekhya-primary px-4 py-3 flex items-center justify-between border-b-2 border-lekhya-accent">
                <div className="flex items-center gap-2 text-white">
                    <Sparkles className="w-4 h-4" />
                    <h3 className="font-bold text-sm tracking-wide">Lekhya Intelligence</h3>
                </div>
                <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
                    {insights.length} Insight{insights.length > 1 ? 's' : ''}
                </span>
            </div>

            <div className="p-2 space-y-2 overflow-y-auto max-h-[300px]">
                {insights.map((insight) => (
                    <div key={insight.id} className={`p-3 rounded border text-left transition-all hover:shadow-md ${insight.type === 'WARNING' ? 'bg-red-50 border-red-100' :
                        insight.type === 'OPPORTUNITY' ? 'bg-green-50 border-green-100' :
                            'bg-blue-50 border-blue-100'
                        }`}>
                        <div className="flex items-start gap-3">
                            <div className={`mt-0.5 p-1.5 rounded-full ${insight.type === 'WARNING' ? 'bg-red-100 text-red-600' :
                                insight.type === 'OPPORTUNITY' ? 'bg-green-100 text-green-600' :
                                    'bg-blue-100 text-blue-600'
                                }`}>
                                {insight.type === 'WARNING' ? <AlertTriangle className="w-3 h-3" /> :
                                    insight.type === 'OPPORTUNITY' ? <TrendingUp className="w-3 h-3" /> :
                                        <Info className="w-3 h-3" />}
                            </div>
                            <div>
                                <h4 className={`text-xs font-bold mb-0.5 ${insight.type === 'WARNING' ? 'text-red-800' :
                                    insight.type === 'OPPORTUNITY' ? 'text-green-800' :
                                        'text-blue-800'
                                    }`}>{insight.title}</h4>
                                <p className="text-[11px] text-slate-600 leading-tight mb-1.5">
                                    {insight.message}
                                </p>
                                {insight.metric && (
                                    <div className="inline-block text-[10px] font-mono font-bold bg-white/50 px-1.5 py-0.5 rounded border border-black/5">
                                        Metric: {insight.metric}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
