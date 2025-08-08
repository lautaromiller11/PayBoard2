import React, { createContext, useContext, useState } from 'react';

interface SyncContextType {
    finanzasNeedsSync: boolean;
    triggerFinanzasSync: () => void;
    resetFinanzasSync: () => void;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export const SyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [finanzasNeedsSync, setFinanzasNeedsSync] = useState(false);

    const triggerFinanzasSync = () => setFinanzasNeedsSync(true);
    const resetFinanzasSync = () => setFinanzasNeedsSync(false);

    return (
        <SyncContext.Provider value={{ finanzasNeedsSync, triggerFinanzasSync, resetFinanzasSync }}>
            {children}
        </SyncContext.Provider>
    );
};

export function useSync() {
    const ctx = useContext(SyncContext);
    if (!ctx) throw new Error('useSync must be used within a SyncProvider');
    return ctx;
}
