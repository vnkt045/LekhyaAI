'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Filter, Download, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { apiGet } from '@/lib/api-client';

interface AuditLog {
    id: string;
    timestamp: string;
    userId: string;
    userName: string;
    userEmail: string;
    entityType: string;
    entityId: string;
    action: 'CREATE' | 'UPDATE' | 'DELETE';
    description: string;
    oldValue: string | null;
    newValue: string | null;
    changes: string | null;
    ipAddress: string;
    userAgent: string;
}

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedRow, setExpandedRow] = useState<string | null>(null);
    const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 0 });

    const [filters, setFilters] = useState({
        entityType: 'all',
        action: 'all',
        startDate: '',
        endDate: '',
        search: ''
    });

    useEffect(() => {
        fetchLogs();
    }, [filters, pagination.page]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
                ...(filters.entityType !== 'all' && { entityType: filters.entityType }),
                ...(filters.action !== 'all' && { action: filters.action }),
                ...(filters.startDate && { startDate: filters.startDate }),
                ...(filters.endDate && { endDate: filters.endDate }),
                ...(filters.search && { search: filters.search })
            });

            const res = await apiGet<any>(`/api/audit?${params}`);
            if (res.data) {
                setLogs(res.data.logs);
                setPagination(res.data.pagination);
            }
        } catch (error) {
            console.error('Failed to fetch audit logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const exportToCSV = () => {
        const headers = ['Timestamp', 'User', 'Action', 'Entity Type', 'Entity ID', 'Description', 'IP Address'];
        const rows = logs.map(log => [
            new Date(log.timestamp).toLocaleString(),
            log.userName,
            log.action,
            log.entityType,
            log.entityId,
            log.description,
            log.ipAddress
        ]);

        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const getActionColor = (action: string) => {
        switch (action) {
            case 'CREATE': return 'text-green-600 bg-green-50';
            case 'UPDATE': return 'text-blue-600 bg-blue-50';
            case 'DELETE': return 'text-red-600 bg-red-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6">
                <div className="flex items-center gap-4">
                    <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-medium">Back to Dashboard</span>
                    </Link>
                    <div className="h-6 w-px bg-slate-300"></div>
                    <h1 className="text-xl font-bold text-slate-900">Audit Trail</h1>
                </div>
                <button
                    onClick={exportToCSV}
                    className="flex items-center gap-2 px-4 py-2 bg-lekhya-primary text-white rounded hover:bg-lekhya-primary/90 transition-colors"
                >
                    <Download className="w-4 h-4" />
                    Export CSV
                </button>
            </header>

            {/* Filters */}
            <div className="bg-white border-b border-slate-200 p-4">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Entity Type</label>
                        <select
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                            value={filters.entityType}
                            onChange={(e) => setFilters({ ...filters, entityType: e.target.value })}
                        >
                            <option value="all">All Types</option>
                            <option value="voucher">Voucher</option>
                            <option value="account">Account</option>
                            <option value="user">User</option>
                            <option value="company">Company</option>
                            <option value="inventoryItem">Inventory Item</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Action</label>
                        <select
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                            value={filters.action}
                            onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                        >
                            <option value="all">All Actions</option>
                            <option value="CREATE">Create</option>
                            <option value="UPDATE">Update</option>
                            <option value="DELETE">Delete</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Start Date</label>
                        <input
                            type="date"
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                            value={filters.startDate}
                            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">End Date</label>
                        <input
                            type="date"
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                            value={filters.endDate}
                            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Search</label>
                        <input
                            type="text"
                            placeholder="User, Entity ID..."
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 p-6 overflow-auto">
                <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center text-slate-500">Loading audit logs...</div>
                    ) : logs.length === 0 ? (
                        <div className="p-12 text-center text-slate-500">No audit logs found</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-100 border-b border-slate-200">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-semibold text-slate-700">Timestamp</th>
                                        <th className="px-4 py-3 text-left font-semibold text-slate-700">User</th>
                                        <th className="px-4 py-3 text-left font-semibold text-slate-700">Action</th>
                                        <th className="px-4 py-3 text-left font-semibold text-slate-700">Entity</th>
                                        <th className="px-4 py-3 text-left font-semibold text-slate-700">Description</th>
                                        <th className="px-4 py-3 text-left font-semibold text-slate-700">IP</th>
                                        <th className="px-4 py-3 text-center font-semibold text-slate-700">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {logs.map((log) => (
                                        <>
                                            <tr key={log.id} className="hover:bg-slate-50">
                                                <td className="px-4 py-3 text-slate-600 font-mono text-xs">
                                                    {new Date(log.timestamp).toLocaleString()}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="text-slate-900 font-medium">{log.userName}</div>
                                                    <div className="text-slate-500 text-xs">{log.userEmail}</div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getActionColor(log.action)}`}>
                                                        {log.action}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="text-slate-900 font-medium">{log.entityType}</div>
                                                    <div className="text-slate-500 text-xs font-mono">{log.entityId.substring(0, 12)}...</div>
                                                </td>
                                                <td className="px-4 py-3 text-slate-700">{log.description}</td>
                                                <td className="px-4 py-3 text-slate-500 font-mono text-xs">{log.ipAddress}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <button
                                                        onClick={() => setExpandedRow(expandedRow === log.id ? null : log.id)}
                                                        className="text-lekhya-primary hover:text-lekhya-primary/80"
                                                    >
                                                        {expandedRow === log.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                    </button>
                                                </td>
                                            </tr>
                                            {expandedRow === log.id && (
                                                <tr>
                                                    <td colSpan={7} className="px-4 py-4 bg-slate-50">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {log.oldValue && (
                                                                <div>
                                                                    <h4 className="text-xs font-bold text-slate-700 mb-2">Before (Old Value)</h4>
                                                                    <pre className="bg-white p-3 rounded border border-slate-200 text-xs overflow-auto max-h-64">
                                                                        {JSON.stringify(JSON.parse(log.oldValue), null, 2)}
                                                                    </pre>
                                                                </div>
                                                            )}
                                                            {log.newValue && (
                                                                <div>
                                                                    <h4 className="text-xs font-bold text-slate-700 mb-2">After (New Value)</h4>
                                                                    <pre className="bg-white p-3 rounded border border-slate-200 text-xs overflow-auto max-h-64">
                                                                        {JSON.stringify(JSON.parse(log.newValue), null, 2)}
                                                                    </pre>
                                                                </div>
                                                            )}
                                                            {log.changes && (
                                                                <div className="md:col-span-2">
                                                                    <h4 className="text-xs font-bold text-slate-700 mb-2">Changes</h4>
                                                                    <pre className="bg-white p-3 rounded border border-slate-200 text-xs overflow-auto">
                                                                        {JSON.stringify(JSON.parse(log.changes), null, 2)}
                                                                    </pre>
                                                                </div>
                                                            )}
                                                            <div className="md:col-span-2">
                                                                <h4 className="text-xs font-bold text-slate-700 mb-2">Metadata</h4>
                                                                <div className="bg-white p-3 rounded border border-slate-200 text-xs">
                                                                    <p><strong>User Agent:</strong> {log.userAgent}</p>
                                                                    <p><strong>IP Address:</strong> {log.ipAddress}</p>
                                                                    <p><strong>Full Entity ID:</strong> {log.entityId}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="border-t border-slate-200 px-4 py-3 flex items-center justify-between">
                            <div className="text-sm text-slate-600">
                                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} logs
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                                    disabled={pagination.page === 1}
                                    className="px-3 py-1 border border-slate-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                                >
                                    Previous
                                </button>
                                <span className="px-3 py-1 text-sm text-slate-600">
                                    Page {pagination.page} of {pagination.totalPages}
                                </span>
                                <button
                                    onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                                    disabled={pagination.page === pagination.totalPages}
                                    className="px-3 py-1 border border-slate-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
