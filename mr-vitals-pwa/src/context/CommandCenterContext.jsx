import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const CommandCenterContext = createContext();

export const MODES = {
    DASHBOARD: 'dashboard',
    VR: 'vr',
    AR: 'ar'
};

export function CommandCenterProvider({ children }) {
    const [mode, setMode] = useState(MODES.DASHBOARD);
    const [vitals, setVitals] = useState({
        hr: 72,
        spo2: 98,
        temp_f: 98.6,
        ecgHistory: []
    });

    // Simulate vitals update
    useEffect(() => {
        const interval = setInterval(() => {
            setVitals(prev => ({
                ...prev,
                hr: Math.floor(60 + Math.random() * 40),
                spo2: Math.floor(95 + Math.random() * 5),
                temp_f: Number((97.5 + Math.random() * 1.5).toFixed(1)),
                ecgHistory: [...prev.ecgHistory.slice(-50), Math.random()]
            }));
        }, 3000); // Slower update for testing
        return () => clearInterval(interval);
    }, []);

    const enterVR = () => setMode(MODES.VR);
    const enterAR = () => setMode(MODES.AR);
    const exitSession = () => setMode(MODES.DASHBOARD);

    return (
        <CommandCenterContext.Provider value={{
            mode,
            vitals,
            enterVR,
            enterAR,
            exitSession,
            MODES
        }}>
            {children}
        </CommandCenterContext.Provider>
    );
}

export const useCommandCenter = () => {
    return useContext(CommandCenterContext);
};
