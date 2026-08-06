'use client';

import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import type { Spot } from '@/lib/types';
import { SPOT_TYPE_ICONS } from '@/lib/types';

interface MapComponentProps {
  spots: Spot[];
  center: [number, number];
  zoom?: number;
  selectedSpotId?: string | null;
  onSpotClick?: (spot: Spot) => void;
  style?: React.CSSProperties;
  showUserLocation?: boolean;
  userLocation?: [number, number] | null;
}

export interface MapHandle {
  showRoute: (from: [number, number], to: [number, number], spotName: string) => void;
  clearRoute: () => void;
  startNavigation: (dest: [number, number], destName: string) => void;
  stopNavigation: () => void;
}

const MapComponent = forwardRef<MapHandle, MapComponentProps>(({
  spots,
  center,
  zoom = 14,
  selectedSpotId,
  onSpotClick,
  style,
  showUserLocation = true,
  userLocation,
}, ref) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const routeInfoRef = useRef<L.Control | null>(null);
  const navWatchIdRef = useRef<number | null>(null);
  const navMarkerRef = useRef<L.Marker | null>(null);
  const navDestRef = useRef<[number, number] | null>(null);
  const navCallbackRef = useRef<((info: {dist: number, dur: number}) => void) | null>(null);

  // Expose showRoute/clearRoute to parent
  useImperativeHandle(ref, () => ({
    showRoute: async (from: [number, number], to: [number, number], spotName: string) => {
      if (!mapInstanceRef.current) return;
      const L = (await import('leaflet')).default;
      const map = mapInstanceRef.current;

      // Clear previous route
      if (routeLayerRef.current) {
        routeLayerRef.current.remove();
        routeLayerRef.current = null;
      }
      if (routeInfoRef.current) {
        routeInfoRef.current.remove();
        routeInfoRef.current = null;
      }

      try {
        // Call OSRM free routing API
        const url = `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson&steps=true`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const coords: [number, number][] = route.geometry.coordinates.map(
            (c: [number, number]) => [c[1], c[0]] // GeoJSON is [lng, lat], Leaflet needs [lat, lng]
          );

          // Draw route polyline
          routeLayerRef.current = L.polyline(coords, {
            color: '#3B82F6',
            weight: 5,
            opacity: 0.85,
            dashArray: '10 6',
            lineCap: 'round',
          }).addTo(map);

          // Add start & end markers
          const startIcon = L.divIcon({
            html: '<div style="width:14px;height:14px;background:#10b981;border:3px solid white;border-radius:50%;box-shadow:0 0 8px rgba(16,185,129,0.6);"></div>',
            iconSize: [14, 14], iconAnchor: [7, 7], className: '',
          });
          const endIcon = L.divIcon({
            html: '<div style="width:18px;height:18px;background:#ef4444;border:3px solid white;border-radius:50%;box-shadow:0 0 8px rgba(239,68,68,0.6);"></div>',
            iconSize: [18, 18], iconAnchor: [9, 9], className: '',
          });
          const startMarker = L.marker(from, { icon: startIcon }).addTo(map).bindPopup('📍 Vị trí của bạn');
          const endMarker = L.marker(to, { icon: endIcon }).addTo(map).bindPopup(`🏁 ${spotName}`);
          markersRef.current.push(startMarker, endMarker);

          // Distance & duration info overlay
          const distKm = (route.distance / 1000).toFixed(1);
          const durationMin = Math.ceil(route.duration / 60);

          const InfoControl = L.Control.extend({
            onAdd: () => {
              const div = L.DomUtil.create('div', '');
              div.innerHTML = `
                <div style="
                  background: rgba(13,13,18,0.92);
                  backdrop-filter: blur(20px);
                  border: 1px solid rgba(255,255,255,0.1);
                  border-radius: 16px;
                  padding: 14px 20px;
                  color: #fff;
                  font-family: 'Inter', sans-serif;
                  min-width: 220px;
                  box-shadow: 0 8px 32px rgba(0,0,0,0.4);
                ">
                  <div style="font-size:13px;color:#a0a0b0;margin-bottom:6px;">🧭 Đường đi đến</div>
                  <div style="font-size:16px;font-weight:700;margin-bottom:10px;">${spotName}</div>
                  <div style="display:flex;gap:16px;font-size:14px;">
                    <span>📏 <strong>${distKm} km</strong></span>
                    <span>⏱️ <strong>${durationMin} phút</strong></span>
                  </div>
                  <button onclick="document.dispatchEvent(new Event('clearRoute'))" style="
                    margin-top:12px;width:100%;padding:8px;border-radius:10px;border:none;
                    background:rgba(239,68,68,0.2);color:#ef4444;font-weight:600;cursor:pointer;
                    font-size:13px;
                  ">✕ Đóng chỉ đường</button>
                </div>
              `;
              L.DomEvent.disableClickPropagation(div);
              return div;
            },
          });

          routeInfoRef.current = new InfoControl({ position: 'bottomleft' });
          routeInfoRef.current.addTo(map);

          // Fit map to route bounds
          map.fitBounds(routeLayerRef.current.getBounds(), { padding: [60, 60] });
        }
      } catch (err) {
        console.error('Routing error:', err);
        // Fallback: just draw a straight line
        routeLayerRef.current = L.polyline([from, to], {
          color: '#3B82F6', weight: 3, opacity: 0.7, dashArray: '8 4',
        }).addTo(map);
        map.fitBounds(routeLayerRef.current.getBounds(), { padding: [60, 60] });
      }
    },

    clearRoute: () => {
      if (routeLayerRef.current) {
        routeLayerRef.current.remove();
        routeLayerRef.current = null;
      }
      if (routeInfoRef.current) {
        routeInfoRef.current.remove();
        routeInfoRef.current = null;
      }
    },

    startNavigation: async (dest: [number, number], destName: string) => {
      if (!mapInstanceRef.current || !navigator.geolocation) return;
      const L = (await import('leaflet')).default;
      const map = mapInstanceRef.current;

      navDestRef.current = dest;

      // Navigation arrow marker
      const navIcon = L.divIcon({
        html: `<div style="
          width:24px;height:24px;background:linear-gradient(135deg,#3B82F6,#2563EB);
          border:3px solid white;border-radius:50%;box-shadow:0 0 16px rgba(59,130,246,0.8);
          display:flex;align-items:center;justify-content:center;
        "><div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-bottom:10px solid white;margin-top:-2px;"></div></div>`,
        iconSize: [24, 24], iconAnchor: [12, 12], className: '',
      });

      // Watch GPS
      navWatchIdRef.current = navigator.geolocation.watchPosition(
        async (pos) => {
          const userPos: [number, number] = [pos.coords.latitude, pos.coords.longitude];

          // Update/create nav marker
          if (navMarkerRef.current) {
            navMarkerRef.current.setLatLng(userPos);
          } else {
            navMarkerRef.current = L.marker(userPos, { icon: navIcon, zIndexOffset: 1000 }).addTo(map);
          }

          // Center map on user, zoom in
          map.setView(userPos, Math.max(map.getZoom(), 16), { animate: true });

          // Calculate remaining distance (haversine)
          const R = 6371;
          const dLat = (dest[0] - userPos[0]) * Math.PI / 180;
          const dLon = (dest[1] - userPos[1]) * Math.PI / 180;
          const a = Math.sin(dLat/2)**2 + Math.cos(userPos[0]*Math.PI/180) * Math.cos(dest[0]*Math.PI/180) * Math.sin(dLon/2)**2;
          const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          const dur = Math.ceil(dist / 30 * 60); // ~30km/h avg

          // Dispatch nav update event
          document.dispatchEvent(new CustomEvent('navUpdate', { detail: { dist, dur, lat: userPos[0], lng: userPos[1] } }));

          // Arrived? (< 50m)
          if (dist < 0.05) {
            document.dispatchEvent(new Event('navArrived'));
          }
        },
        (err) => console.error('Nav GPS error:', err),
        { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
      );
    },

    stopNavigation: () => {
      if (navWatchIdRef.current !== null) {
        navigator.geolocation.clearWatch(navWatchIdRef.current);
        navWatchIdRef.current = null;
      }
      if (navMarkerRef.current) {
        navMarkerRef.current.remove();
        navMarkerRef.current = null;
      }
      navDestRef.current = null;
    },
  }));

  // Listen for clearRoute event from the info panel button
  useEffect(() => {
    const handler = () => {
      if (routeLayerRef.current) {
        routeLayerRef.current.remove();
        routeLayerRef.current = null;
      }
      if (routeInfoRef.current) {
        routeInfoRef.current.remove();
        routeInfoRef.current = null;
      }
    };
    document.addEventListener('clearRoute', handler);
    return () => document.removeEventListener('clearRoute', handler);
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');

      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView(center, zoom);
      } else {
        mapInstanceRef.current = L.map(mapRef.current!, {
          center,
          zoom,
          zoomControl: true,
          attributionControl: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(mapInstanceRef.current);
      }

      // Clear existing markers (but keep route)
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      // User location
      if (showUserLocation && userLocation) {
        const userIcon = L.divIcon({
          html: '<div style="width:16px;height:16px;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 0 10px rgba(59,130,246,0.5);"></div>',
          iconSize: [16, 16], iconAnchor: [8, 8], className: '',
        });
        const userMarker = L.marker(userLocation, { icon: userIcon })
          .addTo(mapInstanceRef.current)
          .bindPopup('📍 Vị trí của bạn');
        markersRef.current.push(userMarker);
      }

      // Spot markers
      spots.forEach((spot) => {
        const isSelected = selectedSpotId === spot.id;
        const typeIcon = SPOT_TYPE_ICONS[spot.type] || '📍';
        const icon = L.divIcon({
          html: `<div style="
            font-size: ${isSelected ? '28px' : '22px'};
            filter: ${isSelected ? 'drop-shadow(0 0 8px rgba(16,185,129,0.7))' : 'drop-shadow(0 2px 2px rgba(0,0,0,0.3))'};
            transition: all 0.2s ease;
            cursor: pointer;
          ">${typeIcon}</div>`,
          iconSize: [32, 32], iconAnchor: [16, 16], className: '',
        });

        const marker = L.marker([spot.latitude, spot.longitude], { icon })
          .addTo(mapInstanceRef.current!);

        marker.on('click', () => {
          if (onSpotClick) onSpotClick(spot);
        });

        markersRef.current.push(marker);
      });
    };

    initMap();

    return () => {};
  }, [spots, center, zoom, selectedSpotId, onSpotClick, showUserLocation, userLocation]);

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={mapRef}
      style={{
        width: '100%',
        height: '100%',
        minHeight: '400px',
        borderRadius: 'var(--radius-lg, 12px)',
        ...style,
      }}
    />
  );
});

MapComponent.displayName = 'MapComponent';
export default MapComponent;
