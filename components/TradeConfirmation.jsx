'use client';

import { useState, useCallback } from 'react';

// Simulated Trade Confirmation screen
// Used when two users close a trade (item-for-item) exchange in person.
// Colors match BuyCoon! design tokens: #716BC9, #E01A4F, #8686B8, #8B416F, #FDE4D8
export default function TradeConfirmation({
  itemOffered,   // { title, image }
  itemRequested, // { title, image }
  counterpartName = 'the other user',
  onConfirm,
  onCancel,
}) {
  const [status, setStatus] = useState('pending'); // pending | scanning | confirmed | cancelled

  const confirmTrade = useCallback(() => {
    setStatus('scanning');
    // Simulated QR scan / handshake delay
    setTimeout(() => {
      setStatus('confirmed');
      setTimeout(() => {
        onConfirm?.({ confirmedAt: Date.now() });
      }, 900);
    }, 1800);
  }, [onConfirm]);

  const cancelTrade = () => {
    setStatus('cancelled');
    onCancel?.();
  };

  // Fake QR pattern — deterministic-looking grid, no real encoding needed
  const qrCells = Array.from({ length: 49 }, (_, i) => (i * 37 + 13) % 5 === 0);

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h2 style={styles.title}>Confirm Trade</h2>
        <p style={styles.subtitle}>
          You're trading with <strong>{counterpartName}</strong>. Confirm once you've both checked the items.
        </p>

        {/* ── Items being exchanged ── */}
        <div style={styles.itemsRow}>
          <ItemCard label="You give" item={itemOffered} accent="#E01A4F" />
          <div style={styles.swapIcon}>⇄</div>
          <ItemCard label="You get" item={itemRequested} accent="#716BC9" />
        </div>

        {/* ── QR / status area ── */}
        <div style={styles.qrFrame}>
          {status === 'confirmed' ? (
            <div style={styles.confirmedWrap}>
              <CheckIcon />
            </div>
          ) : (
            <div style={{ ...styles.qrGrid, opacity: status === 'scanning' ? 0.35 : 1 }}>
              {qrCells.map((filled, i) => (
                <div
                  key={i}
                  style={{
                    ...styles.qrCell,
                    background: filled ? 'var(--tx, #1a1a1a)' : 'transparent',
                  }}
                />
              ))}
            </div>
          )}
          {status === 'scanning' && <div style={styles.scanLine} />}
        </div>

        <p style={styles.statusText}>
          {status === 'pending' && 'Have the other person scan this code to confirm the trade.'}
          {status === 'scanning' && 'Confirming trade…'}
          {status === 'confirmed' && 'Trade confirmed successfully!'}
          {status === 'cancelled' && 'Trade cancelled.'}
        </p>

        <div style={styles.actions}>
          {(status === 'pending') && (
            <button style={styles.primaryBtn} onClick={confirmTrade}>
              Confirm trade
            </button>
          )}
          {status !== 'confirmed' && status !== 'scanning' && (
            <button style={styles.cancelBtn} onClick={cancelTrade}>
              Cancel
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes scanMoveH {
          0% { left: 4%; }
          50% { left: 92%; }
          100% { left: 4%; }
        }
      `}</style>
    </div>
  );
}

function ItemCard({ label, item, accent }) {
  return (
    <div style={styles.itemCard}>
      <div style={{ ...styles.itemImgWrap, borderColor: accent }}>
        {item?.image ? (
          <img src={item.image} alt={item.title} style={styles.itemImg} />
        ) : (
          <div style={styles.itemImgPlaceholder} />
        )}
      </div>
      <span style={styles.itemLabel}>{label}</span>
      <span style={styles.itemTitle}>{item?.title || 'Item'}</span>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
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
    padding: '32px 16px',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    padding: '28px 24px',
    background: 'rgba(255,255,255,0.06)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(134,134,184,0.25)',
    textAlign: 'center',
  },
  title: {
    fontFamily: 'var(--f-dis, inherit)',
    fontSize: 22,
    fontWeight: 700,
    color: 'var(--tx, #1a1a1a)',
    margin: '0 0 8px',
  },
  subtitle: {
    fontFamily: 'var(--f-bod, inherit)',
    fontSize: 13,
    color: 'var(--tx-3, #8686B8)',
    margin: '0 0 20px',
    lineHeight: 1.4,
  },
  itemsRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  itemCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    minWidth: 0,
  },
  itemImgWrap: {
    width: 72,
    height: 72,
    borderRadius: 16,
    overflow: 'hidden',
    border: '2px solid',
    background: 'rgba(255,255,255,0.5)',
  },
  itemImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  itemImgPlaceholder: {
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, #E5E1F5, #FDE4D8)',
  },
  itemLabel: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.4px',
    textTransform: 'uppercase',
    color: 'var(--tx-3, #8686B8)',
    marginTop: 6,
  },
  itemTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--tx, #1a1a1a)',
    maxWidth: 100,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  swapIcon: {
    fontSize: 20,
    color: 'var(--brand, #716BC9)',
    flexShrink: 0,
  },
  qrFrame: {
    position: 'relative',
    width: 168,
    height: 168,
    margin: '0 auto 16px',
    borderRadius: 20,
    background: '#fff',
    border: '3px solid #716BC9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  qrGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gridTemplateRows: 'repeat(7, 1fr)',
    width: '82%',
    height: '82%',
    gap: 2,
    transition: 'opacity 0.3s',
  },
  qrCell: {
    borderRadius: 1,
  },
  confirmedWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanLine: {
    position: 'absolute',
    top: '6%',
    bottom: '6%',
    width: 3,
    borderRadius: 2,
    background: 'linear-gradient(180deg, transparent, #E01A4F, transparent)',
    animation: 'scanMoveH 1.4s ease-in-out infinite',
  },
  statusText: {
    fontFamily: 'var(--f-bod, inherit)',
    fontSize: 13,
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
    fontSize: 15,
    cursor: 'pointer',
  },
  cancelBtn: {
    padding: '10px 20px',
    borderRadius: 14,
    border: '1px solid rgba(134,134,184,0.4)',
    background: 'transparent',
    color: 'var(--tx-3, #8686B8)',
    fontWeight: 500,
    fontSize: 14,
    cursor: 'pointer',
  },
};