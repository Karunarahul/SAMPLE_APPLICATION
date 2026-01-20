import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import AnalysisPanel from '../components/AnalysisPanel'
import { analyzeVitals } from '../utils/ai/HealthEngine'

export default function Analysis() {
    const navigate = useNavigate()
    const location = useLocation()

    // Initialize vitals from state or defaults (aligning to Fahrenheit)
    const [localVitals, setLocalVitals] = useState(
        location.state?.vitals || { hr: 72, spo2: 98, temp_f: 98.6 }
    )

    const [analysisData, setAnalysisData] = useState(null)
    const [isAnalyzing, setIsAnalyzing] = useState(false)

    // Initial analysis on mount
    useEffect(() => {
        runAnalysis()
    }, [])

    const runAnalysis = async () => {
        setIsAnalyzing(true)
        // Simulate network/processing delay for "AI" feel
        setTimeout(() => {
            try {
                const result = analyzeVitals(localVitals)
                setAnalysisData(result)
            } catch (error) {
                console.error("Analysis failed", error)
            } finally {
                setIsAnalyzing(false)
            }
        }, 1500)
    }

    const handleVitalChange = (key, value) => {
        setLocalVitals(prev => ({ ...prev, [key]: Number(value) }))
    }

    // Styles for Soft UI / Neuromorphic look
    const cardStyle = {
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        borderRadius: '24px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        padding: '40px',
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center',
        fontFamily: "'Inter', sans-serif', system-ui"
    }

    const inputContainerStyle = {
        marginBottom: '20px',
        textAlign: 'left'
    }

    const inputStyle = {
        width: '100%',
        padding: '16px 24px',
        borderRadius: '50px',
        border: '1px solid rgba(0,0,0,0.05)',
        background: '#F8FAFC',
        color: '#334155',
        fontSize: '1rem',
        outline: 'none',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
        transition: 'all 0.2s ease',
        boxSizing: 'border-box'
    }

    const buttonStyle = {
        width: '100%',
        padding: '16px',
        marginTop: '12px',
        borderRadius: '50px',
        border: 'none',
        background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',
        color: 'white',
        fontSize: '1rem',
        fontWeight: 'bold',
        cursor: isAnalyzing ? 'not-allowed' : 'pointer',
        boxShadow: '0 10px 20px -5px rgba(37, 99, 235, 0.4)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        opacity: isAnalyzing ? 0.8 : 1
    }

    return (
        <div style={{
            width: '100vw',
            minHeight: '100vh',
            background: '#F1F5F9',
            backgroundImage: 'radial-gradient(circle at 50% 50%, #E0F2FE 0%, #F1F5F9 100%)',
            position: 'relative',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Nav Header */}
            <div style={{
                padding: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start'
            }}>
                <button
                    onClick={() => navigate('/home')}
                    style={{
                        background: 'rgba(255,255,255,0.5)',
                        border: '1px solid rgba(0,0,0,0.05)',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        color: '#64748B',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        backdropFilter: 'blur(5px)'
                    }}
                >
                    <span style={{ fontSize: '1.2rem' }}>←</span> Back to Dashboard
                </button>
            </div>

            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                gap: '40px'
            }}>
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: '40px',
                    width: '100%',
                    maxWidth: '1200px',
                    alignItems: 'flex-start'
                }}>

                    {/* Manual Entry Request Card */}
                    <div style={cardStyle}>
                        <h1 style={{
                            background: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontSize: '2.5rem',
                            fontWeight: '800',
                            marginTop: 0,
                            marginBottom: '40px'
                        }}>
                            AI Analysis
                        </h1>

                        <div style={inputContainerStyle}>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#64748B', fontSize: '0.9rem', paddingLeft: '12px', fontWeight: '500' }}>
                                Heart Rate (BPM)
                            </label>
                            <input
                                type="number"
                                placeholder="72"
                                value={localVitals.hr}
                                onChange={(e) => handleVitalChange('hr', e.target.value)}
                                style={inputStyle}
                            />
                        </div>

                        <div style={inputContainerStyle}>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#64748B', fontSize: '0.9rem', paddingLeft: '12px', fontWeight: '500' }}>
                                SpO2 (%)
                            </label>
                            <input
                                type="number"
                                placeholder="98"
                                value={localVitals.spo2}
                                onChange={(e) => handleVitalChange('spo2', e.target.value)}
                                style={inputStyle}
                            />
                        </div>

                        <div style={inputContainerStyle}>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#64748B', fontSize: '0.9rem', paddingLeft: '12px', fontWeight: '500' }}>
                                Temperature (°F)
                            </label>
                            <input
                                type="number"
                                placeholder="98.6"
                                value={localVitals.temp_f}
                                onChange={(e) => handleVitalChange('temp_f', e.target.value)}
                                step="0.1"
                                style={inputStyle}
                            />
                        </div>

                        <button
                            onClick={runAnalysis}
                            disabled={isAnalyzing}
                            style={buttonStyle}
                            onMouseOver={(e) => {
                                if (!isAnalyzing) {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 15px 25px -5px rgba(37, 99, 235, 0.5)';
                                }
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 10px 20px -5px rgba(37, 99, 235, 0.4)';
                            }}
                        >
                            {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
                        </button>
                    </div>

                    {/* Analysis Results */}
                    {analysisData && (
                        <div style={{ flex: '1 1 400px', minWidth: '320px', maxWidth: '500px' }}>
                            <AnalysisPanel
                                onClose={() => { }}
                                data={analysisData}
                                isLoading={isAnalyzing}
                                embedded={true}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
