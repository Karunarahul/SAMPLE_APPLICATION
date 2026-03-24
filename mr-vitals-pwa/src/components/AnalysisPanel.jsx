import React from 'react';

export default function AnalysisPanel({ onClose, data, isLoading, embedded = false }) {
    if (!data && !isLoading) return null;

    return (
        <div style={{
            position: embedded ? 'relative' : 'absolute',
            top: embedded ? 'auto' : '50%',
            left: embedded ? 'auto' : '50%',
            transform: embedded ? 'none' : 'translate(-50%, -50%)',
            width: embedded ? '100%' : '90%',
            maxWidth: embedded ? '100%' : '500px',
            backgroundColor: 'rgba(16, 24, 39, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            zIndex: 2000,
            color: '#fff',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            overflow: 'hidden',
            fontFamily: "'Inter', sans-serif"
        }}>
            {/* Header */}
            <div style={{
                padding: '24px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'linear-gradient(to right, rgba(59, 130, 246, 0.1), transparent)'
            }}>
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>
                    <span style={{ color: '#60A5FA' }}>AI</span> Health Analysis
                </h2>
                {!embedded && (
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#9CA3AF',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            padding: '4px',
                            lineHeight: 1
                        }}
                    >
                        &times;
                    </button>
                )}
            </div>

            <div style={{ padding: '24px' }}>
                {isLoading ? (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '40px 0',
                        gap: '16px'
                    }}>
                        <div className="spinner" style={{
                            width: '40px',
                            height: '40px',
                            border: '3px solid rgba(255, 255, 255, 0.1)',
                            borderTopColor: '#60A5FA',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                        }} />
                        <p style={{ color: '#9CA3AF', margin: 0 }}>Processing health data...</p>
                        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {/* Risk Assessment Section */}
                        <div style={{
                            display: 'flex',
                            gap: '16px',
                            alignItems: 'center',
                            background: 'rgba(255, 255, 255, 0.05)',
                            padding: '16px',
                            borderRadius: '16px'
                        }}>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.25rem',
                                fontWeight: 'bold',
                                background: data.healthScore >= 85 ? 'rgba(16, 185, 129, 0.2)' : data.healthScore >= 60 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                color: data.healthScore >= 85 ? '#34D399' : data.healthScore >= 60 ? '#FBBF24' : '#F87171',
                                border: `2px solid ${data.healthScore >= 85 ? '#34D399' : data.healthScore >= 60 ? '#FBBF24' : '#F87171'}`
                            }}>
                                {data.healthScore}
                            </div>
                            <div>
                                <div style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>Risk Assessment</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: data.healthScore >= 85 ? '#34D399' : data.healthScore >= 60 ? '#FBBF24' : '#F87171' }}>
                                    {data.riskLevel}
                                </div>
                            </div>
                        </div>

                        {/* Executive Summary */}
                        <div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '12px',
                                color: '#60A5FA',
                                fontWeight: '600'
                            }}>
                                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Executive Summary
                            </div>
                            <div style={{
                                lineHeight: '1.6',
                                color: '#F3F4F6',
                                fontSize: '1rem',
                                background: 'rgba(56, 189, 248, 0.1)',
                                padding: '16px',
                                borderRadius: '16px',
                                border: '1px solid rgba(56, 189, 248, 0.2)'
                            }}>
                                {data.insight}
                            </div>
                        </div>

                        {/* Detailed Vital Breakdown */}
                        {data.detailedAnalysis && data.detailedAnalysis.length > 0 && (
                            <div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    marginBottom: '12px',
                                    color: '#9CA3AF',
                                    fontWeight: '600'
                                }}>
                                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                    </svg>
                                    Detailed Breakdown
                                </div>
                                <ul style={{
                                    margin: 0,
                                    paddingLeft: '24px',
                                    color: '#D1D5DB',
                                    fontSize: '0.95rem',
                                    lineHeight: '1.6',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '8px'
                                }}>
                                    {data.detailedAnalysis.map((item, idx) => (
                                        <li key={idx} style={{ listStyleType: 'disc', color: '#9CA3AF' }}>
                                            <span style={{ color: '#D1D5DB' }}>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Actionable Recommendations */}
                        {data.recommendations && data.recommendations.length > 0 && (
                            <div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    marginBottom: '12px',
                                    color: '#34D399',
                                    fontWeight: '600'
                                }}>
                                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Actionable Steps
                                </div>
                                <div style={{
                                    background: 'rgba(52, 211, 153, 0.05)',
                                    padding: '16px',
                                    borderRadius: '16px',
                                    border: '1px solid rgba(52, 211, 153, 0.1)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '12px'
                                }}>
                                    {data.recommendations.map((rec, idx) => (
                                        <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                            <div style={{
                                                width: '24px',
                                                height: '24px',
                                                borderRadius: '50%',
                                                background: 'rgba(52, 211, 153, 0.2)',
                                                color: '#34D399',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '0.8rem',
                                                fontWeight: 'bold',
                                                flexShrink: 0
                                            }}>
                                                {idx + 1}
                                            </div>
                                            <div style={{ color: '#E5E7EB', fontSize: '0.95rem', lineHeight: '1.5', paddingTop: '1px' }}>
                                                {rec}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Contributing Factors (Warnings) */}
                        {data.contributingFactors && data.contributingFactors.length > 0 && (
                            <div>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {data.contributingFactors.map((factor, i) => (
                                        <span key={i} style={{
                                            padding: '6px 12px',
                                            background: 'rgba(239, 68, 68, 0.1)',
                                            color: '#F87171',
                                            borderRadius: '100px',
                                            fontSize: '0.8rem',
                                            border: '1px solid rgba(239, 68, 68, 0.2)'
                                        }}>
                                            ⚠️ {factor}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div style={{
                            textAlign: 'center',
                            color: '#6B7280',
                            fontSize: '0.75rem',
                            marginTop: '8px'
                        }}>
                            Analysis generated at {data.timestamp} • ML Model v2.4
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
