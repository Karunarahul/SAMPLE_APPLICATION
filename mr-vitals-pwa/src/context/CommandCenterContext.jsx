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

    // Connect to Cloud WebSocket Server
    useEffect(() => {
        // Replace with your production cloud URL (e.g. wss://my-app.onrender.com/web_ui)
        const CLOUD_URL = 'wss://sample-application-3bsj.onrender.com/web_ui';
        let ws;
        let mockInterval;

        const connect = () => {
            ws = new WebSocket(CLOUD_URL);

            ws.onopen = () => {
                console.log('Connected to Cloud Vitals Hub');
                if (mockInterval) clearInterval(mockInterval);
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    // Update vitals with hardware data
                    setVitals(prev => ({
                        hr: data.hr || prev.hr,
                        spo2: data.spo2 || prev.spo2,
                        temp_f: data.temp_c ? Number((parseFloat(data.temp_c) * 9 / 5 + 32).toFixed(1)) : prev.temp_f,
                        ecgHistory: [...prev.ecgHistory.slice(-50), data.ecg || Math.random()] // Fallback random ECG if 0
                    }));
                } catch (e) {
                    console.error('Error parsing vital data:', e);
                }
            };

            ws.onclose = () => {
                console.log('Disconnected from Cloud Hub, falling back to simulated data...');
                // Fallback simulated data
                mockInterval = setInterval(() => {
                    setVitals(prev => ({
                        ...prev,
                        hr: Math.floor(60 + Math.random() * 40),
                        spo2: Math.floor(95 + Math.random() * 5),
                        temp_f: Number((97.5 + Math.random() * 1.5).toFixed(1)),
                        ecgHistory: [...prev.ecgHistory.slice(-50), Math.random()]
                    }));
                }, 3000);

                // Attempt reconnect
                setTimeout(connect, 5000);
            };

            ws.onerror = (err) => {
                console.error("WebSocket error:", err);
                ws.close();
            };
        };

        connect();

        return () => {
            if (ws) ws.close();
            if (mockInterval) clearInterval(mockInterval);
        };
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
