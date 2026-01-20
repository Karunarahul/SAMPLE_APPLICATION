import React, { useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { XR, Controllers, VRButton, ARButton, useXR } from '@react-three/xr'
import { useNavigate } from 'react-router-dom'
import { CommandCenterProvider, useCommandCenter, MODES } from '../context/CommandCenterContext'
import DashboardScene from '../scenes/DashboardScene'
import VRCommandCenter from '../scenes/VRCommandCenter'
import AROverlay from '../scenes/AROverlay'

function SceneManager() {
    const { mode, enterVR, enterAR } = useCommandCenter()
    const { isPresenting, player } = useXR()

    // Sync XR state with Context Mode
    useEffect(() => {
        if (isPresenting) {
            // We can't easily distinguish VR/AR from isPresenting alone without checking session, 
            // but for now we rely on the button clicks setting the mode.
        }
    }, [isPresenting])

    switch (mode) {
        case MODES.VR:
            return <VRCommandCenter />
        case MODES.AR:
            return <AROverlay />
        case MODES.DASHBOARD:
        default:
            return <DashboardScene />
    }
}

function UIOverlay() {
    const { vitals, enterVR, enterAR } = useCommandCenter()
    const navigate = useNavigate()

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
                <div style={{ position: 'relative' }} onClick={enterVR}>
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

                {/* AR Button with Context Interception */}
                <div style={{ position: 'relative' }} onClick={enterAR}>
                    <ARButton
                        sessionInit={{ requiredFeatures: ['hit-test'], optionalFeatures: ['dom-overlay'], domOverlay: { root: document.body } }}
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
                        }}
                    >
                        Enter AR Mode
                    </ARButton>
                </div>
            </div>
        </>
    )
}

export default function Home() {
    return (
        <CommandCenterProvider>
            <UIOverlay />
            <Canvas camera={{ position: [0, 5, 15], fov: 50 }} gl={{ alpha: true }}>
                <XR>
                    <Controllers />
                    <SceneManager />
                </XR>
            </Canvas>
        </CommandCenterProvider>
    )
}

