import React, { useState } from 'react';
import { Environment, Grid, Stars, Text, Html } from '@react-three/drei';
import { useXR } from '@react-three/xr';
import DigitalTwin from '../components/DigitalTwin';
import { useCommandCenter } from '../context/CommandCenterContext';

export default function VRCommandCenter() {
    const { exitSession } = useCommandCenter();
    const { session } = useXR();
    const [hovered, setHovered] = useState(false);

    const handleExit = async () => {
        if (session) await session.end();
        exitSession();
    };

    return (
        <group>
            {/* Medical Command Room Environment - Dark & Sci-fi */}
            <color attach="background" args={['#050510']} />

            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

            <ambientLight intensity={0.2} />
            <pointLight position={[0, 10, 0]} intensity={1} color="#00ffff" distance={20} />
            <spotLight position={[5, 5, 5]} angle={0.3} penumbra={1} intensity={2} color="#60A5FA" />

            {/* Sci-fi Floor Grid */}
            <Grid
                args={[40, 40]}
                cellColor="#2563EB"
                sectionColor="#60A5FA"
                fadeDistance={25}
                sectionThickness={1.5}
                cellThickness={0.8}
                infiniteGrid={true}
            />

            {/* Central Subject */}
            <DigitalTwin position={[0, 0, -2]} scale={0.06} />

            {/* Holographic Ring Base */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, -2]}>
                <ringGeometry args={[1, 1.2, 64]} />
                <meshBasicMaterial color="#00ffff" transparent opacity={0.3} side={2} />
            </mesh>

            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -2]}>
                <ringGeometry args={[2, 2.05, 64]} />
                <meshBasicMaterial color="#2563EB" transparent opacity={0.2} side={2} />
            </mesh>

            {/* Exit VR Button - Floating Panel style */}
            <mesh
                position={[0, 1.5, -4]}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
                onClick={handleExit}
            >
                <planeGeometry args={[1.5, 0.5]} />
                <meshStandardMaterial
                    color={hovered ? '#EF4444' : '#1F2937'}
                    border="#EF4444"
                    transparent
                    opacity={0.9}
                />
                <Text
                    position={[0, 0, 0.01]}
                    fontSize={0.2}
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                >
                    EXIT VR
                </Text>
            </mesh>
        </group>
    );
}
