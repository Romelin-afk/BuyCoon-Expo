"use client";
import { useState } from "react";

export default function TestPage() {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ padding: "40px" }}>
      <button
        onClick={() => setOpen(true)}
        style={{
          padding: "12px 24px",
          background: "#716BC9",
          color: "white",
          border: "none",
          borderRadius: "12px",
          cursor: "pointer",
          fontSize: "16px",
        }}
      >
        Abrir QR
      </button>

      {open && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9000,
          background: "rgba(0,0,0,0.65)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{
            background: "#1e1a3c",
            border: "1px solid rgba(113,107,201,0.3)",
            borderRadius: "24px",
            padding: "32px",
            textAlign: "center",
          }}>
            <p style={{ color: "white", marginBottom: "16px" }}>QR Test</p>
            <img
              src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=BuyCoon-Test-123"
              alt="QR test"
              width={200}
              height={200}
            />
            <br />
            <button onClick={() => setOpen(false)} style={{ marginTop: "16px", padding: "10px 20px", cursor: "pointer" }}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}