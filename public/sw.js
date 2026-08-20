/**
 * MapGo Service Worker — Offline Shell & Intelligent Cache Engine
 * Sprint 7.1 Progressive Web App
 */

const CACHE_NAME = 'mapgo-pwa-v1.0.0';
const OFFLINE_URL = '/offline.html';

const PRECACHE_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.webmanifest',
  '/manifest.json',
  '/logo.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-maskable-192.png',
  '/icons/icon-maskable-512.png',
  '/favicon.ico'
];

// Install Event — Precache core shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event — Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event — Cache First for static assets, Network First with Cache Fallback for APIs and HTML
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and external chrome-extension requests
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // 1. Static Assets (Images, Icons, Fonts, WebManifest): CACHE FIRST
  if (
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/images/') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.ico') ||
    url.pathname.endsWith('.webmanifest') ||
    url.pathname.endsWith('.woff2')
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        }).catch(() => caches.match('/logo.png'));
      })
    );
    return;
  }

  // 2. Data APIs (/api/spots, /api/stats, /api/nearby): NETWORK FIRST with Cache Fallback
  if (url.pathname.startsWith('/api/spots') || url.pathname.startsWith('/api/stats') || url.pathname.startsWith('/api/nearby')) {
    event.respondWith(
      fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
        }
        return networkResponse;
      }).catch(() => {
        return caches.match(request);
      })
    );
    return;
  }

  // 3. Navigation (HTML Pages): NETWORK FIRST with Offline Page Fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
        }
        return networkResponse;
      }).catch(() => {
        return caches.match(request).then((cachedResponse) => {
          return cachedResponse || caches.match(OFFLINE_URL);
        });
      })
    );
    return;
  }

  // 4. Default: Stale While Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
        }
        return networkResponse;
      }).catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
