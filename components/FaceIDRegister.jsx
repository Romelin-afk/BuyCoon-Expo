'use client';

import { useState, useRef, useCallback } from 'react';

// Simulated Face ID registration step
// Colors match BuyCoon! design tokens: #716BC9, #E01A4F, #8686B8, #8B416F, #FDE4D8
export default function FaceIDRegister({ onComplete, onSkip }) {
  const [status, setStatus] = useState('idle'); // idle | requesting | scanning | success | error
  const [errorMsg, setErrorMsg] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const startScan = useCallback(async () => {
    setStatus('requesting');
    setErrorMsg('');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setStatus('scanning');

      // Simulated scan duration
      setTimeout(() => {
        stopStream();
        setStatus('success');
        setTimeout(() => {
          onComplete?.({ faceIdEnrolled: true, timestamp: Date.now() });
        }, 900);
      }, 2600);
    } catch (err) {
      setStatus('error');
      setErrorMsg('Camera access denied. You can skip this step and enable Face ID later.');
    }
  }, [onComplete]);

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  const handleSkip = () => {
    stopStream();
    onSkip?.();
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h2 style={styles.title}>Set up Face ID</h2>
        <p style={styles.subtitle}>
          Speed up sign-in and confirm purchases securely with Face ID.
        </p>

        <div style={styles.scanFrame}>
          {status === 'scanning' || status === 'requesting' ? (
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              style={styles.video}
            />
          ) : (
            <div style={styles.placeholder}>
              {status === 'success' ? (
                <CheckIcon />
              ) : (
                <FaceOutlineIcon />
              )}
            </div>
          )}

          {status === 'scanning' && <div style={styles.scanLine} />}

          {status === 'scanning' && (
            <div style={styles.ring} className="pulse-ring" />
          )}
        </div>

        <p style={styles.statusText}>
          {status === 'idle' && 'Center your face in the frame to begin.'}
          {status === 'requesting' && 'Requesting camera access…'}
          {status === 'scanning' && 'Scanning… hold still.'}
          {status === 'success' && 'Face ID enrolled successfully!'}
          {status === 'error' && errorMsg}
        </p>

        <div style={styles.actions}>
          {status === 'idle' || status === 'error' ? (
            <button style={styles.primaryBtn} onClick={startScan}>
              {status === 'error' ? 'Try again' : 'Start Face ID setup'}
            </button>
          ) : null}

          {status !== 'success' && (
            <button style={styles.skipBtn} onClick={handleSkip}>
              Skip for now
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes scanMove {
          0% { top: 8%; }
          50% { top: 88%; }
          100% { top: 8%; }
        }
        @keyframes ringPulse {
          0% { box-shadow: 0 0 0 0 rgba(113,107,201,0.45); }
          100% { box-shadow: 0 0 0 18px rgba(113,107,201,0); }
        }
      `}</style>
    </div>
  );
}

function FaceOutlineIcon() {
  return (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 8V6a2 2 0 0 1 2-2h2M4 16v2a2 2 0 0 0 2 2h2M20 8V6a2 2 0 0 0-2-2h-2M20 16v2a2 2 0 0 1-2 2h-2M9 10v1M15 10v1M9 15c.83.67 1.87 1 3 1s2.17-.33 3-1"
        stroke="#8686B8"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#716BC9" />
      <path
        d="M7 12.5l3 3 7-7"
        stroke="#FDE4D8"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    padding: 'clamp(16px, 4vw, 32px) clamp(8px, 3vw, 16px)',
    boxSizing: 'border-box',
  },
  card: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    padding: 'clamp(20px, 5vw, 32px) clamp(16px, 4vw, 24px)',
    background: 'rgba(255,255,255,0.06)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(134,134,184,0.25)',
    textAlign: 'center',
    boxSizing: 'border-box',
  },
  title: {
    fontFamily: 'var(--f-dis, inherit)',
    fontSize: 'clamp(18px, 5vw, 22px)',
    fontWeight: 700,
    color: 'var(--tx, #1a1a1a)',
    margin: '0 0 8px',
  },
  subtitle: {
    fontFamily: 'var(--f-bod, inherit)',
    fontSize: 'clamp(12px, 3.2vw, 14px)',
    color: 'var(--tx-3, #8686B8)',
    margin: '0 0 24px',
    lineHeight: 1.4,
  },
  scanFrame: {
    position: 'relative',
    width: 'clamp(150px, 45vw, 200px)',
    height: 'clamp(150px, 45vw, 200px)',
    margin: '0 auto 20px',
    borderRadius: '50%',
    overflow: 'hidden',
    background: 'radial-gradient(circle, #FDE4D8 0%, #E5E1F5 100%)',
    border: '3px solid #716BC9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transform: 'scaleX(-1)',
  },
  placeholder: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  scanLine: {
    position: 'absolute',
    left: '6%',
    right: '6%',
    height: 3,
    borderRadius: 2,
    background: 'linear-gradient(90deg, transparent, #E01A4F, transparent)',
    animation: 'scanMove 1.3s ease-in-out infinite',
  },
  ring: {
    position: 'absolute',
    inset: 0,
    borderRadius: '50%',
    animation: 'ringPulse 1.3s ease-out infinite',
  },
  statusText: {
    fontFamily: 'var(--f-bod, inherit)',
    fontSize: 'clamp(11px, 3vw, 13px)',
    color: 'var(--tx-2, #8B416F)',
    minHeight: 20,
    margin: '0 0 20px',
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  primaryBtn: {
    padding: '12px 20px',
    borderRadius: 14,
    border: 'none',
    background: 'linear-gradient(135deg, #716BC9, #8B416F)',
    color: '#FDE4D8',
    fontWeight: 600,
    fontSize: 'clamp(13px, 3.5vw, 15px)',
    cursor: 'pointer',
  },
  skipBtn: {
    padding: '10px 20px',
    borderRadius: 14,
    border: '1px solid rgba(134,134,184,0.4)',
    background: 'transparent',
    color: 'var(--tx-3, #8686B8)',
    fontWeight: 500,
    fontSize: 'clamp(12px, 3.2vw, 14px)',
    cursor: 'pointer',
  },
};