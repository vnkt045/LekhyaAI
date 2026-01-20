'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, Filter, Download, Eye } from 'lucide-react';
import Link from 'next/link';

interface AuditLog {
    id: string;
    entityType: string;
    entityId: string;
    action: string;
    userId: string;
    userName: string;
    userEmail: string;
    timestamp: string;
    ipAddress: string;
    description: string;
    changes: any;
    oldValue: any;
    newValue: any;
}

export default function AuditTrailPage() {
    const router = useRouter();
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterEntityType, setFilterEntityType] = useState('');
    const [filterAction, setFilterAction] = useState('');
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

    useEffect(() => {
        fetchAuditLogs();
    }, [filterEntityType, filterAction]);

    const fetchAuditLogs = async () => {
        try {
            const params = new URLSearchParams();
            if (filterEntityType) params.append('entityType', filterEntityType);
            if (filterAction) params.append('action', filterAction);

            const res = await fetch(`/api/audit-log?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setLogs(data);
            }
        } catch (error) {
            console.error('Failed to fetch audit logs', error);
        } finally {
            setLoading(false);
        }
    };

    const exportToCSV = async () => {
        try {
            const params = new URLSearchParams();
            if (filterEntityType) params.append('entityType', filterEntityType);
            if (filterAction) params.append('action', filterAction);
            params.append('format', 'csv');

            const res = await fetch(`/api/audit-log?${params.toString()}`);
            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `audit-trail-${new Date().toISOString()}.csv`;
                a.click();
            }
        } catch (error) {
            console.error('Failed to export audit logs', error);
        }
    };

    const filteredLogs = logs.filter(log =>
        log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.entityType.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getActionColor = (action: string) => {
        switch (action) {
            case 'CREATE': return 'bg-green-100 text-green-700';
            case 'UPDATE': return 'bg-blue-100 text-blue-700';
            case 'DELETE': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="flex flex-col h-screen bg-lekhya-base">
            <div className="lekhya-header z-10">
                <div className="flex items-center gap-4">
                    <Link href="/admin/users" className="hover:bg-white/10 p-1.5 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-lekhya-accent" />
                    </Link>
                    <h1 className="font-bold text-lg tracking-wide">
                        Audit Trail <span className="text-gray-400 text-sm font-normal">/ MCA Compliance</span>
                    </h1>
                </div>
            </div>

            <div className="flex-1 p-8 overflow-auto">
                <div className="max-w-7xl mx-auto">
                    {/* Filters and Search */}
                    <div className="bg-white rounded-sm shadow-sm border border-gray-200 p-4 mb-4">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4 flex-1">
                                <div className="relative flex-1 max-w-md">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search audit logs..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded text-sm focus:ring-2 focus:ring-lekhya-accent outline-none"
                                    />
                                </div>

                                <select
                                    value={filterEntityType}
                                    onChange={(e) => setFilterEntityType(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-lekhya-accent outline-none"
                                >
                                    <option value="">All Entities</option>
                                    <option value="account">Accounts</option>
                                    <option value="user">Users</option>
                                    <option value="voucher">Vouchers</option>
                                    <option value="company">Company</option>
                                </select>

                                <select
                                    value={filterAction}
                                    onChange={(e) => setFilterAction(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-lekhya-accent outline-none"
                                >
                                    <option value="">All Actions</option>
                                    <option value="CREATE">Create</option>
                                    <option value="UPDATE">Update</option>
                                    <option value="DELETE">Delete</option>
                                </select>
                            </div>

                            <button
                                onClick={exportToCSV}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm font-medium"
                            >
                                <Download className="w-4 h-4" />
                                Export CSV
                            </button>
                        </div>
                    </div>

                    {/* Audit Logs Table */}
                    <div className="bg-white rounded-sm shadow-sm border border-gray-200">
                        <div className="p-4 border-b border-gray-200 bg-lekhya-dark text-white">
                            <h2 className="text-lg font-bold">Audit Trail Logs</h2>
                            <p className="text-xs text-gray-300 mt-1">
                                ⚠️ MCA Mandatory Requirement - Cannot be disabled or deleted
                            </p>
                        </div>

                        {loading ? (
                            <div className="p-12 text-center text-gray-500">Loading audit logs...</div>
                        ) : filteredLogs.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">
                                {searchTerm || filterEntityType || filterAction ? 'No logs found matching your filters.' : 'No audit logs yet.'}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Timestamp</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">User</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Action</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Entity</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Description</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">IP Address</th>
                                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">Details</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredLogs.map((log) => (
                                            <tr key={log.id} className="hover:bg-blue-50/50 transition-colors">
                                                <td className="px-4 py-3 text-sm text-gray-600">
                                                    {new Date(log.timestamp).toLocaleString()}
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    <div className="font-medium text-gray-800">{log.userName}</div>
                                                    <div className="text-xs text-gray-500">{log.userEmail}</div>
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase ${getActionColor(log.action)}`}>
                                                        {log.action}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm font-mono text-gray-600">{log.entityType}</td>
                                                <td className="px-4 py-3 text-sm text-gray-700">{log.description}</td>
                                                <td className="px-4 py-3 text-sm font-mono text-gray-500">{log.ipAddress}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <button
                                                        onClick={() => setSelectedLog(log)}
                                                        className="text-blue-600 hover:text-blue-800 transition-colors"
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            {selectedLog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedLog(null)}>
                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-200 bg-lekhya-dark text-white">
                            <h3 className="text-lg font-bold">Audit Log Details</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Timestamp</label>
                                    <p className="text-sm text-gray-800">{new Date(selectedLog.timestamp).toLocaleString()}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Action</label>
                                    <p><span className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase ${getActionColor(selectedLog.action)}`}>
                                        {selectedLog.action}
                                    </span></p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">User</label>
                                    <p className="text-sm text-gray-800">{selectedLog.userName} ({selectedLog.userEmail})</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">IP Address</label>
                                    <p className="text-sm font-mono text-gray-800">{selectedLog.ipAddress}</p>
                                </div>
                            </div>

                            {selectedLog.changes && (
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Changes</label>
                                    <div className="bg-gray-50 p-4 rounded border border-gray-200">
                                        <pre className="text-xs overflow-auto">{JSON.stringify(selectedLog.changes, null, 2)}</pre>
                                    </div>
                                </div>
                            )}

                            {selectedLog.oldValue && (
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Old Value</label>
                                    <div className="bg-red-50 p-4 rounded border border-red-200">
                                        <pre className="text-xs overflow-auto">{JSON.stringify(selectedLog.oldValue, null, 2)}</pre>
                                    </div>
                                </div>
                            )}

                            {selectedLog.newValue && (
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">New Value</label>
                                    <div className="bg-green-50 p-4 rounded border border-green-200">
                                        <pre className="text-xs overflow-auto">{JSON.stringify(selectedLog.newValue, null, 2)}</pre>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t border-gray-200 flex justify-end">
                            <button
                                onClick={() => setSelectedLog(null)}
                                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
