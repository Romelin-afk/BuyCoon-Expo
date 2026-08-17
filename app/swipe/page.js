'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X, Heart, Info, Star, MapPin, Eye, RefreshCw } from 'lucide-react';

import { MOCK_PRODUCTS, formatPrice } from '@/lib/data';
import { useFavorites, useToast } from '@/store/AppStore';

const CONDITIONS_LABEL = {
  nuevo: 'New',
  excelente: 'Excellent',
  bueno: 'Good',
  regular: 'Fair',
  'para-piezas': 'For parts',
};

const CONDITIONS_COLOR = {
  nuevo: '#34d399',
  excelente: '#60a5fa',
  bueno: '#716BC9',
  regular: '#fbbf24',
  'para-piezas': '#E01A4F',
};

function SwipeCard({
  product,
  style,
  onDragStart,
  onDrag,
  onDragEnd,
  zIndex,
  isTop
}) {
  const router = useRouter();
  const dragState = useRef({
    startX: 0,
    startY: 0,
    dragging: false
  });

  const cardRef = useRef(null);

  const handlePointerDown = (e) => {
    if (!isTop) return;

    dragState.current = {
      startX: e.clientX,
      startY: e.clientY,
      dragging: true
    };

    cardRef.current.setPointerCapture(e.pointerId);
    onDragStart?.();
  };

  const handlePointerMove = (e) => {
    if (!dragState.current.dragging) return;

    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;

    onDrag?.(dx, dy);
  };

  const handlePointerUp = (e) => {
    if (!dragState.current.dragging) return;

    dragState.current.dragging = false;

    const dx = e.clientX - dragState.current.startX;

    onDragEnd?.(dx);
  };

  return (
    <div
      ref={cardRef}
      className="swipe-card"
      style={{
        zIndex,
        cursor: isTop ? 'grab' : 'default',
        ...style
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <img
        src={product.images[0]}
        alt={product.title}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          pointerEvents: 'none',
          userSelect: 'none'
        }}
        draggable={false}
      />

      <div className="swipe-card-overlay" />

      {/* Top badges */}
      <div
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          right: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}
      >
        <span
          className="badge"
          style={{
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(8px)'
          }}
        >
          <Eye size={10} /> {product.views}
        </span>

        <span
          className="badge"
          style={{
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(8px)',
            borderColor: `${CONDITIONS_COLOR[product.condition]}40`
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: CONDITIONS_COLOR[product.condition],
              display: 'inline-block'
            }}
          />

          <span
            style={{
              color: CONDITIONS_COLOR[product.condition],
              fontSize: 10
            }}
          >
            {CONDITIONS_LABEL[product.condition]}
          </span>
        </span>
      </div>

      {/* Body */}
      <div className="swipe-card-body">
        <div className="swipe-card-price">
          {formatPrice(product.price, product.currency)}
        </div>

        <div className="swipe-card-title">
          {product.title}
        </div>

        <div
          className="swipe-card-meta"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginTop: 6
          }}
        >
          <MapPin size={12} />
          {product.location}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/product/${product.id}`);
          }}
          className="btn btn-glass btn-sm"
          style={{
            marginTop: 12,
            width: '100%',
            justifyContent: 'center'
          }}
        >
          <Info size={14} /> View details
        </button>
      </div>
    </div>
  );
}

export default function SwipePage() {
  const router = useRouter();
  const { toggle } = useFavorites();
  const { show } = useToast();

  const [cards, setCards] = useState(
    MOCK_PRODUCTS.map(p => p.id)
  );

  const [offset, setOffset] = useState({
    x: 0,
    y: 0
  });

  const [gone, setGone] = useState([]);

  const topId = cards.find(id => !gone.includes(id));
  const topProduct = MOCK_PRODUCTS.find(p => p.id === topId);

  const visible = cards
    .filter(id => !gone.includes(id))
    .slice(0, 3);

  const dismissTop = (dir) => {
    if (!topId) return;

    setGone(g => [...g, topId]);
    setOffset({
      x: 0,
      y: 0
    });

    if (dir === 'right') {
      toggle(topId);
      show('Saved to favorites ♥', 'success');
    } else {
      show('Skipped →', 'default');
    }
  };

  const handleDrag = (dx, dy) => {
    setOffset({
      x: dx,
      y: dy
    });
  };

  const handleDragEnd = (dx) => {
    if (Math.abs(dx) > 80) {
      dismissTop(dx > 0 ? 'right' : 'left');
    } else {
      setOffset({
        x: 0,
        y: 0
      });
    }
  };

  const reset = () => {
    setGone([]);
    setOffset({
      x: 0,
      y: 0
    });
  };

  const likeOpacity = Math.max(
    0,
    Math.min(1, offset.x / 80)
  );

  const nopeOpacity = Math.max(
    0,
    Math.min(1, -offset.x / 80)
  );

  const remaining = cards.length - gone.length;

  return (
    <>
      <main
        className="page-content no-bottom"
        style={{
          position: 'relative',
          zIndex: 1
        }}
      >
        <div
          style={{
            maxWidth: 480,
            margin: '0 auto',
            padding: '16px 20px 0'
          }}
        >

          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 24
            }}
          >
            <div>
              <h1 className="section-title">
                Discover
              </h1>

              <p className="section-subtitle">
                {remaining} product{remaining !== 1 ? 's' : ''} available
              </p>
            </div>

            <button
              className="btn btn-ghost btn-sm"
              onClick={() => router.push('/grid')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              View grid
            </button>
          </div>

          {remaining === 0 ? (
            <div
              className="empty-state glass-card"
              style={{
                borderRadius: 'var(--r-xl)',
                padding: '48px 24px'
              }}
            >
              <div
                style={{
                  fontSize: 48,
                  marginBottom: 12
                }}
              >
                🦝
              </div>

              <div className="empty-title">
                You've seen it all!
              </div>

              <p className="empty-desc">
                You've explored all available products for now
              </p>

              <div
                style={{
                  display: 'flex',
                  gap: 10,
                  marginTop: 16,
                  flexWrap: 'wrap',
                  justifyContent: 'center'
                }}
              >
                <button
                  className="btn btn-primary"
                  onClick={reset}
                >
                  <RefreshCw size={14} /> Start over
                </button>

                <button
                  className="btn btn-ghost"
                  onClick={() => router.push('/favorites')}
                >
                  View saved
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Swipe arena */}
              <div
                className="swipe-arena"
                style={{
                  marginBottom: 0
                }}
              >
                {visible.map((id, idx) => {
                  const product = MOCK_PRODUCTS.find(
                    p => p.id === id
                  );

                  const isTop = idx === 0;
                  const stackScale = 1 - idx * 0.04;
                  const stackY = idx * 12;

                  const transform = isTop
                    ? `translateX(${offset.x}px) translateY(${offset.y * 0.2}px) rotate(${offset.x * 0.06}deg)`
                    : `translateY(${stackY}px) scale(${stackScale})`;

                  const transition =
                    isTop &&
                    (
                      Math.abs(offset.x) > 0 ||
                      Math.abs(offset.y) > 0
                    )
                      ? 'none'
                      : 'transform 0.3s cubic-bezier(0.16,1,0.3,1)';

                  return (
                    <SwipeCard
                      key={id}
                      product={product}
                      isTop={isTop}
                      zIndex={10 - idx}
                      style={{
                        transform,
                        transition
                      }}
                      onDrag={
                        isTop
                          ? handleDrag
                          : null
                      }
                      onDragEnd={
                        isTop
                          ? handleDragEnd
                          : null
                      }
                    />
                  );
                })}

                {/* Indicators */}
                <div
                  className="swipe-indicator like"
                  style={{
                    opacity: likeOpacity
                  }}
                >
                  SAVE
                </div>

                <div
                  className="swipe-indicator nope"
                  style={{
                    opacity: nopeOpacity
                  }}
                >
                  SKIP
                </div>
              </div>

              {/* Actions */}
              <div className="swipe-actions">
                <button
                  className="swipe-action-btn nope"
                  onClick={() => dismissTop('left')}
                  title="Skip"
                >
                  <X size={22} />
                </button>

                <button
                  className="swipe-action-btn info"
                  onClick={() =>
                    topProduct &&
                    router.push(`/product/${topProduct.id}`)
                  }
                  title="View details"
                >
                  <Info size={18} />
                </button>

                <button
                  className="swipe-action-btn like"
                  onClick={() => dismissTop('right')}
                  title="Save"
                >
                  <Heart size={24} />
                </button>

                <button
                  className="swipe-action-btn fav"
                  onClick={reset}
                  title="Start over"
                >
                  <RefreshCw size={18} />
                </button>
              </div>

              {/* Progress */}
              <div
                style={{
                  marginTop: 20,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10
                }}
              >
                <div
                  style={{
                    flex: 1,
                    height: 3,
                    background: 'var(--surface-1)',
                    borderRadius: 'var(--r-full)',
                    overflow: 'hidden'
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      borderRadius: 'var(--r-full)',
                      background:
                        'linear-gradient(90deg,var(--brand-primary),#8B416F)',
                      width: `${(
                        (cards.length - remaining) /
                        cards.length
                      ) * 100}%`,
                      transition:
                        'width 0.4s var(--ease-out)'
                    }}
                  />
                </div>

                <span
                  style={{
                    fontSize: 12,
                    color: 'var(--text-muted)',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {cards.length - remaining}/{cards.length}
                </span>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}