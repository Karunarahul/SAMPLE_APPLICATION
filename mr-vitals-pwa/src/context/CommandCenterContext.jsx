import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import useBLE from '../hooks/useBLE';

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
        ecgHistory: [],
        motion: { x: 0, y: 0, z: 0 }
    });

    // ─── Data source tracking ─────────────────────────────
    const [connectionSource, setConnectionSource] = useState('simulated'); // 'ble' | 'websocket' | 'simulated'

    // ─── BLE Integration ──────────────────────────────────
    const { bleStatus, latestData, error: bleError, connectBLE, disconnectBLE } = useBLE();

    // When BLE data arrives, update vitals and mark source
    useEffect(() => {
        if (latestData && bleStatus === 'connected') {
            setConnectionSource('ble');
            setVitals(prev => ({
                hr: latestData.hr || prev.hr,
                spo2: latestData.spo2 || prev.spo2,
                // Convert BLE Celsius → Fahrenheit
                temp_f: latestData.temp
                    ? Number((latestData.temp * 9 / 5 + 32).toFixed(1))
                    : prev.temp_f,
                ecgHistory: [...prev.ecgHistory.slice(-50), latestData.ecg || prev.ecgHistory[prev.ecgHistory.length - 1] || 512],
                motion: latestData.motion || prev.motion
            }));
        }
    }, [latestData, bleStatus]);

    // ─── WebSocket Fallback (only when BLE is NOT connected) ───
    useEffect(() => {
        // Skip WebSocket if BLE is active
        if (bleStatus === 'connected') return;

        const CLOUD_URL = 'wss://sample-application-3bsj.onrender.com/web_ui';
        let ws;
        let mockInterval;
        let reconnectTimeout;

        const connect = () => {
            ws = new WebSocket(CLOUD_URL);

            ws.onopen = () => {
                console.log('Connected to Cloud Vitals Hub');
                setConnectionSource('websocket');
                if (mockInterval) clearInterval(mockInterval);
                if (reconnectTimeout) clearTimeout(reconnectTimeout);
            };

            ws.onmessage = (event) => {
                // Don't overwrite if BLE became active mid-connection
                if (bleStatus === 'connected') return;

                try {
                    const data = JSON.parse(event.data);
                    setVitals(prev => ({
                        hr: data.hr || prev.hr,
                        spo2: data.spo2 || prev.spo2,
                        temp_f: data.temp_c ? Number((parseFloat(data.temp_c) * 9 / 5 + 32).toFixed(1)) : prev.temp_f,
                        ecgHistory: [...prev.ecgHistory.slice(-50), data.ecg || Math.random()],
                        motion: data.motion || prev.motion
                    }));
                } catch (e) {
                    console.error('Error parsing vital data:', e);
                }
            };

            ws.onclose = () => {
                console.log('Disconnected from Cloud Hub, falling back to simulated data...');
                setConnectionSource('simulated');
                if (mockInterval) clearInterval(mockInterval);
                // Fallback simulated data
                mockInterval = setInterval(() => {
                    if (bleStatus === 'connected') return; // guard
                    setVitals(prev => ({
                        ...prev,
                        hr: Math.floor(60 + Math.random() * 40),
                        spo2: Math.floor(95 + Math.random() * 5),
                        temp_f: Number((97.5 + Math.random() * 1.5).toFixed(1)),
                        ecgHistory: [...prev.ecgHistory.slice(-50), Math.random()],
                        motion: {
                            x: Number((Math.random() * 2 - 1).toFixed(2)),
                            y: Number((Math.random() * 2 - 1).toFixed(2)),
                            z: Number((9.8 + Math.random() * 0.4 - 0.2).toFixed(2))
                        }
                    }));
                }, 3000);

                // Attempt reconnect
                if (reconnectTimeout) clearTimeout(reconnectTimeout);
                reconnectTimeout = setTimeout(connect, 5000);
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
            if (reconnectTimeout) clearTimeout(reconnectTimeout);
        };
    }, [bleStatus]);

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
            MODES,
            // BLE
            bleStatus,
            bleError,
            connectBLE,
            disconnectBLE,
            connectionSource
        }}>
            {children}
        </CommandCenterContext.Provider>
    );
}

export const useCommandCenter = () => {
    return useContext(CommandCenterContext);
};
