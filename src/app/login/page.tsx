'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, CheckCircle2, Eye, EyeOff, User } from 'lucide-react';

export default function AuthPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

    // Login state
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [loginLoading, setLoginLoading] = useState(false);
    const [loginError, setLoginError] = useState('');

    // Register state
    const [registerData, setRegisterData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [showRegisterPassword, setShowRegisterPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [registerLoading, setRegisterLoading] = useState(false);
    const [registerError, setRegisterError] = useState('');
    const [registerSuccess, setRegisterSuccess] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginLoading(true);
        setLoginError('');

        const result = await signIn('credentials', {
            redirect: false,
            email: loginData.email,
            password: loginData.password
        });

        if (result?.error) {
            setLoginError('Invalid credentials. Please try again.');
            setLoginLoading(false);
        } else {
            router.push('/');
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setRegisterLoading(true);
        setRegisterError('');
        setRegisterSuccess('');

        // Validation
        if (registerData.password !== registerData.confirmPassword) {
            setRegisterError('Passwords do not match');
            setRegisterLoading(false);
            return;
        }

        if (registerData.password.length < 6) {
            setRegisterError('Password must be at least 6 characters long');
            setRegisterLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: registerData.name,
                    email: registerData.email,
                    password: registerData.password
                })
            });

            const result = await response.json();

            if (!response.ok) {
                setRegisterError(result.error || 'Registration failed');
                setRegisterLoading(false);
                return;
            }

            setRegisterSuccess('Account created successfully! Switching to login...');
            setTimeout(() => {
                setActiveTab('login');
                setLoginData({ email: registerData.email, password: '' });
                setRegisterSuccess('');
            }, 2000);
        } catch (err) {
            setRegisterError('Something went wrong. Please try again.');
            setRegisterLoading(false);
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
                    {/* Tabs */}
                    <div className="flex border-b border-slate-200">
                        <button
                            onClick={() => setActiveTab('login')}
                            className={`flex-1 py-4 text-sm font-bold transition-all ${activeTab === 'login'
                                    ? 'text-lekhya-accent border-b-2 border-lekhya-accent bg-slate-50'
                                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                }`}
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => setActiveTab('register')}
                            className={`flex-1 py-4 text-sm font-bold transition-all ${activeTab === 'register'
                                    ? 'text-lekhya-accent border-b-2 border-lekhya-accent bg-slate-50'
                                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                }`}
                        >
                            Create Account
                        </button>
                    </div>

                    <div className="p-8">
                        {/* Login Form */}
                        {activeTab === 'login' && (
                            <>
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="h-8 w-1 bg-lekhya-accent rounded-full"></div>
                                    <h2 className="text-xl font-bold text-lekhya-primary">Welcome Back</h2>
                                </div>

                                {loginError && (
                                    <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-600 font-medium">
                                        {loginError}
                                    </div>
                                )}

                                <form onSubmit={handleLogin} className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Email ID</label>
                                        <div className="relative">
                                            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                            <input
                                                type="email"
                                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded text-sm text-slate-900 focus:outline-none focus:border-lekhya-accent focus:ring-1 focus:ring-lekhya-accent transition-all"
                                                placeholder="Enter your email"
                                                value={loginData.email}
                                                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Password</label>
                                        <div className="relative">
                                            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                            <input
                                                type={showLoginPassword ? "text" : "password"}
                                                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded text-sm text-slate-900 focus:outline-none focus:border-lekhya-accent focus:ring-1 focus:ring-lekhya-accent transition-all"
                                                placeholder="Enter your password"
                                                value={loginData.password}
                                                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowLoginPassword(!showLoginPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                                            >
                                                {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-xs">
                                        <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                                            <input type="checkbox" className="rounded border-slate-300 text-lekhya-accent focus:ring-lekhya-accent" />
                                            <span>Remember me</span>
                                        </label>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loginLoading}
                                        className="w-full bg-lekhya-dark text-white py-3 rounded font-bold text-sm hover:bg-lekhya-accent hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
                                    >
                                        {loginLoading ? 'Authenticating...' : (
                                            <>
                                                Sign In <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </form>
                            </>
                        )}

                        {/* Register Form */}
                        {activeTab === 'register' && (
                            <>
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="h-8 w-1 bg-lekhya-accent rounded-full"></div>
                                    <h2 className="text-xl font-bold text-lekhya-primary">Create Your Account</h2>
                                </div>

                                {registerError && (
                                    <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-600 font-medium">
                                        {registerError}
                                    </div>
                                )}

                                {registerSuccess && (
                                    <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded text-xs text-green-600 font-medium">
                                        {registerSuccess}
                                    </div>
                                )}

                                <form onSubmit={handleRegister} className="space-y-5">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Full Name</label>
                                        <div className="relative">
                                            <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                            <input
                                                type="text"
                                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded text-sm text-slate-900 focus:outline-none focus:border-lekhya-accent focus:ring-1 focus:ring-lekhya-accent transition-all"
                                                placeholder="Enter your full name"
                                                value={registerData.name}
                                                onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
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
                                                value={registerData.email}
                                                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Password</label>
                                        <div className="relative">
                                            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                            <input
                                                type={showRegisterPassword ? "text" : "password"}
                                                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded text-sm text-slate-900 focus:outline-none focus:border-lekhya-accent focus:ring-1 focus:ring-lekhya-accent transition-all"
                                                placeholder="Create a password"
                                                value={registerData.password}
                                                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                                            >
                                                {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                                                value={registerData.confirmPassword}
                                                onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
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
                                        disabled={registerLoading}
                                        className="w-full bg-lekhya-dark text-white py-3 rounded font-bold text-sm hover:bg-lekhya-accent hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
                                    >
                                        {registerLoading ? 'Creating Account...' : (
                                            <>
                                                Create Account <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </form>
                            </>
                        )}
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
