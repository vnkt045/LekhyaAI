'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, Building2, User, BookOpen } from 'lucide-react';
import { completeSetup } from '../../actions/setup';

// Client-side schema for validation
const step1Schema = z.object({
    companyName: z.string().min(1, 'Company Name is required'),
    email: z.string().email('Invalid email address'),
    gstin: z.string().optional(),
    financialYearStart: z.string().min(1, 'Financial Year Start is required'),
});

const step2Schema = z.object({
    adminName: z.string().min(1, 'Admin Name is required'),
    adminEmail: z.string().email('Invalid email address'),
    adminPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

const step3Schema = z.object({
    useDefaultCOA: z.boolean(),
});

type FormData = z.infer<typeof step1Schema> & z.infer<typeof step2Schema> & z.infer<typeof step3Schema>;

export default function SetupWizard() {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [serverError, setServerError] = useState('');

    const {
        register,
        trigger,
        getValues,
        setValue,
        watch,
        formState: { errors },
    } = useForm<FormData>({
        defaultValues: {
            useDefaultCOA: true,
            financialYearStart: new Date().toISOString().split('T')[0], // Default to today
        },
        mode: 'onChange',
    });

    const nextStep = async () => {
        let isValid = false;
        if (step === 1) isValid = await trigger(['companyName', 'email', 'financialYearStart']);
        if (step === 2) isValid = await trigger(['adminName', 'adminEmail', 'adminPassword']);

        if (isValid) setStep((s) => s + 1);
    };

    const prevStep = () => setStep((s) => s - 1);

    const onSubmit = async () => {
        setIsSubmitting(true);
        setServerError('');

        const data = getValues();
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            formData.append(key, String(value));
        });

        // Call Server Action
        // Note: In a real app we might use useActionState, but invoking directly is fine for this flow
        const result = await completeSetup({} as any, formData);

        if (result?.errors) {
            // Log for debugging
            console.error('Submission Errors:', result.errors);

            // Format detailed error message
            const errorMessages = Object.values(result.errors).flat().join(', ');
            setServerError(`Validation Failed: ${errorMessages}`);
            setIsSubmitting(false);
        } else if (result?.message) {
            setServerError(result.message);
            setIsSubmitting(false);
        }
        // If redirect happens in server action, we won't reach here usually
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white max-w-2xl w-full rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[500px]">

                {/* Sidebar */}
                <div className="bg-lekhya-primary text-white p-8 md:w-1/3 flex flex-col justify-between">
                    <div>
                        <h1 className="text-2xl font-bold mb-2">LekhyaAI</h1>
                        <p className="text-blue-100 text-sm">Initial Setup Wizard</p>
                    </div>

                    <div className="space-y-6 mt-8">
                        <StepIndicator current={step} step={1} icon={Building2} label="Company" />
                        <StepIndicator current={step} step={2} icon={User} label="Admin User" />
                        <StepIndicator current={step} step={3} icon={BookOpen} label="Preferences" />
                    </div>

                    <div className="text-xs text-blue-200 mt-auto">
                        &copy; 2026 LekhyaAI
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 md:w-2/3 flex flex-col">
                    <div className="flex-1">
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    <h2 className="text-xl font-semibold text-slate-800">Company Details</h2>

                                    <Input
                                        label="Company Name"
                                        {...register('companyName')}
                                        error={errors.companyName?.message}
                                    />

                                    <Input
                                        label="Official Email"
                                        type="email"
                                        {...register('email')}
                                        error={errors.email?.message}
                                    />

                                    <Input
                                        label="GSTIN (Optional)"
                                        {...register('gstin')}
                                        error={errors.gstin?.message}
                                    />

                                    <Input
                                        label="Financial Year Start"
                                        type="date"
                                        {...register('financialYearStart')}
                                        error={errors.financialYearStart?.message}
                                    />
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    <h2 className="text-xl font-semibold text-slate-800">Admin Account</h2>
                                    <p className="text-sm text-slate-500 mb-4">This user will have full access to the system.</p>

                                    <Input
                                        label="Full Name"
                                        {...register('adminName')}
                                        error={errors.adminName?.message}
                                    />

                                    <Input
                                        label="Email Address"
                                        type="email"
                                        {...register('adminEmail')}
                                        error={errors.adminEmail?.message}
                                    />

                                    <Input
                                        label="Password"
                                        type="password"
                                        {...register('adminPassword')}
                                        error={errors.adminPassword?.message}
                                    />
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    <h2 className="text-xl font-semibold text-slate-800">Final Configuration</h2>

                                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                        <label className="flex items-start gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="mt-1 w-4 h-4 text-lekhya-primary rounded border-gray-300 focus:ring-lekhya-primary"
                                                {...register('useDefaultCOA')}
                                            />
                                            <div>
                                                <span className="block font-medium text-slate-800">Load Default Chart of Accounts</span>
                                                <span className="block text-xs text-slate-500 mt-1">
                                                    Creates standard accounts like Cash, Bank, Sales, Purchase, etc. Recommended for new companies.
                                                </span>
                                            </div>
                                        </label>
                                    </div>

                                    {serverError && (
                                        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                                            {serverError}
                                        </div>
                                    )}

                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Navigation */}
                    <div className="mt-8 flex justify-between items-center pt-4 border-t border-slate-100">
                        {step > 1 ? (
                            <button
                                onClick={prevStep}
                                className="flex items-center text-slate-500 hover:text-slate-800 text-sm font-medium"
                            >
                                <ChevronLeft className="w-4 h-4 mr-1" /> Back
                            </button>
                        ) : (<div></div>)}

                        {step < 3 ? (
                            <button
                                onClick={nextStep}
                                className="bg-lekhya-primary text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center"
                            >
                                Next <ChevronRight className="w-4 h-4 ml-1" />
                            </button>
                        ) : (
                            <button
                                onClick={onSubmit}
                                disabled={isSubmitting}
                                className="bg-green-600 text-white px-8 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Setting up...' : 'Finish Setup'} <Check className="w-4 h-4 ml-2" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StepIndicator({ current, step, icon: Icon, label }: { current: number, step: number, icon: any, label: string }) {
    const isActive = current === step;
    const isCompleted = current > step;

    return (
        <div className={`flex items-center gap-3 ${isActive ? 'text-white' : 'text-blue-200'} transition-colors`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 
                ${isActive ? 'bg-white text-lekhya-primary border-white' :
                    isCompleted ? 'bg-green-400 border-green-400 text-white' : 'border-blue-300/30'}`}>
                {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
            </div>
            <span className={`text-sm font-medium ${isActive ? 'opacity-100' : 'opacity-70'}`}>{label}</span>
        </div>
    );
}

function Input({ label, error, ...props }: any) {
    return (
        <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">{label}</label>
            <input
                className={`w-full px-3 py-2 border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 
                    ${error ? 'border-red-300 focus:ring-red-200' : 'border-slate-300 focus:border-lekhya-primary focus:ring-blue-100'}`}
                {...props}
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
}
