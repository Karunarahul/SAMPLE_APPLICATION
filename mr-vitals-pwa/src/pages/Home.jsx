import React, { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { XR, Controllers, VRButton, ARButton, useXR } from '@react-three/xr'
import { useNavigate } from 'react-router-dom'
import { CommandCenterProvider, useCommandCenter, MODES } from '../context/CommandCenterContext'
import DashboardScene from '../scenes/DashboardScene'
import VRCommandCenter from '../scenes/VRCommandCenter'
import AROverlay from '../scenes/AROverlay'
import BLEConnectButton from '../components/BLEConnectButton'

function SceneManager() {
    const { mode, exitSession } = useCommandCenter()
    const { isPresenting } = useXR()

    // Clean up state when exiting an XR session
    useEffect(() => {
        if (!isPresenting && mode !== MODES.DASHBOARD) {
            exitSession();
        }
    }, [isPresenting, mode, exitSession]);

    // NEVER render the immersive views if WebXR hasn't activated yet. This prevents the "black void" on desktop.
    if (!isPresenting) {
        return <DashboardScene />
    }

    switch (mode) {
        case MODES.VR:
            return <VRCommandCenter />
        case MODES.AR:
            return <AROverlay />
        case MODES.DASHBOARD:
        default:
            // Fallback during transition
            return <DashboardScene />
    }
}

function UIOverlay({ isPresenting }) {
    const { vitals, enterVR, enterAR, bleStatus, bleError, connectBLE, disconnectBLE, connectionSource } = useCommandCenter()
    const navigate = useNavigate()
    const [cameraGranted, setCameraGranted] = useState(false)
    const [requestingCamera, setRequestingCamera] = useState(false)

    // Hide traditional UI while in immersive mode so it doesn't block hit-testing taps.
    if (isPresenting) return null;

    const requestCameraPermission = async () => {
        try {
            setRequestingCamera(true);
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
            // Permission granted, immediately stop the stream to free it for WebXR
            stream.getTracks().forEach(track => track.stop());
            setCameraGranted(true);
        } catch (err) {
            console.error("Camera permission denied:", err);
            alert("Camera permission is required for AR mode.");
        } finally {
            setRequestingCamera(false);
        }
    };

    return (
        <>
            <div style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                zIndex: 1000
            }}>
                <button
                    onClick={() => navigate('/')}
                    style={{
                        padding: '10px 20px',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        color: 'white',
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '30px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    <span style={{ fontSize: '1.2rem' }}>←</span> Back
                </button>
            </div>

            {/* Connection Source Badge */}
            <div style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.75rem',
                color: 'white',
                letterSpacing: '0.5px'
            }}>
                <div style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: connectionSource === 'ble' ? '#10B981' : connectionSource === 'websocket' ? '#3B82F6' : '#F59E0B',
                    boxShadow: `0 0 6px ${connectionSource === 'ble' ? '#10B981' : connectionSource === 'websocket' ? '#3B82F6' : '#F59E0B'}`
                }} />
                {connectionSource === 'ble' ? '🔗 BLE' : connectionSource === 'websocket' ? '☁️ Cloud' : '📡 Simulated'}
            </div>

            {/* Enhanced AI Analysis & VR Buttons */}
            <div style={{
                position: 'absolute',
                bottom: '32px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 1000,
                display: 'flex',
                gap: '20px',
                alignItems: 'center'
            }}>
                <button
                    onClick={() => navigate('/analysis', { state: { vitals } })}
                    style={{
                        padding: '16px 32px',
                        border: '1px solid rgba(96, 165, 250, 0.5)',
                        borderRadius: '100px',
                        background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.9) 0%, rgba(29, 78, 216, 0.9) 100%)',
                        color: 'white',
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: '600',
                        fontSize: '1.1rem',
                        backdropFilter: 'blur(10px)',
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.5), 0 0 15px rgba(96, 165, 250, 0.3) inset',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                        e.currentTarget.style.boxShadow = '0 20px 30px -10px rgba(37, 99, 235, 0.6), 0 0 20px rgba(96, 165, 250, 0.4) inset';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                        e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(37, 99, 235, 0.5), 0 0 15px rgba(96, 165, 250, 0.3) inset';
                    }}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L14.4 7.2L20 8.8L15.2 12.8L16.8 18.4L12 15.2L7.2 18.4L8.8 12.8L4 8.8L9.6 7.2L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Enhanced AI Analysis
                </button>

                {/* VR Button with Context Interception */}
                <div style={{ position: 'relative' }} onPointerDown={enterVR}>
                    <VRButton
                        sessionInit={{ optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking', 'layers'], domOverlay: { root: document.body } }}
                        style={{
                            position: 'static',
                            padding: '16px 32px',
                            border: '1px solid rgba(16, 185, 129, 0.5)',
                            borderRadius: '100px',
                            background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.9) 0%, rgba(4, 120, 87, 0.9) 100%)',
                            color: 'white',
                            fontFamily: "'Inter', sans-serif",
                            fontWeight: '600',
                            fontSize: '1.1rem',
                            backdropFilter: 'blur(10px)',
                            cursor: 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: '0 10px 25px -5px rgba(5, 150, 105, 0.5), 0 0 15px rgba(16, 185, 129, 0.3) inset',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            width: 'auto',
                            left: 'auto',
                            transform: 'none',
                            bottom: 'auto'
                        }}
                    >
                        Enter VR Mode
                    </VRButton>
                </div>

                {/* AR Button with Native WebXR Context Interception */}
                <div style={{ position: 'relative' }} onPointerDown={enterAR}>
                    <ARButton
                        sessionInit={{ 
                            requiredFeatures: ['hit-test', 'dom-overlay'], 
                            optionalFeatures: ['light-estimation', 'anchors', 'local-floor', 'depth-sensing'],
                            domOverlay: { root: document.body } 
                        }}
                        style={{
                            position: 'static',
                            padding: '16px 32px',
                            border: '1px solid rgba(236, 72, 153, 0.5)',
                            borderRadius: '100px',
                            background: 'linear-gradient(135deg, rgba(219, 39, 119, 0.9) 0%, rgba(190, 24, 93, 0.9) 100%)',
                            color: 'white',
                            fontFamily: "'Inter', sans-serif",
                            fontWeight: '600',
                            fontSize: '1.1rem',
                            backdropFilter: 'blur(10px)',
                            cursor: 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: '0 10px 25px -5px rgba(236, 72, 153, 0.5), 0 0 15px rgba(219, 39, 119, 0.3) inset',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            width: 'auto',
                            left: 'auto',
                            transform: 'none',
                            bottom: 'auto'
                        }}
                    >
                        Enter AR Mode
                    </ARButton>
                </div>

                {/* BLE Connect Button */}
                <BLEConnectButton
                    bleStatus={bleStatus}
                    onConnect={connectBLE}
                    onDisconnect={disconnectBLE}
                    error={bleError}
                />
            </div>
        </>
    )
}

function XRStateSync({ onPresentStateChange }) {
    const { isPresenting } = useXR()
    useEffect(() => {
        onPresentStateChange(isPresenting)
    }, [isPresenting, onPresentStateChange])
    return null
}

export default function Home() {
    const [isPresenting, setIsPresenting] = useState(false)

    return (
        <CommandCenterProvider>
            <UIOverlay isPresenting={isPresenting} />
            <Canvas camera={{ position: [0, 5, 15], fov: 50 }} gl={{ alpha: true }}>
                <XR>
                    <XRStateSync onPresentStateChange={setIsPresenting} />
                    <Controllers />
                    <SceneManager />
                </XR>
            </Canvas>
        </CommandCenterProvider>
    )
}

