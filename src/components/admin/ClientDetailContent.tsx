'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Building2, FileText, CreditCard, Key, Users, Shield, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

interface Client {
    id: string;
    companyName: string;
    tradeName?: string;
    pan?: string;
    gstin?: string;
    tan?: string;
    cin?: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    businessType: string;
    subscriptionPlan: string;
    subscriptionStart: string;
    subscriptionEnd?: string;
    maxUsers: number;
    enabledModules: string;
    licenseKey?: string;
    licenseStatus: string;
    kycStatus: string;
    kycVerifiedAt?: string;
    kycVerifiedBy?: string;
    status: string;
}

export default function ClientDetailContent({ clientId }: { clientId: string }) {
    const router = useRouter();
    const [client, setClient] = useState<Client | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('info');

    useEffect(() => {
        fetchClient();
    }, [clientId]);

    const fetchClient = async () => {
        try {
            const res = await fetch(`/api/admin/clients/${clientId}`);
            if (res.ok) {
                const data = await res.json();
                setClient(data);
            }
        } catch (error) {
            console.error('Failed to fetch client:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveKYC = async () => {
        try {
            const res = await fetch(`/api/admin/clients/${clientId}/kyc/approve`, {
                method: 'POST',
            });
            if (res.ok) {
                fetchClient();
                alert('KYC approved successfully!');
            }
        } catch (error) {
            alert('Failed to approve KYC');
        }
    };

    const handleRejectKYC = async () => {
        try {
            const res = await fetch(`/api/admin/clients/${clientId}/kyc/reject`, {
                method: 'POST',
            });
            if (res.ok) {
                fetchClient();
                alert('KYC rejected');
            }
        } catch (error) {
            alert('Failed to reject KYC');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!client) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <p className="text-gray-600">Client not found</p>
            </div>
        );
    }

    const tabs = [
        { id: 'info', label: 'Basic Info', icon: Building2 },
        { id: 'kyc', label: 'KYC Details', icon: FileText },
        { id: 'subscription', label: 'Subscription', icon: CreditCard },
        { id: 'license', label: 'License', icon: Key },
        { id: 'users', label: 'Users & RBAC', icon: Users },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/clients" className="p-2 hover:bg-gray-100 rounded-lg">
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </Link>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-gray-900">{client.companyName}</h1>
                            <p className="text-sm text-gray-600 mt-1">{client.email}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${client.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                            {client.status}
                        </span>
                    </div>
                </div>
            </header>

            {/* Tabs */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex gap-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${activeTab === tab.id
                                    ? 'border-blue-600 text-blue-600 font-medium'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content - Tabs implementation continues... */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <p className="text-gray-600">Tab content for {activeTab}</p>
            </div>
        </div>
    );
}
