import React, { useRef } from 'react';
import { OrbitControls, Environment, Grid } from '@react-three/drei';
import FloatingPanel from '../components/FloatingPanel';
import DigitalTwin from '../components/DigitalTwin';
import { useCommandCenter } from '../context/CommandCenterContext';

export default function DashboardScene() {
    const { vitals } = useCommandCenter();
    const groupRef = useRef();

    return (
        <>
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 10, 7.5]} intensity={1} shadow-mapSize={[2048, 2048]} />

            <group ref={groupRef}>
                <FloatingPanel data={vitals} />
                <DigitalTwin position={[4, 0, 1.8]} scale={0.05} />
            </group>

            <Grid args={[20, 20]} cellColor="white" sectionColor="white" fadeDistance={20} fadeStrength={1} />
            <Environment preset="city" background={false} />

            <OrbitControls makeDefault target={[-2, 3, 0]} />
        </>
    );
}
