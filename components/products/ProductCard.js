'use client';
import { useRouter } from 'next/navigation';
import { Heart, MapPin, Eye } from 'lucide-react';
import { useFavorites, useToast } from '@/store/AppStore';
import { formatPrice } from '@/lib/data';

export default function ProductCard({ product, style }) {
  const router = useRouter();
  const { isFav, toggle } = useFavorites();
  const { show } = useToast();
  const fav = isFav(product.id);

  const conditionColors = {
    nuevo: '#34d399',
    excelente: '#60a5fa',
    bueno: '#716BC9',
    regular: '#fbbf24',
    'para-piezas': '#E01A4F',
  };

  const conditionLabels = {
    nuevo: 'New',
    excelente: 'Excellent',
    bueno: 'Good',
    regular: 'Fair',
    'para-piezas': 'For parts',
  };

  const handleFav = (e) => {
    e.stopPropagation();
    toggle(product.id);
    show(
      fav ? 'Removed from saved' : 'Saved ✦',
      fav ? 'default' : 'success'
    );
  };

  return (
    <div
      className="product-card glass-card"
      style={style}
      onClick={() => router.push(`/product/${product.id}`)}
    >
      {/* Image */}
      <div
        className="overflow-hidden relative"
        style={{ borderRadius: '16px 16px 0 0' }}
      >
        <img
          src={product.images[0]}
          alt={product.title}
          className="product-card-img"
          loading="lazy"
        />

        {/* Favorite button */}
        <button
          className={`fav-btn${fav ? ' active' : ''}`}
          onClick={handleFav}
          aria-label={fav ? 'Remove from favorites' : 'Save'}
        >
          <Heart size={14} fill={fav ? 'currentColor' : 'none'} />
        </button>

        {/* Condition badge */}
        <div style={{ position: 'absolute', bottom: 10, left: 10 }}>
          <span
            className="badge"
            style={{
              background: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(8px)',
              border: `1px solid ${conditionColors[product.condition]}30`,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: conditionColors[product.condition],
                display: 'inline-block',
              }}
            />

            <span
              style={{
                color: conditionColors[product.condition],
                fontSize: 10,
              }}
            >
              {conditionLabels[product.condition]}
            </span>
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="product-card-body">
        <div className="product-card-price">
          {formatPrice(product.price, product.currency)}
        </div>

        <div className="product-card-title">
          {product.title}
        </div>

        <div className="product-card-meta">
          <MapPin size={10} />

          <span
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {product.location}
          </span>

          <span
            style={{
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: 3,
            }}
          >
            <Eye size={10} />
            {product.views}
          </span>
        </div>
      </div>
    </div>
  );
}