'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

type SaveAction = () => Promise<void> | void;

interface GlobalActionContextType {
    registerSaveAction: (action: SaveAction) => void;
    unregisterSaveAction: () => void;
    hasActiveAction: boolean;
    executeSave: () => Promise<void>;
}

const GlobalActionContext = createContext<GlobalActionContextType | undefined>(undefined);

export function GlobalActionProvider({ children }: { children: React.ReactNode }) {
    const [saveAction, setSaveAction] = useState<SaveAction | null>(null);

    const registerSaveAction = useCallback((action: SaveAction) => {
        setSaveAction(() => action);
    }, []);

    const unregisterSaveAction = useCallback(() => {
        setSaveAction(null);
    }, []);

    const executeSave = useCallback(async () => {
        if (saveAction) {
            await saveAction();
        }
    }, [saveAction]);

    return (
        <GlobalActionContext.Provider value={{
            registerSaveAction,
            unregisterSaveAction,
            hasActiveAction: !!saveAction,
            executeSave
        }}>
            {children}
        </GlobalActionContext.Provider>
    );
}

export function useGlobalAction() {
    const context = useContext(GlobalActionContext);
    if (!context) {
        throw new Error('useGlobalAction must be used within a GlobalActionProvider');
    }
    return context;
}
