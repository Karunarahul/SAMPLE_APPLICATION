import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { processAtlasCommand } from '../../utils/atlas/AtlasBrain';
import { speakResponse } from '../../utils/voice/textToSpeech';

// Reuse existing VoiceInput but manage state carefully for "Wake Word" loop
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export default function AtlasOverlay() {
    const [status, setStatus] = useState('PASSIVE'); // PASSIVE | LISTENING | SPEAKING
    const [transcript, setTranscript] = useState('');
    const [feedback, setFeedback] = useState('Say "Hey Atlas"...');

    const recognitionRef = useRef(null);
    const navigate = useNavigate();
    const isRunning = useRef(true); // Mount check

    useEffect(() => {
        // Init Speech Recognition
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = true; // Keep listening
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onresult = (event) => {
                const results = Array.from(event.results);
                const latestResult = results[results.length - 1];
                const text = latestResult[0].transcript.trim().toLowerCase();
                const isFinal = latestResult.isFinal;

                setTranscript(text);

                if (status === 'PASSIVE') {
                    // Check for Wake Word
                    if (text.includes('hey atlas') || text.includes('atlas')) {
                        activateAtlas();
                    }
                } else if (status === 'LISTENING') {
                    // We are active, listen for command
                    if (isFinal) {
                        handleCommand(text);
                    }
                }
            };

            recognition.onend = () => {
                // Auto-restart if we are meant to be running
                if (isRunning.current) {
                    try {
                        recognition.start();
                    } catch (e) {
                        // ignore already started errors
                    }
                }
            };

            recognition.onerror = (e) => {
                console.warn("Atlas Voice Error:", e.error);
                // Restart on error is handled by onend usually, but safe to force reset sometimes
            };

            recognitionRef.current = recognition;
            try {
                recognition.start();
            } catch (e) { console.warn("Auto-start failed", e); }
        }

        return () => {
            isRunning.current = false;
            if (recognitionRef.current) recognitionRef.current.stop();
        };
    }, [status]); // Re-bind if status changes deeply? Actually ref handles logic usually.

    // Better to keep logic inside onresult referencing a Ref or updated function
    // For simplicity sake, let's keep it simple.

    const activateAtlas = () => {
        setStatus('LISTENING');
        setFeedback("Listening...");
        speakResponse("Yes?");
        // Note: speech synthesis might interfere with recognition on some devices (echo). 
        // We'll assume headset or noise cancellation for now.
    };

    const handleCommand = (text) => {
        // Strip wake word if present in command phrase
        const cleanText = text.replace('hey atlas', '').replace('atlas', '').trim();

        if (!cleanText) return; // Just wake word heard

        const result = processAtlasCommand(cleanText);

        setStatus('SPEAKING'); // Pause listening logic roughly
        setFeedback(result.response);

        speakResponse(result.response);

        if (result.type === 'NAVIGATE') {
            navigate(result.target);
        } else if (result.type === 'SYSTEM' && result.action === 'STOP_LISTENING') {
            // Actually just go passive
        }

        // Return to passive after delay
        setTimeout(() => {
            setStatus('PASSIVE');
            setFeedback('Say "Hey Atlas"...');
            setTranscript('');
        }, 3000);
    };

    // --- RENDER HELPERS ---
    const getGlowColor = () => {
        if (status === 'LISTENING') return '0 0 25px #22d3ee'; // Cyan Pulse
        if (status === 'SPEAKING') return '0 0 25px #c084fc'; // Purple Pulse
        return '0 0 10px rgba(34, 211, 238, 0.3)'; // Passive dim glow
    };

    return (
        <div style={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '12px'
        }}>
            {/* Feedback Bubble */}
            {(status !== 'PASSIVE' || transcript) && (
                <div style={{
                    background: 'rgba(15, 23, 42, 0.9)',
                    backdropFilter: 'blur(8px)',
                    padding: '12px 20px',
                    borderRadius: '16px 16px 4px 16px',
                    border: '1px solid rgba(34, 211, 238, 0.2)',
                    color: '#e2e8f0',
                    maxWidth: '200px',
                    fontSize: '0.9rem',
                    textAlign: 'right',
                    marginBottom: '10px',
                    animation: 'float 0.3s ease-out'
                }}>
                    {status === 'LISTENING' && <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px' }}>LISTENING</div>}
                    {transcript || feedback}
                </div>
            )}

            {/* ORB */}
            <div
                style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0f172a 0%, #0891b2 100%)',
                    border: '2px solid rgba(34, 211, 238, 0.5)',
                    boxShadow: getGlowColor(),
                    transition: 'all 0.5s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                }}
                onClick={() => status === 'PASSIVE' ? activateAtlas() : setStatus('PASSIVE')}
            >
                {/* Minimal Icon */}
                <div style={{
                    width: '24px',
                    height: '24px',
                    background: '#22d3ee',
                    borderRadius: '2px', // Square-ish "Chip" look
                    transform: status === 'LISTENING' ? 'rotate(45deg) scale(0.8)' : 'rotate(0deg)',
                    transition: 'all 0.3s ease'
                }} />
            </div>

            <style>{`
                @keyframes float {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
