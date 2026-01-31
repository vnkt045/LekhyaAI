'use client';

import { useState, useEffect } from 'react';
import { Database, Search, RefreshCw, Eye } from 'lucide-react';

interface TableInfo {
    name: string;
    count: number;
}

export default function DatabaseViewer() {
    const [tables, setTables] = useState<TableInfo[]>([]);
    const [selectedTable, setSelectedTable] = useState<string | null>(null);
    const [tableData, setTableData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [sqlQuery, setSqlQuery] = useState('');
    const [queryResult, setQueryResult] = useState<any>(null);

    useEffect(() => {
        fetchTables();
    }, []);

    const fetchTables = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin-super/database');
            if (res.ok) {
                const data = await res.json();
                setTables(data.tables || []);
            }
        } catch (error) {
            console.error('Failed to fetch tables:', error);
        } finally {
            setLoading(false);
        }
    };

    const viewTable = async (tableName: string) => {
        setSelectedTable(tableName);
        setLoading(true);
        try {
            const res = await fetch(`/api/admin-super/database?table=${tableName}&limit=50`);
            if (res.ok) {
                const data = await res.json();
                setTableData(data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch table data:', error);
        } finally {
            setLoading(false);
        }
    };

    const executeQuery = async () => {
        if (!sqlQuery.trim()) {
            alert('Please enter a SQL query');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/admin-super/database', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: sqlQuery })
            });

            if (res.ok) {
                const data = await res.json();
                setQueryResult(data.result);
            } else {
                const error = await res.json();
                alert(`Query failed: ${error.error}`);
            }
        } catch (error) {
            console.error('Failed to execute query:', error);
            alert('Failed to execute query');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Database className="w-6 h-6 text-white" />
                    <h2 className="text-xl font-bold text-white">Database Viewer</h2>
                </div>
                <button
                    onClick={fetchTables}
                    className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors text-white"
                >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
                {/* Left: Tables List */}
                <div className="lg:col-span-1">
                    <h3 className="text-sm font-bold text-gray-700 uppercase mb-3">Database Tables</h3>
                    <div className="space-y-2">
                        {tables.map((table) => (
                            <button
                                key={table.name}
                                onClick={() => viewTable(table.name)}
                                className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${selectedTable === table.name
                                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                                        : 'bg-white border-gray-200 hover:border-indigo-300 text-gray-700'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">{table.name}</span>
                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                                        {table.count}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right: Table Data */}
                <div className="lg:col-span-2">
                    {selectedTable ? (
                        <div>
                            <h3 className="text-sm font-bold text-gray-700 uppercase mb-3">
                                {selectedTable} ({tableData.length} rows)
                            </h3>
                            <div className="border border-gray-200 rounded-lg overflow-auto max-h-96">
                                {tableData.length > 0 ? (
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 sticky top-0">
                                            <tr>
                                                {Object.keys(tableData[0]).map((key) => (
                                                    <th
                                                        key={key}
                                                        className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border-b"
                                                    >
                                                        {key}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {tableData.map((row, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50">
                                                    {Object.values(row).map((value: any, colIdx) => (
                                                        <td key={colIdx} className="px-4 py-2 text-gray-900">
                                                            {typeof value === 'object' && value !== null
                                                                ? JSON.stringify(value)
                                                                : String(value || '-')}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="p-8 text-center text-gray-500">
                                        No data found in this table
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-64 text-gray-400">
                            <div className="text-center">
                                <Eye className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>Select a table to view its data</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* SQL Query Executor */}
            <div className="border-t border-gray-200 p-6 bg-gray-50">
                <h3 className="text-sm font-bold text-gray-700 uppercase mb-3 flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    SQL Query Executor (SELECT only)
                </h3>
                <div className="flex gap-3">
                    <input
                        type="text"
                        placeholder="SELECT * FROM ..."
                        value={sqlQuery}
                        onChange={(e) => setSqlQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && executeQuery()}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
                    />
                    <button
                        onClick={executeQuery}
                        disabled={loading}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50"
                    >
                        Execute
                    </button>
                </div>

                {queryResult && (
                    <div className="mt-4 border border-gray-200 rounded-lg bg-white p-4 max-h-64 overflow-auto">
                        <pre className="text-xs text-gray-800">
                            {JSON.stringify(queryResult, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
}
