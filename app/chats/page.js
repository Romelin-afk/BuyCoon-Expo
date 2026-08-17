'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import {
  ArrowLeft, Search, Send, Paperclip, MapPin,
  X, Phone, MoreHorizontal, Check, CheckCheck,
  ShieldCheck, Star, Package, Zap, Filter,
} from 'lucide-react';
import { MOCK_PRODUCTS, MOCK_USERS, formatPrice, getSellerById } from '@/lib/data';
import { useTheme } from '@/store/ThemeStore';
import { useAuth } from '@/store/AppStore';

/* ─── MOCK CHAT DATA — linked to real products & sellers ─── */
function buildInitialChats() {
  const pairings = [
    { productId:'p4',  sellerId:'u1', type:'buying',  unread:2,
      messages:[
        { id:1, sender:'them', text:"Hi! I still have the iPhone 15 Pro Max available. Full box, 94% battery. Zero damage.", time:'10:30 AM', read:true },
        { id:2, sender:'me',   text:"Hey! Does it have face ID issues? And can we meet in Marbella?", time:'10:32 AM', read:true },
        { id:3, sender:'them', text:"Face ID works perfectly. Yes, I can do Marbella this weekend.", time:'10:35 AM', read:false },
        { id:4, sender:'them', text:"I can also send you more photos if you need.", time:'10:36 AM', read:false },
      ]
    },
    { productId:'p1',  sellerId:'u3', type:'selling', unread:1,
      messages:[
        { id:1, sender:'them', text:"Hello! Is the MacBook Pro still available?", time:'09:15 AM', read:true },
        { id:2, sender:'me',   text:"Yes! 8 months old, battery at 97%, original charger. It's in perfect condition.", time:'09:20 AM', read:true },
        { id:3, sender:'them', text:"Would you take $1,200?", time:'09:22 AM', read:false },
      ]
    },
    { productId:'p9',  sellerId:'u5', type:'buying',  unread:0,
      messages:[
        { id:1, sender:'me',   text:"Hi! Is the PS5 still for sale?", time:'Yesterday', read:true },
        { id:2, sender:'them', text:"Yes! Barely used. 2 controllers + 3 games included.", time:'Yesterday', read:true },
        { id:3, sender:'me',   text:"Can we meet tomorrow near Albrook Mall?", time:'Yesterday', read:true },
        { id:4, sender:'them', text:"Perfect, 3pm works for me. See you there!", time:'Yesterday', read:true },
      ]
    },
    { productId:'p11', sellerId:'u2', type:'buying',  unread:3,
      messages:[
        { id:1, sender:'them', text:"Hey! Saw you were interested in the DJI drone.", time:'Mon', read:true },
        { id:2, sender:'them', text:"Only 3 flights, comes with 2 batteries and case.", time:'Mon', read:false },
        { id:3, sender:'them', text:"I can do $680 if you pick up today.", time:'Mon', read:false },
        { id:4, sender:'them', text:"Let me know!", time:'Mon', read:false },
      ]
    },
    { productId:'p21', sellerId:'u4', type:'buying',  unread:0,
      messages:[
        { id:1, sender:'me',   text:"Are the Nike shoes US 10? I'm exactly that size.", time:'Sun', read:true },
        { id:2, sender:'them', text:"Yes! Worn 3 times only. Like new.", time:'Sun', read:true },
        { id:3, sender:'me',   text:"Deal. I'll take them for $60.", time:'Sun', read:true },
        { id:4, sender:'them', text:"Great! Let's coordinate pickup.", time:'Sun', read:true },
      ]
    },
    { productId:'p8',  sellerId:'u1', type:'selling', unread:0,
      messages:[
        { id:1, sender:'them', text:"Is the Fender Strat still available?", time:'Sat', read:true },
        { id:2, sender:'me',   text:"Yes! Polar White, Alnico V pickups. Includes semi-rigid case.", time:'Sat', read:true },
        { id:3, sender:'them', text:"Any chance you'd go down to $520?", time:'Sat', read:true },
        { id:4, sender:'me',   text:"I can do $550, that's my lowest.", time:'Sat', read:true },
      ]
    },
    { productId:'p2',  sellerId:'u3', type:'buying',  unread:1,
      messages:[
        { id:1, sender:'them', text:"The Sony A7 IV is a professional body. Only 5k shutter count.", time:'Fri', read:true },
        { id:2, sender:'me',   text:"Does it come with any lens?", time:'Fri', read:true },
        { id:3, sender:'them', text:"Body only, but I include extra battery and original strap.", time:'Fri', read:false },
      ]
    },
    { productId:'p22', sellerId:'u5', type:'buying',  unread:0,
      messages:[
        { id:1, sender:'me',   text:"Hi! Is the Switch Lite Yellow still available?", time:'Thu', read:true },
        { id:2, sender:'them', text:"Yes, excellent condition. 2 games included.", time:'Thu', read:true },
        { id:3, sender:'me',   text:"Can you ship to Colón?", time:'Thu', read:true },
        { id:4, sender:'them', text:"I'd prefer pickup in Panama City, sorry.", time:'Thu', read:true },
      ]
    },
  ];

  return pairings.map((p, idx) => {
    const product = MOCK_PRODUCTS.find(pr => pr.id === p.productId);
    const seller  = MOCK_USERS.find(u => u.id === p.sellerId);
    const last    = p.messages[p.messages.length - 1];
    return {
      id: `chat_${idx + 1}`,
      product,
      seller,
      type: p.type,
      messages: p.messages,
      unread: p.unread,
      lastMessage: last.text,
      lastTime: last.time,
    };
  });
}

/* ─── SMART REPLY ENGINE ──────────────────────────────────── */
function getReply(chat, text) {
  const t = text.toLowerCase();
  const p = chat.product;
  if (t.includes('price') || t.includes('lower') || t.includes('discount') || t.includes('offer'))
    return `The price is ${formatPrice(p.price)}. I can consider a small discount for a quick deal — what are you thinking?`;
  if (t.includes('available') || t.includes('still') || t.includes('sale'))
    return `Yes, the ${p.title} is still available! ${p.condition === 'new' ? 'Brand new condition.' : 'In ' + p.condition + ' condition.'}`;
  if (t.includes('meet') || t.includes('pickup') || t.includes('location') || t.includes('where'))
    return `I'm based in ${p.location}. We can meet there or find a convenient spot nearby.`;
  if (t.includes('photo') || t.includes('picture') || t.includes('image'))
    return "Sure! I'll send you more photos right away. Any specific angle you'd like to see?";
  if (t.includes('ship') || t.includes('deliver') || t.includes('send'))
    return "I prefer local pickup for safety, but we can discuss shipping if you're far. Buyer covers shipping cost.";
  if (t.includes('hello') || t.includes('hi') || t.includes('hey'))
    return `Hey there! Yes, the ${p.title} is still available. What would you like to know?`;
  if (t.includes('condition') || t.includes('damage') || t.includes('scratch'))
    return `It's in ${p.condition} condition — ${p.description.slice(0, 80)}... No major issues at all.`;
  return "Got it! Let me check on that and get back to you shortly.";
}

function timeNow() {
  return new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
}

/* ─── COMPONENTS ──────────────────────────────────────────── */
function ChatItem({ chat, active, onClick }) {
  const hasUnread = chat.unread > 0;
  return (
    <button className={`bc-chat-item${active ? ' active' : ''}`} onClick={onClick} type="button">
      <div className="bc-chat-avatar">
        <img src={chat.seller.avatar} alt={chat.seller.name} />
        <span className={`bc-status-dot${chat.seller.rating > 4.5 ? ' verified' : ''}`} />
      </div>
      <div className="bc-chat-meta">
        <div className="bc-chat-top">
          <span className="bc-chat-name">{chat.seller.name}</span>
          <span className="bc-chat-time">{chat.lastTime}</span>
        </div>
        <div className="bc-chat-product-label">
          <Package size={10} />
          <span>{chat.product.title}</span>
        </div>
        <div className="bc-chat-bottom">
          <span className="bc-chat-preview">{chat.lastMessage}</span>
          {hasUnread && <span className="bc-unread-badge">{chat.unread}</span>}
        </div>
      </div>
    </button>
  );
}

function MessageBubble({ msg }) {
  const isMe = msg.sender === 'me';
  return (
    <div className={`bc-msg-row${isMe ? ' me' : ' them'}`}>
      <div className="bc-bubble">
        <p>{msg.text}</p>
      </div>
      <div className="bc-msg-meta">
        <span>{msg.time}</span>
        {isMe && (msg.read
          ? <CheckCheck size={12} style={{ color:'var(--brand)' }} />
          : <Check size={12} style={{ color:'var(--tx-3)' }} />
        )}
      </div>
    </div>
  );
}

/* ─── MAIN PAGE ───────────────────────────────────────────── */
function ChatsContent() {
  const router        = useRouter();
  const searchParams  = useSearchParams();
  const { isDark }    = useTheme();
  const { user }      = useAuth();

  const [chats, setChats]             = useState(() => buildInitialChats());
  const [selectedId, setSelectedId]   = useState(null);
  const [query, setQuery]             = useState('');
  const [filter, setFilter]           = useState('all');
  const [message, setMessage]         = useState('');
  const [typing, setTyping]           = useState(false);
  const [mobileView, setMobileView]   = useState('list'); // 'list' | 'chat'

  const viewportRef   = useRef(null);
  const replyTimer    = useRef(null);
  const inputRef      = useRef(null);

  // Open chat from query param (e.g., /chats?seller=u1&product=p4)
  useEffect(() => {
    const sellerId  = searchParams.get('seller');
    const productId = searchParams.get('product');
    if (sellerId && productId) {
      const existing = chats.find(c => c.seller.id === sellerId && c.product.id === productId);
      if (existing) { setSelectedId(existing.id); setMobileView('chat'); }
      else {
        // Create a new chat on the fly
        const product = MOCK_PRODUCTS.find(p => p.id === productId);
        const seller  = MOCK_USERS.find(u => u.id === sellerId);
        if (product && seller) {
          const newChat = {
            id: `chat_new_${Date.now()}`,
            product, seller, type: 'buying',
            messages: [{ id:1, sender:'them', text:`Hi! I have the ${product.title} for ${formatPrice(product.price)}. Interested?`, time: timeNow(), read:false }],
            unread: 1, lastMessage: `Hi! I have the ${product.title} available.`, lastTime: timeNow(),
          };
          setChats(prev => [newChat, ...prev]);
          setSelectedId(newChat.id);
          setMobileView('chat');
        }
      }
    }
  }, [searchParams]);

  const selectedChat = useMemo(() => chats.find(c => c.id === selectedId), [chats, selectedId]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return chats.filter(c => {
      const matchFilter = filter === 'all' || c.type === filter;
      const matchQuery  = !q || c.seller.name.toLowerCase().includes(q) || c.product.title.toLowerCase().includes(q) || c.lastMessage.toLowerCase().includes(q);
      return matchFilter && matchQuery;
    });
  }, [chats, filter, query]);

  // Scroll to bottom
  useEffect(() => {
    if (viewportRef.current) viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
  }, [selectedChat?.messages?.length, typing]);

  const selectChat = useCallback((id) => {
    setSelectedId(id);
    setMobileView('chat');
    setChats(prev => prev.map(c => c.id === id ? { ...c, unread: 0 } : c));
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();
    const text = message.trim();
    if (!text || !selectedChat) return;

    const now = timeNow();
    const chatId = selectedChat.id;

    setChats(prev => prev.map(c => c.id !== chatId ? c : {
      ...c,
      messages: [...c.messages, { id: Date.now(), sender:'me', text, time:now, read:false }],
      lastMessage: text, lastTime: now, unread: 0,
    }));
    setMessage('');
    setTyping(true);

    clearTimeout(replyTimer.current);
    replyTimer.current = setTimeout(() => {
      const replyText = getReply(selectedChat, text);
      const replyTime = timeNow();
      setChats(prev => prev.map(c => c.id !== chatId ? c : {
        ...c,
        messages: [...c.messages, { id: Date.now()+1, sender:'them', text:replyText, time:replyTime, read:false }],
        lastMessage: replyText, lastTime: replyTime,
      }));
      setTyping(false);
    }, 1400);
  };

  const totalUnread = chats.reduce((s,c) => s + c.unread, 0);

  return (
    <main className="bc-chat-page">
      <div className={`bc-shell${mobileView === 'chat' ? ' mobile-chat' : ''}`}>

        {/* ── SIDEBAR ── */}
        <aside className="bc-sidebar">
          <div className="bc-sidebar-head">
            <div>
              <h1 className="bc-sidebar-title">Messages</h1>
              {totalUnread > 0 && <span className="bc-unread-badge" style={{ marginLeft:8 }}>{totalUnread}</span>}
            </div>
            <button className="bc-icon-btn" onClick={() => router.push('/grid')} title="Browse listings">
              <Zap size={16}/>
            </button>
          </div>

          {/* Search */}
          <div className="bc-search">
            <Search size={14} style={{ color:'var(--tx-3)', flexShrink:0 }} />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search conversations..." />
            {query && <button onClick={() => setQuery('')} style={{ color:'var(--tx-3)', background:'none', border:'none', cursor:'pointer', display:'flex' }}><X size={13}/></button>}
          </div>

          {/* Filter tabs */}
          <div className="bc-tabs">
            {[{id:'all',label:'All'},{id:'buying',label:'Buying'},{id:'selling',label:'Selling'}].map(t => (
              <button key={t.id} className={`bc-tab${filter===t.id?' active':''}`} onClick={() => setFilter(t.id)} type="button">{t.label}</button>
            ))}
          </div>

          {/* Chat list */}
          <div className="bc-chat-list">
            {visible.length > 0 ? visible.map(c => (
              <ChatItem key={c.id} chat={c} active={c.id === selectedId} onClick={() => selectChat(c.id)} />
            )) : (
              <div style={{ padding:'40px 20px', textAlign:'center', color:'var(--tx-3)', fontSize:13 }}>
                No conversations found
              </div>
            )}
          </div>
        </aside>

        {/* ── MAIN CHAT AREA ── */}
        <section className="bc-main">
          {selectedChat ? (
            <>
              {/* Chat header */}
              <header className="bc-chat-header">
                <button className="bc-back-btn" onClick={() => setMobileView('list')} type="button">
                  <ArrowLeft size={18}/>
                </button>

                <div className="bc-header-user">
                  <div className="bc-chat-avatar" style={{ width:40, height:40 }}>
                    <img src={selectedChat.seller.avatar} alt={selectedChat.seller.name} style={{ width:40, height:40 }} />
                    <span className={`bc-status-dot${selectedChat.seller.rating > 4.5 ? ' verified' : ''}`} />
                  </div>
                  <div>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <strong style={{ fontSize:15, fontWeight:700, color:'var(--tx)' }}>{selectedChat.seller.name}</strong>
                      {selectedChat.seller.verified && <ShieldCheck size={13} style={{ color:'#34d399' }} />}
                    </div>
                    <div style={{ fontSize:11, color:'var(--tx-3)', display:'flex', alignItems:'center', gap:4 }}>
                      <Star size={10} style={{ color:'#fbbf24' }} />
                      {selectedChat.seller.rating} · {selectedChat.seller.sales} sales
                    </div>
                  </div>
                </div>

                {/* Product card in header */}
                <button className="bc-product-pill" onClick={() => router.push(`/product/${selectedChat.product.id}`)} type="button">
                  <img src={selectedChat.product.images[0]} alt={selectedChat.product.title} />
                  <div>
                    <span>{selectedChat.product.title}</span>
                    <strong>{formatPrice(selectedChat.product.price)}</strong>
                  </div>
                </button>
              </header>

              {/* Messages */}
              <div className="bc-messages-viewport" ref={viewportRef}>
                {/* Context card at top */}
                <div className="bc-context-card">
                  <img src={selectedChat.product.images[0]} alt={selectedChat.product.title} />
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:'var(--tx)' }}>{selectedChat.product.title}</div>
                    <div style={{ fontSize:12, color:'var(--tx-3)', marginTop:2 }}>{selectedChat.product.location}</div>
                    <div style={{ fontFamily:'var(--f-dis)', fontSize:18, fontWeight:800, color:'var(--brand)', marginTop:4 }}>{formatPrice(selectedChat.product.price)}</div>
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={() => router.push(`/product/${selectedChat.product.id}`)} type="button">
                    View listing
                  </button>
                </div>

                <div style={{ display:'flex', flexDirection:'column', gap:12, padding:'0 20px 16px' }}>
                  {selectedChat.messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}
                </div>

                {typing && (
                  <div style={{ padding:'0 20px 8px' }}>
                    <div className="bc-typing">
                      <span/><span/><span/>
                    </div>
                  </div>
                )}
              </div>

              {/* Composer */}
              <footer className="bc-footer">
                <button className="bc-icon-btn" type="button" title="Attach"><Paperclip size={17}/></button>
                <button className="bc-icon-btn" type="button" title="Location"><MapPin size={17}/></button>
                <form className="bc-composer" onSubmit={sendMessage}>
                  <input
                    ref={inputRef}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Write your offer or question..."
                    autoComplete="off"
                  />
                  <button type="submit" className="bc-send-btn" disabled={!message.trim()} aria-label="Send">
                    <Send size={15}/>
                  </button>
                </form>
              </footer>
            </>
          ) : (
            <div className="bc-empty">
              <div className="bc-empty-inner">
                <div style={{ fontSize:52, marginBottom:16 }}>💬</div>
                <h2 style={{ fontFamily:'var(--f-dis)', fontSize:22, fontWeight:800, marginBottom:8 }}>Your messages</h2>
                <p style={{ fontSize:14, color:'var(--tx-2)', maxWidth:280, lineHeight:1.6 }}>
                  Select a conversation or contact a seller directly from any product listing.
                </p>
                <button className="btn btn-primary" style={{ marginTop:20 }} onClick={() => router.push('/grid')} type="button">
                  Browse listings
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      <style>{`
        .bc-chat-page {
          position: relative;
          z-index: 1;
          min-height: calc(100dvh - var(--nav-h) - var(--ann-h, 48px));
          padding-top: calc(var(--nav-h) + var(--ann-h, 48px));
        }

        .bc-shell {      
          display: flex;
          height: calc(100dvh - var(--nav-h) - var(--ann-h, 48px) - 76px);
          max-width: 1200px;
          margin: 0 auto;
          padding: 16px 20px;
          gap: 16px;
        }

        /* ── Sidebar ── */
        .bc-sidebar {
          width: 340px;
          min-width: 340px;
          display: flex;
          flex-direction: column;
          background: linear-gradient(145deg, rgba(255,255,255,0.055), rgba(113,107,201,0.035));
          backdrop-filter: blur(28px) saturate(175%);
          -webkit-backdrop-filter: blur(28px) saturate(175%);
          border: 1px solid rgba(255,255,255,0.080);
          border-top-color: rgba(255,255,255,0.155);
          border-radius: var(--r-xl);
          overflow: hidden;
        }
        [data-theme="light"] .bc-sidebar {
          background: linear-gradient(148deg, rgba(255,255,255,0.82), rgba(238,236,255,0.68));
          border-color: rgba(113,107,201,0.12);
          border-top-color: rgba(255,255,255,0.98);
        }

        .bc-sidebar-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 18px 14px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          flex-shrink: 0;
        }
        [data-theme="light"] .bc-sidebar-head { border-bottom-color: rgba(113,107,201,0.10); }

        .bc-sidebar-title {
          font-family: var(--f-dis);
          font-size: 18px;
          font-weight: 800;
          color: var(--tx);
          letter-spacing: -0.02em;
          display: inline;
        }

        .bc-search {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 12px 14px 10px;
          padding: 10px 14px;
          border-radius: var(--r-lg);
          background: rgba(255,255,255,0.042);
          border: 1px solid rgba(255,255,255,0.090);
          flex-shrink: 0;
        }
        [data-theme="light"] .bc-search {
          background: rgba(255,255,255,0.82);
          border-color: rgba(113,107,201,0.15);
        }
        .bc-search input {
          flex: 1;
          background: none;
          border: none;
          outline: none;
          color: var(--tx);
          font-size: 13px;
          font-family: var(--f-bod);
        }
        .bc-search input::placeholder { color: var(--tx-3); }

        .bc-tabs {
          display: flex;
          gap: 6px;
          padding: 0 14px 12px;
          flex-shrink: 0;
        }
        .bc-tab {
          padding: 6px 14px;
          border-radius: var(--r-f);
          border: 1px solid rgba(255,255,255,0.080);
          background: rgba(255,255,255,0.032);
          color: var(--tx-2);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--t-f) var(--ease);
        }
        .bc-tab:hover { background: rgba(255,255,255,0.055); color: var(--tx); }
        .bc-tab.active {
          background: linear-gradient(135deg, rgba(113,107,201,0.22), rgba(59,37,97,0.18));
          border-color: rgba(113,107,201,0.32);
          color: #e0ddff;
        }
        [data-theme="light"] .bc-tab { background: rgba(255,255,255,0.70); border-color: rgba(113,107,201,0.14); color: var(--tx-2); }
        [data-theme="light"] .bc-tab.active { background: rgba(113,107,201,0.14); border-color: rgba(113,107,201,0.28); color: var(--brand); }

        .bc-chat-list {
          flex: 1;
          overflow-y: auto;
          padding-bottom: 8px;
        }

        .bc-chat-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border: none;
          background: transparent;
          color: inherit;
          text-align: left;
          cursor: pointer;
          border-top: 1px solid rgba(255,255,255,0.04);
          transition: background var(--t-f) var(--ease);
        }
        [data-theme="light"] .bc-chat-item { border-top-color: rgba(113,107,201,0.06); }
        .bc-chat-item:hover  { background: rgba(255,255,255,0.042); }
        .bc-chat-item.active { background: rgba(113,107,201,0.12); }
        [data-theme="light"] .bc-chat-item.active { background: rgba(113,107,201,0.10); }

        .bc-chat-avatar {
          position: relative;
          flex-shrink: 0;
          width: 46px;
          height: 46px;
        }
        .bc-chat-avatar img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
          background: rgba(255,255,255,0.08);
        }
        .bc-status-dot {
          position: absolute;
          right: 1px;
          bottom: 1px;
          width: 11px;
          height: 11px;
          border-radius: 50%;
          border: 2px solid transparent;
          background: rgba(100,116,139,0.6);
        }
        .bc-status-dot.verified { background: #34d399; }

        .bc-chat-meta { flex: 1; min-width: 0; }
        .bc-chat-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
          margin-bottom: 2px;
        }
        .bc-chat-name {
          font-size: 14px;
          font-weight: 700;
          color: var(--tx);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .bc-chat-time { font-size: 11px; color: var(--tx-3); flex-shrink: 0; }
        .bc-chat-product-label {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          color: var(--brand);
          margin-bottom: 3px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .bc-chat-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }
        .bc-chat-preview {
          font-size: 12px;
          color: var(--tx-2);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .bc-unread-badge {
          min-width: 19px;
          height: 19px;
          padding: 0 6px;
          border-radius: var(--r-f);
          background: var(--brand);
          color: #fff;
          font-size: 11px;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        /* ── Main area ── */
        .bc-main {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          background: linear-gradient(145deg, rgba(255,255,255,0.042), rgba(59,37,97,0.030));
          backdrop-filter: blur(26px) saturate(175%);
          -webkit-backdrop-filter: blur(26px) saturate(175%);
          border: 1px solid rgba(255,255,255,0.075);
          border-top-color: rgba(255,255,255,0.14);
          border-radius: var(--r-xl);
          overflow: hidden;
        }
        [data-theme="light"] .bc-main {
          background: linear-gradient(148deg, rgba(255,255,255,0.78), rgba(238,236,255,0.62));
          border-color: rgba(113,107,201,0.11);
          border-top-color: rgba(255,255,255,0.97);
        }

        /* Chat header */
        .bc-chat-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 18px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          flex-shrink: 0;
        }
        [data-theme="light"] .bc-chat-header { border-bottom-color: rgba(113,107,201,0.10); }

        .bc-header-user {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
          min-width: 0;
        }

        .bc-product-pill {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 7px 12px;
          border-radius: var(--r-lg);
          background: rgba(255,255,255,0.042);
          border: 1px solid rgba(255,255,255,0.080);
          border-top-color: rgba(255,255,255,0.13);
          cursor: pointer;
          transition: all var(--t-f) var(--ease);
          flex-shrink: 0;
          max-width: 240px;
        }
        .bc-product-pill:hover { background: rgba(113,107,201,0.10); border-color: rgba(113,107,201,0.22); }
        [data-theme="light"] .bc-product-pill { background: rgba(255,255,255,0.72); border-color: rgba(113,107,201,0.14); }
        .bc-product-pill img { width:32px; height:32px; border-radius:8px; object-fit:cover; flex-shrink:0; }
        .bc-product-pill div { display:flex; flex-direction:column; min-width:0; }
        .bc-product-pill span { font-size:11px; color:var(--tx-2); font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .bc-product-pill strong { font-size:13px; color:var(--brand); font-family:var(--f-dis); font-weight:800; }

        /* Messages viewport */
        .bc-messages-viewport {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 0;
          background-image: radial-gradient(rgba(255,255,255,0.055) 1px, transparent 1px);
          background-size: 20px 20px;
        }
        [data-theme="light"] .bc-messages-viewport {
          background-image: radial-gradient(rgba(113,107,201,0.08) 1px, transparent 1px);
        }

        /* Context card */
        .bc-context-card {
          display: flex;
          align-items: center;
          gap: 14px;
          margin: 16px 20px;
          padding: 14px;
          border-radius: var(--r-lg);
          background: rgba(113,107,201,0.08);
          border: 1px solid rgba(113,107,201,0.18);
          border-top-color: rgba(255,255,255,0.14);
        }
        [data-theme="light"] .bc-context-card {
          background: rgba(113,107,201,0.06);
          border-color: rgba(113,107,201,0.16);
        }
        .bc-context-card img { width:56px; height:56px; border-radius:var(--r-sm); object-fit:cover; flex-shrink:0; }
        .bc-context-card > div { flex:1; min-width:0; }

        /* Messages */
        .bc-msg-row {
          display: flex;
          flex-direction: column;
          max-width: 76%;
          margin: 4px 0;
        }
        .bc-msg-row.me   { align-self: flex-end;  align-items: flex-end;  margin-right: 20px; }
        .bc-msg-row.them { align-self: flex-start; align-items: flex-start; margin-left: 20px; }

        .bc-bubble {
          padding: 11px 14px;
          border-radius: 18px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.12);
        }
        .bc-msg-row.me .bc-bubble {
          background: linear-gradient(135deg, #716bc9 0%, #8b416f 100%);
          color: #fff;
          border-bottom-right-radius: 5px;
        }
        .bc-msg-row.them .bc-bubble {
          background: rgba(255,255,255,0.075);
          border: 1px solid rgba(255,255,255,0.080);
          border-top-color: rgba(255,255,255,0.14);
          color: var(--tx);
          border-bottom-left-radius: 5px;
        }
        [data-theme="light"] .bc-msg-row.them .bc-bubble {
          background: rgba(255,255,255,0.82);
          border-color: rgba(113,107,201,0.13);
        }
        .bc-bubble p { margin:0; font-size:14px; line-height:1.5; }

        .bc-msg-meta {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: 3px;
          font-size: 11px;
          color: var(--tx-3);
        }

        /* Typing indicator */
        .bc-typing {
          display: flex;
          gap: 4px;
          padding: 10px 14px;
          border-radius: 18px;
          border-bottom-left-radius: 5px;
          background: rgba(255,255,255,0.075);
          width: fit-content;
          margin-left: 20px;
        }
        [data-theme="light"] .bc-typing { background: rgba(255,255,255,0.80); border: 1px solid rgba(113,107,201,0.13); }
        .bc-typing span {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--tx-3);
          animation: bcBounce 1.3s infinite ease-in-out;
        }
        .bc-typing span:nth-child(2) { animation-delay: 0.15s; }
        .bc-typing span:nth-child(3) { animation-delay: 0.30s; }
        @keyframes bcBounce {
          0%,80%,100% { transform:scale(0.6); opacity:0.4; }
          40%         { transform:scale(1);   opacity:1;   }
        }

        /* Footer / composer */
        .bc-footer {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 18px;
          border-top: 1px solid rgba(255,255,255,0.06);
          flex-shrink: 0;
        }
        [data-theme="light"] .bc-footer { border-top-color: rgba(113,107,201,0.10); }

        .bc-icon-btn {
          width: 38px; height: 38px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.042);
          border: 1px solid rgba(255,255,255,0.090);
          color: var(--tx-2); cursor: pointer; transition: all var(--t-f) var(--ease); flex-shrink: 0;
        }
        .bc-icon-btn:hover { background: rgba(113,107,201,0.12); color: var(--brand); }
        [data-theme="light"] .bc-icon-btn { background: rgba(255,255,255,0.70); border-color: rgba(113,107,201,0.14); }

        .bc-composer {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 10px 9px 16px;
          border-radius: 22px;
          background: rgba(255,255,255,0.042);
          border: 1px solid rgba(255,255,255,0.090);
          border-top-color: rgba(255,255,255,0.130);
          transition: all var(--t-b) var(--ease);
        }
        .bc-composer:focus-within {
          border-color: rgba(113,107,201,0.42);
          box-shadow: 0 0 0 3px rgba(113,107,201,0.10);
        }
        [data-theme="light"] .bc-composer { background: rgba(255,255,255,0.82); border-color: rgba(113,107,201,0.15); }
        .bc-composer input {
          flex: 1; background: none; border: none; outline: none;
          color: var(--tx); font-size: 14px; font-family: var(--f-bod);
        }
        .bc-composer input::placeholder { color: var(--tx-3); }

        .bc-send-btn {
          width: 36px; height: 36px; border-radius: 50%; border: none; cursor: pointer;
          color: #fff;
          background: linear-gradient(135deg, #716bc9 0%, #8b416f 100%);
          box-shadow: 0 6px 18px rgba(113,107,201,0.30);
          display: flex; align-items: center; justify-content: center;
          transition: all var(--t-b) var(--spring); flex-shrink: 0;
        }
        .bc-send-btn:hover:not(:disabled) { transform: scale(1.08); box-shadow: 0 8px 24px rgba(113,107,201,0.42); }
        .bc-send-btn:disabled { opacity: 0.4; cursor: default; }

        /* Empty state */
        .bc-empty {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 24px;
        }
        .bc-empty-inner { max-width: 360px; }

        /* Back button (mobile only) */
        .bc-back-btn {
          display: none;
          width: 36px; height: 36px; border-radius: 11px;
          align-items: center; justify-content: center;
          background: rgba(255,255,255,0.042);
          border: 1px solid rgba(255,255,255,0.090);
          color: var(--tx-2); cursor: pointer; flex-shrink: 0;
          transition: all var(--t-f) var(--ease);
        }
        .bc-back-btn:hover { background: rgba(255,255,255,0.075); color: var(--tx); }
        [data-theme="light"] .bc-back-btn { background: rgba(255,255,255,0.70); border-color: rgba(113,107,201,0.14); }

        /* ── RESPONSIVE ── */
        @media (max-width: 900px) {
          .bc-sidebar { width: 300px; min-width: 300px; }
          .bc-product-pill { display: none; }
        }

        @media (max-width: 700px) {
         .bc-shell {
  position: relative;
  padding: 8px 0 0;
  gap: 0;
  height: calc(100dvh - var(--nav-h) - var(--ann-h, 48px) - 70px);
}

          .bc-sidebar,
          .bc-main {
            position: absolute;
            inset: 0;
            width: 100%;
            min-width: 0;
            border-radius: 0;
            transition: transform 0.30s cubic-bezier(0.16,1,0.3,1);
          }

          .bc-shell:not(.mobile-chat) .bc-sidebar { transform: translateX(0); }
          .bc-shell:not(.mobile-chat) .bc-main    { transform: translateX(100%); }
          .bc-shell.mobile-chat .bc-sidebar        { transform: translateX(-100%); }
          .bc-shell.mobile-chat .bc-main           { transform: translateX(0); }

          .bc-back-btn { display: flex; }
          .bc-context-card { flex-wrap: wrap; }
          .bc-context-card .btn { width: 100%; justify-content: center; }
          .bc-msg-row { max-width: 88%; }
        }

        @media (max-width: 480px) {
          .bc-chat-header { padding: 12px 14px; }
          .bc-footer { padding: 12px 14px; }
          .bc-sidebar-head { padding: 14px 14px 12px; }
        }
      `}</style>
    </main>
  );
}

export default function ChatsPage() {
  return (
    <Suspense fallback={<div style={{ padding:40, textAlign:'center', color:'var(--tx-3)' }}>Loading...</div>}>
      <ChatsContent />
    </Suspense>
  );
}
