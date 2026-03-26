/**
 * BLEService.js — Web Bluetooth API wrapper for SafeVitals ESP32
 * 
 * Singleton service that handles:
 *  - Device discovery & pairing
 *  - GATT connection & characteristic subscription
 *  - JSON packet parsing with validation
 *  - Auto-reconnect with exponential backoff
 *  - Clean disconnect
 */

const SERVICE_UUID        = '12345678-1234-1234-1234-123456789abc';
const CHARACTERISTIC_UUID = 'abcd1234-ab12-cd34-ef56-123456789abc';

// Default fallback values when a field is missing or invalid
const DEFAULTS = {
    hr:   72,
    spo2: 98,
    temp: 36.5,
    ecg:  512,
    motion: { x: 0, y: 0, z: 0 }
};

class BLEService {
    constructor() {
        this._device = null;
        this._server = null;
        this._characteristic = null;
        this._status = 'idle'; // idle | connecting | connected | disconnected | error
        this._dataListeners = [];
        this._statusListeners = [];
        this._reconnectTimer = null;
        this._reconnectDelay = 1000;
        this._maxReconnectDelay = 10000;
        this._shouldReconnect = false;
    }

    // ─── Public API ───────────────────────────────────────

    /** Request BLE device & connect */
    async connect() {
        // Check browser support
        if (!navigator.bluetooth) {
            this._setStatus('error');
            throw new Error('Web Bluetooth is not supported in this browser. Use Chrome or Edge on desktop.');
        }

        try {
            this._setStatus('connecting');
            this._shouldReconnect = true;

            // Request device — browser shows pairing dialog
            this._device = await navigator.bluetooth.requestDevice({
                filters: [{ name: 'SafeVitalsESP32' }],
                optionalServices: [SERVICE_UUID]
            });

            // Listen for unexpected disconnects
            this._device.addEventListener('gattserverdisconnected', () => this._onDisconnected());

            await this._connectToDevice();

        } catch (err) {
            if (err.name === 'NotFoundError') {
                // User cancelled the pairing dialog
                this._setStatus('idle');
                throw new Error('No ESP32 device selected. Please try again.');
            }
            this._setStatus('error');
            throw new Error(`BLE Connection failed: ${err.message}`);
        }
    }

    /** Cleanly disconnect */
    disconnect() {
        this._shouldReconnect = false;
        this._clearReconnectTimer();

        if (this._device && this._device.gatt.connected) {
            this._device.gatt.disconnect();
        }
        this._setStatus('disconnected');
    }

    /** Register a callback for parsed vitals data */
    onData(callback) {
        this._dataListeners.push(callback);
        return () => {
            this._dataListeners = this._dataListeners.filter(cb => cb !== callback);
        };
    }

    /** Register a callback for status changes */
    onStatusChange(callback) {
        this._statusListeners.push(callback);
        // Immediately fire with current status
        callback(this._status);
        return () => {
            this._statusListeners = this._statusListeners.filter(cb => cb !== callback);
        };
    }

    get status() {
        return this._status;
    }

    // ─── Internal Methods ─────────────────────────────────

    async _connectToDevice() {
        try {
            this._server = await this._device.gatt.connect();

            const service = await this._server.getPrimaryService(SERVICE_UUID);
            this._characteristic = await service.getCharacteristic(CHARACTERISTIC_UUID);

            // Subscribe to notifications
            await this._characteristic.startNotifications();
            this._characteristic.addEventListener('characteristicvaluechanged', (event) => {
                this._handleNotification(event);
            });

            this._setStatus('connected');
            this._reconnectDelay = 1000; // reset backoff on success
            console.log('[BLE] Connected and subscribed to notifications');

        } catch (err) {
            console.error('[BLE] Connection to GATT failed:', err);
            this._setStatus('error');
            this._scheduleReconnect();
        }
    }

    _handleNotification(event) {
        try {
            const decoder = new TextDecoder('utf-8');
            const rawString = decoder.decode(event.target.value);
            const data = JSON.parse(rawString);

            // Validate & sanitize each field
            const vitals = {
                hr:   this._clamp(data.hr,   30, 220, DEFAULTS.hr),
                spo2: this._clamp(data.spo2,  70, 100, DEFAULTS.spo2),
                temp: this._clamp(data.temp,  20, 45,  DEFAULTS.temp),
                ecg:  this._clamp(data.ecg,   0, 4095, DEFAULTS.ecg),
                motion: {
                    x: this._clampFloat(data.motion?.x, -20, 20, 0),
                    y: this._clampFloat(data.motion?.y, -20, 20, 0),
                    z: this._clampFloat(data.motion?.z, -20, 20, 0),
                }
            };

            // Notify all listeners
            this._dataListeners.forEach(cb => cb(vitals));

        } catch (err) {
            // Corrupted packet — silently skip
            console.warn('[BLE] Malformed packet skipped:', err.message);
        }
    }

    _onDisconnected() {
        console.log('[BLE] Device disconnected');
        this._setStatus('disconnected');
        if (this._shouldReconnect) {
            this._scheduleReconnect();
        }
    }

    _scheduleReconnect() {
        this._clearReconnectTimer();
        console.log(`[BLE] Reconnecting in ${this._reconnectDelay}ms...`);

        this._reconnectTimer = setTimeout(async () => {
            if (!this._shouldReconnect || !this._device) return;

            this._setStatus('connecting');
            try {
                await this._connectToDevice();
            } catch (e) {
                console.error('[BLE] Reconnect attempt failed');
                // Exponential backoff
                this._reconnectDelay = Math.min(this._reconnectDelay * 2, this._maxReconnectDelay);
                this._scheduleReconnect();
            }
        }, this._reconnectDelay);
    }

    _clearReconnectTimer() {
        if (this._reconnectTimer) {
            clearTimeout(this._reconnectTimer);
            this._reconnectTimer = null;
        }
    }

    _setStatus(status) {
        this._status = status;
        this._statusListeners.forEach(cb => cb(status));
    }

    /** Clamp an integer value, returning fallback if NaN */
    _clamp(value, min, max, fallback) {
        if (typeof value !== 'number' || isNaN(value)) return fallback;
        return Math.max(min, Math.min(max, Math.round(value)));
    }

    /** Clamp a float value, returning fallback if NaN */
    _clampFloat(value, min, max, fallback) {
        if (typeof value !== 'number' || isNaN(value)) return fallback;
        return Math.round(Math.max(min, Math.min(max, value)) * 100) / 100;
    }
}

// Export as singleton
const bleService = new BLEService();
export default bleService;
