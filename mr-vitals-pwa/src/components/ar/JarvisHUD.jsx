import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * JarvisHUD — Iron Man style circular rings, scanning arcs, and rotating elements.
 * Pure Three.js geometry, no external models needed.
 */
export default function JarvisHUD({ vitals = {}, scanActive = true }) {
    const outerRingRef = useRef();
    const innerRingRef = useRef();
    const scanLineRef = useRef();
    const dataArcRef = useRef();

    // Animate rings
    useFrame((state) => {
        const t = state.clock.getElapsedTime();

        if (outerRingRef.current) {
            outerRingRef.current.rotation.z = t * 0.15;
        }
        if (innerRingRef.current) {
            innerRingRef.current.rotation.z = -t * 0.25;
        }
        if (scanLineRef.current) {
            scanLineRef.current.rotation.z = t * 0.8;
            scanLineRef.current.material.opacity = 0.3 + Math.sin(t * 3) * 0.2;
        }
        if (dataArcRef.current) {
            dataArcRef.current.rotation.z = t * 0.1;
        }
    });

    // HR-based arc coverage (map 40-180 BPM → 0.3-0.9 of circle)
    const hrArc = useMemo(() => {
        const hr = vitals.hr || 72;
        const normalized = Math.max(0.3, Math.min(0.9, (hr - 40) / 140));
        return normalized * Math.PI * 2;
    }, [vitals.hr]);

    // SpO2-based arc
    const spo2Arc = useMemo(() => {
        const spo2 = vitals.spo2 || 98;
        const normalized = Math.max(0.5, Math.min(1, spo2 / 100));
        return normalized * Math.PI * 2;
    }, [vitals.spo2]);

    return (
        <group position={[0, 0, -5]}>

            {/* Outer rotating ring */}
            <mesh ref={outerRingRef}>
                <ringGeometry args={[3.8, 4.0, 64]} />
                <meshBasicMaterial
                    color="#00FFFF"
                    transparent
                    opacity={0.25}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Outer ring dashes */}
            {[...Array(36)].map((_, i) => {
                const angle = (i / 36) * Math.PI * 2;
                const len = i % 3 === 0 ? 0.25 : 0.12;
                return (
                    <mesh
                        key={`dash-${i}`}
                        position={[
                            Math.cos(angle) * 3.9,
                            Math.sin(angle) * 3.9,
                            0
                        ]}
                        rotation={[0, 0, angle + Math.PI / 2]}
                    >
                        <planeGeometry args={[0.02, len]} />
                        <meshBasicMaterial
                            color="#00FFFF"
                            transparent
                            opacity={i % 3 === 0 ? 0.8 : 0.3}
                        />
                    </mesh>
                );
            })}

            {/* Inner rotating ring */}
            <mesh ref={innerRingRef}>
                <ringGeometry args={[2.8, 2.95, 64]} />
                <meshBasicMaterial
                    color="#00FF88"
                    transparent
                    opacity={0.2}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* HR data arc */}
            <mesh ref={dataArcRef}>
                <ringGeometry args={[3.2, 3.4, 64, 1, 0, hrArc]} />
                <meshBasicMaterial
                    color={vitals.hr > 100 ? '#FF3B3B' : '#00FF88'}
                    transparent
                    opacity={0.6}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* SpO2 data arc */}
            <mesh rotation={[0, 0, Math.PI]}>
                <ringGeometry args={[3.0, 3.15, 64, 1, 0, spo2Arc]} />
                <meshBasicMaterial
                    color="#00FFFF"
                    transparent
                    opacity={0.4}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Scan sweep line */}
            {scanActive && (
                <mesh ref={scanLineRef}>
                    <planeGeometry args={[0.03, 4]} />
                    <meshBasicMaterial
                        color="#00FFFF"
                        transparent
                        opacity={0.5}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            )}

            {/* Center crosshair */}
            <group>
                {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle, i) => (
                    <mesh
                        key={`cross-${i}`}
                        position={[
                            Math.cos(angle) * 0.3,
                            Math.sin(angle) * 0.3,
                            0
                        ]}
                        rotation={[0, 0, angle]}
                    >
                        <planeGeometry args={[0.3, 0.015]} />
                        <meshBasicMaterial color="#00FFFF" transparent opacity={0.6} />
                    </mesh>
                ))}
                {/* Center dot */}
                <mesh>
                    <circleGeometry args={[0.05, 16]} />
                    <meshBasicMaterial color="#00FFFF" transparent opacity={0.8} />
                </mesh>
            </group>

            {/* Corner brackets */}
            {[
                { pos: [-4.5, 3.5, 0], rot: 0 },
                { pos: [4.5, 3.5, 0], rot: Math.PI / 2 },
                { pos: [4.5, -3.5, 0], rot: Math.PI },
                { pos: [-4.5, -3.5, 0], rot: -Math.PI / 2 },
            ].map(({ pos, rot }, i) => (
                <group key={`bracket-${i}`} position={pos} rotation={[0, 0, rot]}>
                    <mesh position={[0.3, 0, 0]}>
                        <planeGeometry args={[0.6, 0.02]} />
                        <meshBasicMaterial color="#00FFFF" transparent opacity={0.4} />
                    </mesh>
                    <mesh position={[0, 0.3, 0]}>
                        <planeGeometry args={[0.02, 0.6]} />
                        <meshBasicMaterial color="#00FFFF" transparent opacity={0.4} />
                    </mesh>
                </group>
            ))}
        </group>
    );
}
