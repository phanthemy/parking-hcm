'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useLocale } from '@/contexts/LocaleContext';
import LanguageSelector from '@/components/LanguageSelector';
import UserRetentionDrawer from '@/components/UserRetentionDrawer';
import { useUserRetention } from '@/contexts/UserRetentionContext';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { t } = useLocale();
  const { favorites } = useUserRetention();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);

  return (
    <header
      className="header"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        background: 'var(--bg-primary, #0f0f0f)',
        borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.1))',
        padding: '0 20px',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '64px',
          maxWidth: '1400px',
          margin: '0 auto',
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <img src="/logo.png" alt="MapGo" style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
          <span style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.5px', color: '#fff' }}>
            MapGo.vn
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
          }}
          className="nav-desktop"
        >
          <Link href="/" style={{ fontSize: '14px', opacity: 0.8, transition: 'opacity 0.2s', color: '#fff' }}>
            {t('map')}
          </Link>
          <button
            onClick={() => setShowDrawer(true)}
            style={{
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              color: '#fbbf24',
              borderRadius: '12px',
              padding: '5px 12px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <span>⭐</span> {favorites.length > 0 ? `Đã lưu (${favorites.length})` : 'Đã lưu'}
          </button>
          {isAuthenticated && user?.role?.toString().toUpperCase() === 'BUSINESS' && (
            <Link href="/business/dashboard" style={{ fontSize: '14px', opacity: 0.8, color: '#fff' }}>
               {t('manage')}
            </Link>
          )}
          {isAuthenticated && user?.role?.toString().toUpperCase() === 'ADMIN' && (
            <Link href="/admin" style={{ fontSize: '14px', opacity: 0.8, color: '#eab308', fontWeight: 700 }}>
              👑 Admin
            </Link>
          )}

          <LanguageSelector compact={true} />

          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '14px', opacity: 0.8, color: '#fff' }}>
                👤 {user?.name}
              </span>
              <button
                className="btn-secondary"
                onClick={logout}
                style={{ fontSize: '13px', padding: '6px 14px' }}
              >
                {t('logout')}
              </button>
            </div>
          ) : (
            <Link href="/auth/login">
              <button className="btn-primary" style={{ fontSize: '13px', padding: '8px 18px' }}>
                {t('login')}
              </button>
            </Link>
          )}
        </nav>

        {/* Mobile Hamburger */}
        <button
          className="nav-mobile-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            color: 'inherit',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '4px',
          }}
          aria-label="Menu"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div
          className="nav-mobile"
          style={{
            position: 'fixed',
            top: '64px',
            left: 0,
            right: 0,
            bottom: 0,
            background: 'var(--bg-primary, #0f0f0f)',
            padding: '24px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            zIndex: 999,
            animation: 'slideDown 0.2s ease',
          }}
        >
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            style={{ fontSize: '18px', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}
          >
            🗺️ {t('map')}
          </Link>
          <div
            onClick={() => {
              setMenuOpen(false);
              setShowDrawer(true);
            }}
            style={{ fontSize: '18px', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', color: '#fbbf24' }}
          >
            ⭐ Địa điểm đã lưu ({favorites.length})
          </div>
          {isAuthenticated && user?.role?.toString().toUpperCase() === 'BUSINESS' && (
            <Link
              href="/business/dashboard"
              onClick={() => setMenuOpen(false)}
              style={{ fontSize: '18px', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}
            >
               📊 {t('manage')}
            </Link>
          )}
          {isAuthenticated && user?.role?.toString().toUpperCase() === 'ADMIN' && (
            <Link
              href="/admin"
              onClick={() => setMenuOpen(false)}
              style={{ fontSize: '18px', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#eab308', fontWeight: 700 }}
            >
              👑 Quản trị Admin
            </Link>
          )}
          <div style={{ padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '16px', color: '#a0a0b0' }}>🌐 Language</span>
            <LanguageSelector />
          </div>
          <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
            {isAuthenticated ? (
              <>
                <p style={{ fontSize: '14px', opacity: 0.7, marginBottom: '12px' }}>
                  👤 {user?.name} ({user?.email})
                </p>
                <button
                  className="btn-secondary"
                  onClick={() => { logout(); setMenuOpen(false); }}
                  style={{ width: '100%', padding: '12px' }}
                >
                  {t('logout')}
                </button>
              </>
            ) : (
              <Link href="/auth/login" onClick={() => setMenuOpen(false)}>
                <button className="btn-primary" style={{ width: '100%', padding: '12px' }}>
                  {t('login')}
                </button>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* User Retention Drawer */}
      <UserRetentionDrawer
        isOpen={showDrawer}
        onClose={() => setShowDrawer(false)}
        onSelectSpot={(spot) => {
          window.location.href = `/?route_to=${spot.id}&lat=${spot.latitude}&lng=${spot.longitude}&name=${encodeURIComponent(spot.name)}`;
        }}
        onNavigateLocation={(lat, lng, name) => {
          window.location.href = `/?lat=${lat}&lng=${lng}&name=${encodeURIComponent(name)}`;
        }}
      />

      {/* Inline responsive CSS */}
      <style jsx>{`
        @media (max-width: 768px) {
          .nav-desktop {
            display: none !important;
          }
          .nav-mobile-toggle {
            display: block !important;
          }
        }
      `}</style>
    </header>
  );
}
