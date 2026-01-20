import React from 'react';

const WelcomePage = ({ onEnter }) => {
    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
            color: 'white',
            fontFamily: "'Inter', sans-serif",
            zIndex: 1000 // Ensure it sits on top of everything
        }}>
            <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                padding: '40px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                textAlign: 'center',
                maxWidth: '500px',
                width: '90%'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '20px',
                    marginBottom: '1rem'
                }}>
                    <img
                        src="/logo-new.png"
                        alt="Safe Vitals Logo"
                        style={{
                            width: '80px',
                            height: '80px',
                            objectFit: 'contain',
                            filter: 'drop-shadow(0 0 15px rgba(0, 198, 255, 0.4))'
                        }}
                    />
                    <h1 style={{
                        fontSize: '3rem',
                        background: 'linear-gradient(to right, #00c6ff, #0072ff)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        filter: 'drop-shadow(0 0 10px rgba(0,114,255,0.3))',
                        margin: 0
                    }}>
                        Safe Vitals
                    </h1>
                </div>

                <p style={{
                    fontSize: '1.2rem',
                    marginBottom: '2rem',
                    color: '#e0e0e0',
                    lineHeight: '1.6'
                }}>
                    Experience the future of medical monitoring in Mixed Reality.
                    Real-time data visualization with immersive 3D interactions.
                </p>

                <button
                    className="btn-donate"
                    onClick={onEnter}
                    style={{
                        // Keeping only layout related styles if necessary, but the css handles sizing well.
                        // adding margin top for spacing
                        marginTop: '20px'
                    }}
                >
                    Enter Experience
                </button>

            </div>

            <div style={{
                position: 'absolute',
                bottom: '20px',
                fontSize: '0.8rem',
                opacity: 0.5
            }}>
                Powered by WebXR
            </div>
        </div >
    );
};

export default WelcomePage;
