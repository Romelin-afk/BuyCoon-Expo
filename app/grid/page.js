'use client';
import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, X } from 'lucide-react';

import ProductCard from '@/components/products/ProductCard';
import { CATEGORIES, CONDITIONS } from '@/lib/data';
import { supabase } from '@/lib/supabase';

const SORT_OPTIONS = [
  { id: 'recent', label: 'Most recent' },
  { id: 'precio-asc', label: 'Lowest price' },
  { id: 'precio-desc', label: 'Highest price' },
  { id: 'popular', label: 'Most viewed' },
];

function GridContent() {
  const searchParams = useSearchParams();
  const initialCat = searchParams.get('cat') || 'all';

  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setProducts(data); });
  }, []);

  const [activeCategory, setActiveCategory] = useState(initialCat);
  const [activeCondition, setActiveCondition] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let list = [...products];

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(p =>
        (p.title || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.tags || []).some(t => t.includes(q))
      );
    }
    if (activeCategory !== 'all') list = list.filter(p => p.category === activeCategory);
    if (activeCondition !== 'all') list = list.filter(p => p.condition === activeCondition);
    list = list.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    switch (sortBy) {
      case 'precio-asc':  list.sort((a, b) => a.price - b.price); break;
      case 'precio-desc': list.sort((a, b) => b.price - a.price); break;
      case 'popular':     list.sort((a, b) => (b.views || 0) - (a.views || 0)); break;
      default:            list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    return list;
  }, [products, query, activeCategory, activeCondition, sortBy, priceRange]);

  const clearFilters = () => {
    setQuery(''); setActiveCategory('all'); setActiveCondition('all');
    setSortBy('recent'); setPriceRange([0, 5000]);
  };

  const hasFilters = query || activeCategory !== 'all' || activeCondition !== 'all' || sortBy !== 'recent';

  return (
    <>
      <main className="page-content" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 20px 0' }}>

          {/* Header */}
          <div style={{ marginBottom: 20 }}>
            <h1 className="section-title">Explore</h1>
            <p className="section-subtitle">{filtered.length} listings available</p>
          </div>

          {/* Search bar */}
          <div className="search-bar" style={{ marginBottom: 14 }}>
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search products, brands, categories..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            {query && (
              <button onClick={() => setQuery('')} style={{ color: 'var(--text-muted)', display: 'flex' }}>
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter bar — scrolleable horizontal */}
          <div
            style={{
              display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center',
              overflowX: 'auto', paddingBottom: 4, WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
            }}
            className="category-scroll-row"
          >
            <button
              className={`filter-chip${showFilters ? ' active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
              style={{ flexShrink: 0 }}
            >
              <SlidersHorizontal size={13} />
              Filters
            </button>

            <div style={{ display: 'flex', flexWrap: 'nowrap', gap: 8, flexShrink: 0 }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  className={`filter-chip${activeCategory === cat.id ? ' active' : ''}`}
                  onClick={() => setActiveCategory(cat.id)}
                  style={{ flexShrink: 0, whiteSpace: 'nowrap' }}
                >
                  {cat.id !== 'all' && <span style={{ fontSize: 12 }}>{cat.icon}</span>}
                  {cat.label}
                </button>
              ))}
            </div>

            {hasFilters && (
              <button className="filter-chip" onClick={clearFilters} style={{ flexShrink: 0, color: 'var(--brand-red)', borderColor: 'rgba(224,26,79,0.2)' }}>
                <X size={12} /> Clear
              </button>
            )}
          </div>

          {/* Expanded filter panel */}
          {showFilters && (
            <div className="glass-card anim-fade-up" style={{ borderRadius: 'var(--r-lg)', padding: '20px', marginBottom: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20 }}>

                <div>
                  <label className="input-label">Condition</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <button
                      className={`filter-chip${activeCondition === 'all' ? ' active' : ''}`}
                      onClick={() => setActiveCondition('all')}
                      style={{ justifyContent: 'flex-start', width: '100%' }}
                    >
                      All Conditions
                    </button>
                    {CONDITIONS.map(c => (
                      <button
                        key={c.id}
                        className={`filter-chip${activeCondition === c.id ? ' active' : ''}`}
                        onClick={() => setActiveCondition(c.id)}
                        style={{ justifyContent: 'flex-start', width: '100%' }}
                      >
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="input-label">Sort by</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {SORT_OPTIONS.map(s => (
                      <button
                        key={s.id}
                        className={`filter-chip${sortBy === s.id ? ' active' : ''}`}
                        onClick={() => setSortBy(s.id)}
                        style={{ justifyContent: 'flex-start', width: '100%' }}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="input-label">Maximum Price: ${priceRange[1]}</label>
                  <input
                    type="range"
                    min={0} max={5000} step={50}
                    value={priceRange[1]}
                    onChange={e => setPriceRange([0, Number(e.target.value)])}
                    style={{ width: '100%', accentColor: 'var(--brand-primary)' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                    <span>$0</span><span>$5,000</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          {filtered.length > 0 ? (
            <div className="products-grid" style={{ paddingBottom: 8 }}>
              {filtered.map((p, i) => (
                <ProductCard key={p.id} product={p} style={{ animationDelay: `${i * 40}ms`, animation: 'fadeUp 0.4s var(--ease-out) both' }} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon" style={{ width: 80, height: 80, fontSize: 32 }}>🔍</div>
              <div className="empty-title">No results found</div>
              <p className="empty-desc">Try different keywords or remove some filters</p>
              <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={clearFilters}>
                Clear filters
              </button>
            </div>
          )}
        </div>
      </main>

      <style>{`
        .category-scroll-row::-webkit-scrollbar { display: none; }
      `}</style>
    </>
  );
}

export default function GridPage() {
  return <Suspense fallback={<div style={{padding:40,textAlign:"center",color:"var(--text-muted)"}}>Loading...</div>}><GridContent /></Suspense>;
}