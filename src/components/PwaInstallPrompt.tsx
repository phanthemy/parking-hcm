'use client';

import React, { useEffect, useState } from 'react';

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if dismissed before
    const isDismissed = localStorage.getItem('mapgo_pwa_dismissed');
    if (isDismissed) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('mapgo_pwa_dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '12px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 1000,
      width: 'calc(100% - 24px)',
      maxWidth: '440px',
      background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.95), rgba(15, 23, 42, 0.95))',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid rgba(99, 102, 241, 0.4)',
      borderRadius: '16px',
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      animation: 'slideDown 0.3s ease',
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '10px',
        background: 'linear-gradient(135deg, #2563eb, #8b5cf6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
        flexShrink: 0,
      }}>
        🧭
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>
          Cài đặt App MapGo (5MB)
        </div>
        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
          Mở tức thì, tìm bãi xe & trạm xăng 1-chạm
        </div>
      </div>
      <button
        onClick={handleInstall}
        style={{
          background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
          color: '#ffffff',
          border: 'none',
          borderRadius: '10px',
          padding: '8px 14px',
          fontSize: '12px',
          fontWeight: 700,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        Cài đặt
      </button>
      <button
        onClick={handleDismiss}
        style={{
          background: 'transparent',
          color: '#64748b',
          border: 'none',
          fontSize: '16px',
          cursor: 'pointer',
          padding: '4px',
        }}
      >
        ✕
      </button>
    </div>
  );
}
