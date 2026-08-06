'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useLocale } from '@/contexts/LocaleContext';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isAuthenticated } = useAuth();
  const { t } = useLocale();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'driver' | 'business'>('driver');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (isAuthenticated) {
    router.push('/');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError(t('fill_all_fields'));
      return;
    }
    if (password.length < 6) {
      setError(t('password_min'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('password_mismatch'));
      return;
    }

    setIsLoading(true);
    try {
      await register(name, email, password, role);
      router.push('/');
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setError(apiErr.message || t('register_error'));
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: 'var(--radius-md, 8px)',
    border: '1px solid var(--border-color, rgba(255,255,255,0.15))',
    background: 'var(--bg-tertiary, rgba(255,255,255,0.05))',
    color: 'inherit',
    fontSize: '15px',
    outline: 'none',
    transition: 'border-color 0.2s',
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
            {t('register_title')}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Role Selection */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '8px', opacity: 0.8 }}>
              {t('you_are')}
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setRole('driver')}
                className={role === 'driver' ? 'btn-primary' : 'btn-secondary'}
                style={{
                  flex: 1,
                  padding: '12px',
                  fontSize: '14px',
                  fontWeight: 500,
                  transition: 'all 0.2s',
                }}
              >
                🚗 {t('driver')}
              </button>
              <button
                type="button"
                onClick={() => setRole('business')}
                className={role === 'business' ? 'btn-primary' : 'btn-secondary'}
                style={{
                  flex: 1,
                  padding: '12px',
                  fontSize: '14px',
                  fontWeight: 500,
                  transition: 'all 0.2s',
                }}
              >
                🏢 {t('business')}
              </button>
            </div>
          </div>

          {/* Name */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', opacity: 0.8 }}>
              {t('full_name')}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nguyễn Văn A"
              style={inputStyle}
              autoComplete="name"
            />
          </div>

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
              style={inputStyle}
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', opacity: 0.8 }}>
              {t('password')}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('min_6_chars')}
              style={inputStyle}
              autoComplete="new-password"
            />
          </div>

          {/* Confirm Password */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', opacity: 0.8 }}>
              {t('confirm_password')}
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t('confirm_password_placeholder')}
              style={inputStyle}
              autoComplete="new-password"
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
            {isLoading ? '⏳ ' + t('registering') : t('register')}
          </button>
        </form>

        {/* Login Link */}
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <p style={{ fontSize: '14px', opacity: 0.6 }}>
            {t('have_account')}{' '}
            <Link
              href="/auth/login"
              style={{
                color: 'var(--color-primary, #10b981)',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              {t('login')}
            </Link>
          </p>
        </div>

        {/* Back to home */}
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <Link href="/" style={{ fontSize: '13px', opacity: 0.5 }}>
            ← {t('back_home')}
          </Link>
        </div>
      </div>
    </div>
  );
}
