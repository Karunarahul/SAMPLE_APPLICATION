import React from 'react';

const STATUS_CONFIG = {
    idle:         { color: '#6B7280', label: 'Not Connected',  pulse: false },
    connecting:   { color: '#F59E0B', label: 'Connecting...',  pulse: true  },
    connected:    { color: '#10B981', label: 'ESP32 Connected', pulse: true  },
    disconnected: { color: '#EF4444', label: 'Disconnected',   pulse: false },
    error:        { color: '#EF4444', label: 'Error',          pulse: false },
};

export default function BLEConnectButton({ bleStatus, onConnect, onDisconnect, error }) {
    const config = STATUS_CONFIG[bleStatus] || STATUS_CONFIG.idle;
    const isConnected = bleStatus === 'connected';
    const isConnecting = bleStatus === 'connecting';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <button
                onClick={isConnected ? onDisconnect : onConnect}
                disabled={isConnecting}
                style={{
                    padding: '16px 32px',
                    border: `1px solid ${config.color}80`,
                    borderRadius: '100px',
                    background: isConnected
                        ? `linear-gradient(135deg, rgba(16, 185, 129, 0.9) 0%, rgba(5, 150, 105, 0.9) 100%)`
                        : `linear-gradient(135deg, rgba(99, 102, 241, 0.9) 0%, rgba(79, 70, 229, 0.9) 100%)`,
                    color: 'white',
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: '600',
                    fontSize: '1.1rem',
                    backdropFilter: 'blur(10px)',
                    cursor: isConnecting ? 'wait' : 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: `0 10px 25px -5px ${config.color}80, 0 0 15px ${config.color}30 inset`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    opacity: isConnecting ? 0.7 : 1,
                }}
                onMouseOver={(e) => {
                    if (!isConnecting) {
                        e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                    }
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                }}
            >
                {/* Bluetooth Icon */}
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6.5 6.5L17.5 17.5L12 23V1L17.5 6.5L6.5 17.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>

                {/* Status Dot */}
                <div style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: config.color,
                    boxShadow: `0 0 8px ${config.color}`,
                    animation: config.pulse ? 'pulse 1.5s infinite' : 'none'
                }} />

                {isConnected ? 'Disconnect ESP32' : isConnecting ? 'Pairing...' : 'Connect ESP32'}
            </button>

            {/* Status label */}
            <span style={{
                fontSize: '0.75rem',
                color: config.color,
                fontFamily: "'Inter', sans-serif",
                fontWeight: 500,
                letterSpacing: '0.5px'
            }}>
                {config.label}
            </span>

            {/* Error message */}
            {error && (
                <span style={{
                    fontSize: '0.7rem',
                    color: '#FCA5A5',
                    fontFamily: "'Inter', sans-serif",
                    maxWidth: '250px',
                    textAlign: 'center'
                }}>
                    {error}
                </span>
            )}
        </div>
    );
}
