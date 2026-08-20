'use client';

import React, { useEffect, useState } from 'react';
import { isPwaBannerAllowed, dismissPwaBanner } from '@/lib/user-retention';
import { trackEvent } from '@/lib/analytics';

export default function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosInstructions, setShowIosInstructions] = useState(false);

  useEffect(() => {
    // 1. Kiểm tra môi trường & chế độ standalone
    if (typeof window === 'undefined') return;

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      trackEvent('pwa_direct_launch');
      return;
    }

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    // 2. Lắng nghe sự kiện beforeinstallprompt (Android / Chrome / Edge)
    const promptHandler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', promptHandler);

    // 3. Kiểm tra điều kiện: Visit >= 2, không quá 1 lần/tuần, và chờ session >= 30s
    let timer: NodeJS.Timeout;
    if (isPwaBannerAllowed()) {
      // Đợi đúng 30 giây (30000ms) trước khi hiển thị banner theo quy định KPI
      timer = setTimeout(() => {
        if (isPwaBannerAllowed()) {
          setShowBanner(true);
          trackEvent('pwa_banner_shown');
        }
      }, 30000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', promptHandler);
      if (timer) clearTimeout(timer);
    };
  }, []);

  const handleInstall = async () => {
    trackEvent('pwa_install_click');

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        trackEvent('pwa_install_accepted');
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else if (isIos) {
      setShowIosInstructions(true);
    } else {
      // Fallback
      alert('Để cài đặt ứng dụng: Nhấn biểu tượng 3 chấm ở góc trình duyệt và chọn "Thêm vào Màn hình chính" hoặc "Cài đặt ứng dụng".');
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setShowIosInstructions(false);
    dismissPwaBanner();
    trackEvent('pwa_banner_dismissed');
  };

  if (!showBanner) return null;

  return (
    <>
      <div
        style={{
          position: 'fixed',
          bottom: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9000,
          width: 'calc(100% - 24px)',
          maxWidth: '460px',
          background: 'linear-gradient(135deg, rgba(20, 24, 45, 0.96), rgba(13, 13, 20, 0.98))',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(59, 130, 246, 0.4)',
          borderRadius: '18px',
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.75), 0 0 20px rgba(37, 99, 235, 0.2)',
          animation: 'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* App Icon */}
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
          }}
        >
          <img
            src="/logo.png"
            alt="MapGo"
            style={{ width: '28px', height: '28px', objectFit: 'contain' }}
            onError={(e: any) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>

        {/* Text info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.01em' }}>
            Cài đặt App MapGo (Không tốn bộ nhớ)
          </div>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px', lineHeight: 1.4 }}>
            Mở 1-chạm từ màn hình chính, tra cứu bản đồ bãi xe siêu tốc
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleInstall}
          style={{
            background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
            padding: '9px 14px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 10px rgba(37, 99, 235, 0.5)',
          }}
        >
          Cài đặt
        </button>

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          style={{
            background: 'transparent',
            color: '#64748b',
            border: 'none',
            fontSize: '16px',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="Đóng thông báo"
        >
          ✕
        </button>
      </div>

      {/* iOS Instructions Modal if needed */}
      {showIosInstructions && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
          onClick={() => setShowIosInstructions(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#13131e',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '24px 24px 0 0',
              padding: '24px 20px 36px',
              width: '100%',
              maxWidth: '480px',
              textAlign: 'center',
            }}
          >
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#ffffff', marginBottom: '12px' }}>
              Cài đặt MapGo trên iPhone / iPad
            </h3>
            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.6, marginBottom: '20px' }}>
              1. Nhấn nút <strong>Chia sẻ (Share)</strong> ở thanh dưới Safari.<br />
              2. Cuộn xuống và chọn <strong>&quot;Thêm vào MH chính&quot; (Add to Home Screen)</strong>.<br />
              3. Nhấn <strong>Thêm (Add)</strong> ở góc trên bên phải để hoàn tất.
            </p>
            <button
              onClick={() => setShowIosInstructions(false)}
              style={{
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '10px 24px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                width: '100%',
              }}
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}
    </>
  );
}
