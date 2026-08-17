"use client";
import { useState } from "react";
import { usePurchaseQR } from "@/hooks/usePurchaseQR";
import TradeConfirmation from "./TradeConfirmation";

const METHOD_META = {
  yappy:  { label: "Yappy",   icon: "📱", color: "#00B04F", desc: "Digital payment via Yappy" },
  stripe: { label: "Card",    icon: "💳", color: "#635BFF", desc: "Credit / debit card" },
  paypal: { label: "PayPal",  icon: "PP", color: "#003087", desc: "Pay with PayPal" },
  cash:   { label: "Cash",    icon: "💵", color: "#2D7A4F", desc: "Pay in person" },
  trade:  { label: "Trade",   icon: "🔄", color: "#8B416F", desc: "Exchange items" },
};

function MethodSelector({ selected, onChange }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: "10px",
        marginBottom: "24px",
      }}
    >
      {Object.entries(METHOD_META).map(([key, meta]) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          style={{
            background:
              selected === key
                ? `linear-gradient(135deg, ${meta.color}22, ${meta.color}44)`
                : "rgba(255,255,255,0.06)",
            border:
              selected === key
                ? `1.5px solid ${meta.color}`
                : "1.5px solid rgba(255,255,255,0.12)",
            borderRadius: "14px",
            padding: "12px 8px",
            cursor: "pointer",
            transition: "all 0.2s",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span style={{ fontSize: "22px" }}>{meta.icon}</span>

          <span
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color:
                selected === key ? meta.color : "var(--tx-2)",
              letterSpacing: "0.3px",
            }}
          >
            {meta.label}
          </span>
        </button>
      ))}
    </div>
  );
}

function QRPanel({
  qrDataUrl,
  txId,
  status,
  method,
  loading,
  error,
  onRegenerate,
}) {
  const meta = METHOD_META[method];

  if (loading)
    return (
      <div style={qrContainer}>
        <div style={spinnerStyle} />

        <p
          style={{
            color: "var(--tx-3)",
            fontSize: "13px",
            marginTop: "12px",
          }}
        >
          Generating transaction...
        </p>
      </div>
    );

  if (error)
    return (
      <div style={qrContainer}>
        <span style={{ fontSize: "32px" }}>⚠️</span>

        <p
          style={{
            color: "#E01A4F",
            fontSize: "13px",
            margin: "8px 0",
          }}
        >
          {error}
        </p>

        <button onClick={onRegenerate} style={ghostBtn}>
          Retry
        </button>
      </div>
    );

  if (status === "confirmed")
    return (
      <div style={{ ...qrContainer, gap: "10px" }}>
        <div
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background:
              "linear-gradient(135deg, #2D7A4F, #48C774)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "36px",
            animation:
              "bc-pop 0.4s cubic-bezier(0.34,1.56,0.64,1)",
          }}
        >
          ✓
        </div>

        <p
          style={{
            color: "#48C774",
            fontWeight: 700,
            fontSize: "16px",
          }}
        >
          Purchase confirmed!
        </p>

        <p
          style={{
            color: "var(--tx-3)",
            fontSize: "12px",
          }}
        >
          TX: {txId}
        </p>
      </div>
    );

  if (status === "expired")
    return (
      <div style={qrContainer}>
        <span style={{ fontSize: "32px" }}>⏱️</span>

        <p
          style={{
            color: "#E01A4F",
            fontSize: "13px",
            margin: "8px 0",
          }}
        >
          QR code expired (30 min)
        </p>

        <button onClick={onRegenerate} style={ghostBtn}>
          Generate new QR
        </button>
      </div>
    );

  return (
    <div style={qrContainer}>
      <div
        style={{
          background: `${meta.color}22`,
          border: `1px solid ${meta.color}55`,
          borderRadius: "20px",
          padding: "4px 14px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          marginBottom: "8px",
        }}
      >
        <span style={{ fontSize: "14px" }}>{meta.icon}</span>

        <span
          style={{
            fontSize: "12px",
            fontWeight: 600,
            color: meta.color,
          }}
        >
          {meta.desc}
        </span>
      </div>

      <div
        style={{
          background: "white",
          borderRadius: "20px",
          padding: "12px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
          position: "relative",
        }}
      >
        <img
          src={qrDataUrl}
          alt="Transaction confirmation QR code"
          width={200}
          height={200}
          style={{
            display: "block",
            borderRadius: "8px",
          }}
        />
      </div>

      <div
        style={{
          background: "rgba(255,255,255,0.06)",
          borderRadius: "10px",
          padding: "8px 16px",
          marginTop: "10px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <span
          style={{
            fontSize: "11px",
            color: "var(--tx-3)",
            letterSpacing: "0.5px",
          }}
        >
          TX
        </span>

        <span
          style={{
            fontSize: "11px",
            fontFamily: "monospace",
            color: "var(--tx-2)",
            letterSpacing: "1px",
          }}
        >
          {txId}
        </span>

        <button
          onClick={() => navigator.clipboard.writeText(txId)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#716BC9",
            fontSize: "12px",
            padding: 0,
          }}
          title="Copy transaction ID"
        >
          Copy
        </button>
      </div>

      <p
        style={{
          color: "var(--tx-3)",
          fontSize: "12px",
          textAlign: "center",
          maxWidth: "220px",
          lineHeight: 1.5,
        }}
      >
        {method === "cash"
          ? "Show this QR code to the seller when handing over the cash"
          : method === "trade"
          ? "Show this QR code to the seller when completing the trade"
          : "The seller scans this QR code to confirm that the payment was received"}
      </p>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <span
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: "#48C774",
            boxShadow:
              "0 0 0 0 rgba(72,199,116,0.6)",
            animation: "bc-pulse 1.5s infinite",
          }}
        />

        <span
          style={{
            fontSize: "11px",
            color: "var(--tx-3)",
          }}
        >
          Waiting for confirmation...
        </span>
      </div>
    </div>
  );
}

export default function PurchaseConfirmation({
  isOpen,
  onClose,
  product,
  buyer,
  onSuccess,
  initialStep = "method",
}) {
  const [method, setMethod] = useState("yappy");
  const [tradeItem, setTradeItem] = useState(null);
  const [step, setStep] = useState(initialStep);

  const {
    txId,
    qrDataUrl,
    status,
    loading,
    error,
    confirmTransaction,
    regenerate,
  } = usePurchaseQR({
    productId: product?.id,
    sellerId: product?.seller_id,
    buyerId: buyer?.id,
    amount: product?.price,
    method,
    tradeItem,
  });

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes bc-pulse {
          0%   { box-shadow: 0 0 0 0 rgba(72,199,116,0.6); }
          70%  { box-shadow: 0 0 0 8px rgba(72,199,116,0); }
          100% { box-shadow: 0 0 0 0 rgba(72,199,116,0); }
        }

        @keyframes bc-pop {
          0%   { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }

        @keyframes bc-slide-up {
          from {
            transform: translateY(40px) translateX(-50%);
            opacity: 0;
          }

          to {
            transform: translateY(0) translateX(-50%);
            opacity: 1;
          }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .bc-confirm-modal {
          animation: bc-slide-up 0.3s cubic-bezier(0.34,1.2,0.64,1);
        }
      `}</style>

      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9000,
          background: "rgba(0,0,0,0.65)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      />

      <div
        className="bc-confirm-modal"
        style={{
          position: "fixed",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: "480px",
          zIndex: 9001,
          background:
            "linear-gradient(160deg, rgba(30,26,60,0.97), rgba(20,18,40,0.98))",
          border: "1px solid rgba(113,107,201,0.3)",
          borderRadius: "28px 28px 0 0",
          padding: "28px 24px 40px",
          boxShadow:
            "0 -20px 60px rgba(113,107,201,0.15), 0 -4px 20px rgba(0,0,0,0.4)",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "4px",
            background: "rgba(255,255,255,0.15)",
            borderRadius: "4px",
            margin: "0 auto 24px",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "18px",
                fontWeight: 700,
                color: "var(--tx)",
                fontFamily: "var(--f-dis)",
              }}
            >
              {step === "method"
                ? "How are you going to pay?"
                : "Confirmation QR Code"}
            </h2>

            <p
              style={{
                margin: "4px 0 0",
                fontSize: "13px",
                color: "var(--tx-3)",
              }}
            >
              {product?.title} ·{" "}
              <span
                style={{
                  color: "#716BC9",
                  fontWeight: 600,
                }}
              >
                ${product?.price}
              </span>
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "none",
              borderRadius: "50%",
              width: "36px",
              height: "36px",
              cursor: "pointer",
              color: "var(--tx-2)",
              fontSize: "18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {step === "method" && (
          <>
            <MethodSelector
              selected={method}
              onChange={setMethod}
            />

            {method === "trade" && (
              <TradeConfirmation
                onTradeItemSet={setTradeItem}
              />
            )}

            {method === "cash" && (
              <div style={infoBox("#2D7A4F")}>
                <span>💵</span>

                <p
                  style={{
                    margin: 0,
                    fontSize: "13px",
                    color: "var(--tx-2)",
                    lineHeight: 1.5,
                  }}
                >
                  Coordinate the location and time with the seller
                  through the chat. At the time of delivery, both
                  parties scan the QR code to confirm.
                </p>
              </div>
            )}

            <button
              onClick={() => setStep("qr")}
              disabled={method === "trade" && !tradeItem}
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: "16px",
                border: "none",
                background:
                  "linear-gradient(135deg, #716BC9, #8B416F)",
                color: "white",
                fontSize: "15px",
                fontWeight: 700,
                cursor:
                  method === "trade" && !tradeItem
                    ? "not-allowed"
                    : "pointer",
                opacity:
                  method === "trade" && !tradeItem
                    ? 0.5
                    : 1,
                transition: "opacity 0.2s",
                letterSpacing: "0.3px",
              }}
            >
              Continue
            </button>
          </>
        )}

        {step === "qr" && (
          <>
            <QRPanel
              qrDataUrl={qrDataUrl}
              txId={txId}
              status={status}
              method={method}
              loading={loading}
              error={error}
              onRegenerate={regenerate}
            />

            {process.env.NODE_ENV === "development" &&
              status === "pending" &&
              !loading && (
                <button
                  onClick={confirmTransaction}
                  style={{
                    ...ghostBtn,
                    marginTop: "12px",
                    width: "100%",
                  }}
                >
                  [DEV] Simulate seller confirmation
                </button>
              )}

            {status === "confirmed" && (
              <button
                onClick={() => {
                  onSuccess?.(txId);
                  onClose();
                }}
                style={{
                  width: "100%",
                  marginTop: "16px",
                  padding: "16px",
                  borderRadius: "16px",
                  border: "none",
                  background:
                    "linear-gradient(135deg, #2D7A4F, #48C774)",
                  color: "white",
                  fontSize: "15px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                View my purchase
              </button>
            )}

            <button
              onClick={() => setStep("method")}
              style={{
                ...ghostBtn,
                marginTop: "10px",
                width: "100%",
              }}
            >
              Change payment method
            </button>
          </>
        )}
      </div>
    </>
  );
}

const qrContainer = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "14px",
  padding: "8px 0 20px",
};

const ghostBtn = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "12px",
  padding: "10px 20px",
  color: "var(--tx-2)",
  fontSize: "13px",
  cursor: "pointer",
};

const spinnerStyle = {
  width: "40px",
  height: "40px",
  border: "3px solid rgba(113,107,201,0.2)",
  borderTop: "3px solid #716BC9",
  borderRadius: "50%",
  animation: "spin 0.8s linear infinite",
};

const infoBox = (color) => ({
  display: "flex",
  gap: "12px",
  alignItems: "flex-start",
  background: `${color}15`,
  border: `1px solid ${color}33`,
  borderRadius: "14px",
  padding: "14px",
  marginBottom: "16px",
});