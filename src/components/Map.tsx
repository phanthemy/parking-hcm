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

function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number) {
  const p1 = (lat1 * Math.PI) / 180;
  const p2 = (lat2 * Math.PI) / 180;
  const dL = ((lon2 - lon1) * Math.PI) / 180;
  const y = Math.sin(dL) * Math.cos(p2);
  const x = Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dL);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
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
  const spotMarkersRef = useRef<L.Marker[]>([]);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const routeInfoRef = useRef<L.Control | null>(null);
  const navWatchIdRef = useRef<number | null>(null);
  const navMarkerRef = useRef<L.Marker | null>(null);
  const navMarkerElRef = useRef<HTMLDivElement | null>(null);
  const lastNavPosRef = useRef<[number, number] | null>(null);

  // Expose showRoute / startNavigation API to parent
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
        const url = `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson&steps=true`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const coords: [number, number][] = route.geometry.coordinates.map(
            (c: [number, number]) => [c[1], c[0]]
          );

          routeLayerRef.current = L.polyline(coords, {
            color: '#3B82F6',
            weight: 6,
            opacity: 0.85,
            dashArray: '8 6',
            lineCap: 'round',
          }).addTo(map);

          const distKm = (route.distance / 1000).toFixed(1);
          const durationMin = Math.ceil(route.duration / 60);

          const InfoControl = L.Control.extend({
            onAdd: () => {
              const div = L.DomUtil.create('div', '');
              div.innerHTML = `
                <div style="
                  background: rgba(13,13,18,0.92);
                  backdrop-filter: blur(20px);
                  border: 1px solid rgba(255,255,255,0.12);
                  border-radius: 16px;
                  padding: 14px 20px;
                  color: #fff;
                  font-family: sans-serif;
                  min-width: 220px;
                  box-shadow: 0 8px 32px rgba(0,0,0,0.5);
                ">
                  <div style="font-size:13px;color:#a0a0b0;margin-bottom:4px;">🧭 Route to</div>
                  <div style="font-size:16px;font-weight:700;margin-bottom:8px;">${spotName}</div>
                  <div style="display:flex;gap:16px;font-size:14px;">
                    <span>📏 <strong>${distKm} km</strong></span>
                    <span>⏱️ <strong>${durationMin} min</strong></span>
                  </div>
                  <button onclick="document.dispatchEvent(new Event('clearRoute'))" style="
                    margin-top:10px;width:100%;padding:8px;border-radius:10px;border:none;
                    background:rgba(239,68,68,0.25);color:#ef4444;font-weight:600;cursor:pointer;
                    font-size:13px;
                  ">✕ Close</button>
                </div>
              `;
              L.DomEvent.disableClickPropagation(div);
              return div;
            },
          });

          routeInfoRef.current = new InfoControl({ position: 'bottomleft' });
          routeInfoRef.current.addTo(map);

          map.fitBounds(routeLayerRef.current.getBounds(), { padding: [60, 60], animate: true });
        }
      } catch (err) {
        console.error('Routing error:', err);
        routeLayerRef.current = L.polyline([from, to], {
          color: '#3B82F6', weight: 4, opacity: 0.8, dashArray: '6 4',
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

      // Stop previous nav watch if active
      if (navWatchIdRef.current !== null) {
        navigator.geolocation.clearWatch(navWatchIdRef.current);
      }

      // Real-time GPS watchPosition with zero maximumAge
      navWatchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const userPos: [number, number] = [pos.coords.latitude, pos.coords.longitude];

          // Calculate heading/bearing
          let heading = pos.coords.heading;
          if ((heading === null || isNaN(heading)) && lastNavPosRef.current) {
            heading = calculateBearing(
              lastNavPosRef.current[0],
              lastNavPosRef.current[1],
              userPos[0],
              userPos[1]
            );
          }
          if (heading === null || isNaN(heading)) heading = 0;

          // Update/create Navigation Marker with smooth rotation
          if (navMarkerRef.current && navMarkerElRef.current) {
            navMarkerRef.current.setLatLng(userPos);
            navMarkerElRef.current.style.transform = `rotate(${heading}deg)`;
          } else {
            const wrapperEl = document.createElement('div');
            wrapperEl.style.width = '32px';
            wrapperEl.style.height = '32px';
            wrapperEl.style.display = 'flex';
            wrapperEl.style.alignItems = 'center';
            wrapperEl.style.justifyContent = 'center';
            wrapperEl.style.transition = 'transform 0.4s ease-out';
            wrapperEl.style.transform = `rotate(${heading}deg)`;
            wrapperEl.innerHTML = `
              <div style="
                width: 26px; height: 26px;
                background: linear-gradient(135deg, #3B82F6, #1D4ED8);
                border: 3px solid #ffffff;
                border-radius: 50%;
                box-shadow: 0 0 16px rgba(59,130,246,0.9), 0 4px 12px rgba(0,0,0,0.5);
                display: flex; align-items: center; justify-content: center;
              ">
                <div style="
                  width: 0; height: 0;
                  border-left: 5px solid transparent;
                  border-right: 5px solid transparent;
                  border-bottom: 10px solid #ffffff;
                  margin-top: -2px;
                "></div>
              </div>
            `;
            navMarkerElRef.current = wrapperEl;

            const navIcon = L.divIcon({
              html: wrapperEl,
              iconSize: [32, 32],
              iconAnchor: [16, 16],
              className: '',
            });

            navMarkerRef.current = L.marker(userPos, { icon: navIcon, zIndexOffset: 2000 }).addTo(map);
          }

          // Smooth map panning without setView jitter
          if (!lastNavPosRef.current) {
            map.setView(userPos, 17, { animate: true });
          } else {
            const movedKm = calculateDistanceKm(
              lastNavPosRef.current[0],
              lastNavPosRef.current[1],
              userPos[0],
              userPos[1]
            );
            // Pan smoothly only if moved more than 2 meters
            if (movedKm > 0.002) {
              map.panTo(userPos, { animate: true, duration: 0.6 });
            }
          }

          lastNavPosRef.current = userPos;

          // Calculate remaining distance & ETA
          const dist = calculateDistanceKm(userPos[0], userPos[1], dest[0], dest[1]);
          const dur = Math.ceil((dist / 30) * 60); // 30 km/h avg city speed

          document.dispatchEvent(
            new CustomEvent('navUpdate', {
              detail: { dist, dur, lat: userPos[0], lng: userPos[1] },
            })
          );

          // Arrived (< 40m)
          if (dist < 0.04) {
            document.dispatchEvent(new Event('navArrived'));
          }
        },
        (err) => console.error('Realtime GPS Nav error:', err),
        {
          enableHighAccuracy: true,
          maximumAge: 0, // Fresh real-time GPS coords
          timeout: 5000,
        }
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
        navMarkerElRef.current = null;
      }
      lastNavPosRef.current = null;
    },
  }));

  // Handle clearRoute DOM event
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

  // 1. Initialize Leaflet Map Instance (ONCE)
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    let isMounted = true;

    const init = async () => {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');

      if (!isMounted || !mapRef.current || mapInstanceRef.current) return;

      const map = L.map(mapRef.current, {
        center,
        zoom,
        zoomControl: true,
        attributionControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    };

    init();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []); // Run once on mount

  // 2. Smoothly Update Map Center when prop changes
  useEffect(() => {
    if (mapInstanceRef.current && !navWatchIdRef.current) {
      mapInstanceRef.current.panTo(center, { animate: true, duration: 0.5 });
    }
  }, [center]);

  // 3. Render / Update User Location Marker (Without clearing spot markers or resetting view!)
  useEffect(() => {
    if (!mapInstanceRef.current || !showUserLocation) return;

    const updateUserMarker = async () => {
      const L = (await import('leaflet')).default;
      const map = mapInstanceRef.current!;

      if (userLocation) {
        const userIcon = L.divIcon({
          html: `<div style="
            width:18px;height:18px;background:#3b82f6;border:3px solid white;
            border-radius:50%;box-shadow:0 0 14px rgba(59,130,246,0.8);
          "></div>`,
          iconSize: [18, 18],
          iconAnchor: [9, 9],
          className: '',
        });

        if (userMarkerRef.current) {
          userMarkerRef.current.setLatLng(userLocation);
        } else {
          userMarkerRef.current = L.marker(userLocation, { icon: userIcon, zIndexOffset: 500 })
            .addTo(map)
            .bindPopup('📍 Your Location');
        }
      } else if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
    };

    updateUserMarker();
  }, [showUserLocation, userLocation]);

  // 4. Render Spot Markers (Only re-run when spots or selectedSpotId change)
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const updateSpotMarkers = async () => {
      const L = (await import('leaflet')).default;
      const map = mapInstanceRef.current!;

      // Clear previous spot markers
      spotMarkersRef.current.forEach((m) => m.remove());
      spotMarkersRef.current = [];

      spots.forEach((spot) => {
        const isSelected = selectedSpotId === spot.id;
        const typeIcon = SPOT_TYPE_ICONS[spot.type] || '📍';

        const icon = L.divIcon({
          html: `<div style="
            font-size: ${isSelected ? '28px' : '22px'};
            filter: ${isSelected ? 'drop-shadow(0 0 10px rgba(16,185,129,0.9))' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))'};
            transition: transform 0.2s ease;
            transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'};
            cursor: pointer;
          ">${typeIcon}</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          className: '',
        });

        const marker = L.marker([spot.latitude, spot.longitude], { icon }).addTo(map);

        marker.on('click', () => {
          if (onSpotClick) onSpotClick(spot);
        });

        spotMarkersRef.current.push(marker);
      });
    };

    updateSpotMarkers();
  }, [spots, selectedSpotId, onSpotClick]);

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
