'use client';
import { useRouter } from 'next/navigation';
import { Zap, Grid3x3, Map, ArrowRight, ShieldCheck, Leaf, RefreshCw, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import ProductCard from '@/components/products/ProductCard';
import { MOCK_PRODUCTS, CATEGORIES, getFeatured, getTrending, getLowCost, formatPrice } from '@/lib/data';
import { useAuth } from '@/store/AppStore';
import { useTheme } from '@/store/ThemeStore';

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const featured = getFeatured().slice(0, 4);
  const trending  = getTrending().slice(0, 6);
  const lowCost   = getLowCost().slice(0, 4);

  return (
    <main className="page-content" style={{ position: 'relative', zIndex: 1 }}>

      {/* ── HERO ─────────────────────────────────────── */}
      <section style={{ padding: '48px 20px 36px', maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
        <div className="glow-orb glow-orb-primary" style={{ width: 500, height: 400, top: -100, left: -100, opacity: 0.55 }} />
        <div className="glow-orb glow-orb-plum"    style={{ width: 350, height: 280, top: 60, right: -80, opacity: 0.45 }} />

        <div className="anim-fade-up" style={{ maxWidth: 680, position: 'relative', zIndex: 1 }}>
          {/* Logo + headline side by side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 22 }}>
            <div style={{ flexShrink: 0 }}>
              <Image
                src={isDark ? '/logos/logo-white.png' : '/logos/logo-black.png'}
                alt="BuyCoon!"
                width={200} height={60}
                style={{ objectFit: 'contain', filter: isDark ? 'drop-shadow(0 0 24px rgba(113,107,201,0.5))' : 'none' }}
              />
            </div>
          </div>

          <h1 className="hero-gradient-text" style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(36px, 5.5vw, 64px)',
            fontWeight: 800, lineHeight: 1.06,
            letterSpacing: '-1.5px', marginBottom: 20,
          }}>
            Buy & sell<br />what you no<br />longer need
          </h1>

          <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.65, maxWidth: 480, marginBottom: 30 }}>
            Premium secondhand marketplace connecting buyers and sellers across Panama. Real deals. Real people.
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-lg" onClick={() => router.push('/grid')}
              style={{ boxShadow: '0 8px 32px rgba(113,107,201,0.45)', fontSize: 15 }}>
              Browse products <ArrowRight size={18} />
            </button>
            <button className="btn btn-liquid btn-lg" onClick={() => router.push('/publish')}>
              Start selling
            </button>
          </div>
        </div>
      </section>

      {/* ── QUICK ACCESS ──────────────────────────────── */}
      <section style={{ padding: '0 20px 32px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 12 }}>
          {[
            { icon: Zap,     label: 'Swipe Mode',   sub: 'Discover in seconds',  href: '/swipe', color: '#716BC9' },
            { icon: Grid3x3, label: 'Browse Grid',  sub: 'Full catalog view',    href: '/grid',  color: '#8686B8' },
            { icon: Map,     label: 'Map',          sub: 'Products near you',    href: '/map',   color: '#8B416F' },
          ].map(a => {
            const Icon = a.icon;
            return (
              <button key={a.href} className="liquid-card" style={{ padding: '20px', borderRadius: 'var(--r-lg)', cursor: 'pointer', textAlign: 'left', border: 'none' }}
                onClick={() => router.push(a.href)}>
                <div className="shimmer-line" />
                <div style={{ width: 44, height: 44, borderRadius: 13, background: `${a.color}18`, border: `1px solid ${a.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: a.color, marginBottom: 13 }}>
                  <Icon size={19} />
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, marginBottom: 3 }}>{a.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{a.sub}</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── CATEGORIES ────────────────────────────────── */}
      <section style={{ padding: '0 20px 32px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h2 className="section-title">Categories</h2>
          <button className="btn btn-ghost btn-sm" onClick={() => router.push('/grid')}>See all <ArrowRight size={12} /></button>
        </div>
        <div className="filter-bar">
          {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
            <button key={cat.id} className="filter-chip" onClick={() => router.push(`/grid?cat=${cat.id}`)}>
              <span>{cat.icon}</span> {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* ── FEATURED ──────────────────────────────────── */}
      <section style={{ padding: '0 20px 32px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h2 className="section-title">Featured</h2>
          <button className="btn btn-ghost btn-sm" onClick={() => router.push('/grid')}>More <ArrowRight size={12} /></button>
        </div>
        <div className="products-grid">
          {featured.map((p, i) => (
            <ProductCard key={p.id} product={p} style={{ animationDelay: `${i * 55}ms` }} />
          ))}
        </div>
      </section>

      {/* ── ANNOUNCEMENT BANNER ───────────────────────── */}
      <section style={{ padding: '0 20px 32px', maxWidth: 1200, margin: '0 auto' }}>
        <div className="ultra-glass" style={{
          borderRadius: 'var(--r-xl)', overflow: 'hidden', position: 'relative',
          background: 'linear-gradient(120deg, rgba(113,107,201,0.18) 0%, rgba(139,65,111,0.14) 50%, rgba(224,26,79,0.10) 100%)',
          padding: '28px 32px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap',
        }}>
          <div className="shimmer-line" />
          <div className="glow-orb glow-orb-primary" style={{ width: 250, height: 200, top: -60, left: -40 }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>
              💜 Premium experience · Low prices
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 800, lineHeight: 1.2 }}>
              Great finds don't have<br />to be expensive
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8 }}>
              From $8 to $11K — every budget, every category.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, position: 'relative', zIndex: 1 }}>
            <button className="btn btn-primary" onClick={() => router.push('/grid?sort=price-asc')}>
              Shop deals <ArrowRight size={14} />
            </button>
            <button className="btn btn-liquid" onClick={() => router.push('/swipe')}>
              Try Swipe
            </button>
          </div>
        </div>
      </section>

      {/* ── TRENDING ──────────────────────────────────── */}
      <section style={{ padding: '0 20px 32px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h2 className="section-title">Trending now</h2>
            <TrendingUp size={15} style={{ color: 'var(--brand-primary)' }} />
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => router.push('/grid')}>See all <ArrowRight size={12} /></button>
        </div>
        <div className="rec-strip">
          {trending.map(p => (
            <div key={p.id} className="rec-card liquid-card" onClick={() => router.push(`/product/${p.id}`)}>
              <div className="shimmer-line" />
              <div style={{ position: 'relative', overflow: 'hidden' }}>
                <img src={p.images[0]} alt={p.title} style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 55%)' }} />
                <div style={{ position: 'absolute', bottom: 8, left: 10 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, color: 'white' }}>{formatPrice(p.price)}</span>
                </div>
              </div>
              <div style={{ padding: '10px 12px 12px' }}>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>{p.title}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── LOW-COST DEALS ────────────────────────────── */}
      <section style={{ padding: '0 20px 32px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 className="section-title">Under $50</h2>
              <span className="badge badge-red" style={{ fontSize: 10 }}>🔥 Hot deals</span>
            </div>
            <p className="section-subtitle">Premium experience at low cost</p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => router.push('/grid?maxprice=50')}>More deals <ArrowRight size={12} /></button>
        </div>
        <div className="products-grid">
          {lowCost.map((p, i) => (
            <ProductCard key={p.id} product={p} style={{ animationDelay: `${i * 55}ms` }} />
          ))}
        </div>
      </section>

      {/* ── VALUE PROPS ───────────────────────────────── */}
      <section style={{ padding: '0 20px 36px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 12 }}>
          {[
            { icon: ShieldCheck, color: '#34d399', title: 'Verified sellers',    body: 'Every seller is reviewed so you buy with confidence.' },
            { icon: Leaf,        color: '#a78bfa', title: 'Eco-conscious',       body: 'Give items a second life and help reduce waste.' },
            { icon: RefreshCw,   color: '#f59e0b', title: 'Zero commissions',   body: 'Direct connection. No middlemen. No fees. Ever.' },
          ].map(v => {
            const Icon = v.icon;
            return (
              <div key={v.title} className="ultra-glass" style={{ padding: '24px', borderRadius: 'var(--r-lg)', position: 'relative', overflow: 'hidden' }}>
                <div className="shimmer-line" />
                <div style={{ width: 44, height: 44, borderRadius: 13, background: `${v.color}12`, border: `1px solid ${v.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: v.color, marginBottom: 14 }}>
                  <Icon size={19} />
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, marginBottom: 7 }}>{v.title}</h3>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{v.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────── */}
      {!user && (
        <section style={{ padding: '0 20px 52px', maxWidth: 1200, margin: '0 auto' }}>
          <div className="ultra-glass" style={{
            borderRadius: 'var(--r-xl)', padding: '44px 32px', textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(113,107,201,0.14), rgba(139,65,111,0.10))',
            position: 'relative', overflow: 'hidden',
          }}>
            <div className="shimmer-line" />
            <div className="glow-orb glow-orb-primary" style={{ width: 300, height: 200, top: -60, left: -60 }} />
            <div className="glow-orb glow-orb-plum" style={{ width: 200, height: 160, bottom: -40, right: -40 }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <Image src={isDark ? '/logos/icon-white.png' : '/logos/icon-dark.png'} alt="BuyCoon!" width={52} height={52}
                style={{ margin: '0 auto 18px', filter: isDark ? 'drop-shadow(0 0 20px rgba(113,107,201,0.6))' : 'none' }} />
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, marginBottom: 10 }}>Join BuyCoon!</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 15, marginBottom: 26, maxWidth: 360, margin: '0 auto 26px' }}>
                Free account. Premium experience. Start buying or selling in minutes.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="btn btn-primary btn-lg" onClick={() => router.push('/auth/register')}
                  style={{ boxShadow: '0 8px 32px rgba(113,107,201,0.4)' }}>
                  Create free account
                </button>
                <button className="btn btn-liquid btn-lg" onClick={() => router.push('/auth/login')}>
                  Sign in
                </button>
              </div>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
