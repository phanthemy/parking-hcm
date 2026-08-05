'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  if (isAuthenticated) {
    router.push('/');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      router.push('/');
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setError(apiErr.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: 'var(--bg-primary, #0f0f0f)',
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '420px',
          padding: '40px 32px',
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <span style={{ fontSize: '40px' }}>🅿️</span>
            <h1 style={{ fontSize: '24px', fontWeight: 700, marginTop: '8px', letterSpacing: '-0.5px' }}>
              ParkingHCM
            </h1>
          </Link>
          <p style={{ fontSize: '14px', opacity: 0.6, marginTop: '8px' }}>
            Đăng nhập vào tài khoản
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', opacity: 0.8 }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md, 8px)',
                border: '1px solid var(--border-color, rgba(255,255,255,0.15))',
                background: 'var(--bg-tertiary, rgba(255,255,255,0.05))',
                color: 'inherit',
                fontSize: '15px',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', opacity: 0.8 }}>
              Mật khẩu
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md, 8px)',
                border: '1px solid var(--border-color, rgba(255,255,255,0.15))',
                background: 'var(--bg-tertiary, rgba(255,255,255,0.05))',
                color: 'inherit',
                fontSize: '15px',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              autoComplete="current-password"
            />
          </div>

          {/* Error */}
          {error && (
            <p style={{ color: '#ef4444', fontSize: '13px', marginBottom: '16px', textAlign: 'center' }}>
              ⚠️ {error}
            </p>
          )}

          {/* Submit */}
          <button
            className="btn-primary"
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '15px',
              fontWeight: 600,
              opacity: isLoading ? 0.6 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {isLoading ? '⏳ Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        {/* Register Link */}
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <p style={{ fontSize: '14px', opacity: 0.6 }}>
            Chưa có tài khoản?{' '}
            <Link
              href="/auth/register"
              style={{
                color: 'var(--color-primary, #10b981)',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>

        {/* Back to home */}
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <Link href="/" style={{ fontSize: '13px', opacity: 0.5 }}>
            ← Quay về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
