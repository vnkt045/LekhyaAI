'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle, XCircle, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface ProvisioningStep {
    name: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    startedAt?: string;
    completedAt?: string;
    error?: string;
}

interface ProvisioningJob {
    id: string;
    tenantId: string;
    status: string;
    currentStep?: string;
    progress: number;
    totalSteps: number;
    completedSteps: number;
    steps: ProvisioningStep[];
    error?: string;
    createdAt: string;
    startedAt?: string;
    completedAt?: string;
    tenant: {
        id: string;
        name: string;
        subscriptionPlan: string;
    };
}

export default function ProvisioningProgressPage({ params }: { params: { jobId: string } }) {
    const router = useRouter();
    const [job, setJob] = useState<ProvisioningJob | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchJobStatus();

        // Poll for updates every 2 seconds if job is in progress
        const interval = setInterval(() => {
            if (job?.status === 'IN_PROGRESS' || job?.status === 'PENDING') {
                fetchJobStatus();
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [params.jobId, job?.status]);

    const fetchJobStatus = async () => {
        try {
            const res = await fetch(`/api/admin/provisioning/${params.jobId}`);
            if (res.ok) {
                const data = await res.json();
                setJob(data);
            } else {
                setError('Failed to fetch job status');
            }
        } catch (err) {
            setError('Network error occurred');
        } finally {
            setLoading(false);
        }
    };

    const getStepIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="w-6 h-6 text-green-600" />;
            case 'in_progress':
                return <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />;
            case 'failed':
                return <XCircle className="w-6 h-6 text-red-600" />;
            default:
                return <Clock className="w-6 h-6 text-gray-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return 'bg-green-100 text-green-800';
            case 'IN_PROGRESS':
                return 'bg-blue-100 text-blue-800';
            case 'FAILED':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading provisioning status...</p>
                </div>
            </div>
        );
    }

    if (error || !job) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <div className="text-center">
                    <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                    <p className="text-gray-900 font-semibold mb-2">Error Loading Job</p>
                    <p className="text-gray-600">{error || 'Job not found'}</p>
                    <Link
                        href="/admin-control"
                        className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-4xl mx-auto px-6 py-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin-control"
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </Link>
                        <div className="flex-1">
                            <h1 className="text-xl font-bold text-gray-900">Provisioning Progress</h1>
                            <p className="text-sm text-gray-600">{job.tenant.name}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(job.status)}`}>
                            {job.status}
                        </span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-6 py-8">
                {/* Progress Overview */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Overall Progress</h2>
                            <p className="text-sm text-gray-600">
                                {job.completedSteps} of {job.totalSteps} steps completed
                            </p>
                        </div>
                        <div className="text-3xl font-bold text-blue-600">
                            {job.progress}%
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                            className={`h-full transition-all duration-500 ${job.status === 'FAILED' ? 'bg-red-600' :
                                    job.status === 'COMPLETED' ? 'bg-green-600' :
                                        'bg-blue-600'
                                }`}
                            style={{ width: `${job.progress}%` }}
                        />
                    </div>

                    {job.currentStep && job.status === 'IN_PROGRESS' && (
                        <p className="text-sm text-gray-600 mt-3">
                            Current: <span className="font-medium text-gray-900">{job.currentStep}</span>
                        </p>
                    )}
                </div>

                {/* Steps Timeline */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Provisioning Steps</h2>

                    <div className="space-y-4">
                        {job.steps.map((step, index) => (
                            <div
                                key={index}
                                className={`flex items-start gap-4 p-4 rounded-lg border-2 transition-all ${step.status === 'in_progress' ? 'border-blue-600 bg-blue-50' :
                                        step.status === 'completed' ? 'border-green-200 bg-green-50' :
                                            step.status === 'failed' ? 'border-red-200 bg-red-50' :
                                                'border-gray-200'
                                    }`}
                            >
                                <div className="flex-shrink-0 mt-1">
                                    {getStepIcon(step.status)}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="font-semibold text-gray-900">{step.name}</h3>
                                        <span className="text-xs text-gray-500">
                                            Step {index + 1} of {job.totalSteps}
                                        </span>
                                    </div>

                                    {step.status === 'completed' && step.completedAt && (
                                        <p className="text-xs text-gray-600">
                                            Completed at {new Date(step.completedAt).toLocaleTimeString()}
                                        </p>
                                    )}

                                    {step.status === 'in_progress' && (
                                        <p className="text-xs text-blue-600 font-medium">
                                            In progress...
                                        </p>
                                    )}

                                    {step.status === 'failed' && step.error && (
                                        <p className="text-xs text-red-600 mt-1">
                                            Error: {step.error}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                {job.status === 'COMPLETED' && (
                    <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-green-900 mb-2">
                            Provisioning Complete!
                        </h3>
                        <p className="text-green-700 mb-4">
                            Client instance has been successfully created and activated.
                        </p>
                        <Link
                            href="/admin-control"
                            className="inline-block px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                        >
                            Back to Dashboard
                        </Link>
                    </div>
                )}

                {job.status === 'FAILED' && (
                    <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                        <XCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-red-900 mb-2">
                            Provisioning Failed
                        </h3>
                        <p className="text-red-700 mb-4">
                            {job.error || 'An error occurred during provisioning'}
                        </p>
                        <div className="flex items-center justify-center gap-3">
                            <Link
                                href="/admin-control"
                                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                            >
                                Back to Dashboard
                            </Link>
                            <button
                                onClick={() => {/* TODO: Implement retry */ }}
                                className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                            >
                                Retry Provisioning
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
