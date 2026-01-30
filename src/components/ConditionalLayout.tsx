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

    // Define routes where the app shell (Header, Calculator, etc.) should be hidden
    const isShellHidden = pathname === '/login' || pathname?.startsWith('/marketing') || pathname?.startsWith('/setup') || pathname?.startsWith('/activate');

    // Main app routes: Full layout with auth and header
    return (
        <AuthProvider>
            <GlobalActionProvider>
                <ToastProvider>
                    {!isShellHidden && <KioskController />}
                    {!isShellHidden && <Calculator />}
                    {!isShellHidden && <GlobalHeader />}
                    {children}
                </ToastProvider>
            </GlobalActionProvider>
        </AuthProvider>
    );
}
