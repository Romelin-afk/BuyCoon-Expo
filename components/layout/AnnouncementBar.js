'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, X, Sparkles, Tag } from 'lucide-react';
import { ANNOUNCEMENT_SLIDES, formatPrice } from '@/lib/data';

export default function AnnouncementBar() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [prev, setPrev] = useState(null);
  const [animDir, setAnimDir] = useState('next'); // 'next' | 'prev'
  const [animating, setAnimating] = useState(false);
  const timerRef = useRef(null);

  const startTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => go('next'), 5000);
  };

  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current);
  }, [current]);

  const go = (dir) => {
    if (animating) return;
    setAnimating(true);
    setAnimDir(dir);
    setPrev(current);
    const next = dir === 'next'
      ? (current + 1) % ANNOUNCEMENT_SLIDES.length
      : (current - 1 + ANNOUNCEMENT_SLIDES.length) % ANNOUNCEMENT_SLIDES.length;
    setTimeout(() => {
      setCurrent(next);
      setPrev(null);
      setAnimating(false);
    }, 420);
    startTimer();
  };

  if (dismissed) return null;

  const slide = ANNOUNCEMENT_SLIDES[current];
  const isPremium = slide.type === 'premium';

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0,
      zIndex: 201, height: 48,
      overflow: 'hidden',
    }}>
      {/* Glass backdrop */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(90deg, rgba(113,107,201,0.15) 0%, rgba(139,65,111,0.12) 50%, rgba(113,107,201,0.15) 100%)',
        backdropFilter: 'blur(28px) saturate(200%)',
        WebkitBackdropFilter: 'blur(28px) saturate(200%)',
        borderBottom: '1px solid rgba(113,107,201,0.22)',
        boxShadow: '0 2px 20px rgba(0,0,0,0.25)',
      }} />

      {/* Shimmer sweep */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.04) 50%, transparent 65%)',
        backgroundSize: '200% 100%',
        animation: 'annSweep 4s infinite',
      }} />

      {/* Content row */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', height: '100%', zIndex: 1 }}>

        {/* Prev arrow */}
        <button onClick={() => go('prev')} style={{ padding: '0 10px', color: 'rgba(255,255,255,0.4)', height: '100%', display: 'flex', alignItems: 'center', flexShrink: 0, transition: 'color 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}>
          <ChevronLeft size={14} />
        </button>

        {/* Slide content */}
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative', height: '100%', cursor: slide.productId ? 'pointer' : 'default' }}
          onClick={() => slide.productId && router.push(`/product/${slide.productId}`)}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 12, height: '100%',
            animation: animating ? `slideOut${animDir === 'next' ? 'Left' : 'Right'} 0.42s cubic-bezier(0.16,1,0.3,1) both` : `slideIn${animDir === 'next' ? 'Right' : 'Left'} 0.42s cubic-bezier(0.16,1,0.3,1) both`,
          }}>

            {/* Product thumbnail */}
            {slide.image && (
              <div style={{
                width: 30, height: 30, borderRadius: 8, overflow: 'hidden', flexShrink: 0,
                border: `1px solid ${slide.accent}40`,
                boxShadow: `0 0 10px ${slide.accent}30`,
              }}>
                <img src={slide.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}

            {/* Badge */}
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              fontSize: 10, fontWeight: 700, letterSpacing: '0.4px',
              padding: '2px 8px', borderRadius: 'var(--r-full)',
              background: `${slide.accent}22`,
              border: `1px solid ${slide.accent}40`,
              color: slide.accent,
              flexShrink: 0,
            }}>
              {isPremium ? <Sparkles size={9} /> : <Tag size={9} />}
              {slide.headline}
            </span>

            {/* Text */}
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.82)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 320 }}>
              {slide.sub}
            </span>

            {/* Price pill */}
            <span style={{
              fontSize: 12, fontWeight: 800,
              color: 'white',
              background: `${slide.accent}30`,
              border: `1px solid ${slide.accent}50`,
              borderRadius: 'var(--r-full)',
              padding: '1px 10px',
              flexShrink: 0,
            }}>
              {slide.price}
            </span>

            {/* CTA */}
            <button
              onClick={e => { e.stopPropagation(); slide.productId && router.push(`/product/${slide.productId}`); }}
              style={{
                fontSize: 11, fontWeight: 700, color: 'white',
                background: `linear-gradient(135deg, ${slide.accent}, ${slide.accent}bb)`,
                border: 'none', borderRadius: 'var(--r-full)',
                padding: '3px 12px', cursor: 'pointer', flexShrink: 0,
                boxShadow: `0 2px 10px ${slide.accent}50`,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = `0 4px 16px ${slide.accent}70`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = `0 2px 10px ${slide.accent}50`; }}
            >
              {slide.cta} →
            </button>
          </div>
        </div>

        {/* Dots */}
        <div style={{ display: 'flex', gap: 5, padding: '0 10px', flexShrink: 0, alignItems: 'center' }}>
          {ANNOUNCEMENT_SLIDES.map((s, i) => (
            <button key={i} onClick={() => { setPrev(current); setAnimDir('next'); setCurrent(i); startTimer(); }}
              style={{
                width: i === current ? 18 : 5, height: 5,
                borderRadius: 'var(--r-full)',
                background: i === current ? slide.accent : 'rgba(255,255,255,0.20)',
                border: 'none', cursor: 'pointer',
                transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)',
                boxShadow: i === current ? `0 0 6px ${slide.accent}60` : 'none',
              }}
            />
          ))}
        </div>

        {/* Next arrow */}
        <button onClick={() => go('next')} style={{ padding: '0 10px', color: 'rgba(255,255,255,0.4)', height: '100%', display: 'flex', alignItems: 'center', flexShrink: 0, transition: 'color 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}>
          <ChevronRight size={14} />
        </button>

        {/* Dismiss */}
        <button onClick={() => setDismissed(true)} style={{ padding: '0 12px', color: 'rgba(255,255,255,0.25)', height: '100%', display: 'flex', alignItems: 'center', flexShrink: 0, transition: 'color 0.2s', borderLeft: '1px solid rgba(255,255,255,0.06)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.25)'}>
          <X size={12} />
        </button>
      </div>

      {/* Light mode overrides */}
      <style>{`
        [data-theme="light"] [data-ann-bar] {
          background: linear-gradient(90deg, rgba(113,107,201,0.10), rgba(139,65,111,0.08), rgba(113,107,201,0.10)) !important;
          border-bottom: 1px solid rgba(113,107,201,0.16) !important;
        }
        @keyframes annSweep {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes slideOutLeft {
          from { transform: translateX(0); opacity: 1; }
          to   { transform: translateX(-60px); opacity: 0; }
        }
        @keyframes slideOutRight {
          from { transform: translateX(0); opacity: 1; }
          to   { transform: translateX(60px); opacity: 0; }
        }
        @keyframes slideInRight {
          from { transform: translateX(60px); opacity: 0; }
          to   { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideInLeft {
          from { transform: translateX(-60px); opacity: 0; }
          to   { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
