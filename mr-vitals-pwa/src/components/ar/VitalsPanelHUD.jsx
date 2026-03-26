import React from 'react';
import ECGWaveform from './ECGWaveform';

/**
 * VitalsPanelHUD — Floating glassmorphic panels for Iron Man AR overlay.
 * Rendered as DOM overlays on top of the camera + Three.js canvas.
 */
export default function VitalsPanelHUD({ vitals = {}, bleStatus = 'idle', connectionSource = 'simulated' }) {
    const hr = vitals.hr || 72;
    const spo2 = vitals.spo2 || 98;
    const tempF = vitals.temp_f || 98.6;
    const motion = vitals.motion || { x: 0, y: 0, z: 0 };

    const isHighHR = hr > 100;
    const isLowHR = hr < 50;
    const isAbnormal = isHighHR || isLowHR;

    const panelStyle = {
        background: 'rgba(0, 10, 20, 0.7)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(0, 255, 255, 0.25)',
        borderRadius: '16px',
        padding: '16px 20px',
        color: 'white',
        fontFamily: "'Inter', monospace",
        boxShadow: '0 0 20px rgba(0, 255, 255, 0.1), inset 0 0 30px rgba(0, 255, 255, 0.03)',
        minWidth: '160px',
    };

    const labelStyle = {
        fontSize: '0.65rem',
        textTransform: 'uppercase',
        letterSpacing: '2px',
        color: 'rgba(0, 255, 255, 0.7)',
        marginBottom: '4px',
    };

    const valueStyle = (color = '#00FFFF') => ({
        fontSize: '2rem',
        fontWeight: '700',
        color: color,
        textShadow: `0 0 10px ${color}60`,
        lineHeight: 1,
    });

    const unitStyle = {
        fontSize: '0.75rem',
        color: 'rgba(255, 255, 255, 0.5)',
        marginLeft: '4px',
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 10,
            pointerEvents: 'none',
            fontFamily: "'Inter', sans-serif",
        }}>

            {/* ─── Top Row: HR + SpO2 ───────────────────────── */}
            <div style={{
                position: 'absolute',
                top: '80px',
                left: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
            }}>
                {/* Heart Rate */}
                <div style={{
                    ...panelStyle,
                    borderColor: isAbnormal ? 'rgba(255, 59, 59, 0.5)' : 'rgba(0, 255, 136, 0.3)',
                    animation: isAbnormal ? 'pulse 0.5s infinite' : 'none',
                }}>
                    <div style={labelStyle}>❤️ Heart Rate</div>
                    <div style={{ display: 'flex', alignItems: 'baseline' }}>
                        <span style={valueStyle(isAbnormal ? '#FF3B3B' : '#00FF88')}>{hr}</span>
                        <span style={unitStyle}>bpm</span>
                    </div>
                    <div style={{
                        fontSize: '0.6rem',
                        color: isAbnormal ? '#FF3B3B' : '#00FF88',
                        marginTop: '4px',
                        letterSpacing: '1px',
                    }}>
                        {isHighHR ? '⚠ TACHYCARDIA' : isLowHR ? '⚠ BRADYCARDIA' : '● NORMAL'}
                    </div>
                </div>

                {/* SpO2 */}
                <div style={panelStyle}>
                    <div style={labelStyle}>🫁 SpO₂</div>
                    <div style={{ display: 'flex', alignItems: 'baseline' }}>
                        <span style={valueStyle(spo2 < 95 ? '#FF3B3B' : '#00FFFF')}>{spo2}</span>
                        <span style={unitStyle}>%</span>
                    </div>
                </div>
            </div>

            {/* ─── Top Right: Temp + Motion ─────────────────── */}
            <div style={{
                position: 'absolute',
                top: '80px',
                right: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
            }}>
                {/* Temperature */}
                <div style={panelStyle}>
                    <div style={labelStyle}>🌡️ Temperature</div>
                    <div style={{ display: 'flex', alignItems: 'baseline' }}>
                        <span style={valueStyle('#FBBF24')}>{tempF}</span>
                        <span style={unitStyle}>°F</span>
                    </div>
                </div>

                {/* Motion */}
                <div style={panelStyle}>
                    <div style={labelStyle}>🧭 Motion</div>
                    <div style={{ display: 'flex', gap: '14px', marginTop: '4px' }}>
                        {['x', 'y', 'z'].map(axis => (
                            <div key={axis} style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.55rem', color: 'rgba(0,255,255,0.5)', textTransform: 'uppercase' }}>{axis}</div>
                                <div style={{ fontSize: '1rem', fontWeight: '700', color: '#A78BFA' }}>
                                    {typeof motion[axis] === 'number' ? motion[axis].toFixed(1) : '0.0'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ─── Bottom Center: ECG ───────────────────────── */}
            <div style={{
                position: 'absolute',
                bottom: '100px',
                left: '50%',
                transform: 'translateX(-50%)',
            }}>
                <div style={{ ...panelStyle, padding: '12px 16px' }}>
                    <div style={{ ...labelStyle, marginBottom: '8px' }}>📈 ECG Waveform</div>
                    <ECGWaveform hr={hr} width={350} height={55} />
                </div>
            </div>

            {/* ─── Connection Badge ─────────────────────────── */}
            <div style={{
                position: 'absolute',
                top: '16px',
                right: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                background: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(8px)',
                borderRadius: '20px',
                border: `1px solid ${bleStatus === 'connected' ? 'rgba(0,255,136,0.3)' : 'rgba(255,255,255,0.15)'}`,
                fontSize: '0.7rem',
                color: bleStatus === 'connected' ? '#00FF88' : '#F59E0B',
                letterSpacing: '1px',
                textTransform: 'uppercase',
            }}>
                <div style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: connectionSource === 'ble' ? '#00FF88' : connectionSource === 'websocket' ? '#3B82F6' : '#F59E0B',
                    boxShadow: `0 0 6px ${connectionSource === 'ble' ? '#00FF88' : connectionSource === 'websocket' ? '#3B82F6' : '#F59E0B'}`,
                    animation: 'pulse 1.5s infinite',
                }} />
                {connectionSource === 'ble' ? 'BLE Live' : connectionSource === 'websocket' ? 'Cloud' : 'Simulated'}
            </div>
        </div>
    );
}
