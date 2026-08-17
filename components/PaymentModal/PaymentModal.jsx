"use client";
import { useState } from "react";
import styles from "./PaymentModal.module.css";

const FEE = 0.025;

export default function PaymentModal({ product, onClose }) {
  const [tab, setTab] = useState("yappy"); // "yappy" | "card" | "paypal"
  const [success, setSuccess] = useState(false);

  const [card, setCard] = useState({ number: "", expiry: "", cvv: "", name: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const subtotal = product?.price ?? 0;
  const fee = +(subtotal * FEE).toFixed(2);
  const total = +(subtotal + fee).toFixed(2);

  // ─── Yappy ───────────────────────────────────────────────────────────────
  function handleYappy() {
    const deepLink = `yappy://pay?amount=${total}&ref=${product.id}`;
    const webFallback = `https://yappy.com.pa/pay?amount=${total}&ref=${product.id}`;
    const win = window.open(deepLink, "_blank");
    setTimeout(() => {
      if (!win || win.closed) window.open(webFallback, "_blank");
    }, 1500);
    setSuccess(true);
  }

  // ─── Card (Stripe-ready) ─────────────────────────────────────────────────
  function fmtCardNumber(val) {
    return val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  }

  function fmtExpiry(val) {
    return val.replace(/\D/g, "").slice(0, 4).replace(/^(\d{2})(\d)/, "$1/$2");
  }

  async function handleCard() {
    const num = card.number.replace(/\s/g, "");

    if (num.length < 16) return setError("Invalid card number.");
    if (card.expiry.length < 5) return setError("Invalid expiration date.");
    if (card.cvv.length < 3) return setError("Invalid CVV.");
    if (!card.name.trim()) return setError("Enter the cardholder name.");

    setError("");
    setLoading(true);

    // TODO: replace this block with your Stripe call
    // const { error } = await stripe.confirmCardPayment(clientSecret, { ... })
    await new Promise((r) => setTimeout(r, 1200)); // simulated

    setLoading(false);
    setSuccess(true);
  }

  // ─── PayPal ──────────────────────────────────────────────────────────────
  function handlePayPal() {
    // TODO: initialize the PayPal SDK and call paypal.Buttons().render(...)
    // For now, redirect directly to PayPal checkout
    window.open(
      `https://www.paypal.com/checkoutnow?amount=${total}&currency=USD`,
      "_blank"
    );

    setSuccess(true);
  }

  function handlePay() {
    if (tab === "yappy") handleYappy();
    else if (tab === "card") handleCard();
    else handlePayPal();
  }

  if (!product) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <h2>Checkout</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Product */}
        <div className={styles.productRow}>
          <img
            src={product.image}
            alt={product.title}
            className={styles.productImg}
          />

          <div>
            <p className={styles.productName}>{product.title}</p>
            <p className={styles.productPrice}>${subtotal.toFixed(2)}</p>
          </div>
        </div>

        {success ? (
          <div className={styles.success}>
            <span className={styles.successIcon}>✅</span>
            <h3>Payment successful!</h3>
            <p>
              The seller has been notified.
              <br />
              Check your chat to coordinate the delivery.
            </p>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className={styles.tabs}>
              {["yappy", "card", "paypal"].map((t) => (
                <button
                  key={t}
                  className={`${styles.tab} ${
                    tab === t ? styles.tabActive : ""
                  }`}
                  onClick={() => {
                    setTab(t);
                    setError("");
                  }}
                >
                  {t === "yappy"
                    ? " Yappy"
                    : t === "card"
                    ? " Card"
                    : "PayPal"}
                </button>
              ))}
            </div>

            {/* Fee summary */}
            <div className={styles.fees}>
              <div className={styles.feeRow}>
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              <div className={styles.feeRow}>
                <span>Fee (2.5%)</span>
                <span>${fee.toFixed(2)}</span>
              </div>

              <div className={`${styles.feeRow} ${styles.feeTotal}`}>
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Card form */}
            {tab === "card" && (
              <div className={styles.cardForm}>
                <div className={styles.field}>
                  <label>CARD NUMBER</label>
                  <input
                    placeholder="1234 5678 9012 3456"
                    value={card.number}
                    onChange={(e) =>
                      setCard({
                        ...card,
                        number: fmtCardNumber(e.target.value),
                      })
                    }
                  />
                </div>

                <div className={styles.row2}>
                  <div className={styles.field}>
                    <label>EXPIRATION DATE</label>
                    <input
                      placeholder="MM/YY"
                      value={card.expiry}
                      onChange={(e) =>
                        setCard({
                          ...card,
                          expiry: fmtExpiry(e.target.value),
                        })
                      }
                    />
                  </div>

                  <div className={styles.field}>
                    <label>CVV</label>
                    <input
                      type="password"
                      placeholder="123"
                      maxLength={4}
                      value={card.cvv}
                      onChange={(e) =>
                        setCard({
                          ...card,
                          cvv: e.target.value.replace(/\D/g, ""),
                        })
                      }
                    />
                  </div>
                </div>

                <div className={styles.field}>
                  <label>CARDHOLDER NAME</label>
                  <input
                    placeholder="John Doe"
                    value={card.name}
                    onChange={(e) =>
                      setCard({
                        ...card,
                        name: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            )}

            {tab === "paypal" && (
              <p className={styles.note}>
                You will be redirected to PayPal to complete your payment
                securely.
              </p>
            )}

            {tab === "yappy" && (
              <p className={styles.note}>
                The Yappy app will open automatically. If you don't have the
                app, the website will open instead.
              </p>
            )}

            {error && <p className={styles.error}>{error}</p>}

            <button
              className={
                tab === "paypal"
                  ? styles.paypalBtn
                  : tab === "yappy"
                  ? styles.yappyBtn
                  : styles.payBtn
              }
              onClick={handlePay}
              disabled={loading}
            >
              {loading
                ? "Processing..."
                : tab === "yappy"
                ? "🐾 Pay with Yappy"
                : tab === "paypal"
                ? "Pay with PayPal"
                : `Pay $${total.toFixed(2)}`}
            </button>
          </>
        )}
      </div>
    </div>
  );
}