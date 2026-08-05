'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

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
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <span style={{ fontSize: '28px' }}>🅿️</span>
          <span style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.5px' }}>
            ParkingHCM
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
          }}
          className="nav-desktop"
        >
          <Link href="/" style={{ fontSize: '14px', opacity: 0.8, transition: 'opacity 0.2s' }}>
            Bản đồ
          </Link>
          {isAuthenticated && user?.role === 'business' && (
            <Link href="/business/dashboard" style={{ fontSize: '14px', opacity: 0.8 }}>
              Quản lý
            </Link>
          )}
          {isAuthenticated && user?.role === 'admin' && (
            <Link href="/admin" style={{ fontSize: '14px', opacity: 0.8 }}>
              Admin
            </Link>
          )}

          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '14px', opacity: 0.8 }}>
                👤 {user?.name}
              </span>
              <button
                className="btn-secondary"
                onClick={logout}
                style={{ fontSize: '13px', padding: '6px 14px' }}
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <Link href="/auth/login">
              <button className="btn-primary" style={{ fontSize: '13px', padding: '8px 18px' }}>
                Đăng nhập
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
            🗺️ Bản đồ
          </Link>
          {isAuthenticated && user?.role === 'business' && (
            <Link
              href="/business/dashboard"
              onClick={() => setMenuOpen(false)}
              style={{ fontSize: '18px', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}
            >
              📊 Quản lý
            </Link>
          )}
          {isAuthenticated && user?.role === 'admin' && (
            <Link
              href="/admin"
              onClick={() => setMenuOpen(false)}
              style={{ fontSize: '18px', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}
            >
              ⚙️ Admin
            </Link>
          )}
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
                  Đăng xuất
                </button>
              </>
            ) : (
              <Link href="/auth/login" onClick={() => setMenuOpen(false)}>
                <button className="btn-primary" style={{ width: '100%', padding: '12px' }}>
                  Đăng nhập
                </button>
              </Link>
            )}
          </div>
        </div>
      )}

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
