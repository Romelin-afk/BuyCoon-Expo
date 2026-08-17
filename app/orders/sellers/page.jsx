"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SellerOrders() {
  const supabase = createClient();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await supabase
        .from("transactions")
        .select("*")
        .eq("seller_id", user.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      setOrders(data || []);
    };
    load();
  }, []);

  const confirm = async (txId) => {
    await supabase
      .from("transactions")
      .update({ status: "confirmed", confirmed_at: new Date().toISOString() })
      .eq("id", txId);
    setOrders(prev => prev.filter(o => o.id !== txId));
  };

  return (
    <div style={{ padding: "24px", maxWidth: "600px", margin: "0 auto" }}>
      <h1 style={{ color: "var(--tx)", marginBottom: "20px" }}>Pending orders</h1>
      {orders.length === 0 && (
        <p style={{ color: "var(--tx-3)" }}>No pending orders.</p>
      )}
      {orders.map(order => (
        <div key={order.id} style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "16px",
          padding: "16px",
          marginBottom: "12px",
        }}>
          <p style={{ margin: "0 0 4px", color: "var(--tx)", fontWeight: 600 }}>
            ${order.amount} · {order.method}
          </p>
          <p style={{ margin: "0 0 12px", fontFamily: "monospace", fontSize: "11px", color: "var(--tx-3)" }}>
            {order.id}
          </p>
          <button
            onClick={() => confirm(order.id)}
            style={{
              padding: "10px 20px",
              borderRadius: "12px",
              border: "none",
              background: "linear-gradient(135deg, #2D7A4F, #48C774)",
              color: "white",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Confirm order
          </button>
        </div>
      ))}
    </div>
  );
}