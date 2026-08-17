'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Settings,
  LogOut,
  Heart,
  Package,
  Star,
  ShieldCheck,
  MapPin,
  ChevronRight,
  ArrowLeft,
  Bell,
  HelpCircle,
  Lock
} from 'lucide-react';

import ProductCard from '@/components/products/ProductCard';
import { useAuth, useFavorites, useToast } from '@/store/AppStore';
import { MOCK_PRODUCTS } from '@/lib/data';

const MENU_ITEMS = [
  {
    icon: Bell,
    label: 'Notifications',
    sub: 'Manage your alerts'
  },
  {
    icon: Lock,
    label: 'Security',
    sub: 'Password and access'
  },
  {
    icon: HelpCircle,
    label: 'Help & Support',
    sub: 'Help center'
  },
];

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { favProducts } = useFavorites();
  const { show } = useToast();
  const [activeTab, setActiveTab] = useState('listings');

  if (!user) {
    return (
      <>
        <main className="page-content">
          <div className="empty-state">
            <div
              className="empty-icon"
              style={{ fontSize: 36 }}
            >
              👤
            </div>

            <div className="empty-title">
              You are not logged in.
            </div>

            <p className="empty-desc">
              Log in to view your profile and listings
            </p>

            <button
              className="btn btn-primary"
              style={{ marginTop: 8 }}
              onClick={() => router.push('/auth/login')}
            >
              Log In
            </button>
          </div>
        </main>
      </>
    );
  }

  const handleLogout = () => {
    logout();
    show('Session closed', 'default');
    router.push('/');
  };

  // Mock: show some products as "mine"
  const myProducts = MOCK_PRODUCTS.slice(0, 3);

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
            maxWidth: 720,
            margin: '0 auto',
            padding: '16px 20px 0'
          }}
        >

          {/* Back + settings */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 8
            }}
          >
            <button
              className="btn btn-ghost btn-sm btn-icon"
              onClick={() => router.back()}
            >
              <ArrowLeft size={16} />
            </button>

            <button className="btn btn-ghost btn-sm btn-icon">
              <Settings size={16} />
            </button>
          </div>

          {/* Profile header */}
          <div className="profile-header">
            <div className="profile-avatar-wrap">
              <img
                src={user.avatar}
                alt={user.name}
                className="profile-avatar"
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: '56%',
                  objectFit: 'cover',
                  border: '3px solid var(--glass-border)'
                }}
              />

              {user.verified && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    background: 'rgba(52,211,153,0.15)',
                    border: '2px solid rgba(52,211,153,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <ShieldCheck
                    size={13}
                    style={{ color: '#34d399' }}
                  />
                </div>
              )}
            </div>

            <div className="profile-name">
              {user.name}
            </div>

            <div className="profile-handle">
              {user.handle}
            </div>

            <div
              style={{
                display: 'flex',
                gap: 10,
                justifyContent: 'center',
                marginTop: 8,
                flexWrap: 'wrap'
              }}
            >
              <span className="badge badge-primary">
                <Star
                  size={10}
                  style={{ color: '#fbbf24' }}
                />
                4.9
              </span>

              {user.verified && (
                <span className="badge badge-success">
                  <ShieldCheck size={10} />
                  Verified
                </span>
              )}
            </div>

            <div className="profile-stats">
              <div className="profile-stat">
                <div className="profile-stat-n">
                  {myProducts.length}
                </div>
                <div className="profile-stat-l">
                  Listings
                </div>
              </div>

              <div className="profile-stat">
                <div className="profile-stat-n">
                  {favProducts.length}
                </div>
                <div className="profile-stat-l">
                  Favorites
                </div>
              </div>

              <div className="profile-stat">
                <div className="profile-stat-n">
                  47
                </div>
                <div className="profile-stat-l">
                  Sales
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div
            style={{
              display: 'flex',
              gap: 4,
              background: 'var(--surface-0)',
              borderRadius: 'var(--r-lg)',
              padding: 4,
              marginBottom: 20
            }}
          >
            {[
              {
                id: 'listings',
                label: 'Listings',
                icon: Package
              },
              {
                id: 'favorites',
                label: 'Favorites',
                icon: Heart
              },
              {
                id: 'settings',
                label: 'Settings',
                icon: Settings
              },
            ].map(tab => {
              const Icon = tab.icon;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: 'var(--r-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: 'none',
                    background:
                      activeTab === tab.id
                        ? 'var(--glass-bg)'
                        : 'transparent',
                    color:
                      activeTab === tab.id
                        ? 'var(--text-accent)'
                        : 'var(--text-muted)',
                    transition: 'all 0.2s',
                    backdropFilter:
                      activeTab === tab.id
                        ? 'blur(12px)'
                        : 'none',
                    boxShadow:
                      activeTab === tab.id
                        ? 'var(--glass-shadow)'
                        : 'none',
                    borderColor:
                      activeTab === tab.id
                        ? 'var(--glass-border)'
                        : 'transparent',
                    borderWidth: 1,
                    borderStyle: 'solid',
                  }}
                >
                  <Icon size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab: Listings */}
          {activeTab === 'listings' && (
            <div className="anim-fade-in">
              {myProducts.length > 0 ? (
                <>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 14
                    }}
                  >
                    <p
                      style={{
                        fontSize: 13,
                        color: 'var(--text-secondary)'
                      }}
                    >
                      {myProducts.length} active listings
                    </p>

                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => router.push('/publish')}
                    >
                      + Publish
                    </button>
                  </div>

                  <div className="products-grid">
                    {myProducts.map(p => (
                      <ProductCard
                        key={p.id}
                        product={p}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">
                    <Package size={26} />
                  </div>

                  <div className="empty-title">
                    You haven't published anything yet
                  </div>

                  <p className="empty-desc">
                    Publish your first item and start selling!
                  </p>

                  <button
                    className="btn btn-primary"
                    style={{ marginTop: 8 }}
                    onClick={() => router.push('/publish')}
                  >
                    Publish now
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tab: Favorites */}
          {activeTab === 'favorites' && (
            <div className="anim-fade-in">
              {favProducts.length > 0 ? (
                <div className="products-grid">
                  {favProducts.map(p => (
                    <ProductCard
                      key={p.id}
                      product={p}
                    />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div
                    className="empty-icon"
                    style={{
                      color: 'var(--brand-red)'
                    }}
                  >
                    <Heart size={26} />
                  </div>

                  <div className="empty-title">
                    No favorites yet
                  </div>

                  <p className="empty-desc">
                    Save products you're interested in to find them easily
                  </p>

                  <button
                    className="btn btn-primary"
                    style={{ marginTop: 8 }}
                    onClick={() => router.push('/grid')}
                  >
                    Explore
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tab: Settings */}
          {activeTab === 'settings' && (
            <div
              className="anim-fade-in"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8
              }}
            >
              {MENU_ITEMS.map(item => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.label}
                    className="glass-card"
                    style={{
                      padding: '14px 16px',
                      borderRadius: 'var(--r-lg)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      cursor: 'pointer',
                      textAlign: 'left',
                      border: 'none'
                    }}
                  >
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 10,
                        background: 'var(--surface-2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-secondary)',
                        flexShrink: 0
                      }}
                    >
                      <Icon size={16} />
                    </div>

                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: 14
                        }}
                      >
                        {item.label}
                      </div>

                      <div
                        style={{
                          fontSize: 12,
                          color: 'var(--text-muted)',
                          marginTop: 1
                        }}
                      >
                        {item.sub}
                      </div>
                    </div>

                    <ChevronRight
                      size={16}
                      style={{
                        color: 'var(--text-muted)'
                      }}
                    />
                  </button>
                );
              })}

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="btn"
                style={{
                  marginTop: 8,
                  background: 'rgba(224,26,79,0.08)',
                  border: '1px solid rgba(224,26,79,0.18)',
                  color: 'var(--brand-red)',
                  width: '100%',
                  padding: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}
              >
                <LogOut size={16} />
                Log out
              </button>
            </div>
          )}

        </div>
      </main>
    </>
  );
}