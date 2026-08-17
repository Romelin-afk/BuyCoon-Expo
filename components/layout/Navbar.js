'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Home, Grid3x3, Zap, Map, Plus,
  Search, X, Sun, Moon, ArrowRight, MessageCircle,
} from 'lucide-react';
import { useAuth } from '@/store/AppStore';
import { useTheme } from '@/store/ThemeStore';
import { MOCK_PRODUCTS, formatPrice } from '@/lib/data';

// Bottom nav: 5 slots total (2 + publish + 2)
const NAV_ITEMS = [
  { href: '/',        label: 'Home',   icon: Home },
  { href: '/grid',    label: 'Browse', icon: Grid3x3 },
  { href: '/swipe',   label: 'Swipe',  icon: Zap },
  { href: '/chats',   label: 'Chats',  icon: MessageCircle },
];

export default function Navbar() {
  const pathname  = usePathname();
  const router    = useRouter();
  const { user }  = useAuth();
  const { toggle, isDark } = useTheme();

  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery]           = useState('');
  const [hidden, setHidden]         = useState(false);
  const searchInputRef = useRef(null);
  const lastY          = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (y < 80)                   setHidden(false);
      else if (y > lastY.current + 6) setHidden(true);
      else if (y < lastY.current - 4) setHidden(false);
      lastY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 80);
    else setQuery('');
  }, [searchOpen]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setSearchOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const isAuth = pathname.startsWith('/auth');
  if (isAuth) return null;

  const navigate = (href) => router.push(href);

  const results = query.length > 1
    ? MOCK_PRODUCTS.filter(p =>
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.tags.some(t => t.includes(query.toLowerCase()))
      ).slice(0, 6)
    : [];

  return (
    <>
      {/* ── TOP NAV ── */}
      <nav className="top-nav" style={{
        display: 'flex', alignItems: 'center', padding: '0 20px', gap: 12,
        transition: 'transform 0.35s cubic-bezier(0.16,1,0.3,1), opacity 0.35s ease',
        transform: hidden ? 'translateY(-100%)' : 'translateY(0)',
        opacity: hidden ? 0 : 1,
        overflow: 'visible',
      }}>
        <button className="top-nav-logo" onClick={() => navigate('/')}
          style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0, background:'transparent', border:'none', cursor:'pointer', padding:0 }}>
          <div style={{ position:'relative', width:28, height:28, flexShrink:0 }}>
            <Image src={isDark ? '/logos/icon-white.png' : '/logos/icon-dark.png'} alt="BuyCoon!" fill
              style={{ objectFit:'contain', filter: isDark ? 'drop-shadow(0 0 8px rgba(113,107,201,0.45))' : 'none', borderRadius:8 }} />
          </div>
          <span className="top-nav-brand" style={{
            fontFamily:'var(--f-dis)', fontWeight:800, fontSize:20,
            background: isDark ? 'linear-gradient(135deg,#fff 0%,#9b97d9 100%)' : 'linear-gradient(135deg,#2d2870 0%,#716BC9 100%)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
          }}>BuyCoon!</span>
        </button>

        <div className="top-nav-actions" style={{ display:'flex', alignItems:'center', gap:8, marginLeft:'auto', flexShrink:0 }}>
          {/* Map */}
          <button onClick={() => navigate('/map')} title="Map" style={{
            width:36, height:36, borderRadius:'var(--r-md)',
            display:'flex', alignItems:'center', justifyContent:'center',
            background: pathname === '/map' ? 'rgba(113,107,201,0.15)' : 'var(--s1)',
            border:'1px solid var(--b-norm)',
            color: pathname === '/map' ? 'var(--brand)' : 'var(--tx-2)',
            cursor:'pointer', transition:'all 0.25s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background='rgba(113,107,201,0.15)'; e.currentTarget.style.color='var(--brand)'; }}
            onMouseLeave={e => { if (pathname !== '/map') { e.currentTarget.style.background='var(--s1)'; e.currentTarget.style.color='var(--tx-2)'; } }}>
            <Map size={15} />
          </button>

          {/* Search */}
          <button onClick={() => setSearchOpen(true)} style={{
            width:36, height:36, borderRadius:'var(--r-md)',
            display:'flex', alignItems:'center', justifyContent:'center',
            background:'var(--s1)', border:'1px solid var(--b-norm)',
            color:'var(--tx-3)', cursor:'pointer', transition:'all 0.25s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background='var(--s2)'; e.currentTarget.style.borderColor='var(--brand)'; }}
            onMouseLeave={e => { e.currentTarget.style.background='var(--s1)'; e.currentTarget.style.borderColor='var(--b-norm)'; }}>
            <Search size={15} />
          </button>

          {/* Theme toggle */}
          <button onClick={toggle} title={isDark ? 'Light mode' : 'Dark mode'} style={{
            width:36, height:36, borderRadius:'var(--r-md)',
            display:'flex', alignItems:'center', justifyContent:'center',
            background:'var(--s1)', border:'1px solid var(--b-norm)',
            color:'var(--tx-2)', cursor:'pointer', transition:'all 0.25s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background='rgba(113,107,201,0.15)'; e.currentTarget.style.color='var(--brand)'; }}
            onMouseLeave={e => { e.currentTarget.style.background='var(--s1)'; e.currentTarget.style.color='var(--tx-2)'; }}>
            {isDark ? <Sun size={15}/> : <Moon size={15}/>}
          </button>

          {/* Profile / Auth */}
          {user ? (
            <button onClick={() => navigate('/profile')} style={{
              position:'relative', display:'flex', alignItems:'center', gap:8,
              padding:'5px 12px 5px 5px', borderRadius:'var(--r-f)',
              background:'var(--s1)', border:'1px solid var(--b-norm)', cursor:'pointer', transition:'all 0.25s',
            }}
              onMouseEnter={e => e.currentTarget.style.background='var(--s2)'}
              onMouseLeave={e => e.currentTarget.style.background='var(--s1)'}>
              <img src={user.avatar} alt={user.name} style={{ width:26, height:26, borderRadius:'50%', objectFit:'cover', border:'2px solid var(--gl-border)' }} />
              <div style={{ position:'absolute', bottom:0, right:0, width:8, height:8, borderRadius:'50%', background:'#34d399', border:'1.5px solid var(--bg)' }} />
            </button>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/auth/login')}>Sign in</button>
          )}
        </div>
      </nav>

      {/* ── BOTTOM NAV — floating pill, 5 slots ── */}
      <nav className="bottom-nav">
        {NAV_ITEMS.slice(0,2).map(item => <BotItem key={item.href} item={item} active={pathname===item.href} onClick={() => navigate(item.href)} />)}
        <button className="bottom-nav-publish" onClick={() => navigate('/publish')} aria-label="Sell"><Plus size={22} strokeWidth={2.5}/></button>
        {NAV_ITEMS.slice(2).map(item => <BotItem key={item.href} item={item} active={pathname===item.href} onClick={() => navigate(item.href)} />)}
      </nav>

      {/* ── SEARCH OVERLAY ── */}
      {searchOpen && (
        <>
          <div onClick={() => setSearchOpen(false)} style={{
            position:'fixed', inset:0, zIndex:998,
            background:'rgba(0,0,0,0.45)', backdropFilter:'blur(6px)', WebkitBackdropFilter:'blur(6px)',
            animation:'fadeIn 0.2s ease both',
          }} />
          <div style={{
            position:'fixed', top:'calc(var(--ann-h,48px) + 8px)', left:'50%',
            transform:'translateX(-50%)', width:'92%', maxWidth:640, zIndex:999,
            borderRadius:'var(--r-xl)', overflow:'hidden',
            animation:'searchDrop 0.35s cubic-bezier(0.16,1,0.3,1) both',
            background: isDark ? 'rgba(14,12,28,0.90)' : 'rgba(248,247,255,0.94)',
            backdropFilter:'blur(40px) saturate(220%)', WebkitBackdropFilter:'blur(40px) saturate(220%)',
            border:'1px solid rgba(113,107,201,0.25)', borderTop:'1px solid rgba(255,255,255,0.18)',
            boxShadow:'0 32px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.12)',
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 18px', borderBottom:'1px solid rgba(113,107,201,0.12)' }}>
              <Search size={18} style={{ color:'var(--brand)', flexShrink:0 }} />
              <input ref={searchInputRef} type="text" placeholder="Search for anything in BuyCoon!..."
                value={query} onChange={e => setQuery(e.target.value)}
                onKeyDown={e => { if(e.key==='Enter' && query.trim()){ navigate(`/grid?q=${encodeURIComponent(query)}`); setSearchOpen(false); } }}
                style={{ flex:1, background:'none', border:'none', outline:'none', fontSize:16, color:'var(--tx)', fontFamily:'var(--f-bod)' }} />
              <button onClick={() => query ? setQuery('') : setSearchOpen(false)}
                style={{ color:'var(--tx-3)', display:'flex', flexShrink:0, background:'none', border:'none', cursor:'pointer' }}>
                <X size={16}/>
              </button>
            </div>

            {query.length > 1 ? (
              <div style={{ maxHeight:340, overflowY:'auto' }}>
                {results.length > 0 ? (
                  <>
                    {results.map((p,i) => (
                      <button key={p.id} onClick={() => { navigate(`/product/${p.id}`); setSearchOpen(false); }}
                        style={{ width:'100%', display:'flex', alignItems:'center', gap:12, padding:'10px 18px', border:'none', background:'none', cursor:'pointer', textAlign:'left', borderBottom: i<results.length-1 ? '1px solid rgba(113,107,201,0.07)' : 'none', transition:'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background='rgba(113,107,201,0.08)'}
                        onMouseLeave={e => e.currentTarget.style.background='none'}>
                        <img src={p.images[0]} alt={p.title} style={{ width:44, height:44, borderRadius:10, objectFit:'cover', flexShrink:0 }} />
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontWeight:600, fontSize:14, color:'var(--tx)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.title}</div>
                          <div style={{ fontSize:12, color:'var(--tx-3)', marginTop:2 }}>{p.location}</div>
                        </div>
                        <div style={{ fontFamily:'var(--f-dis)', fontWeight:800, fontSize:15, color:'var(--brand)', flexShrink:0 }}>{formatPrice(p.price)}</div>
                      </button>
                    ))}
                    <button onClick={() => { navigate(`/grid?q=${encodeURIComponent(query)}`); setSearchOpen(false); }}
                      style={{ width:'100%', padding:'12px 18px', display:'flex', alignItems:'center', justifyContent:'center', gap:8, fontSize:13, fontWeight:600, color:'var(--brand)', border:'none', background:'rgba(113,107,201,0.06)', cursor:'pointer', borderTop:'1px solid rgba(113,107,201,0.10)' }}>
                      See all results for "{query}" <ArrowRight size={14}/>
                    </button>
                  </>
                ) : (
                  <div style={{ padding:'24px 18px', textAlign:'center', color:'var(--tx-3)', fontSize:14 }}>No results for "{query}"</div>
                )}
              </div>
            ) : (
              <div style={{ padding:'12px 18px 16px' }}>
                <div style={{ fontSize:11, fontWeight:700, color:'var(--tx-3)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:10 }}>Quick access</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                  {['Electronics','Fashion','Gaming','Sports','Home','Music'].map(cat => (
                    <button key={cat} onClick={() => { navigate(`/grid?cat=${cat.toLowerCase()}`); setSearchOpen(false); }}
                      style={{ padding:'5px 12px', borderRadius:'var(--r-f)', fontSize:12, fontWeight:500, background:'var(--s1)', border:'1px solid var(--b-norm)', color:'var(--tx-2)', cursor:'pointer', transition:'all 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.background='rgba(113,107,201,0.12)'; e.currentTarget.style.borderColor='var(--brand)'; e.currentTarget.style.color='var(--brand)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background='var(--s1)'; e.currentTarget.style.borderColor='var(--b-norm)'; e.currentTarget.style.color='var(--tx-2)'; }}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      <style>{`
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes searchDrop {
          from{opacity:0;transform:translateX(-50%) translateY(-12px) scale(0.97)}
          to  {opacity:1;transform:translateX(-50%) translateY(0)     scale(1)}
        }
        .bottom-nav {
          display:flex; position:fixed; left:50%; transform:translateX(-50%);
          bottom:16px; z-index:1001;
          width:calc(100% - 24px); max-width:520px;
          padding:10px 14px; border-radius:22px;
          background:rgba(8,7,15,0.75);
          backdrop-filter:blur(28px) saturate(180%);
          -webkit-backdrop-filter:blur(28px) saturate(180%);
          border:1px solid rgba(113,107,201,0.18);
          box-shadow:0 18px 50px rgba(0,0,0,0.38);
          gap:8px; align-items:center; justify-content:space-between;
        }
        .bottom-nav-item, .bottom-nav-publish {
          border:none; background:transparent; color:rgba(255,255,255,0.55);
          cursor:pointer; display:flex; align-items:center; justify-content:center;
          transition:all 0.2s ease; -webkit-tap-highlight-color:transparent;
        }
        .bottom-nav-item {
          flex:1; min-width:0; flex-direction:column; gap:3px;
          padding:8px 6px; border-radius:14px;
        }
        .bottom-nav-item svg { width:22px; height:22px; }
        .bottom-nav-item span { font-size:10px; line-height:1; font-weight:600; letter-spacing:0.3px; }
        .bottom-nav-item.active { color:#fff; background:rgba(113,107,201,0.18); }
        .bottom-nav-item:hover  { color:#fff; background:rgba(255,255,255,0.06); }
        .bottom-nav-publish {
          width:54px; height:54px; border-radius:17px; flex-shrink:0; margin:0 2px;
          background:linear-gradient(135deg,#716bc9 0%,#8b416f 100%);
          color:white; box-shadow:0 10px 24px rgba(113,107,201,0.38);
        }
        .bottom-nav-publish:hover { transform:translateY(-1px) scale(1.03); }
        body { padding-bottom:100px; }
        [data-theme='light'] .bottom-nav {
          background:rgba(243,242,252,0.84) !important;
          border-color:rgba(113,107,201,0.16) !important;
          box-shadow:0 18px 50px rgba(113,107,201,0.12) !important;
        }
        [data-theme='light']  .bottom-nav-item { color:rgba(16,14,38,0.45) !important; }
        [data-theme='light'] .bottom-nav-item.active { color:var(--brand) !important; background:rgba(113,107,201,0.12) !important; }
        [data-theme='light'] .bottom-nav-item:hover  { color:var(--brand) !important; background:rgba(113,107,201,0.08) !important; }
        @media(max-width:767px) {
          .bottom-nav { width:calc(100% - 16px); bottom:10px; border-radius:20px; padding:9px 12px; }
          .bottom-nav-item svg { width:24px; height:24px; }
          .bottom-nav-item span { font-size:9px; }
          .bottom-nav-publish { width:50px; height:50px; border-radius:15px; }
          body { padding-bottom:92px; }
        }
        @media(max-width:400px) {
          .top-nav-brand { display:none; }
          .top-nav { padding:0 12px !important; gap:8px !important; }
          .top-nav-actions { gap:5px !important; }
        }
      `}</style>
    </>
  );
}

function BotItem({ item, active, onClick }) {
  const Icon = item.icon;
  return (
    <button className={`bottom-nav-item${active ? ' active' : ''}`} onClick={onClick} aria-label={item.label} type="button">
      <Icon size={22} strokeWidth={active ? 2.2 : 1.5} />
      <span>{item.label}</span>
    </button>
  );
}