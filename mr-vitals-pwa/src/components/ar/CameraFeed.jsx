import React, { useRef, useEffect, useState } from 'react';

/**
 * CameraFeed — Fullscreen getUserMedia webcam background.
 * Supports front/rear camera toggle on mobile.
 */
export default function CameraFeed({ facingMode = 'environment', onStreamReady }) {
    const videoRef = useRef(null);
    const [error, setError] = useState(null);
    const [active, setActive] = useState(false);

    useEffect(() => {
        let stream = null;

        const startCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: facingMode,
                        width: { ideal: 1920 },
                        height: { ideal: 1080 }
                    },
                    audio: false
                });

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await videoRef.current.play();
                    setActive(true);
                    if (onStreamReady) onStreamReady(true);
                }
            } catch (err) {
                console.error('[Camera] Failed:', err);
                setError(err.message || 'Camera access denied');
                if (onStreamReady) onStreamReady(false);
            }
        };

        startCamera();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            setActive(false);
        };
    }, [facingMode]);

    return (
        <>
            <video
                ref={videoRef}
                playsInline
                muted
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    objectFit: 'cover',
                    zIndex: 0,
                    transform: facingMode === 'user' ? 'scaleX(-1)' : 'none'
                }}
            />

            {/* Camera status indicator */}
            {active && (
                <div style={{
                    position: 'fixed',
                    top: '16px',
                    left: '16px',
                    zIndex: 100,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 14px',
                    background: 'rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: '20px',
                    border: '1px solid rgba(0, 255, 255, 0.3)',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.7rem',
                    color: '#00FFFF',
                    letterSpacing: '1px',
                    textTransform: 'uppercase'
                }}>
                    <div style={{
                        width: '8px', height: '8px', borderRadius: '50%',
                        background: '#00FF88',
                        boxShadow: '0 0 8px #00FF88',
                        animation: 'pulse 1.5s infinite'
                    }} />
                    Camera Active
                </div>
            )}

            {/* Error overlay */}
            {error && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, width: '100vw', height: '100vh',
                    background: 'rgba(0, 0, 0, 0.9)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 100,
                    color: '#FF3B3B',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '1.2rem',
                    textAlign: 'center',
                    padding: '20px'
                }}>
                    ⚠️ Camera Error: {error}<br />
                    <span style={{ fontSize: '0.9rem', color: '#999', marginTop: '10px', display: 'block' }}>
                        Please allow camera access and reload.
                    </span>
                </div>
            )}
        </>
    );
}
