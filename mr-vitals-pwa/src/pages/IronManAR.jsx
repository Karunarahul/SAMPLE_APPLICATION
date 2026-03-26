import React, { useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { useNavigate } from 'react-router-dom';
import { CommandCenterProvider, useCommandCenter } from '../context/CommandCenterContext';
import CameraFeed from '../components/ar/CameraFeed';
import JarvisHUD from '../components/ar/JarvisHUD';
import HologramModel from '../components/ar/HologramModel';
import VitalsPanelHUD from '../components/ar/VitalsPanelHUD';
import BLEConnectButton from '../components/BLEConnectButton';

function IronManARContent() {
    const { vitals, bleStatus, bleError, connectBLE, disconnectBLE, connectionSource } = useCommandCenter();
    const navigate = useNavigate();
    const [cameraReady, setCameraReady] = useState(false);
    const [facingMode, setFacingMode] = useState('environment');
    const [showHologram, setShowHologram] = useState(true);
    const [showHUD, setShowHUD] = useState(true);

    const handleStreamReady = useCallback((ready) => {
        setCameraReady(ready);
    }, []);

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', overflow: 'hidden', background: '#000' }}>

            {/* Layer 0: Camera Feed */}
            <CameraFeed facingMode={facingMode} onStreamReady={handleStreamReady} />

            {/* Layer 1: Three.js Transparent Canvas */}
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 5 }}>
                <Canvas
                    camera={{ position: [0, 0, 0], fov: 50 }}
                    gl={{ alpha: true, antialias: true }}
                    style={{ background: 'transparent' }}
                >
                    <ambientLight intensity={0.5} />
                    <pointLight position={[0, 5, 5]} intensity={0.5} color="#00FFFF" />

                    {/* Jarvis HUD rings */}
                    {showHUD && <JarvisHUD vitals={vitals} scanActive={true} />}

                    {/* Holographic body */}
                    {showHologram && <HologramModel vitals={vitals} position={[0, -1.5, -5]} scale={0.9} />}
                </Canvas>
            </div>

            {/* Layer 2: DOM Vitals Panels */}
            <VitalsPanelHUD vitals={vitals} bleStatus={bleStatus} connectionSource={connectionSource} />

            {/* Layer 3: Controls Bar */}
            <div style={{
                position: 'fixed',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 50,
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
                pointerEvents: 'auto',
            }}>
                {/* Exit AR */}
                <button
                    onClick={() => navigate('/home')}
                    style={controlBtnStyle('#FF3B3B')}
                >
                    ✕ Exit AR
                </button>

                {/* Toggle Hologram */}
                <button
                    onClick={() => setShowHologram(prev => !prev)}
                    style={controlBtnStyle(showHologram ? '#00FFFF' : '#6B7280')}
                >
                    {showHologram ? '👤 Hide Body' : '👤 Show Body'}
                </button>

                {/* Toggle HUD */}
                <button
                    onClick={() => setShowHUD(prev => !prev)}
                    style={controlBtnStyle(showHUD ? '#00FFFF' : '#6B7280')}
                >
                    {showHUD ? '◎ Hide HUD' : '◎ Show HUD'}
                </button>

                {/* Flip Camera */}
                <button
                    onClick={() => setFacingMode(prev => prev === 'environment' ? 'user' : 'environment')}
                    style={controlBtnStyle('#00FF88')}
                >
                    🔄 Flip
                </button>

                {/* BLE */}
                <BLEConnectButton
                    bleStatus={bleStatus}
                    onConnect={connectBLE}
                    onDisconnect={disconnectBLE}
                    error={bleError}
                />
            </div>
        </div>
    );
}

function controlBtnStyle(color) {
    return {
        padding: '10px 18px',
        border: `1px solid ${color}60`,
        borderRadius: '30px',
        background: `rgba(0, 0, 0, 0.6)`,
        backdropFilter: 'blur(10px)',
        color: color,
        fontFamily: "'Inter', sans-serif",
        fontWeight: '600',
        fontSize: '0.8rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        letterSpacing: '0.5px',
        whiteSpace: 'nowrap',
    };
}

// Wrap in CommandCenterProvider like Home page
export default function IronManAR() {
    return (
        <CommandCenterProvider>
            <IronManARContent />
        </CommandCenterProvider>
    );
}
