'use client';

import { useState } from 'react';
import { Upload, FileText, Check, AlertCircle } from 'lucide-react';
import { parseTallyXML } from '@/lib/tally-parser';

export default function TallyImportPage() {
    const [file, setFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<any>(null);
    const [importing, setImporting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError('');
            setSuccess('');
            setPreviewData(null);
        }
    };

    const handlePreview = async () => {
        if (!file) return;

        try {
            const text = await file.text();
            if (file.name.endsWith('.xml')) {
                const data = await parseTallyXML(text);
                setPreviewData(data);
            } else {
                setError('Currently only XML format is supported for preview.');
            }
        } catch (err) {
            console.error(err);
            setError('Failed to parse file. Please ensure it is a valid Tally XML export.');
        }
    };

    const handleImport = async () => {
        if (!previewData) return;
        setImporting(true);
        setError('');

        try {
            const res = await fetch('/api/import/tally', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(previewData)
            });

            const result = await res.json();
            if (res.ok) {
                setSuccess(`Successfully imported ${result.ledgers} ledgers and ${result.vouchers} vouchers!`);
                setFile(null);
                setPreviewData(null);
            } else {
                setError(result.error || 'Import failed');
            }
        } catch (err: any) {
            setError(err.message || 'Import failed');
        } finally {
            setImporting(false);
        }
    };

    return (
        <div className="min-h-screen bg-lekhya-base p-8 font-sans">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-lekhya-secondary/10 rounded-lg">
                            <Upload className="w-8 h-8 text-lekhya-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-lekhya-primary">Import Tally Data</h1>
                            <p className="text-slate-600">Migrate your data from Tally to LekhyaAI via XML.</p>
                        </div>
                    </div>

                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center hover:bg-slate-50 transition-colors">
                        <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-700 mb-2">Upload Tally XML File</h3>
                        <p className="text-slate-500 mb-6">Export your data from Tally as XML (Master & Transactions) and upload here.</p>

                        <input
                            type="file"
                            accept=".xml"
                            onChange={handleFileChange}
                            className="hidden"
                            id="file-upload"
                        />
                        <label
                            htmlFor="file-upload"
                            className="px-6 py-2 bg-lekhya-primary text-white rounded-lg cursor-pointer hover:bg-[#0f2d4a] transition-colors inline-block"
                        >
                            Select File
                        </label>
                        {file && (
                            <div className="mt-4 flex items-center justify-center gap-2 text-lekhya-primary font-medium">
                                <FileText className="w-4 h-4" />
                                {file.name}
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mt-6 p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-2">
                            <Check className="w-5 h-5" />
                            {success}
                        </div>
                    )}

                    {file && !previewData && !success && (
                        <div className="mt-6 text-center">
                            <button
                                onClick={handlePreview}
                                className="px-6 py-2 bg-lekhya-accent text-white rounded-lg hover:bg-orange-600 transition-colors"
                            >
                                Preview Data
                            </button>
                        </div>
                    )}

                    {previewData && (
                        <div className="mt-8">
                            <h3 className="text-lg font-bold text-slate-800 mb-4">Data Preview</h3>
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                                    <h4 className="font-semibold text-slate-700">Ledgers Found</h4>
                                    <p className="text-2xl font-bold text-lekhya-primary">{previewData.ledgers.length}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                                    <h4 className="font-semibold text-slate-700">Vouchers Found</h4>
                                    <p className="text-2xl font-bold text-lekhya-primary">{previewData.vouchers.length}</p>
                                </div>
                            </div>

                            <div className="flex justify-end gap-4">
                                <button
                                    onClick={() => setPreviewData(null)}
                                    className="px-6 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleImport}
                                    disabled={importing}
                                    className="px-6 py-2 bg-lekhya-primary text-white rounded-lg hover:bg-[#0f2d4a] transition-colors disabled:opacity-70 disabled:cursor-wait"
                                >
                                    {importing ? 'Importing...' : 'Confirm & Import Data'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
