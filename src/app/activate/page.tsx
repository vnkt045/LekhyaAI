'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, ArrowRight } from 'lucide-react';

export default function ActivatePage() {
    const router = useRouter();
    const [key, setKey] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleActivate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/activate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: key.trim() })
            });

            if (res.ok) {
                // Success!
                window.location.href = '/'; // Hard reload to clear middleware cache/state
            } else {
                const data = await res.json();
                setError(data.error || 'Invalid License Key');
            }
        } catch (e) {
            setError('Connection failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 font-sans p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative">
                {/* Decorative Top */}
                <div className="bg-lekhya-primary h-2 w-full"></div>

                <div className="p-8 pt-10">
                    <div className="flex justify-center mb-6">
                        <div className="bg-slate-100 p-4 rounded-full">
                            <Lock className="w-8 h-8 text-slate-700" />
                        </div>
                    </div>

                    <h1 className="text-2xl font-bold text-center text-slate-800 mb-2">Activate LekhyaAI</h1>
                    <p className="text-center text-slate-500 text-sm mb-8">
                        This system is currently locked. Enter your 16-digit product license key to verify ownership.
                    </p>

                    <form onSubmit={handleActivate} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">License Key</label>
                            <input
                                type="text"
                                value={key}
                                onChange={e => setKey(e.target.value.toUpperCase())}
                                placeholder="LEKHYA-XXXX-XXXX-XXXX"
                                className="w-full text-center font-mono text-lg py-3 border-2 border-slate-200 rounded-lg focus:border-lekhya-primary focus:ring-0 uppercase tracking-widest placeholder:tracking-normal placeholder:text-sm placeholder:font-sans"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg text-center font-medium animate-pulse">
                                {error}
                            </div>
                        )}

                        <button
                            disabled={loading || key.length < 10}
                            className="w-full bg-lekhya-primary hover:bg-slate-800 text-white font-bold py-4 rounded-lg shadow-lg shadow-blue-900/10 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="animate-spin">⟳</span>
                            ) : (
                                <>
                                    Activate System <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-xs text-slate-400">
                            Need a license? Contact <a href="#" className="underline">sales@lekhyaai.com</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
