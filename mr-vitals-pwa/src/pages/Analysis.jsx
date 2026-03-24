import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import AnalysisPanel from '../components/AnalysisPanel'
import { analyzeVitals } from '../utils/ai/HealthEngine'

export default function Analysis() {
    const navigate = useNavigate()
    const location = useLocation()

    // Initialize vitals from state or default to empty
    const [localVitals, setLocalVitals] = useState(
        location.state?.vitals || { hr: '', spo2: '', temp_f: '' }
    )

    const [analysisData, setAnalysisData] = useState(null)
    const [isAnalyzing, setIsAnalyzing] = useState(false)

    // Initial analysis on mount if we came from dashboard with data
    useEffect(() => {
        if (location.state?.vitals) {
            runAnalysis()
        }
    }, [])

    const runAnalysis = async () => {
        if (!localVitals.hr || !localVitals.spo2 || !localVitals.temp_f) return;

        setIsAnalyzing(true)
        // Simulate network/processing delay for "AI" feel
        setTimeout(() => {
            try {
                const result = analyzeVitals({
                    hr: Number(localVitals.hr),
                    spo2: Number(localVitals.spo2),
                    temp_f: Number(localVitals.temp_f)
                })
                setAnalysisData(result)
            } catch (error) {
                console.error("Analysis failed", error)
            } finally {
                setIsAnalyzing(false)
            }
        }, 1500)
    }

    const handleVitalChange = (key, value) => {
        setLocalVitals(prev => ({ ...prev, [key]: value }))
    }

    // Enhanced Styles for Modern UI
    const cardStyle = {
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '28px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
        padding: '48px',
        width: '100%',
        maxWidth: '420px',
        textAlign: 'center',
        fontFamily: "'Inter', sans-serif', system-ui",
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        border: '1px solid rgba(255, 255, 255, 0.4)'
    }

    const inputContainerStyle = {
        marginBottom: '28px',
        textAlign: 'left',
        position: 'relative'
    }

    const labelStyle = {
        display: 'block',
        marginBottom: '10px',
        color: '#475569',
        fontSize: '0.95rem',
        paddingLeft: '16px',
        fontWeight: '600',
        letterSpacing: '0.5px'
    }

    const inputStyle = {
        width: '100%',
        padding: '18px 24px',
        borderRadius: '16px',
        border: '2px solid transparent',
        background: '#F1F5F9',
        color: '#1E293B',
        fontSize: '1.1rem',
        fontWeight: '500',
        outline: 'none',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.04)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxSizing: 'border-box'
    }

    const runButtonStyle = {
        width: '100%',
        padding: '18px',
        marginTop: '20px',
        borderRadius: '16px',
        border: 'none',
        background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
        color: 'white',
        fontSize: '1.1rem',
        fontWeight: '700',
        cursor: isAnalyzing ? 'not-allowed' : 'pointer',
        boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.5)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: isAnalyzing ? 0.7 : 1,
        position: 'relative',
        overflow: 'hidden'
    }

    return (
        <div style={{
            width: '100vw',
            minHeight: '100vh',
            background: '#F8FAFC',
            backgroundImage: 'radial-gradient(circle at top right, #E0F2FE 0%, transparent 40%), radial-gradient(circle at bottom left, #DBEAFE 0%, #F8FAFC 60%)',
            position: 'relative',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Nav Header */}
            <div style={{
                padding: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start'
            }}>
                <button
                    onClick={() => navigate('/home')}
                    style={{
                        background: 'rgba(255,255,255,0.7)',
                        border: '1px solid rgba(0,0,0,0.05)',
                        padding: '12px 24px',
                        borderRadius: '100px',
                        color: '#475569',
                        fontSize: '1.05rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                        e.currentTarget.style.background = 'rgba(255,255,255,0.9)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
                        e.currentTarget.style.background = 'rgba(255,255,255,0.7)';
                    }}
                >
                    <span style={{ fontSize: '1.3rem', transform: 'translateY(-1px)' }}>←</span> Back to Dashboard
                </button>
            </div>

            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px',
                gap: '50px'
            }}>
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: '50px',
                    width: '100%',
                    maxWidth: '1200px',
                    alignItems: 'flex-start'
                }}>

                    {/* Manual Entry Request Card */}
                    <div
                        style={cardStyle}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-5px)';
                            e.currentTarget.style.boxShadow = '0 30px 60px -12px rgba(0, 0, 0, 0.15)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.1)';
                        }}
                    >
                        <h1 style={{
                            background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontSize: '2.8rem',
                            fontWeight: '800',
                            marginTop: 0,
                            marginBottom: '48px',
                            letterSpacing: '-1px'
                        }}>
                            AI Analysis
                        </h1>

                        <div style={inputContainerStyle}>
                            <label style={labelStyle}>
                                Heart Rate (BPM)
                            </label>
                            <input
                                type="number"
                                placeholder="e.g. 72"
                                value={localVitals.hr}
                                onChange={(e) => handleVitalChange('hr', e.target.value)}
                                style={inputStyle}
                                onFocus={(e) => { e.currentTarget.style.border = '2px solid #3B82F6'; e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)'; }}
                                onBlur={(e) => { e.currentTarget.style.border = '2px solid transparent'; e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.04)'; }}
                            />
                        </div>

                        <div style={inputContainerStyle}>
                            <label style={labelStyle}>
                                SpO2 (%)
                            </label>
                            <input
                                type="number"
                                placeholder="e.g. 98"
                                value={localVitals.spo2}
                                onChange={(e) => handleVitalChange('spo2', e.target.value)}
                                style={inputStyle}
                                onFocus={(e) => { e.currentTarget.style.border = '2px solid #3B82F6'; e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)'; }}
                                onBlur={(e) => { e.currentTarget.style.border = '2px solid transparent'; e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.04)'; }}
                            />
                        </div>

                        <div style={inputContainerStyle}>
                            <label style={labelStyle}>
                                Temperature (°F)
                            </label>
                            <input
                                type="number"
                                placeholder="e.g. 98.6"
                                value={localVitals.temp_f}
                                onChange={(e) => handleVitalChange('temp_f', e.target.value)}
                                step="0.1"
                                style={inputStyle}
                                onFocus={(e) => { e.currentTarget.style.border = '2px solid #3B82F6'; e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)'; }}
                                onBlur={(e) => { e.currentTarget.style.border = '2px solid transparent'; e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.04)'; }}
                            />
                        </div>

                        <button
                            onClick={runAnalysis}
                            disabled={isAnalyzing}
                            style={runButtonStyle}
                            onMouseOver={(e) => {
                                if (!isAnalyzing) {
                                    e.currentTarget.style.transform = 'translateY(-3px)';
                                    e.currentTarget.style.boxShadow = '0 15px 30px -5px rgba(37, 99, 235, 0.6)';
                                    e.currentTarget.style.background = 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%)';
                                }
                            }}
                            onMouseOut={(e) => {
                                if (!isAnalyzing) {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(37, 99, 235, 0.5)';
                                    e.currentTarget.style.background = 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)';
                                }
                            }}
                            onMouseDown={(e) => {
                                if (!isAnalyzing) {
                                    e.currentTarget.style.transform = 'translateY(1px)';
                                    e.currentTarget.style.boxShadow = '0 5px 15px -5px rgba(37, 99, 235, 0.4)';
                                }
                            }}
                        >
                            {isAnalyzing ? (
                                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ animation: 'spin 1s linear infinite' }}>
                                        <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="30 30" strokeLinecap="round" />
                                    </svg>
                                    Processing AI Data...
                                </span>
                            ) : 'Run Health Analysis'}
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
