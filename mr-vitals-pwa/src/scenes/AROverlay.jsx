import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useXR } from '@react-three/xr';
import { Text } from '@react-three/drei';
import DigitalTwin from '../components/DigitalTwin';
import { useCommandCenter } from '../context/CommandCenterContext';

export default function AROverlay() {
    const twinRef = useRef();
    const { exitSession } = useCommandCenter();
    const { session } = useXR();
    const [hovered, setHovered] = useState(false);

    // In AR, we might want the model to stay relative to the user initially, or anchored.
    // For now, place it 1 meter in front (z = -1) and slightly down.

    const handleExit = async () => {
        if (session) await session.end();
        exitSession();
    };

    return (
        <group>
            {/* Ambient light for AR to match real world somewhat */}
            <ambientLight intensity={1.5} />
            <directionalLight position={[0, 10, 5]} intensity={1} />

            {/* Digital Twin anchored in front of user */}
            <group ref={twinRef} position={[0, -0.4, -1]}>
                <DigitalTwin scale={0.03} />
            </group>

            {/* Exit AR Button - Floating near the model */}
            <mesh
                position={[0, 0.2, -0.8]}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
                onClick={handleExit}
            >
                <planeGeometry args={[0.4, 0.15]} />
                <meshBasicMaterial
                    color={hovered ? '#EF4444' : 'rgba(0,0,0,0.5)'}
                    transparent
                    opacity={0.8}
                    depthTest={false} // Always verify visibility on top
                />
                <Text
                    position={[0, 0, 0.01]}
                    fontSize={0.06}
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                >
                    EXIT AR
                </Text>
            </mesh>
        </group>
    );
}

