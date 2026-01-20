'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, RotateCcw, ShieldCheck, Save, X, Plus, Printer, Download } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import InvoicePDF from '@/components/InvoicePDF';
import { saveAs } from 'file-saver';
import '@/styles/print.css';

// Helper for rounding to 2 decimal places
const round = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100;

interface VoucherItem {
    id: string;
    productName: string;
    description: string;
    hsnSac: string;
    qty: number;
    rate: number;
    per: string;

    // Taxes (Inputs)
    cgstRate: number;
    sgstRate: number;
    igstRate: number;

    // Computed
    taxableAmount: number;
    cgstAmount: number;
    sgstAmount: number;
    igstAmount: number;
    totalAmount: number;
}

const EMPTY_ITEM: VoucherItem = {
    id: '',
    productName: '',
    description: '',
    hsnSac: '',
    qty: 0,
    rate: 0,
    per: 'pcs',
    cgstRate: 0,
    sgstRate: 0,
    igstRate: 0,
    taxableAmount: 0,
    cgstAmount: 0,
    sgstAmount: 0,
    igstAmount: 0,
    totalAmount: 0
};

export default function VoucherDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [voucher, setVoucher] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [generatingPDF, setGeneratingPDF] = useState(false);

    // Edit State
    const [formData, setFormData] = useState<any>({});
    const [items, setItems] = useState<VoucherItem[]>([]);

    const [accounts, setAccounts] = useState<any[]>([]);

    const [showAdminModal, setShowAdminModal] = useState(false);
    const [actionType, setActionType] = useState<'DELETE' | 'REVERSE' | null>(null);
    const [adminCode, setAdminCode] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (params.id) {
            fetchVoucher(params.id as string);
            fetchAccounts();
        }
    }, [params.id]);

    const fetchVoucher = async (id: string) => {
        try {
            const res = await fetch(`/api/vouchers/${id}`);
            if (res.ok) {
                const data = await res.json();
                setVoucher(data);

                // Initialize Form Data
                setFormData({
                    date: new Date(data.date).toISOString().split('T')[0],
                    narration: data.narration,
                    invoiceNumber: data.invoiceNumber || '',
                    type: data.voucherType,
                    accountId: data.entries[0]?.accountId, // Approx
                    accountName: data.entries[0]?.accountName,
                    amount: Math.max(data.totalDebit, data.totalCredit)
                });

                // Initialize Items
                if (data.items && data.items.length > 0) {
                    setItems(data.items.map((item: any) => ({
                        ...item,
                        qty: parseFloat(item.qty),
                        rate: parseFloat(item.rate),
                        taxableAmount: parseFloat(item.taxableAmount),
                        cgstRate: parseFloat(item.cgstRate),
                        sgstRate: parseFloat(item.sgstRate),
                        igstRate: parseFloat(item.igstRate),
                        totalAmount: parseFloat(item.totalAmount)
                    })));
                } else {
                    setItems([]);
                }

            } else {
                setVoucher(null);
            }
        } catch (error) {
            console.error('Failed to fetch voucher', error);
            setVoucher(null);
        } finally {
            setLoading(false);
        }
    };

    const fetchAccounts = async () => {
        try {
            const res = await fetch('/api/accounts');
            if (res.ok) {
                const data = await res.json();
                setAccounts(data);
            }
        } catch (error) {
            console.error('Failed to fetch accounts', error);
        }
    };

    const handleItemChange = (id: string, field: keyof VoucherItem, value: any) => {
        setItems(prevItems => prevItems.map(item => {
            if (item.id !== id) return item;

            const newItem = { ...item, [field]: value };

            if (['qty', 'rate', 'cgstRate', 'sgstRate', 'igstRate'].includes(field)) {
                newItem.taxableAmount = round(newItem.qty * newItem.rate);
                newItem.cgstAmount = round(newItem.taxableAmount * (newItem.cgstRate / 100));
                newItem.sgstAmount = round(newItem.taxableAmount * (newItem.sgstRate / 100));
                newItem.igstAmount = round(newItem.taxableAmount * (newItem.igstRate / 100));
                newItem.totalAmount = round(newItem.taxableAmount + newItem.cgstAmount + newItem.sgstAmount + newItem.igstAmount);
            }
            return newItem;
        }));
    };

    const addItem = () => {
        setItems([...items, { ...EMPTY_ITEM, id: Math.random().toString(36).substr(2, 9) }]);
    };

    const removeItem = (id: string) => {
        if (items.length === 1 && items[0].productName === '') return;
        setItems(items.filter(i => i.id !== id));
    };

    const grandTotal = items.length > 0
        ? items.reduce((sum, item) => sum + item.totalAmount, 0)
        : formData.amount;

    const handleSaveEdit = async () => {
        try {
            const payload = {
                ...formData,
                amount: grandTotal,
                items: items.map(({ id, ...rest }) => rest)
            };

            const res = await fetch(`/api/vouchers/${voucher.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const updated = await res.json();
                setVoucher(updated);
                setIsEditing(false);
                fetchVoucher(voucher.id);
                alert('Voucher updated successfully!');
            } else {
                alert('Failed to update voucher');
            }
        } catch (error) {
            console.error('Update failed:', error);
            alert('Failed to update voucher');
        }
    };

    const initiateAction = (type: 'DELETE' | 'REVERSE') => {
        setActionType(type);
        setAdminCode('');
        setError('');
        setShowAdminModal(true);
    };

    const handleAdminSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (adminCode === '1234') {
            if (actionType === 'DELETE') {
                try {
                    const res = await fetch(`/api/vouchers/${voucher.id}`, {
                        method: 'DELETE'
                    });
                    if (res.ok) {
                        alert('Voucher Deleted Successfully.');
                        router.push('/vouchers');
                    } else {
                        alert('Failed to delete voucher');
                    }
                } catch (error) {
                    console.error('Delete failed:', error);
                    alert('Failed to delete voucher');
                }
            } else if (actionType === 'REVERSE') {
                alert('Reversal Entry Created (Simulation).');
                setShowAdminModal(false);
            }
        } else {
            setError('Invalid Admin Code');
        }
    };


    const handleDownloadPDF = async () => {
        setGeneratingPDF(true);
        try {
            const blob = await pdf(<InvoicePDF voucher={voucher} />).toBlob();
            saveAs(blob, `Invoice_${voucher.voucherNumber}.pdf`);
        } catch (error) {
            console.error('PDF generation failed:', error);
            alert('Failed to generate PDF');
        } finally {
            setGeneratingPDF(false);
        }
    };

    const handlePrintPDF = async () => {
        setGeneratingPDF(true);
        try {
            const blob = await pdf(<InvoicePDF voucher={voucher} />).toBlob();
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
        } catch (error) {
            console.error('Print generation failed:', error);
            alert('Failed to prepare for printing');
        } finally {
            setGeneratingPDF(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-lekhya-base">
                <div className="text-lekhya-primary font-bold">Loading voucher...</div>
            </div>
        );
    }

    if (!voucher) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-lekhya-base flex-col gap-4">
                <div className="text-red-600 font-bold text-xl">Voucher Not Found</div>
                <Link href="/vouchers" className="px-4 py-2 bg-lekhya-primary text-white font-bold rounded-sm hover:bg-blue-700 transition-colors">
                    Back to Vouchers
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-lekhya-base flex flex-col font-sans relative">
            <header className="bg-lekhya-primary text-white h-12 flex items-center justify-between px-4 border-b-[3px] border-lekhya-accent shadow-sm sticky top-0 z-10 no-print">
                <div className="flex items-center gap-4">
                    <Link href="/vouchers" className="hover:bg-white/10 p-1.5 rounded-full transition-colors" title="Back to Vouchers">
                        <ArrowLeft className="w-5 h-5 text-lekhya-accent" />
                    </Link>
                    <h1 className="text-lg font-bold tracking-wide">Voucher View: {voucher.voucherNumber}</h1>
                </div>
                <div className="text-xs font-mono bg-white/10 px-2 py-1 rounded">
                    {voucher.id}
                </div>
            </header>

            <div className="flex-1 p-8 max-w-[1400px] mx-auto w-full voucher-print-container">
                <div className="bg-white border border-gray-300 shadow-md rounded-sm overflow-hidden">

                    {/* Header Info */}
                    <div className="bg-gray-50 border-b border-gray-200 px-6 py-3 flex justify-between items-center no-print">
                        <div className="flex items-center gap-4">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border ${voucher.voucherType === 'RECEIPT' ? 'bg-green-50 text-green-700 border-green-200' :
                                voucher.voucherType === 'PAYMENT' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                    'bg-slate-100 text-slate-700 border-slate-200'
                                }`}>
                                {voucher.voucherType}
                            </span>
                            {isEditing ? (
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="text-xs border rounded px-2 py-1"
                                />
                            ) : (
                                <span className="text-xs text-gray-500 font-bold">
                                    {formatDate(voucher.date)}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                            <ShieldCheck className="w-3 h-3 text-green-500" /> Verified
                        </div>
                    </div>

                    <div className="p-8 space-y-8">
                        {/* Top Props */}
                        <div className="flex justify-between items-start">
                            <div className="flex-1 max-w-lg">
                                {isEditing ? (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-lekhya-primary uppercase mb-1">
                                                Vendor Invoice Number
                                            </label>
                                            <input
                                                type="text"
                                                className="lekhya-input"
                                                value={formData.invoiceNumber}
                                                onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-lekhya-primary uppercase mb-1">
                                                Narration
                                            </label>
                                            <textarea
                                                className="lekhya-input w-full"
                                                value={formData.narration}
                                                onChange={(e) => setFormData({ ...formData, narration: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        {voucher.invoiceNumber && (
                                            <p className="text-xs text-slate-500 mb-2">Ref: <span className="font-bold text-slate-700">{voucher.invoiceNumber}</span></p>
                                        )}
                                        <p className="text-sm text-gray-500 uppercase font-bold tracking-wider mb-1">Narration</p>
                                        <p className="text-lg text-gray-800 italic">"{voucher.narration}"</p>
                                    </div>
                                )}
                            </div>

                            <div className="text-right">
                                <p className="text-sm text-gray-500 uppercase font-bold tracking-wider mb-1">Total Amount</p>
                                <p className="text-3xl font-bold text-lekhya-primary">
                                    {isEditing ? formatCurrency(grandTotal) :
                                        voucher.currency && voucher.currency !== 'INR' ? (
                                            <span className="flex flex-col items-end">
                                                <span>{voucher.currency} {(Math.max(voucher.totalDebit, voucher.totalCredit) / voucher.exchangeRate).toFixed(2)}</span>
                                                <span className="text-sm text-slate-500 font-medium">
                                                    (Rate: {voucher.exchangeRate}) {formatCurrency(Math.max(voucher.totalDebit, voucher.totalCredit))}
                                                </span>
                                            </span>
                                        ) : formatCurrency(Math.max(voucher.totalDebit, voucher.totalCredit))
                                    }
                                </p>
                            </div>
                        </div>

                        {/* ITEM GRID */}
                        {(items.length > 0 || isEditing) && (
                            <div className="border border-gray-300 rounded-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-xs">
                                        <thead className="bg-[#E0E8F0] text-lekhya-primary font-bold border-b border-gray-300">
                                            <tr>
                                                <th className="px-2 py-2 text-left w-10">#</th>
                                                <th className="px-2 py-2 text-left w-48">Name of Item</th>
                                                <th className="px-2 py-2 text-left w-24">HSN/SAC</th>
                                                <th className="px-2 py-2 text-right w-20">Qty</th>
                                                <th className="px-2 py-2 text-right w-24">Rate</th>
                                                <th className="px-2 py-2 text-left w-16">Per</th>
                                                <th className="px-2 py-2 text-right w-32">Amount</th>
                                                <th className="px-2 py-2 text-right w-16">Tax %</th>
                                                <th className="px-2 py-2 text-right w-32">Total</th>
                                                {isEditing && <th className="px-2 py-2 w-10"></th>}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white">
                                            {items.map((item, idx) => (
                                                <tr key={item.id || idx} className="group hover:bg-blue-50">
                                                    <td className="px-2 py-1 text-center text-slate-500">{idx + 1}</td>
                                                    <td className="px-2 py-1">
                                                        {isEditing ? (
                                                            <input type="text" className="w-full bg-transparent border-none focus:ring-1 focus:ring-lekhya-primary p-1 rounded" value={item.productName} onChange={(e) => handleItemChange(item.id, 'productName', e.target.value)} />
                                                        ) : item.productName}
                                                    </td>
                                                    <td className="px-2 py-1">
                                                        {isEditing ? (
                                                            <input type="text" className="w-full bg-transparent border-none focus:ring-1 focus:ring-lekhya-primary p-1 rounded text-center" value={item.hsnSac} onChange={(e) => handleItemChange(item.id, 'hsnSac', e.target.value)} />
                                                        ) : item.hsnSac}
                                                    </td>
                                                    <td className="px-2 py-1 text-right">
                                                        {isEditing ? (
                                                            <input type="number" className="w-full bg-transparent border-none focus:ring-1 focus:ring-lekhya-primary p-1 rounded text-right" value={item.qty} onChange={(e) => handleItemChange(item.id, 'qty', parseFloat(e.target.value))} />
                                                        ) : item.qty}
                                                    </td>
                                                    <td className="px-2 py-1 text-right">
                                                        {isEditing ? (
                                                            <input type="number" className="w-full bg-transparent border-none focus:ring-1 focus:ring-lekhya-primary p-1 rounded text-right" value={item.rate} onChange={(e) => handleItemChange(item.id, 'rate', parseFloat(e.target.value))} />
                                                        ) : formatCurrency(item.rate)}
                                                    </td>
                                                    <td className="px-2 py-1">
                                                        {isEditing ? (
                                                            <input type="text" className="w-full bg-transparent border-none focus:ring-1 focus:ring-lekhya-primary p-1 rounded" value={item.per} onChange={(e) => handleItemChange(item.id, 'per', e.target.value)} />
                                                        ) : item.per}
                                                    </td>
                                                    <td className="px-2 py-1 text-right font-mono text-slate-700">
                                                        {formatCurrency(item.taxableAmount)}
                                                    </td>
                                                    <td className="px-2 py-1 text-right text-xs text-gray-500">
                                                        {item.cgstRate + item.sgstRate + item.igstRate}%
                                                    </td>
                                                    <td className="px-2 py-1 text-right font-bold font-mono text-lekhya-primary">
                                                        {formatCurrency(item.totalAmount)}
                                                    </td>
                                                    {isEditing && (
                                                        <td className="px-2 py-1 text-center">
                                                            <button onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {isEditing && (
                                    <div className="p-2 border-t border-gray-200">
                                        <button type="button" onClick={addItem} className="text-xs font-bold text-lekhya-primary hover:underline flex items-center gap-1"><Plus className="w-3 h-3" /> Add Item</button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Admin Actions */}
                        <div className="border-t-2 border-dashed border-gray-200 pt-6 mt-6 no-print">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Actions</h3>
                            <div className="flex gap-4">
                                {!isEditing ? (
                                    <>
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="flex-1 bg-white border border-lekhya-primary text-lekhya-primary px-4 py-3 rounded-sm font-bold text-sm hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Edit className="w-4 h-4" /> Modify
                                        </button>

                                        <button
                                            onClick={handlePrintPDF}
                                            disabled={generatingPDF}
                                            className="flex-1 bg-lekhya-primary text-white px-4 py-3 rounded-sm font-bold text-sm hover:bg-blue-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            <Printer className="w-4 h-4" />
                                            {generatingPDF ? 'Preparing...' : 'Print Preview'}
                                        </button>

                                        <button
                                            onClick={handleDownloadPDF}
                                            disabled={generatingPDF}
                                            className="flex-1 bg-white border border-lekhya-primary text-lekhya-primary px-4 py-3 rounded-sm font-bold text-sm hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            <Download className="w-4 h-4" />
                                            {generatingPDF ? 'Generating...' : 'Download PDF'}
                                        </button>

                                        <button
                                            onClick={() => initiateAction('REVERSE')}
                                            className="flex-1 bg-white border border-orange-500 text-orange-600 px-4 py-3 rounded-sm font-bold text-sm hover:bg-orange-50 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <RotateCcw className="w-4 h-4" /> Reverse
                                        </button>
                                        <button
                                            onClick={() => initiateAction('DELETE')}
                                            className="flex-1 bg-white border border-red-500 text-red-600 px-4 py-3 rounded-sm font-bold text-sm hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Trash2 className="w-4 h-4" /> Delete
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={handleSaveEdit}
                                            className="flex-1 bg-green-600 text-white px-4 py-3 rounded-sm font-bold text-sm hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Save className="w-4 h-4" /> Save Changes
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsEditing(false);
                                                fetchVoucher(voucher.id);
                                            }}
                                            className="flex-1 bg-gray-600 text-white px-4 py-3 rounded-sm font-bold text-sm hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <X className="w-4 h-4" /> Cancel
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Admin Action Modal */}
            {showAdminModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-xl w-96 p-6 animate-in fade-in zoom-in duration-200">
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Admin Verification</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Please enter the Admin Approval Code to {actionType?.toLowerCase()} this voucher.
                        </p>

                        <form onSubmit={handleAdminSubmit}>
                            <input
                                type="password"
                                autoFocus
                                className="w-full border border-gray-300 rounded p-2 text-center text-lg tracking-widest font-mono mb-2 focus:ring-2 focus:ring-lekhya-primary outline-none"
                                placeholder="Enter Code"
                                value={adminCode}
                                onChange={(e) => setAdminCode(e.target.value)}
                            />
                            {error && <p className="text-red-500 text-xs text-center mb-2 font-bold">{error}</p>}

                            <div className="flex gap-2 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAdminModal(false)}
                                    className="flex-1 px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 text-sm font-bold text-white bg-lekhya-primary hover:bg-blue-700 rounded"
                                >
                                    Verify & {actionType === 'DELETE' ? 'Delete' : 'Reverse'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
