'use client';

import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
// Card imports removed
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { PieChart as PieIcon, BarChart3, TrendingUp } from 'lucide-react';

interface AnalyticsChartProps {
    title: string;
    data: any[];
    type?: 'bar' | 'pie' | 'area';
    dataKeys: { key: string, name: string, color: string }[];
    xAxisKey: string;
    height?: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function AnalyticsChart({ title, data, type = 'bar', dataKeys, xAxisKey, height = 300 }: AnalyticsChartProps) {
    const [chartType, setChartType] = useState(type);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-lekhya-primary" />
                    {title}
                </h3>
                <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200">
                    <button
                        onClick={() => setChartType('bar')}
                        className={cn("p-1.5 rounded transition-all", chartType === 'bar' ? "bg-white shadow text-lekhya-primary" : "text-slate-400 hover:text-slate-600")}
                        title="Bar Chart"
                    >
                        <BarChart3 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setChartType('pie')}
                        className={cn("p-1.5 rounded transition-all", chartType === 'pie' ? "bg-white shadow text-lekhya-primary" : "text-slate-400 hover:text-slate-600")}
                        title="Pie Chart"
                    >
                        <PieIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="p-6">
                <div style={{ height: height, width: '100%' }}>
                    <ResponsiveContainer>
                        {chartType === 'bar' ? (
                            <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey={xAxisKey} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} tickFormatter={(val) => `₹${val / 1000}k`} />
                                <RechartsTooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value: any) => [`₹${(value || 0).toLocaleString('en-IN')}`, '']}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                {dataKeys.map((k, idx) => (
                                    <Bar
                                        key={k.key}
                                        dataKey={k.key}
                                        name={k.name}
                                        fill={k.color}
                                        radius={[4, 4, 0, 0]}
                                        barSize={40}
                                    />
                                ))}
                            </BarChart>
                        ) : chartType === 'pie' ? (
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={height * 0.35}
                                    fill="#8884d8"
                                    dataKey={dataKeys[0].key} // Pie usually visualizes one metric
                                    nameKey={xAxisKey}
                                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip
                                    formatter={(value: any) => [`₹${(value || 0).toLocaleString('en-IN')}`, '']}
                                />
                                <Legend />
                            </PieChart>
                        ) : (
                            // Fallback / Area
                            <AreaChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey={xAxisKey} />
                                <YAxis />
                                <RechartsTooltip />
                                <Area type="monotone" dataKey={dataKeys[0].key} stroke={dataKeys[0].color} fill={dataKeys[0].color} fillOpacity={0.2} />
                            </AreaChart>
                        )}
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
