'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Home, Save, X, AlertCircle } from 'lucide-react';
import { useGlobalAction } from '@/context/GlobalActionContext';

export default function GlobalHomeButton() {
    const router = useRouter();
    const pathname = usePathname();
    const { hasActiveAction, executeSave } = useGlobalAction();
    const [showModal, setShowModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Show on all pages as requested
    // if (pathname === '/') return null;

    const handleHomeClick = () => {
        if (hasActiveAction) {
            setShowModal(true);
        } else {
            router.push('/');
        }
    };

    const handleConfirmSave = async () => {
        setIsSaving(true);
        try {
            await executeSave();
            setShowModal(false);
            router.push('/');
        } catch (error) {
            console.error("Save failed", error);
            // Optionally show error toast here
        } finally {
            setIsSaving(false);
        }
    };

    const handleDiscard = () => {
        setShowModal(false);
        router.push('/');
    };

    return (
        <>
            {/* Prominent Home Icon - Top Left */}
            <button
                onClick={handleHomeClick}
                className="fixed top-4 left-4 z-[9999] bg-lekhya-primary text-white p-3 rounded-lg shadow-xl hover:bg-lekhya-accent hover:text-lekhya-primary transition-all hover:scale-110 active:scale-95 flex items-center justify-center border-2 border-white"
                title="Go to Home"
            >
                <Home className="w-6 h-6" />
            </button>

            {/* Confirmation Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6">
                            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4 text-yellow-600">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Save Your Work?</h3>
                            <p className="text-slate-500 text-sm">
                                You have unsaved changes. Would you like to save before going home?
                            </p>
                        </div>

                        <div className="bg-slate-50 px-6 py-4 flex flex-col gap-2">
                            <button
                                onClick={handleConfirmSave}
                                disabled={isSaving}
                                className="w-full bg-lekhya-primary text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                            >
                                {isSaving ? 'Saving...' : <><Save className="w-4 h-4" /> Save & Go Home</>}
                            </button>

                            <button
                                onClick={handleDiscard}
                                disabled={isSaving}
                                className="w-full bg-white text-slate-700 border border-slate-200 py-2.5 rounded-lg font-medium hover:bg-slate-50 hover:text-red-600 transition-colors flex items-center justify-center gap-2"
                            >
                                <X className="w-4 h-4" /> Discard Changes
                            </button>

                            <button
                                onClick={() => setShowModal(false)}
                                disabled={isSaving}
                                className="w-full text-slate-400 text-sm py-2 hover:text-slate-600"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
