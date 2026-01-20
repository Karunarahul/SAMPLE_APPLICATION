import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useFBX, useAnimations, Html, Text } from '@react-three/drei';
import { useCommandCenter } from '../context/CommandCenterContext';
import * as THREE from 'three';

const VitalLabel = ({ position, label, value, color = '#60A5FA', unit = '' }) => (
    <Html position={position} center transform distanceFactor={5}>
        <div style={{
            background: 'rgba(16, 24, 39, 0.8)',
            border: `1px solid ${color}`,
            borderRadius: '12px',
            padding: '8px 12px',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minWidth: '100px',
            boxShadow: `0 0 15px ${color}40`,
            pointerEvents: 'none'
        }}>
            <span style={{ fontSize: '0.75rem', color: '#9CA3AF', textTransform: 'uppercase' }}>{label}</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: color }}>{value}</span>
                <span style={{ fontSize: '0.9rem', color: '#D1D5DB' }}>{unit}</span>
            </div>
        </div>
    </Html>
);

export default function DigitalTwin({ position = [0, 0, 0], scale = 0.05 }) {
    const { vitals } = useCommandCenter();
    const group = useRef();
    const heartRef = useRef();

    // Load Model & Animations
    const fbx = useFBX('/Breathing Idle-MH.fbx');
    const { actions } = useAnimations(fbx.animations, group);

    // Heartbeat Animation Logic
    useFrame((state) => {
        if (heartRef.current) {
            // Calculate pulse based on HR (BPM)
            // 60 BPM = 1 beat per second
            const time = state.clock.getElapsedTime();
            const bps = vitals.hr / 60;
            const pulse = Math.sin(time * bps * Math.PI * 2);

            // Subtle scale effect
            const scaleVal = 1 + (pulse * 0.1);
            heartRef.current.scale.set(scaleVal, scaleVal, scaleVal);

            // Emissive pulse
            if (heartRef.current.material) {
                const intensity = (pulse + 1) * 0.5; // 0 to 1
                heartRef.current.material.emissiveIntensity = intensity * 2;
            }
        }
    });

    // Breathing Animation Speed Control
    useEffect(() => {
        if (actions && Object.keys(actions).length > 0) {
            const action = actions[Object.keys(actions)[0]];
            action.reset().fadeIn(0.5).play();

            // Map SpO2 to breathing speed (Lower SpO2 -> Faster breathing)
            // Normal: 98% -> 1x
            // Low: 90% -> 2x
            const speed = 1 + ((100 - vitals.spo2) * 0.1);
            action.timeScale = Math.max(0.5, Math.min(speed, 3)); // Clamp speed
        }
    }, [actions, vitals.spo2]);

    return (
        <group ref={group} position={position} scale={scale} dispose={null}>
            <primitive object={fbx} />

            {/* Holographic Heart Representation */}
            <mesh ref={heartRef} position={[0, 145, 10]}>
                <sphereGeometry args={[4, 16, 16]} />
                <meshStandardMaterial
                    color="#EF4444"
                    emissive="#EF4444"
                    emissiveIntensity={0.5}
                    transparent
                    opacity={0.8}
                    roughness={0.2}
                    metalness={0.8}
                />
            </mesh>

            {/* Vital Labels anchored to body parts */}
            <VitalLabel position={[0, 185, 0]} label="Ref Temp" value={vitals.temp_f} unit="°F" color={vitals.temp_f > 99 ? '#F59E0B' : '#60A5FA'} />
            <VitalLabel position={[30, 145, 10]} label="Heart Rate" value={vitals.hr} unit="BPM" color={vitals.hr > 100 ? '#EF4444' : '#10B981'} />
            <VitalLabel position={[-30, 145, 10]} label="SpO2" value={vitals.spo2} unit="%" color={vitals.spo2 < 95 ? '#F59E0B' : '#10B981'} />

            {/* Neural Activity Indicator (Head) */}
            <mesh position={[0, 175, 5]}>
                <sphereGeometry args={[12, 32, 32]} />
                <meshBasicMaterial color="#60A5FA" wireframe transparent opacity={0.15} />
            </mesh>
        </group>
    );
}
