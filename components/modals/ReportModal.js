'use client';
import { useState } from 'react';
import { X, Flag, AlertTriangle, ShieldAlert, Copy, Trash2, MessageCircleWarning } from 'lucide-react';
import { useToast } from '@/store/AppStore';

const REASONS = [
  { id: 'fraude',      icon: ShieldAlert,           label: 'Scam or suspected fraud' },
  { id: 'inapropiado', icon: AlertTriangle,         label: 'Inappropriate content' },
  { id: 'falso',       icon: Flag,                   label: 'False information' },
  { id: 'duplicado',   icon: Copy,                  label: 'Duplicate listing' },
  { id: 'spam',        icon: MessageCircleWarning,  label: 'Spam or unwanted advertising' },
  { id: 'otro',        icon: Trash2,                label: 'Other reason' },
];

export default function ReportModal({ productTitle, onClose }) {
  const [selected, setSelected] = useState('');
  const [details, setDetails] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { show } = useToast();

  const submit = async () => {
    if (!selected) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    setLoading(false);
    setSent(true);

    setTimeout(() => {
      show(
        'Report submitted. Thank you for helping keep the community safe.',
        'success',
        3500
      );
      onClose();
    }, 1800);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-panel glass-strong anim-scale-in"
        onClick={e => e.stopPropagation()}
        style={{ position: 'relative' }}
      >
        <button className="modal-close" onClick={onClose}>
          <X size={16} />
        </button>

        {sent ? (
          <div
            className="flex-col flex-center"
            style={{
              padding: '32px 0',
              gap: 16,
              textAlign: 'center'
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'rgba(52,211,153,0.1)',
                border: '2px solid rgba(52,211,153,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#34d399',
                fontSize: 28
              }}
            >
              ✓
            </div>

            <div className="modal-title" style={{ margin: 0 }}>
              Report submitted
            </div>

            <p
              style={{
                fontSize: 14,
                color: 'var(--text-secondary)'
              }}
            >
              Our team will review the content and take the necessary action.
            </p>
          </div>
        ) : (
          <>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 4
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'rgba(224,26,79,0.12)',
                  border: '1px solid rgba(224,26,79,0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--brand-red)'
                }}
              >
                <Flag size={16} />
              </div>

              <div className="modal-title">
                Report listing
              </div>
            </div>

            <p
              className="modal-subtitle"
              style={{ marginBottom: 20 }}
            >
              {productTitle
                ? `"${productTitle}"`
                : 'This listing'} — Select the reason for your report
            </p>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8
              }}
            >
              {REASONS.map(r => {
                const Icon = r.icon;

                return (
                  <label
                    key={r.id}
                    className={`radio-option${
                      selected === r.id ? ' selected' : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={r.id}
                      style={{ display: 'none' }}
                      onChange={() => setSelected(r.id)}
                    />

                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 8,
                        background:
                          selected === r.id
                            ? 'rgba(113,107,201,0.15)'
                            : 'var(--surface-1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color:
                          selected === r.id
                            ? 'var(--brand-primary)'
                            : 'var(--text-muted)',
                        transition: 'all 0.2s',
                        flexShrink: 0
                      }}
                    >
                      <Icon size={14} />
                    </div>

                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 500
                      }}
                    >
                      {r.label}
                    </span>

                    <div
                      style={{
                        marginLeft: 'auto',
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        border: `2px solid ${
                          selected === r.id
                            ? 'var(--brand-primary)'
                            : 'var(--border-normal)'
                        }`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s'
                      }}
                    >
                      {selected === r.id && (
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: 'var(--brand-primary)'
                          }}
                        />
                      )}
                    </div>
                  </label>
                );
              })}
            </div>

            {selected && (
              <div style={{ marginTop: 16 }}>
                <label className="input-label">
                  Additional details (optional)
                </label>

                <textarea
                  className="input-field"
                  placeholder="Briefly describe the issue..."
                  rows={3}
                  value={details}
                  onChange={e => setDetails(e.target.value)}
                  style={{
                    resize: 'none',
                    borderRadius: 'var(--r-md)'
                  }}
                />
              </div>
            )}

            <div
              style={{
                display: 'flex',
                gap: 10,
                marginTop: 20
              }}
            >
              <button
                className="btn btn-ghost w-full"
                onClick={onClose}
              >
                Cancel
              </button>

              <button
                className="btn w-full"
                style={{
                  background: 'linear-gradient(135deg,#E01A4F,#c0154a)',
                  color: 'white',
                  boxShadow: selected
                    ? '0 4px 20px rgba(224,26,79,0.3)'
                    : 'none',
                  opacity: selected ? 1 : 0.4
                }}
                onClick={submit}
                disabled={!selected || loading}
              >
                {loading ? (
                  <span
                    className="loader"
                    style={{
                      width: 18,
                      height: 18,
                      borderWidth: 2
                    }}
                  />
                ) : (
                  'Submit report'
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}