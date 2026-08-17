'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Copy, MessageCircle, Package } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/data';
import { useToast } from '@/store/AppStore';

const METHOD_LABEL = {
  yappy: 'Yappy', stripe: 'Tarjeta', paypal: 'PayPal', cash: 'Efectivo', trade: 'Trueque',
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { show } = useToast();

  const [order, setOrder] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data: tx, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', params.txId)
        .single();

      if (error || !tx) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setOrder(tx);

      if (tx.product_id) {
        const { data: prod } = await supabase
          .from('products')
          .select('*')
          .eq('id', tx.product_id)
          .single();
        setProduct(prod ?? null);
      }
      setLoading(false);
    }
    load();
  }, [params.txId]);

  const copyId = () => {
    navigator.clipboard.writeText(order.id);
    show('ID copiado', 'success', 1800);
  };

  if (loading) {
    return (
      <main className="page-content">
        <div className="empty-state">
          <span className="loader" style={{ width: 32, height: 32, borderWidth: 3 }} />
        </div>
      </main>
    );
  }

  if (notFound) {
    return (
      <main className="page-content">
        <div className="empty-state">
          <div className="empty-icon" style={{ fontSize: 32 }}>🔍</div>
          <div className="empty-title">Order not found</div>
          <p className="empty-desc">This order doesn't exist or was already removed.</p>
          <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={() => router.push('/grid')}>
            Browse listings
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="page-content" style={{ position: 'relative', zIndex: 1 }}>
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '20px 20px 40px' }}>
        <button
          className="btn btn-ghost btn-sm"
          style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6 }}
          onClick={() => router.push('/')}
        >
          <ArrowLeft size={14} /> Home
        </button>

        {/* Success header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg, #2D7A4F, #48C774)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 14,
          }}>
            <CheckCircle2 size={36} color="white" />
          </div>
          <h1 style={{ fontFamily: 'var(--f-dis)', fontSize: 22, fontWeight: 800, color: 'var(--tx)', margin: '0 0 4px' }}>
            Purchase confirmed
          </h1>
          <p style={{ fontSize: 13, color: 'var(--tx-3)', margin: 0 }}>
            {order.status === 'confirmed' ? 'Payment verified by seller' : 'Waiting for final confirmation'}
          </p>
        </div>

        {/* Product card */}
        {product && (
          <div className="glass-card" style={{ borderRadius: 'var(--r-lg)', padding: 16, display: 'flex', gap: 14, alignItems: 'center', marginBottom: 16 }}>
            <img
              src={product.images?.[0]}
              alt={product.title}
              style={{ width: 64, height: 64, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--tx)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {product.title}
              </div>
              <div style={{ fontFamily: 'var(--f-dis)', fontSize: 18, fontWeight: 800, color: 'var(--brand)', marginTop: 2 }}>
                {formatPrice(order.amount)}
              </div>
            </div>
          </div>
        )}

        {/* Order details */}
        <div className="glass-card" style={{ borderRadius: 'var(--r-lg)', padding: 16, marginBottom: 16 }}>
          <Row label="Order ID">
            <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{order.id}</span>
            <button onClick={copyId} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brand)', display: 'flex' }}>
              <Copy size={13} />
            </button>
          </Row>
          <Row label="Payment method">
            <span>{METHOD_LABEL[order.payment_method] || order.payment_method}</span>
          </Row>
          {order.trade_item && (
            <Row label="Trade item">
              <span>{order.trade_item}</span>
            </Row>
          )}
          <Row label="Status">
            <span className={`badge ${order.status === 'confirmed' ? 'badge-success' : 'badge-primary'}`}>
              {order.status}
            </span>
          </Row>
          <Row label="Date" last>
            <span>{new Date(order.created_at).toLocaleString()}</span>
          </Row>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="btn btn-primary w-full"
            onClick={() => router.push(`/chats?seller=${order.seller_id}&product=${order.product_id}`)}
          >
            <MessageCircle size={15} /> Message seller
          </button>
          <button className="btn btn-ghost w-full" onClick={() => router.push('/grid')}>
            <Package size={15} /> Keep browsing
          </button>
        </div>
      </div>
    </main>
  );
}

function Row({ label, children, last }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 10, padding: '10px 0',
      borderBottom: last ? 'none' : '1px solid rgba(255,255,255,0.06)',
      fontSize: 13,
    }}>
      <span style={{ color: 'var(--tx-3)' }}>{label}</span>
      <span style={{ color: 'var(--tx)', display: 'flex', alignItems: 'center', gap: 6 }}>{children}</span>
    </div>
  );
}