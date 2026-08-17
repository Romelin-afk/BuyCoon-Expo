'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Heart,
  Flag,
  Share2,
  MapPin,
  Eye,
  ArrowLeft,
  Star,
  MessageCircle,
  ShieldCheck
} from 'lucide-react';

import { useUser } from '@/store/AppStore';
import { supabase } from '@/lib/supabase';
import PurchaseConfirmation from "@/components/PurchaseConfirmation";
import ReportModal from '@/components/modals/ReportModal';
import PaymentModal from "@/components/PaymentModal/PaymentModal.jsx";
import { formatPrice, CATEGORIES } from '@/lib/data';
import { useFavorites, useToast } from '@/store/AppStore';

const CONDITIONS_COLOR = {
  nuevo: '#34d399',
  excelente: '#60a5fa',
  bueno: '#716BC9',
  regular: '#fbbf24',
  'para-piezas': '#E01A4F',
};

const CONDITIONS_LABEL = {
  nuevo: 'New',
  excelente: 'Excellent',
  bueno: 'Good',
  regular: 'Fair',
  'para-piezas': 'For parts',
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [seller, setSeller] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  const { isFav, toggle } = useFavorites();
  const { show } = useToast();
  const { user } = useUser();

  const [activeImg, setActiveImg] = useState(0);
  const [showReport, setShowReport] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);

      const { data: prod, error } = await supabase
        .from('products')
        .select('*, profiles:seller_id(*)')
        .eq('id', params.id)
        .single();

      if (!error && prod) {
        setProduct(prod);
        setSeller(prod.profiles ?? null);

        const { data: rel } = await supabase
          .from('products')
          .select('*')
          .eq('category', prod.category)
          .neq('id', prod.id)
          .limit(4);

        setRelated(rel ?? []);
      } else {
        setProduct(null);
      }

      setLoading(false);
    }

    load();
  }, [params.id]);

  if (loading) {
    return (
      <main className="page-content">
        <div className="empty-state">Loading...</div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="page-content">
        <div className="empty-state">
          <div
            className="empty-icon"
            style={{ fontSize: 32 }}
          >
            🔍
          </div>

          <div className="empty-title">
            Product not found
          </div>

          <button
            className="btn btn-primary"
            onClick={() => router.push('/grid')}
          >
            Return to catalog
          </button>
        </div>
      </main>
    );
  }

  const fav = isFav(product.id);

  const catLabel = CATEGORIES.find(
    c => c.id === product.category
  )?.label;

  const handleFav = () => {
    toggle(product.id);

    show(
      fav
        ? 'Removed from favorites'
        : 'Added to favorites',
      fav ? 'default' : 'success'
    );
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: product.title,
        url: window.location.href
      });
    } catch {
      await navigator.clipboard.writeText(
        window.location.href
      );

      show(
        'Link copied to clipboard',
        'success'
      );
    }
  };

  return (
    <>
      <main
        className="page-content"
        style={{
          position: 'relative',
          zIndex: 1
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            padding: '16px 20px 0'
          }}
        >

          {/* Back */}
          <button
            className="btn btn-ghost btn-sm"
            style={{
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
            onClick={() => router.back()}
          >
            <ArrowLeft size={14} />
            Return
          </button>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'minmax(0, 1.1fr) minmax(0, 0.9fr)',
              gap: 32,
              alignItems: 'start'
            }}
          >

            {/* ── LEFT: Gallery ── */}
            <div>

              <div
                style={{
                  borderRadius: 'var(--r-xl)',
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                <img
                  src={product.images[activeImg]}
                  alt={product.title}
                  style={{
                    width: '100%',
                    aspectRatio: '4/3',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />

                <div
                  style={{
                    position: 'absolute',
                    top: 14,
                    right: 14,
                    display: 'flex',
                    gap: 8
                  }}
                >
                  <button
                    className={`fav-btn${fav ? ' active' : ''}`}
                    style={{
                      position: 'static',
                      width: 38,
                      height: 38
                    }}
                    onClick={handleFav}
                  >
                    <Heart
                      size={15}
                      fill={
                        fav
                          ? 'currentColor'
                          : 'none'
                      }
                    />
                  </button>

                  <button
                    className="fav-btn"
                    style={{
                      position: 'static',
                      width: 38,
                      height: 38
                    }}
                    onClick={handleShare}
                  >
                    <Share2 size={15} />
                  </button>
                </div>
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div
                  className="product-gallery-thumbs"
                  style={{ marginTop: 10 }}
                >
                  {product.images.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt=""
                      className={`gallery-thumb${
                        activeImg === i
                          ? ' active'
                          : ''
                      }`}
                      onClick={() =>
                        setActiveImg(i)
                      }
                    />
                  ))}
                </div>
              )}

              {/* Tags */}
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  flexWrap: 'wrap',
                  marginTop: 14
                }}
              >
                {product.tags?.map(tag => (
                  <span
                    key={tag}
                    className="badge badge-primary"
                    style={{ fontSize: 11 }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* ── RIGHT: Info ── */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 16
              }}
            >

              {/* Price + title */}
              <div>

                <div
                  style={{
                    display: 'flex',
                    gap: 8,
                    flexWrap: 'wrap',
                    marginBottom: 10,
                    alignItems: 'center'
                  }}
                >
                  <span className="badge badge-primary">
                    {catLabel}
                  </span>

                  <span
                    className="badge"
                    style={{
                      background: `${CONDITIONS_COLOR[product.condition]}15`,
                      color:
                        CONDITIONS_COLOR[
                          product.condition
                        ],
                      border: `1px solid ${CONDITIONS_COLOR[product.condition]}30`
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background:
                          CONDITIONS_COLOR[
                            product.condition
                          ],
                        display: 'inline-block'
                      }}
                    />

                    {
                      CONDITIONS_LABEL[
                        product.condition
                      ]
                    }
                  </span>
                </div>

                <h1
                  style={{
                    fontFamily:
                      'var(--font-display)',
                    fontSize:
                      'clamp(20px, 3vw, 28px)',
                    fontWeight: 800,
                    lineHeight: 1.2,
                    marginBottom: 8
                  }}
                >
                  {product.title}
                </h1>

                <div
                  style={{
                    fontFamily:
                      'var(--font-display)',
                    fontSize:
                      'clamp(28px, 4vw, 38px)',
                    fontWeight: 900,
                    background:
                      'linear-gradient(135deg,#fff,#9b97d9)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor:
                      'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  {formatPrice(
                    product.price,
                    product.currency
                  )}
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: 16,
                    marginTop: 10,
                    fontSize: 12,
                    color: 'var(--text-muted)'
                  }}
                >
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <MapPin size={12} />
                    {product.location}
                  </span>

                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <Eye size={12} />
                    {product.views} views
                  </span>

                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <Heart size={12} />
                    {product.favorites}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div
                className="glass-card"
                style={{
                  borderRadius: 'var(--r-lg)',
                  padding: '16px'
                }}
              >
                <h3
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: 8
                  }}
                >
                  Description
                </h3>

                <p
                  style={{
                    fontSize: 14,
                    color: 'var(--text-secondary)',
                    lineHeight: 1.6
                  }}
                >
                  {product.description}
                </p>
              </div>

              {/* Seller */}
              {seller && (
                <div className="seller-card glass-card">
                  <img
                    src={seller.avatar_url}
                    alt={seller.full_name}
                    className="seller-avatar"
                  />

                  <div
                    style={{
                      flex: 1,
                      minWidth: 0
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: 14
                        }}
                      >
                        {seller.full_name}
                      </span>

                      {seller.verified && (
                        <ShieldCheck
                          size={14}
                          style={{
                            color: '#34d399',
                            flexShrink: 0
                          }}
                        />
                      )}
                    </div>

                    <div
                      style={{
                        fontSize: 12,
                        color: 'var(--text-muted)',
                        marginTop: 2
                      }}
                    >
                      @{seller.username}
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        gap: 10,
                        marginTop: 4,
                        fontSize: 11,
                        color: 'var(--text-muted)'
                      }}
                    >
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 3
                        }}
                      >
                        <Star
                          size={10}
                          style={{
                            color: '#fbbf24'
                          }}
                        />
                        {seller.rating}
                      </span>

                      <span>
                        {seller.total_sales} sales
                      </span>

                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 3
                        }}
                      >
                        <MapPin size={10} />
                        {seller.location}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Trust badges */}
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  flexWrap: 'wrap'
                }}
              >
                <div
                  className="badge badge-success"
                  style={{ fontSize: 11 }}
                >
                  <ShieldCheck size={10} />
                  Verified seller
                </div>

                <div
                  className="badge badge-primary"
                  style={{ fontSize: 11 }}
                >
                  🔒 Secure transaction
                </div>
              </div>

              {/* CTA buttons */}
              <div
                style={{
                  display: 'flex',
                  gap: 10
                }}
              >
                <button
                  className="btn btn-primary w-full btn-lg"
                  onClick={() =>
                    setShowConfirm(true)
                  }
                >
                  <MessageCircle size={16} />
                  Buy
                </button>

                <button
                  className={`btn btn-ghost btn-icon btn-lg${
                    fav ? ' btn-glass' : ''
                  }`}
                  onClick={handleFav}
                  style={{
                    flexShrink: 0,
                    color: fav
                      ? 'var(--brand-red)'
                      : undefined
                  }}
                >
                  <Heart
                    size={18}
                    fill={
                      fav
                        ? 'currentColor'
                        : 'none'
                    }
                  />
                </button>
              </div>

              {/* Report link */}
              <button
                onClick={() =>
                  setShowReport(true)
                }
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 12,
                  color: 'var(--text-muted)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  alignSelf: 'flex-start'
                }}
              >
                <Flag size={12} />
                Report this listing
              </button>
            </div>
          </div>
        </div>

        {/* Related products */}
        <div
          style={{
            maxWidth: 1100,
            margin: '32px auto 0',
            padding: '0 20px'
          }}
        >
          <h2
            className="section-title"
            style={{ marginBottom: 16 }}
          >
            You might also be interested in
          </h2>

          <div className="products-grid">
            {related.map(p => (
              <button
                key={p.id}
                className="product-card glass-card"
                style={{
                  padding: 0,
                  textAlign: 'left',
                  cursor: 'pointer',
                  border: 'none'
                }}
                onClick={() =>
                  router.push(
                    `/product/${p.id}`
                  )
                }
              >
                <div
                  style={{
                    overflow: 'hidden',
                    borderRadius:
                      '16px 16px 0 0'
                  }}
                >
                  <img
                    src={p.images[0]}
                    alt={p.title}
                    className="product-card-img"
                  />
                </div>

                <div className="product-card-body">
                  <div className="product-card-price">
                    {formatPrice(p.price)}
                  </div>

                  <div className="product-card-title">
                    {p.title}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>

      {showReport && (
        <ReportModal
          productTitle={product.title}
          onClose={() =>
            setShowReport(false)
          }
        />
      )}

      {showModal && (
        <PaymentModal
          product={{
            id: product.id,
            title: product.title,
            image: product.images[0],
            price: product.price
          }}
          onClose={() =>
            setShowModal(false)
          }
        />
      )}

      <PurchaseConfirmation
        isOpen={showConfirm}
        onClose={() =>
          setShowConfirm(false)
        }
        product={{
          id: product.id,
          title: product.title,
          price: product.price,
          seller_id: product.seller_id
        }}
        buyer={user}
        onSuccess={(txId) =>
          router.push(`/orders/${txId}`)
        }
      />
    </>
  );
}