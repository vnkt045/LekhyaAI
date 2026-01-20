'use client';

import { usePathname } from 'next/navigation';
import AuthProvider from "@/components/AuthProvider";
import KioskController from "@/components/KioskController";
import Calculator from "@/components/Calculator";
import { GlobalActionProvider } from "@/context/GlobalActionContext";
import GlobalHeader from "@/components/GlobalHeader";
import { ToastProvider } from "@/context/ToastContext";

export default function ConditionalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isAdminRoute = pathname?.startsWith('/admin') || false;

    if (isAdminRoute) {
        // Admin routes: No AuthProvider, no GlobalHeader - just children
        return <>{children}</>;
    }

    // Main app routes: Full layout with auth and header
    return (
        <AuthProvider>
            <GlobalActionProvider>
                <ToastProvider>
                    <KioskController />
                    <Calculator />
                    <GlobalHeader />
                    {children}
                </ToastProvider>
            </GlobalActionProvider>
        </AuthProvider>
    );
}
