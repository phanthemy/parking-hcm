'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            // Check for updates
            registration.onupdatefound = () => {
              const installingWorker = registration.installing;
              if (installingWorker) {
                installingWorker.onstatechange = () => {
                  if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    console.log('[PWA] Phiên bản mới đã sẵn sàng. Sẽ kích hoạt trong lần mở tiếp theo.');
                  }
                };
              }
            };
          })
          .catch((error) => {
            console.warn('[PWA] Lỗi đăng ký Service Worker:', error);
          });
      });
    }
  }, []);

  return null;
}
