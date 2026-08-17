'use client';
import { useRouter } from 'next/navigation';
import { Heart, Search } from 'lucide-react';

import ProductCard from '@/components/products/ProductCard';
import { useFavorites } from '@/store/AppStore';

export default function FavoritesPage() {
  const router = useRouter();
  const { favProducts } = useFavorites();

  return (
    <>
      
      <main className="page-content" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px 0' }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h1 className="section-title">Saved</h1>
              <p className="section-subtitle">{favProducts.length} article{favProducts.length !== 1 ? 's' : ''} saved</p>
            </div>
            {favProducts.length > 0 && (
              <div className="badge badge-red">
                <Heart size={10} fill="currentColor" /> {favProducts.length}
              </div>
            )}
          </div>

          {favProducts.length > 0 ? (
            <div className="products-grid">
              {favProducts.map((p, i) => (
                <ProductCard key={p.id} product={p} style={{ animationDelay: `${i * 50}ms`, animation: 'fadeUp 0.4s var(--ease-out) both' }} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon" style={{ background: 'rgba(224,26,79,0.08)', color: 'var(--brand-red)' }}>
                <Heart size={28} />
              </div>
              <div className="empty-title">No Saved Items</div>
              <p className="empty-desc">Save products to find them quickly later</p>
              <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
                <button className="btn btn-primary" onClick={() => router.push('/grid')}>
                  <Search size={14} /> Explore Products
                </button>
                <button className="btn btn-ghost" onClick={() => router.push('/swipe')}>
                  Swipe Mode
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
