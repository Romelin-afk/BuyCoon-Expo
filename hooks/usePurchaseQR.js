"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

function generateTxId(type) {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
  return "BC-" + type + "-" + ts + "-" + rand;
}

export function usePurchaseQR({ productId, sellerId, buyerId, amount, method, tradeItem }) {
  const [txId, setTxId] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [status, setStatus] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const methodCode = { yappy: "YAP", stripe: "STR", paypal: "PP", cash: "CASH", trade: "TRADE" }[method] || "PAY";

  const initTransaction = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const id = generateTxId(methodCode);
      setTxId(id);

      const { error: dbErr } = await supabase.from("transactions").insert({
        id,
        product_id: productId,
        seller_id: sellerId,
        buyer_id: buyerId,
        amount,
       payment_method: method,
        trade_item: tradeItem,
        status: "pending",
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      });

      if (dbErr) throw dbErr;

      const qrPayload = encodeURIComponent(JSON.stringify({ txId: id, productId, amount, method }));
      setQrDataUrl("https://api.qrserver.com/v1/create-qr-code/?size=220x220&format=png&data=" + qrPayload);
      setStatus("pending");
    } catch (err) {
      setError(err.message || "Error generated transaction");
    } finally {
      setLoading(false);
    }
  }, [productId, sellerId, buyerId, amount, method, tradeItem]);

  useEffect(() => {
    if (!txId) return;
    const channel = supabase
      .channel("tx-" + txId)
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "transactions",
        filter: "id=eq." + txId,
      }, (payload) => {
        if (payload.new.status === "confirmed") setStatus("confirmed");
        if (payload.new.status === "expired") setStatus("expired");
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [txId]);

  const confirmTransaction = useCallback(async () => {
    if (!txId) return;
    const { error } = await supabase
      .from("transactions")
      .update({ status: "confirmed", confirmed_at: new Date().toISOString() })
      .eq("id", txId);
    if (!error) setStatus("confirmed");
  }, [txId]);

  useEffect(() => {
    initTransaction();
  }, []);

  return { txId, qrDataUrl, status, loading, error, confirmTransaction, regenerate: initTransaction };
}