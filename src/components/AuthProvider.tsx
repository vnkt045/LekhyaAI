'use client';

import { useEffect } from 'react';
import { SessionProvider, useSession, signOut } from 'next-auth/react';

function IdleTimer() {
    const { data: session } = useSession();

    useEffect(() => {
        if (!session) return;

        let logoutTimer: NodeJS.Timeout;

        const resetTimer = () => {
            if (logoutTimer) clearTimeout(logoutTimer);
            logoutTimer = setTimeout(() => {
                console.log('User idle for 2 minutes, logging out...');
                signOut({ callbackUrl: `${window.location.origin}/login` });
            }, 120000); // 2 minutes
        };

        // Listen for user activity
        const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
        events.forEach(event => window.addEventListener(event, resetTimer));

        // Initial timer start
        resetTimer();

        return () => {
            if (logoutTimer) clearTimeout(logoutTimer);
            events.forEach(event => window.removeEventListener(event, resetTimer));
        };
    }, [session]);

    return null;
}

import { usePathname, useRouter } from 'next/navigation';

function AuthGuard() {
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        if (status === 'loading') return;

        // Define public paths that don't need auth
        const isPublicPath =
            pathname.startsWith('/_next') ||
            pathname.startsWith('/static') ||
            pathname.startsWith('/api/auth') ||
            pathname === '/login' ||
            pathname === '/activate' ||
            pathname.startsWith('/owner');

        // If unauthenticated and on a protected path, force redirect
        if (status === 'unauthenticated' && !isPublicPath) {
            console.log('Client-side AuthGuard: Unauthenticated, redirecting to login');
            window.location.href = '/login'; // Hard redirect to clear any state
        }
    }, [status, pathname]);

    return null;
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <IdleTimer />
            <AuthGuard />
            {children}
        </SessionProvider>
    );
}
