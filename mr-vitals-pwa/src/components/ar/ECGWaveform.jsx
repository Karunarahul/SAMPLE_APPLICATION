import React, { useRef, useEffect } from 'react';

/**
 * ECGWaveform — Canvas-based real-time ECG trace in neon style.
 * Renders as an HTML overlay inside Three.js Html component.
 */
export default function ECGWaveform({ hr = 72, width = 300, height = 60 }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);

        let x = 0;
        let lastY = height / 2;
        let frameCount = 0;
        let animId;

        const render = () => {
            const currentHR = hr || 60;
            const framesPerBeat = Math.floor(3600 / currentHR);
            const t = (frameCount % framesPerBeat) / framesPerBeat;

            let yOffset = 0;
            const noise = (Math.random() - 0.5) * 1.5;

            // PQRST waveform pattern
            if (t > 0.08 && t < 0.13) yOffset = -4;       // P wave
            else if (t > 0.16 && t < 0.19) yOffset = 3;    // Q
            else if (t > 0.19 && t < 0.25) yOffset = -28;  // R (sharp peak)
            else if (t > 0.25 && t < 0.30) yOffset = 6;    // S
            else if (t > 0.35 && t < 0.50) yOffset = -5;   // T wave

            const baseY = height / 2;
            const currentY = baseY + yOffset + noise;

            // Clear ahead
            ctx.clearRect(x, 0, 20, height);

            // Draw line segment
            ctx.strokeStyle = '#00FF88';
            ctx.lineWidth = 2;
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#00FF88';
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';

            ctx.beginPath();
            if (x > 0) {
                ctx.moveTo(x - 2, lastY);
                ctx.lineTo(x, currentY);
            }
            ctx.stroke();

            lastY = currentY;
            x += 2;
            if (x >= width) {
                x = 0;
                lastY = baseY;
            }

            frameCount++;
            animId = requestAnimationFrame(render);
        };

        animId = requestAnimationFrame(render);
        return () => cancelAnimationFrame(animId);
    }, [hr, width, height]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                width: `${width}px`,
                height: `${height}px`,
                borderRadius: '8px',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(0, 255, 136, 0.2)',
            }}
        />
    );
}
