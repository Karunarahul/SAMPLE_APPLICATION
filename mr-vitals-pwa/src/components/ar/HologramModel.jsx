import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * HologramModel — Glowing wireframe human silhouette with scanning animation.
 * Built from basic Three.js primitives (no external model needed).
 */
export default function HologramModel({ vitals = {}, position = [0, -1.5, -5], scale = 1 }) {
    const groupRef = useRef();
    const scanPlaneRef = useRef();
    const heartRef = useRef();

    useFrame((state) => {
        const t = state.clock.getElapsedTime();

        // Gentle float
        if (groupRef.current) {
            groupRef.current.position.y = position[1] + Math.sin(t * 0.5) * 0.1;
        }

        // Scanning plane sweeps up and down
        if (scanPlaneRef.current) {
            const sweep = Math.sin(t * 0.8);
            scanPlaneRef.current.position.y = sweep * 2;
            scanPlaneRef.current.material.opacity = 0.15 + Math.abs(sweep) * 0.1;
        }

        // Heart pulse synced to HR
        if (heartRef.current) {
            const hr = vitals.hr || 72;
            const bps = hr / 60;
            const pulse = Math.sin(t * bps * Math.PI * 2);
            const s = 1 + pulse * 0.15;
            heartRef.current.scale.set(s, s, s);
            heartRef.current.material.emissiveIntensity = 0.5 + (pulse + 1) * 0.5;
        }
    });

    const hologramMaterial = useMemo(() => new THREE.MeshBasicMaterial({
        color: '#00FFFF',
        wireframe: true,
        transparent: true,
        opacity: 0.3,
    }), []);

    const glowMaterial = useMemo(() => new THREE.MeshBasicMaterial({
        color: '#00FFFF',
        transparent: true,
        opacity: 0.08,
    }), []);

    return (
        <group ref={groupRef} position={position} scale={scale}>

            {/* Head */}
            <mesh position={[0, 3.2, 0]} material={hologramMaterial}>
                <sphereGeometry args={[0.4, 16, 12]} />
            </mesh>
            <mesh position={[0, 3.2, 0]} material={glowMaterial}>
                <sphereGeometry args={[0.45, 16, 12]} />
            </mesh>

            {/* Neck */}
            <mesh position={[0, 2.7, 0]} material={hologramMaterial}>
                <cylinderGeometry args={[0.12, 0.15, 0.3, 8]} />
            </mesh>

            {/* Torso */}
            <mesh position={[0, 1.8, 0]} material={hologramMaterial}>
                <boxGeometry args={[1.0, 1.5, 0.5]} />
            </mesh>
            <mesh position={[0, 1.8, 0]} material={glowMaterial}>
                <boxGeometry args={[1.05, 1.55, 0.55]} />
            </mesh>

            {/* Heart (pulsing) */}
            <mesh ref={heartRef} position={[0.15, 2.2, 0.3]}>
                <sphereGeometry args={[0.12, 12, 12]} />
                <meshStandardMaterial
                    color="#FF3B3B"
                    emissive="#FF3B3B"
                    emissiveIntensity={1}
                    transparent
                    opacity={0.9}
                />
            </mesh>

            {/* Left Arm */}
            <mesh position={[-0.75, 2.0, 0]} rotation={[0, 0, 0.3]} material={hologramMaterial}>
                <cylinderGeometry args={[0.08, 0.1, 1.2, 6]} />
            </mesh>
            <mesh position={[-0.95, 1.3, 0]} rotation={[0, 0, 0.1]} material={hologramMaterial}>
                <cylinderGeometry args={[0.06, 0.08, 1.0, 6]} />
            </mesh>

            {/* Right Arm */}
            <mesh position={[0.75, 2.0, 0]} rotation={[0, 0, -0.3]} material={hologramMaterial}>
                <cylinderGeometry args={[0.08, 0.1, 1.2, 6]} />
            </mesh>
            <mesh position={[0.95, 1.3, 0]} rotation={[0, 0, -0.1]} material={hologramMaterial}>
                <cylinderGeometry args={[0.06, 0.08, 1.0, 6]} />
            </mesh>

            {/* Pelvis */}
            <mesh position={[0, 0.9, 0]} material={hologramMaterial}>
                <boxGeometry args={[0.8, 0.4, 0.4]} />
            </mesh>

            {/* Left Leg */}
            <mesh position={[-0.25, 0.2, 0]} material={hologramMaterial}>
                <cylinderGeometry args={[0.1, 0.12, 1.2, 6]} />
            </mesh>
            <mesh position={[-0.25, -0.8, 0]} material={hologramMaterial}>
                <cylinderGeometry args={[0.08, 0.1, 1.0, 6]} />
            </mesh>

            {/* Right Leg */}
            <mesh position={[0.25, 0.2, 0]} material={hologramMaterial}>
                <cylinderGeometry args={[0.1, 0.12, 1.2, 6]} />
            </mesh>
            <mesh position={[0.25, -0.8, 0]} material={hologramMaterial}>
                <cylinderGeometry args={[0.08, 0.1, 1.0, 6]} />
            </mesh>

            {/* Scanning plane */}
            <mesh ref={scanPlaneRef} position={[0, 0, 0]}>
                <planeGeometry args={[2.5, 0.05]} />
                <meshBasicMaterial
                    color="#00FFFF"
                    transparent
                    opacity={0.2}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Vertical scan lines */}
            {[-0.6, -0.3, 0, 0.3, 0.6].map((x, i) => (
                <mesh key={`vline-${i}`} position={[x, 1.5, 0.3]}>
                    <planeGeometry args={[0.005, 4.5]} />
                    <meshBasicMaterial color="#00FFFF" transparent opacity={0.06} side={THREE.DoubleSide} />
                </mesh>
            ))}
        </group>
    );
}
