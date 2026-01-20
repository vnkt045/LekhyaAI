'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import { apiGet, apiPost } from '@/lib/api-client';

interface VoucherItem {
    id: string;
    productName: string;
    hsnSac: string;
    qty: number;
    rate: number;
    per: string;
    taxableAmount: number;
    cgstRate: number;
    sgstRate: number;
    igstRate: number;
    cgstAmount: number;
    sgstAmount: number;
    igstAmount: number;
    totalAmount: number;
}

const EMPTY_ITEM: VoucherItem = {
    id: Math.random().toString(36).substr(2, 9),
    productName: '',
    hsnSac: '',
    qty: 1,
    rate: 0,
    per: 'pcs',
    taxableAmount: 0,
    cgstRate: 0,
    sgstRate: 0,
    igstRate: 0,
    cgstAmount: 0,
    sgstAmount: 0,
    igstAmount: 0,
    totalAmount: 0
};

export default function NewVoucherPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [accounts, setAccounts] = useState<any[]>([]);
    const [items, setItems] = useState<VoucherItem[]>([EMPTY_ITEM]);

    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        type: 'SALES',
        accountId: '',
        accountName: '',
        narration: '',
        invoiceNumber: ''
    });

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            const res = await apiGet<any[]>('/api/accounts');
            if (res.data) {
                setAccounts(res.data);
            } else {
                console.error('Failed to fetch accounts:', res.error);
            }
        } catch (error) {
            console.error('Failed to fetch accounts', error);
        }
    };

    const handleItemChange = (id: string, field: keyof VoucherItem, value: any) => {
        setItems(prevItems => prevItems.map(item => {
            if (item.id !== id) return item;

            const newItem = { ...item, [field]: value };

            // Auto-calculate amounts
            if (['qty', 'rate', 'cgstRate', 'sgstRate', 'igstRate'].includes(field as string)) {
                newItem.taxableAmount = newItem.qty * newItem.rate;
                newItem.cgstAmount = newItem.taxableAmount * (newItem.cgstRate / 100);
                newItem.sgstAmount = newItem.taxableAmount * (newItem.sgstRate / 100);
                newItem.igstAmount = newItem.taxableAmount * (newItem.igstRate / 100);
                newItem.totalAmount = newItem.taxableAmount + newItem.cgstAmount + newItem.sgstAmount + newItem.igstAmount;
            }
            return newItem;
        }));
    };

    const addItem = () => {
        setItems([...items, { ...EMPTY_ITEM, id: Math.random().toString(36).substr(2, 9) }]);
    };

    const removeItem = (id: string) => {
        if (items.length === 1) return;
        setItems(items.filter(i => i.id !== id));
    };

    const grandTotal = items.reduce((sum, item) => sum + item.totalAmount, 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            ...formData,
            amount: grandTotal,
            items: items.map(({ id, ...rest }) => rest)
        };

        try {
            const res = await apiPost('/api/vouchers', payload);

            if (res.error) throw new Error(res.error);
            router.push('/vouchers');
        } catch (error: any) {
            console.error(error);
            alert(`Failed to save voucher: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-lekhya-base flex flex-col font-sans">
            {/* Header */}
            <header className="bg-lekhya-primary text-white h-12 flex items-center justify-between px-4 border-b-[3px] border-lekhya-accent shadow-sm sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <Link href="/vouchers" className="hover:bg-white/10 p-1.5 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-lekhya-accent" />
                    </Link>
                    <h1 className="text-lg font-bold tracking-wide">Create Invoice</h1>
                </div>
                <div className="text-xs text-white/50 font-mono">LekhyaAI</div>
            </header>

            <div className="flex-1 overflow-auto p-4 md:p-8">
                <form onSubmit={handleSubmit} className="bg-white rounded-sm shadow-sm border border-[#BDCDD6] overflow-hidden max-w-7xl mx-auto">
                    {/* Header Details */}
                    <div className="bg-[#F8FAFC] px-8 py-4 border-b border-[#E2E8F0]">
                        <h2 className="text-lekhya-primary font-bold text-sm uppercase tracking-wide">Invoice Details</h2>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Top Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-lekhya-primary uppercase mb-1 required-label">Voucher Type</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-lekhya-accent"
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option value="SALES">Sales</option>
                                    <option value="PURCHASE">Purchase</option>
                                    <option value="PAYMENT">Payment</option>
                                    <option value="RECEIPT">Receipt</option>
                                    <option value="JOURNAL">Journal</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-lekhya-primary uppercase mb-1 required-label">Date</label>
                                <input
                                    type="date"
                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-lekhya-accent"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-lekhya-primary uppercase mb-1 required-label">Party Account</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-lekhya-accent bg-yellow-50/50"
                                    value={formData.accountId}
                                    onChange={(e) => {
                                        const selected = accounts.find(a => a.id === e.target.value);
                                        setFormData({
                                            ...formData,
                                            accountId: e.target.value,
                                            accountName: selected ? selected.name : ''
                                        });
                                    }}
                                    required
                                >
                                    <option value="">Select Account...</option>
                                    {accounts.map(acc => (
                                        <option key={acc.id} value={acc.id}>{acc.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Invoice Number */}
                        <div className="max-w-md">
                            <label className="block text-xs font-bold text-lekhya-primary uppercase mb-1">Invoice Number (Optional)</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-lekhya-accent"
                                placeholder="Ref No."
                                value={formData.invoiceNumber}
                                onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                            />
                        </div>

                        {/* Items Grid */}
                        <div className="mt-8 border border-gray-300 rounded-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead className="bg-[#E0E8F0] text-lekhya-primary font-bold border-b border-gray-300">
                                        <tr>
                                            <th className="px-2 py-2 text-left w-10">#</th>
                                            <th className="px-2 py-2 text-left w-48">Product/Service</th>
                                            <th className="px-2 py-2 text-left w-24">HSN/SAC</th>
                                            <th className="px-2 py-2 text-right w-20">Qty</th>
                                            <th className="px-2 py-2 text-right w-24">Rate</th>
                                            <th className="px-2 py-2 text-left w-16">Per</th>
                                            <th className="px-2 py-2 text-right w-32">Amount</th>
                                            <th className="px-2 py-2 text-right w-16">CGST %</th>
                                            <th className="px-2 py-2 text-right w-16">SGST %</th>
                                            <th className="px-2 py-2 text-right w-16">IGST %</th>
                                            <th className="px-2 py-2 text-right w-32">Total</th>
                                            <th className="px-2 py-2 w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {items.map((item, idx) => (
                                            <tr key={item.id} className="group hover:bg-blue-50">
                                                <td className="px-2 py-1 text-center text-slate-500">{idx + 1}</td>
                                                <td className="px-2 py-1">
                                                    <input
                                                        type="text"
                                                        className="w-full bg-transparent border-none focus:ring-1 focus:ring-lekhya-primary p-1 rounded"
                                                        placeholder="Item Name"
                                                        value={item.productName}
                                                        onChange={(e) => handleItemChange(item.id, 'productName', e.target.value)}
                                                    />
                                                </td>
                                                <td className="px-2 py-1">
                                                    <input
                                                        type="text"
                                                        className="w-full bg-transparent border-none focus:ring-1 focus:ring-lekhya-primary p-1 rounded text-center"
                                                        value={item.hsnSac}
                                                        onChange={(e) => handleItemChange(item.id, 'hsnSac', e.target.value)}
                                                    />
                                                </td>
                                                <td className="px-2 py-1">
                                                    <input
                                                        type="number"
                                                        className="w-full bg-transparent border-none focus:ring-1 focus:ring-lekhya-primary p-1 rounded text-right font-medium"
                                                        value={item.qty || ''}
                                                        onChange={(e) => handleItemChange(item.id, 'qty', parseFloat(e.target.value) || 0)}
                                                    />
                                                </td>
                                                <td className="px-2 py-1">
                                                    <input
                                                        type="number"
                                                        className="w-full bg-transparent border-none focus:ring-1 focus:ring-lekhya-primary p-1 rounded text-right font-medium"
                                                        value={item.rate || ''}
                                                        onChange={(e) => handleItemChange(item.id, 'rate', parseFloat(e.target.value) || 0)}
                                                    />
                                                </td>
                                                <td className="px-2 py-1">
                                                    <input
                                                        type="text"
                                                        className="w-full bg-transparent border-none focus:ring-1 focus:ring-lekhya-primary p-1 rounded"
                                                        value={item.per}
                                                        onChange={(e) => handleItemChange(item.id, 'per', e.target.value)}
                                                    />
                                                </td>
                                                <td className="px-2 py-1 text-right font-mono text-slate-700 px-1">
                                                    {item.taxableAmount.toFixed(2)}
                                                </td>
                                                <td className="px-2 py-1">
                                                    <input
                                                        type="number"
                                                        className="w-full bg-transparent border-none focus:ring-1 focus:ring-lekhya-primary p-1 rounded text-right text-xs"
                                                        value={item.cgstRate || ''}
                                                        onChange={(e) => handleItemChange(item.id, 'cgstRate', parseFloat(e.target.value) || 0)}
                                                    />
                                                </td>
                                                <td className="px-2 py-1">
                                                    <input
                                                        type="number"
                                                        className="w-full bg-transparent border-none focus:ring-1 focus:ring-lekhya-primary p-1 rounded text-right text-xs"
                                                        value={item.sgstRate || ''}
                                                        onChange={(e) => handleItemChange(item.id, 'sgstRate', parseFloat(e.target.value) || 0)}
                                                    />
                                                </td>
                                                <td className="px-2 py-1">
                                                    <input
                                                        type="number"
                                                        className="w-full bg-transparent border-none focus:ring-1 focus:ring-lekhya-primary p-1 rounded text-right text-xs"
                                                        value={item.igstRate || ''}
                                                        onChange={(e) => handleItemChange(item.id, 'igstRate', parseFloat(e.target.value) || 0)}
                                                    />
                                                </td>
                                                <td className="px-2 py-1 text-right font-bold font-mono text-lekhya-primary">
                                                    {item.totalAmount.toFixed(2)}
                                                </td>
                                                <td className="px-2 py-1 text-center">
                                                    <button type="button" onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-red-500">
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-gray-50 border-t border-gray-300">
                                        <tr>
                                            <td colSpan={10} className="px-4 py-2 text-right font-bold text-slate-600 uppercase">Grand Total</td>
                                            <td className="px-2 py-2 text-right font-bold text-lg text-lekhya-primary">
                                                ₹ {grandTotal.toFixed(2)}
                                            </td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                            <div className="p-2 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={addItem}
                                    className="text-xs font-bold text-lekhya-primary hover:underline flex items-center gap-1"
                                >
                                    <Plus className="w-3 h-3" /> Add Item
                                </button>
                            </div>
                        </div>

                        {/* Narration */}
                        <div>
                            <label className="block text-xs font-bold text-lekhya-primary uppercase mb-1">Narration (Remarks)</label>
                            <textarea
                                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-lekhya-accent min-h-[60px] italic text-slate-600"
                                placeholder="Enter accounting notes..."
                                value={formData.narration}
                                onChange={(e) => setFormData({ ...formData, narration: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 border-t border-gray-300 bg-gray-50 flex items-center justify-end gap-2 sticky bottom-0">
                        <button
                            type="button"
                            onClick={() => router.push('/vouchers')}
                            className="bg-white border border-slate-300 text-slate-700 px-6 py-2.5 rounded hover:bg-slate-50 font-bold"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-lekhya-accent text-lekhya-primary px-8 py-2.5 rounded font-bold hover:bg-orange-600 hover:text-white transition-colors disabled:opacity-70 disabled:cursor-wait flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            {loading ? 'Saving...' : 'Save Invoice'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
