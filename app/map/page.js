'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, X, Navigation, SlidersHorizontal, Search } from 'lucide-react';
import { MOCK_PRODUCTS, CATEGORIES, CONDITIONS, formatPrice, distanceKm } from '@/lib/data';

const CENTER = [8.9936, -79.5197];
const CONDITION_COLORS = {
  new: '#34d399', excellent: '#60a5fa', good: '#716BC9',
  fair: '#fbbf24', 'for-parts': '#E01A4F',
};

export default function MapPage() {
  const router = useRouter();
  const mapRef = useRef(null);
  const leafletRef = useRef(null);
  const markersRef = useRef([]);
  const [ready, setReady] = useState(false);
  const [selected, setSelected] = useState(null);
  const [userPos, setUserPos] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ proximity: 50, category: 'all', condition: 'all', priceMax: 12000, query: '' });
  const setF = (k, v) => setFilters(f => ({ ...f, [k]: v }));

  const filtered = MOCK_PRODUCTS.filter(p => {
    if (filters.category !== 'all' && p.category !== filters.category) return false;
    if (filters.condition !== 'all' && p.condition !== filters.condition) return false;
    if (p.price > filters.priceMax) return false;
    if (filters.query && !p.title.toLowerCase().includes(filters.query.toLowerCase())) return false;
    if (userPos && distanceKm(userPos[0], userPos[1], p.lat, p.lng) > filters.proximity) return false;
    return true;
  });

  const selectedProduct = MOCK_PRODUCTS.find(p => p.id === selected);

  // Init map
  useEffect(() => {
    let map;
    import('leaflet').then(L => {
      if (leafletRef.current || !mapRef.current) return;
      delete L.Icon.Default.prototype._getIconUrl;
      map = L.map(mapRef.current, { center: CENTER, zoom: 12, zoomControl: false });
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap © CARTO', maxZoom: 19,
      }).addTo(map);
      L.control.zoom({ position: 'bottomright' }).addTo(map);
      map.on('click', () => setSelected(null));
      leafletRef.current = map;
      setReady(true);
    });
    return () => { if (leafletRef.current) { leafletRef.current.remove(); leafletRef.current = null; } };
  }, []);

  // Update markers
  useEffect(() => {
    if (!ready || !leafletRef.current) return;
    import('leaflet').then(L => {
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      filtered.forEach(p => {
        const color = CONDITION_COLORS[p.condition] || '#716BC9';
        const isSel = selected === p.id;
        const icon = L.divIcon({
          className: '',
          html: `<div style="background:${isSel ? 'rgba(113,107,201,0.95)' : 'rgba(10,9,22,0.88)'};border:1.5px solid ${isSel ? 'rgba(155,151,217,0.9)' : color + '80'};border-radius:20px;padding:4px 10px;font-size:11px;font-weight:700;color:white;white-space:nowrap;backdrop-filter:blur(12px);box-shadow:0 4px 14px rgba(0,0,0,0.5)${isSel ? ',0 0 0 2px rgba(113,107,201,0.4)' : ''};font-family:system-ui,sans-serif;cursor:pointer;">${formatPrice(p.price)}</div>`,
          iconAnchor: [38, 14],
        });
        const m = L.marker([p.lat, p.lng], { icon }).addTo(leafletRef.current)
          .on('click', e => { e.originalEvent.stopPropagation(); setSelected(p.id); });
        markersRef.current.push(m);
      });
      if (userPos) {
        const ui = L.divIcon({ className: '', html: `<div style="width:14px;height:14px;border-radius:50%;background:#716BC9;border:2px solid white;box-shadow:0 0 0 4px rgba(113,107,201,0.3);"></div>`, iconAnchor: [7,7] });
        markersRef.current.push(L.marker(userPos, { icon: ui }).addTo(leafletRef.current));
      }
    });
  }, [ready, filtered, selected, userPos]);

  const locateMe = () => {
    navigator.geolocation?.getCurrentPosition(
      pos => { const { latitude: la, longitude: lo } = pos.coords; setUserPos([la, lo]); leafletRef.current?.flyTo([la, lo], 13, { duration: 1.5 }); },
      () => leafletRef.current?.flyTo(CENTER, 12, { duration: 1 })
    );
  };

  const sorted = userPos
    ? [...filtered].sort((a, b) => distanceKm(userPos[0], userPos[1], a.lat, a.lng) - distanceKm(userPos[0], userPos[1], b.lat, b.lng))
    : filtered;

  return (
    <main className="page-content no-bottom" style={{ position: 'relative', zIndex: 1 }}>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 20px 0' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <h1 className="section-title">Map</h1>
            <p className="section-subtitle">{filtered.length} listing{filtered.length !== 1 ? 's' : ''} visible</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-glass btn-sm" onClick={() => setShowFilters(s => !s)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: showFilters ? 'rgba(113,107,201,0.18)' : undefined }}>
              <SlidersHorizontal size={13} /> Filters
            </button>
            <button className="btn btn-primary btn-sm" onClick={locateMe}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Navigation size={13} /> Near me
            </button>
          </div>
        </div>

        <div className="search-bar" style={{ marginBottom: 10 }}>
          <Search size={15} color="var(--text-muted)" />
          <input type="text" placeholder="Search on map..." value={filters.query} onChange={e => setF('query', e.target.value)} />
          {filters.query && <button onClick={() => setF('query', '')} style={{ color: 'var(--text-muted)', display: 'flex' }}><X size={13} /></button>}
        </div>

        {showFilters && (
          <div className="glass-card anim-fade-up" style={{ borderRadius: 'var(--r-lg)', padding: '16px 20px', marginBottom: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))', gap: 16 }}>
              <div>
                <label className="input-label">Proximity: {filters.proximity < 50 ? `${filters.proximity} km` : 'All Panama'}</label>
                <input type="range" min={1} max={50} step={1} value={filters.proximity} onChange={e => setF('proximity', Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--brand-primary)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}><span>1 km</span><span>All Panama</span></div>
              </div>
              <div>
                <label className="input-label">Category</label>
                <select className="input-field" value={filters.category} onChange={e => setF('category', e.target.value)} style={{ fontSize: 13, padding: '8px 12px' }}>
                  <option value="all">All categories</option>
                  {CATEGORIES.filter(c => c.id !== 'all').map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="input-label">Condition</label>
                <select className="input-field" value={filters.condition} onChange={e => setF('condition', e.target.value)} style={{ fontSize: 13, padding: '8px 12px' }}>
                  <option value="all">All conditions</option>
                  {CONDITIONS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="input-label">Max price: {filters.priceMax >= 12000 ? 'Any' : `$${filters.priceMax}`}</label>
                <input type="range" min={0} max={12000} step={25} value={filters.priceMax} onChange={e => setF('priceMax', Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--brand-primary)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}><span>$0</span><span>Any</span></div>
              </div>
            </div>
          </div>
        )}

        <div style={{ position: 'relative', borderRadius: 'var(--r-xl)', overflow: 'hidden', border: '1px solid var(--border-subtle)', boxShadow: '0 8px 40px rgba(0,0,0,0.45)', height: 430 }}>
          <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
          <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 500 }}>
            <div className="glass" style={{ borderRadius: 'var(--r-md)', padding: '7px 12px', display: 'flex', alignItems: 'center', gap: 7 }}>
              <Navigation size={12} style={{ color: 'var(--brand-primary)' }} />
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>Panama</span>
            </div>
          </div>
          <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 500 }}>
            <span className="badge badge-primary">{filtered.length} listings</span>
          </div>
        </div>

        {selectedProduct && (
          <div className="glass-strong anim-scale-in" style={{ borderRadius: 'var(--r-xl)', padding: '14px 16px', marginTop: 12, display: 'flex', gap: 14, alignItems: 'center' }}>
            <img src={selectedProduct.images[0]} alt={selectedProduct.title} style={{ width: 68, height: 68, borderRadius: 'var(--r-md)', objectFit: 'cover', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800 }}>{formatPrice(selectedProduct.price)}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedProduct.title}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
                <MapPin size={10} /> {selectedProduct.location}
                {userPos && <span style={{ marginLeft: 4 }}>· {distanceKm(userPos[0], userPos[1], selectedProduct.lat, selectedProduct.lng).toFixed(1)} km away</span>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary btn-sm" onClick={() => router.push(`/product/${selectedProduct.id}`)}>View</button>
              <button className="btn btn-ghost btn-sm" style={{ padding: '6px 8px' }} onClick={() => setSelected(null)}><X size={14} /></button>
            </div>
          </div>
        )}

        <div style={{ marginTop: 18, marginBottom: 16 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, color: 'var(--text-secondary)' }}>
            {userPos ? '📍 Sorted by distance' : `All listings (${filtered.length})`}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {sorted.map(p => (
              <button key={p.id}
                className={`glass-card${selected === p.id ? ' glass-strong' : ''}`}
                style={{ padding: '10px 14px', borderRadius: 'var(--r-lg)', display: 'flex', gap: 12, alignItems: 'center', cursor: 'pointer', textAlign: 'left', border: selected === p.id ? '1px solid var(--brand-primary)' : undefined }}
                onClick={() => { setSelected(p.id); leafletRef.current?.flyTo([p.lat, p.lng], 14, { duration: 1 }); }}
              >
                <img src={p.images[0]} alt={p.title} style={{ width: 46, height: 46, borderRadius: 'var(--r-sm)', objectFit: 'cover', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', display: 'flex', gap: 6, marginTop: 2 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}><MapPin size={9} />{p.location}</span>
                    {userPos && <span>· {distanceKm(userPos[0], userPos[1], p.lat, p.lng).toFixed(1)} km</span>}
                  </div>
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 800, flexShrink: 0 }}>{formatPrice(p.price)}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
