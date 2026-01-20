import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { VoiceInput } from '../../utils/voice/speechToText';
import { speakResponse } from '../../utils/voice/textToSpeech';
import { processCommand } from '../../utils/voice/commandBrain';

export default function JarvisOverlay() {
    const [isListening, setIsListening] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [botResponse, setBotResponse] = useState('');
    const [showOverlay, setShowOverlay] = useState(false);

    // Refs to hold instances
    const voiceInputRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Initialize VoiceInput once
        voiceInputRef.current = new VoiceInput();
        return () => {
            if (voiceInputRef.current) voiceInputRef.current.stop();
        };
    }, []);

    const toggleListening = () => {
        if (isListening || isThinking) {
            stopListening();
        } else {
            startListening();
        }
    };

    const startListening = () => {
        setIsListening(true);
        setShowOverlay(true);
        setTranscript('Listening...');
        setBotResponse('');

        voiceInputRef.current.start(
            (text, isFinal) => {
                setTranscript(text);
                if (isFinal) {
                    handleCommand(text);
                }
            },
            () => {
                // onEnd
            },
            (error) => {
                setTranscript("Error: " + error);
                setIsListening(false);
            }
        );
    };

    const stopListening = () => {
        setIsListening(false);
        if (voiceInputRef.current) voiceInputRef.current.stop();
    };

    const handleCommand = async (text) => {
        stopListening(); // Stop mic
        setIsThinking(true);
        setTranscript("Thinking...");

        // Gather Context
        const context = {
            route: location.pathname,
            vitals: location.state?.vitals || "Not currently available in this context"
        };

        const result = await processCommand(text, context);

        setIsThinking(false);
        setTranscript(text); // Show original question

        // 1. Speak Response
        if (result.response) {
            setBotResponse(result.response);
            speakResponse(result.response);
        }

        // 2. Execute Action or Navigation
        if (result.type === 'NAVIGATE' && result.target) {
            setTimeout(() => {
                navigate(result.target);
            }, 1000);
        } else if (result.type === 'ACTION') {
            if (result.action === 'TRIGGER_ANALYSIS') {
                window.dispatchEvent(new Event('JARVIS_TRIGGER_ANALYSIS'));
            }
        }
    };

    return (
        <>
            {/* Expanded Overlay */}
            {showOverlay && (
                <div style={{
                    position: 'fixed',
                    bottom: '100px',
                    right: '20px',
                    width: '300px',
                    background: 'rgba(15, 23, 42, 0.9)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '16px',
                    padding: '20px',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    color: 'white',
                    fontFamily: "'Inter', sans-serif",
                    zIndex: 9999,
                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                    transition: 'all 0.3s ease'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <h3 style={{ margin: 0, color: '#38BDF8', fontSize: '1rem' }}>
                            {isThinking ? 'JARVIS (Thinking...)' : 'JARVIS'}
                        </h3>
                        <button
                            onClick={() => setShowOverlay(false)}
                            style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '1.2rem' }}
                        >
                            &times;
                        </button>
                    </div>

                    <div style={{ minHeight: '40px', fontSize: '0.9rem', color: isListening ? '#38BDF8' : '#E2E8F0', fontStyle: isThinking ? 'italic' : 'normal' }}>
                        {transcript}
                    </div>

                    {botResponse && (
                        <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.1)', color: '#A5B4FC', fontSize: '0.9rem' }}>
                            {botResponse}
                        </div>
                    )}
                </div>
            )}

            {/* FAB */}
            <button
                onClick={toggleListening}
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: isListening
                        ? 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)'
                        : isThinking
                            ? 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)' // Purple for thinking
                            : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    cursor: 'pointer',
                    zIndex: 10000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.2s',
                    animation: isListening || isThinking ? 'pulse 1.5s infinite' : 'none'
                }}
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                </svg>
            </button>
        </>
    );
}
