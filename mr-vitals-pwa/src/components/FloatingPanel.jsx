import React, { useRef, useEffect } from 'react'
import { Html } from '@react-three/drei'

const ECGGraph = ({ hr }) => {
    const canvasRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Set canvas size for retina
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        ctx.strokeStyle = '#4ade80';
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        ctx.shadowBlur = 4;
        ctx.shadowColor = '#4ade80';

        let x = 0;
        let lastY = rect.height / 2;
        let frameCount = 0;

        // PQRST Wave points relative to a single 'beat' cycle
        // A beat takes roughly 60/hr seconds.
        const render = () => {
            const currentHR = hr || 60;
            const framesPerBeat = 3600 / currentHR;

            // Current position in the beat cycle (0 to 1)
            const t = (frameCount % framesPerBeat) / framesPerBeat;

            // Calculate Y based on PQRST
            let yOffset = 0;

            // Add some random noise for realism
            const noise = (Math.random() - 0.5) * 2;

            // PQRST Complex
            if (t > 0.10 && t < 0.15) yOffset = -3;  // P
            else if (t > 0.15 && t < 0.18) yOffset = 0;
            else if (t > 0.18 && t < 0.22) yOffset = 2;   // Q
            else if (t > 0.22 && t < 0.30) yOffset = -25; // R (Big Spike)
            else if (t > 0.30 && t < 0.34) yOffset = 4;   // S
            else if (t > 0.34 && t < 0.40) yOffset = 0;
            else if (t > 0.40 && t < 0.55) yOffset = -4;  // T

            const baseHeight = rect.height / 2;
            const currentY = baseHeight + yOffset + noise;

            // Fade effect: Clear a specific rectangle ahead of the draw head
            // Instead of full clear, we can draw a semi-transparent rect over the whole canvas to fade old trails?
            // Or the traditional "wiper" bar.

            // Wiper method: Clear a small bar ahead of x
            const cleanWidth = 10;
            ctx.clearRect(x, 0, cleanWidth, rect.height);

            // Draw Line
            ctx.beginPath();
            // If x was just reset, don't draw line from end to start
            if (x > 0) {
                ctx.moveTo(x - 2, lastY);
                ctx.lineTo(x, currentY);
            }
            ctx.stroke();

            // Store for next frame
            lastY = currentY;

            // Move forward
            const speed = 2; // Pixels per frame
            x += speed;

            // Wrap around
            if (x > rect.width) {
                x = 0;
                lastY = baseHeight;
            }

            frameCount++;
            animationFrameId = requestAnimationFrame(render);
        };

        let animationFrameId = requestAnimationFrame(render);
        return () => cancelAnimationFrame(animationFrameId);
    }, [hr]);

    return (
        <div style={{ width: '100%', height: '50px', marginBottom: '5px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', overflow: 'hidden' }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
        </div>
    )
}

export default function FloatingPanel({ data }) {
    // Alert Conditions
    const isHighHR = data.hr > 100;
    const isLowHR = data.hr < 50;
    const isAbnormal = isHighHR || isLowHR;

    // Pulse animation color
    const pulseColor = isAbnormal ? '#ef4444' : '#4ade80';

    return (
        <group position={[-5, 3.5, 1.8]}>
            <Html center transform>
                <div style={{
                    width: '450px',
                    padding: '30px',
                    background: isAbnormal
                        ? 'linear-gradient(135deg, rgba(80, 10, 10, 0.95) 0%, rgba(30, 0, 0, 0.95) 100%)'
                        : 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
                    color: '#fff',
                    borderRadius: '24px',
                    fontFamily: "'Inter', sans-serif",
                    backdropFilter: 'blur(12px)',
                    border: isAbnormal ? '1px solid #ef4444' : '1px solid rgba(56, 189, 248, 0.3)',
                    boxShadow: isAbnormal ? '0 0 50px rgba(220, 38, 38, 0.5)' : '0 8px 32px rgba(0, 0, 0, 0.5)'
                }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 600, letterSpacing: '0.5px', color: pulseColor }}>Vitals Monitor</h2>
                            <div style={{ fontSize: '12px', opacity: 0.6, marginTop: '4px' }}>Real-time Patient Data</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ fontSize: '12px', fontWeight: 'bold', color: pulseColor }}>LIVE</div>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: pulseColor, boxShadow: `0 0 10px ${pulseColor}`, animation: 'pulse 1s infinite' }}></div>
                        </div>
                    </div>

                    {/* Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>

                        {/* Heart Rate */}
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.03)',
                            padding: '20px',
                            borderRadius: '16px',
                            border: '1px solid rgba(255,255,255,0.05)',
                        }}>
                            <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ color: '#f87171' }}>♥</span> Heart Rate
                            </div>
                            <div style={{ fontSize: '42px', fontWeight: '700', color: isAbnormal ? '#fca5a5' : 'white' }}>
                                {data.hr} <span style={{ fontSize: '16px', fontWeight: '400', opacity: 0.8 }}>bpm</span>
                            </div>
                        </div>

                        {/* SpO2 */}
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.03)',
                            padding: '20px',
                            borderRadius: '16px',
                            border: '1px solid rgba(255,255,255,0.05)'
                        }}>
                            <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ color: '#60a5fa' }}>○</span> SpO₂
                            </div>
                            <div style={{ fontSize: '42px', fontWeight: '700' }}>
                                {data.spo2} <span style={{ fontSize: '16px', fontWeight: '400', opacity: 0.8 }}>%</span>
                            </div>
                        </div>

                        {/* Temp */}
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.03)',
                            padding: '20px',
                            borderRadius: '16px',
                            border: '1px solid rgba(255,255,255,0.05)'
                        }}>
                            <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ color: '#fbbf24' }}>🌡</span> Temp
                            </div>
                            <div style={{ fontSize: '42px', fontWeight: '700' }}>
                                {data.temp_f || data.temp_c || '--'} <span style={{ fontSize: '16px', fontWeight: '400', opacity: 0.8 }}>°F</span>
                            </div>
                        </div>

                        {/* ECG Graph Section */}
                        <div style={{
                            background: 'rgba(0, 0, 0, 0.3)',
                            padding: '10px 15px',
                            borderRadius: '16px',
                            border: '1px solid rgba(255,255,255,0.05)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center'
                        }}>
                            <ECGGraph hr={data.hr} />
                            <div style={{ fontSize: '12px', color: pulseColor, fontWeight: '600', textAlign: 'center', marginTop: '5px' }}>
                                {isHighHR ? 'TACHYCARDIA DETECTED' : isLowHR ? 'BRADYCARDIA DETECTED' : 'Normal Sinus Rhythm'}
                            </div>
                        </div>
                    </div>

                    {/* Alert Banner */}
                    {isAbnormal && (
                        <div style={{
                            marginTop: '20px',
                            padding: '12px',
                            background: 'rgba(220, 38, 38, 0.2)',
                            border: '1px solid rgba(220, 38, 38, 0.5)',
                            color: '#fecaca',
                            fontWeight: '600',
                            textAlign: 'center',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            animation: 'pulse 0.5s infinite'
                        }}>
                            <span style={{ fontSize: '18px' }}>⚠</span>
                            {isHighHR ? 'HIGH HEART RATE WARNING' : 'LOW HEART RATE WARNING'}
                        </div>
                    )}
                </div>
            </Html>
        </group>
    )
}
