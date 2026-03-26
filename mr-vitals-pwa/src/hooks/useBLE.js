/**
 * useBLE.js — React hook wrapping BLEService for component consumption
 * 
 * Provides:
 *  - bleStatus: 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error'
 *  - latestData: most recent parsed vitals packet from ESP32
 *  - error: human-readable error string (null when ok)
 *  - connectBLE(): initiate pairing
 *  - disconnectBLE(): cleanly disconnect
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import bleService from '../services/BLEService';

export default function useBLE() {
    const [bleStatus, setBleStatus] = useState(bleService.status);
    const [latestData, setLatestData] = useState(null);
    const [error, setError] = useState(null);
    const unsubscribersRef = useRef([]);

    // Subscribe to BLE events on mount
    useEffect(() => {
        const unsubStatus = bleService.onStatusChange((status) => {
            setBleStatus(status);
            if (status === 'connected') setError(null);
        });

        const unsubData = bleService.onData((data) => {
            setLatestData(data);
        });

        unsubscribersRef.current = [unsubStatus, unsubData];

        return () => {
            unsubscribersRef.current.forEach(unsub => unsub());
        };
    }, []);

    const connectBLE = useCallback(async () => {
        try {
            setError(null);
            await bleService.connect();
        } catch (err) {
            setError(err.message);
        }
    }, []);

    const disconnectBLE = useCallback(() => {
        bleService.disconnect();
        setLatestData(null);
        setError(null);
    }, []);

    return {
        bleStatus,
        latestData,
        error,
        connectBLE,
        disconnectBLE
    };
}
