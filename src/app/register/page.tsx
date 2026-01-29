'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, CheckCircle2, Eye, EyeOff, User } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
    const router = useRouter();
    const [data, setData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        // Validation
        if (data.password !== data.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (data.password.length < 6) {
            setError('Password must be at least 6 characters long');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: data.name,
                    email: data.email,
                    password: data.password
                })
            });

            const result = await response.json();

            if (!response.ok) {
                setError(result.error || 'Registration failed');
                setLoading(false);
                return;
            }

            setSuccess('Account created successfully! Redirecting to login...');
            setTimeout(() => {
                router.push('/login');
            }, 2000);
        } catch (err) {
            setError('Something went wrong. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-lekhya-primary flex items-center justify-center p-4 font-sans relative overflow-hidden">

            {/* Background Accents */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-lekhya-accent/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="w-full max-w-md z-10">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white tracking-wide mb-2">Lekhya<span className="font-light text-lekhya-accent">AI</span></h1>
                    <p className="text-slate-400 text-sm">Next-Gen Intelligent Accounting for India</p>
                </div>

                <div className="bg-white rounded-lg shadow-2xl overflow-hidden border border-white/10">
                    <div className="p-8">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="h-8 w-1 bg-lekhya-accent rounded-full"></div>
                            <h2 className="text-xl font-bold text-lekhya-primary">Create Your Account</h2>
                        </div>

                        {error && (
                            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-600 font-medium">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded text-xs text-green-600 font-medium">
                                {success}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Full Name</label>
                                <div className="relative">
                                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded text-sm text-slate-900 focus:outline-none focus:border-lekhya-accent focus:ring-1 focus:ring-lekhya-accent transition-all"
                                        placeholder="Enter your full name"
                                        value={data.name}
                                        onChange={(e) => setData({ ...data, name: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Email ID</label>
                                <div className="relative">
                                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="email"
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded text-sm text-slate-900 focus:outline-none focus:border-lekhya-accent focus:ring-1 focus:ring-lekhya-accent transition-all"
                                        placeholder="Enter your email"
                                        value={data.email}
                                        onChange={(e) => setData({ ...data, email: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Password</label>
                                <div className="relative">
                                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded text-sm text-slate-900 focus:outline-none focus:border-lekhya-accent focus:ring-1 focus:ring-lekhya-accent transition-all"
                                        placeholder="Create a password"
                                        value={data.password}
                                        onChange={(e) => setData({ ...data, password: e.target.value })}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded text-sm text-slate-900 focus:outline-none focus:border-lekhya-accent focus:ring-1 focus:ring-lekhya-accent transition-all"
                                        placeholder="Confirm your password"
                                        value={data.confirmPassword}
                                        onChange={(e) => setData({ ...data, confirmPassword: e.target.value })}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-lekhya-dark text-white py-3 rounded font-bold text-sm hover:bg-lekhya-accent hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
                            >
                                {loading ? 'Creating Account...' : (
                                    <>
                                        Create Account <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-xs text-slate-600">
                                Already have an account?{' '}
                                <Link href="/login" className="text-lekhya-accent hover:text-amber-500 font-medium transition-colors">
                                    Sign in here
                                </Link>
                            </p>
                        </div>
                    </div>

                    <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 flex items-center justify-center gap-6 text-xs text-slate-500">
                        <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3 h-3 text-green-500" /> Secure
                        </div>
                        <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3 h-3 text-green-500" /> Private
                        </div>
                        <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3 h-3 text-green-500" /> Encrypted
                        </div>
                    </div>
                </div>

                <p className="text-center text-slate-500 text-xs mt-8 opacity-60">
                    &copy; 2024 LekhyaAI. Enterprise Edition.
                </p>
            </div>
        </div>
    );
}
