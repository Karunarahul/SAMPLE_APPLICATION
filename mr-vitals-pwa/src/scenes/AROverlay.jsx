import React, { useRef, useState, useEffect } from 'react';
import { useHitTest, Interactive } from '@react-three/xr';
import { Text } from '@react-three/drei';
import DigitalTwin from '../components/DigitalTwin';
import FloatingPanel from '../components/FloatingPanel';
import { useCommandCenter } from '../context/CommandCenterContext';

export default function AROverlay() {
    const { vitals } = useCommandCenter();
    const reticleRef = useRef();
    
    const [placedPosition, setPlacedPosition] = useState(null);
    const [placedRotation, setPlacedRotation] = useState(null);
    
    // Interactions
    const [modelScale, setModelScale] = useState(0.03);
    const [modelRotY, setModelRotY] = useState(0);
    const [showVitals, setShowVitals] = useState(true);

    // Provide hit testing for initial placement
    useHitTest((hitMatrix) => {
        if (!placedPosition && reticleRef.current) {
            reticleRef.current.visible = true;
            hitMatrix.decompose(
                reticleRef.current.position,
                reticleRef.current.quaternion,
                reticleRef.current.scale
            );
        } else if (reticleRef.current) {
            reticleRef.current.visible = false;
        }
    });

    const placeModel = () => {
        if (!placedPosition && reticleRef.current && reticleRef.current.visible) {
            setPlacedPosition(reticleRef.current.position.clone());
            setPlacedRotation(reticleRef.current.quaternion.clone());
            setModelScale(0.03); // Reset scale on place
            setModelRotY(0); // Reset rot on place
        }
    };

    // Global touch events for Pinch & Drag when model is placed
    useEffect(() => {
        if (!placedPosition) return;

        let initialPinchDistance = null;
        let initialScale = modelScale;
        let lastTouchX = null;

        const handleTouchStart = (e) => {
            if (e.touches.length === 2) {
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                initialPinchDistance = Math.hypot(dx, dy);
                initialScale = modelScale;
            } else if (e.touches.length === 1) {
                lastTouchX = e.touches[0].clientX;
            }
        };

        const handleTouchMove = (e) => {
            if (e.touches.length === 2 && initialPinchDistance) {
                // Pinch to scale
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                const distance = Math.hypot(dx, dy);
                const scaleFactor = distance / initialPinchDistance;
                
                let newScale = initialScale * scaleFactor;
                newScale = Math.max(0.01, Math.min(newScale, 0.15)); // constrain scale
                setModelScale(newScale);
            } else if (e.touches.length === 1 && lastTouchX !== null) {
                // Drag to rotate horizontally
                const deltaX = e.touches[0].clientX - lastTouchX;
                setModelRotY(prev => prev + deltaX * 0.01);
                lastTouchX = e.touches[0].clientX;
            }
        };

        const handleTouchEnd = () => {
            initialPinchDistance = null;
            lastTouchX = null;
        };

        window.addEventListener('touchstart', handleTouchStart);
        window.addEventListener('touchmove', handleTouchMove);
        window.addEventListener('touchend', handleTouchEnd);
        
        return () => {
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [placedPosition, modelScale]);

    return (
        <group>
            {/* Ambient light for AR to match real world somewhat */}
            <ambientLight intensity={1.5} />
            <directionalLight position={[0, 10, 5]} intensity={1} />

            {/* The Reticle */}
            <Interactive onSelect={placeModel}>
                <mesh ref={reticleRef} rotation-x={-Math.PI / 2}>
                    <ringGeometry args={[0.1, 0.15, 32]} />
                    <meshBasicMaterial color="#38bdf8" />
                </mesh>
            </Interactive>

            {/* Render the placed model */}
            {placedPosition && (
                <group position={placedPosition} quaternion={placedRotation}>
                    {/* Rotate the twin based on drag gesture */}
                    <group rotation={[0, modelRotY, 0]}>
                        <DigitalTwin scale={modelScale} />
                        
                        {/* The vitals panel, placed beside the twin */}
                        {showVitals && (
                            <FloatingPanel 
                                data={vitals} 
                                position={[-modelScale * 15, modelScale * 30, 0]} 
                                scale={modelScale * 0.1} 
                            />
                        )}
                    </group>
                    
                    {/* Toggle Vitals Button */}
                    <Interactive onSelect={() => setShowVitals(!showVitals)}>
                        <mesh position={[-0.2, 0.25, 0]}>
                            <planeGeometry args={[0.25, 0.08]} />
                            <meshBasicMaterial color="#38bdf8" transparent opacity={0.8} />
                            <Text fontSize={0.03} position={[0, 0, 0.01]} color="white" anchorX="center" anchorY="middle">
                                {showVitals ? "Hide Vitals" : "Show Vitals"}
                            </Text>
                        </mesh>
                    </Interactive>

                    {/* Reposition Button */}
                    <Interactive onSelect={() => setPlacedPosition(null)}>
                        <mesh position={[0.2, 0.25, 0]}>
                            <planeGeometry args={[0.25, 0.08]} />
                            <meshBasicMaterial color="#ef4444" transparent opacity={0.8} />
                            <Text fontSize={0.03} position={[0, 0, 0.01]} color="white" anchorX="center" anchorY="middle">
                                Reposition
                            </Text>
                        </mesh>
                    </Interactive>
                </group>
            )}
        </group>
    );
}

