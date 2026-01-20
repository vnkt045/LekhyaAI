'use client';

import { useEffect, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';

/**
 * KioskController: Manages browser shortcut blocking
 * - Blocks browser shortcuts (F5, Ctrl+R, F12, etc.)
 * - All navigation handled by Command Box (Ctrl+G)
 */
export default function KioskController() {
    const { data: session } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const isSessionActive = !!session;

    // Fullscreen handling removed completely per user request

    const handleGlobalKeys = useCallback((e: KeyboardEvent) => {
        if (!isSessionActive) return;
        if (!e.key) return; // Safety check

        console.log('[KioskController] Key pressed:', e.key, 'Ctrl:', e.ctrlKey, 'Alt:', e.altKey);

        const key = e.key.toLowerCase();
        const isCtrl = e.ctrlKey || e.metaKey;
        const isAlt = e.altKey;

        // --- BLOCK BROWSER SHORTCUTS ---
        const blockedKeys = ['F5', 'F11', 'F12'];
        const blockedCtrlKeys = ['r', 's', 'p', 'h', 'j', 'u', 'w', 't', 'f', 'd', 'l'];
        const blockedCtrlShiftKeys = ['i', 'j', 'c', 'delete'];

        let shouldBlock = false;

        // Block F-keys
        if (blockedKeys.includes(e.key)) {
            shouldBlock = true;
        }

        // Block Ctrl+Key combinations
        if (isCtrl && blockedCtrlKeys.includes(key)) {
            shouldBlock = true;
        }

        // Block Ctrl+Shift+Key combinations (DevTools)
        if (isCtrl && e.shiftKey && blockedCtrlShiftKeys.includes(key)) {
            shouldBlock = true;
        }

        if (shouldBlock) {
            console.log('[KioskController] Blocking browser shortcut:', e.key);
            e.preventDefault();
            e.stopPropagation();
        }

        // --- APP HOTKEYS ---

        // ALL NAVIGATION: Use Command Box (Ctrl+G)
        // Ctrl+G is handled by CommandBox component
        // CAL command opens Calculator

    }, [isSessionActive, router]);

    useEffect(() => {
        console.log('[KioskController] Attaching keydown listener');
        // Use capture phase to intercept before browser defaults
        window.addEventListener('keydown', handleGlobalKeys, { capture: true });

        return () => {
            console.log('[KioskController] Removing keydown listener');
            window.removeEventListener('keydown', handleGlobalKeys, { capture: true });
        };
    }, [handleGlobalKeys]);

    return null; // This is a controller component, no UI
}
