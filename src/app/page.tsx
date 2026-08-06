'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import SpotCard from '@/components/SpotCard';
import LanguageSelector from '@/components/LanguageSelector';
import { useLocale } from '@/contexts/LocaleContext';
import { useGeolocation } from '@/hooks/useGeolocation';
import api from '@/lib/api';
import type { Spot, SpotType } from '@/lib/types';
import type { MapHandle } from '@/components/Map';

const MapComponent = dynamic(() => import('@/components/Map'), { ssr: false });

export default function HomePage() {
  const { locale, setLocale, t } = useLocale();
  const { latitude, longitude } = useGeolocation();
  const [spots, setSpots] = useState<Spot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<SpotType | 'all'>('all');
  const [hasCarParking, setHasCarParking] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [bottomSheetState, setBottomSheetState] = useState<'peek' | 'full' | 'detail'>('peek');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isRouting, setIsRouting] = useState(false);
  const mapComponentRef = useRef<MapHandle>(null);

  // Bottom sheet gesture ref
  const sheetRef = useRef<HTMLDivElement>(null);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);

  const fetchSpots = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeFilter !== 'all') params.set('type', activeFilter);
      if (searchQuery) params.set('search', searchQuery);
      if (latitude) params.set('lat', String(latitude));
      if (longitude) params.set('lng', String(longitude));
      if (hasCarParking) params.set('hasCarParking', '1');
      params.set('limit', '100');

      const data = await api.get<{ spots: Spot[] }>(`/api/spots?${params.toString()}`);
      setSpots(data.spots || []);
      // Auto-expand bottom sheet when search has results
      if (searchQuery && (data.spots || []).length > 0 && window.innerWidth < 768) {
        setBottomSheetState('full');
      }
    } catch {
      setSpots(getMockSpots());
    } finally {
      setIsLoading(false);
    }
  }, [activeFilter, searchQuery, latitude, longitude, hasCarParking]);

  useEffect(() => {
    fetchSpots();
  }, [fetchSpots]);

  // Dedicated search function — always resets state & forces fresh fetch
  const doSearch = useCallback(() => {
    // Clear routing if active
    if (isRouting && mapComponentRef.current) {
      mapComponentRef.current.clearRoute();
      setIsRouting(false);
    }
    // Clear selected spot detail
    setSelectedSpot(null);
    if (bottomSheetState === 'detail') {
      setBottomSheetState('peek');
    }
    // Force re-fetch (even if query didn't change)
    fetchSpots();
  }, [fetchSpots, isRouting, bottomSheetState]);

  // Auto-route from URL params (from spot detail page)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const routeTo = params.get('route_to');
    const destLat = params.get('lat');
    const destLng = params.get('lng');
    const destName = params.get('name');
    
    if (routeTo && destLat && destLng && destName && latitude && longitude) {
      // Small delay to let map initialize
      setTimeout(() => {
        if (mapComponentRef.current) {
          mapComponentRef.current.showRoute(
            [latitude, longitude],
            [parseFloat(destLat), parseFloat(destLng)],
            decodeURIComponent(destName)
          );
          setIsRouting(true);
          setBottomSheetState('peek');
          // Clean URL
          window.history.replaceState({}, '', '/');
        }
      }, 1500);
    }
  }, [latitude, longitude]);

  const mapCenter: [number, number] = useMemo(
    () => [latitude || 10.7769, longitude || 106.7009],
    [latitude, longitude]
  );

  const handleMarkerClick = useCallback((spot: Spot) => {
    setSelectedSpot(spot);
    setBottomSheetState('detail');
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      setSidebarCollapsed(false);
    }
  }, []);

  const [routingDest, setRoutingDest] = useState<Spot | null>(null);

  const handleDirections = useCallback((spot: Spot) => {
    if (!latitude || !longitude) {
      alert(t('gps_not_available'));
      return;
    }
    if (mapComponentRef.current) {
      mapComponentRef.current.showRoute(
        [latitude, longitude],
        [spot.latitude, spot.longitude],
        spot.name
      );
      setIsRouting(true);
      setRoutingDest(spot);
      setBottomSheetState('peek');
    }
  }, [latitude, longitude]);

  // In-app real-time navigation
  const [isNavigating, setIsNavigating] = useState(false);
  const [navInfo, setNavInfo] = useState<{ dist: number; dur: number } | null>(null);

  const startNavMode = useCallback(() => {
    if (!routingDest || !mapComponentRef.current) return;
    mapComponentRef.current.startNavigation(
      [routingDest.latitude, routingDest.longitude],
      routingDest.name
    );
    setIsNavigating(true);
    setBottomSheetState('peek');
  }, [routingDest]);

  const stopNavMode = useCallback(() => {
    if (mapComponentRef.current) {
      mapComponentRef.current.stopNavigation();
      mapComponentRef.current.clearRoute();
    }
    setIsNavigating(false);
    setIsRouting(false);
    setRoutingDest(null);
    setNavInfo(null);
  }, []);

  // Listen for nav updates from Map
  useEffect(() => {
    const handleNavUpdate = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setNavInfo({ dist: detail.dist, dur: detail.dur });
    };
    const handleArrived = () => {
      alert('🎉 ' + t('arrived'));
      stopNavMode();
    };
    document.addEventListener('navUpdate', handleNavUpdate);
    document.addEventListener('navArrived', handleArrived);
    return () => {
      document.removeEventListener('navUpdate', handleNavUpdate);
      document.removeEventListener('navArrived', handleArrived);
    };
  }, [stopNavMode]);

  const handleClearRoute = useCallback(() => {
    if (mapComponentRef.current) {
      mapComponentRef.current.clearRoute();
      setIsRouting(false);
    }
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
    setCurrentY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setCurrentY(e.touches[0].clientY);
    const diff = currentY - startY;
    if (sheetRef.current) {
      if (diff > 0 && bottomSheetState === 'full') {
        sheetRef.current.style.transform = `translateY(${diff}px)`;
      }
    }
  };

  const handleTouchEnd = () => {
    const diff = currentY - startY;
    if (sheetRef.current) {
      sheetRef.current.style.transform = '';
    }
    if (bottomSheetState === 'peek' && diff < -50) {
      setBottomSheetState('full');
    } else if (bottomSheetState === 'full' && diff > 50) {
      setBottomSheetState('peek');
    } else if (bottomSheetState === 'detail' && diff > 50) {
      setBottomSheetState('full');
      setSelectedSpot(null);
    }
  };

  const categories = [
    { id: 'all', name: t('all'), icon: '🌐' },
    { id: 'PARKING_LOT', name: t('parking'), icon: '🚗' },
    { id: 'RESTAURANT', name: t('restaurant'), icon: '🍜' },
    { id: 'CAFE', name: t('cafe'), icon: '☕' },
    { id: 'RESTROOM', name: t('restroom'), icon: '🚻' },
    { id: 'SERVICE', name: t('service'), icon: '🛒' },
  ];

  return (
    <div className="page-map-layout">
      {/* MOBILE HEADER / SEARCH */}
      <div className="floating-search">
        <div className="mobile-brand-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', padding: '0 4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src="/logo.png" alt="MapGo" style={{ width: '32px', height: '32px', borderRadius: '50%', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }} />
            <span style={{ fontSize: '17px', fontWeight: 700, color: '#ffffff', textShadow: '0 2px 6px rgba(0,0,0,0.8)', letterSpacing: '-0.3px' }}>MapGo.vn</span>
          </div>
          <LanguageSelector compact={true} align="right" />
        </div>
        <div className="search-input-wrap">
          <input
            className="search-field"
            type="text"
            placeholder={t('search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && doSearch()}
          />
          <div className="filter-btn" onClick={() => doSearch()}>
            🔍
          </div>
        </div>
      </div>

      <div className="floating-chips">
        {categories.map((c) => (
          <div
            key={c.id}
            className={`floating-chip ${activeFilter === c.id ? 'active' : ''}`}
            onClick={() => setActiveFilter(c.id as any)}
          >
            {c.icon} {c.name}
          </div>
        ))}
        <div
          className={`floating-chip ${hasCarParking ? 'active' : ''}`}
          onClick={() => setHasCarParking(v => !v)}
          style={hasCarParking ? { background: 'rgba(234,179,8,0.25)', borderColor: '#eab308', color: '#fde047' } : {}}
        >
          🚗 Có bãi ô tô
        </div>
      </div>

      {/* DESKTOP SIDEBAR */}
      <div className={`desktop-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src="/logo.png" alt="MapGo" style={{ width: '38px', height: '38px', borderRadius: '50%' }} />
              <span style={{ fontSize: '18px', fontWeight: 700 }}>MapGo.vn</span>
            </div>
            <LanguageSelector compact={true} />
          </div>
          <div className="search-bar" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}>
            <input
              type="text"
              placeholder={t('search_desktop_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && doSearch()}
            />
          </div>
        </div>

        <div className="sidebar-chips">
          {categories.map((c) => (
            <div
              key={c.id}
              className={`chip ${activeFilter === c.id ? 'active' : ''}`}
              onClick={() => setActiveFilter(c.id as any)}
              style={{ fontSize: '12px', padding: '6px 12px' }}
            >
              {c.icon} {c.name}
            </div>
          ))}
          <div
            className={`chip ${hasCarParking ? 'active' : ''}`}
            onClick={() => setHasCarParking(v => !v)}
            style={{ fontSize: '12px', padding: '6px 12px', ...(hasCarParking ? { background: 'rgba(234,179,8,0.2)', borderColor: '#eab308', color: '#fde047' } : {}) }}
          >
            🚗 Có bãi ô tô
          </div>
        </div>

        <div className="sidebar-results">
          {selectedSpot ? (
            <div className="spot-detail-sidebar">
              <button className="btn btn-ghost" onClick={() => setSelectedSpot(null)} style={{ marginBottom: '12px' }}>
                ◀ {t('back')}
              </button>
              <img src={selectedSpot.images?.[0] || 'https://via.placeholder.com/400x200?text=No+Image'} alt={selectedSpot.name} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '12px', marginBottom: '16px' }} />
              <h2 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 8px' }}>{selectedSpot.name}</h2>
              <p style={{ color: '#a0a0b0', marginBottom: '16px' }}>{selectedSpot.address}</p>
              
              <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                <button onClick={() => handleDirections(selectedSpot)} className="btn btn-primary" style={{ flex: 1 }}>
                  🧭 {t('directions')}
                </button>
                {selectedSpot.phone && (
                  <a href={`tel:${selectedSpot.phone}`} className="btn btn-secondary" style={{ flex: 1 }}>
                    📞 {t('call')}
                  </a>
                )}
              </div>

              {selectedSpot.description && (
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>{t('info')}</h3>
                  <p style={{ color: '#a0a0b0', fontSize: '14px' }}>{selectedSpot.description}</p>
                </div>
              )}
            </div>
          ) : (
            <>
              {isLoading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>{t('loading')}</div>
              ) : spots.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {spots.map((spot) => (
                    <div key={spot.id} onClick={() => handleMarkerClick(spot)} style={{ cursor: 'pointer' }}>
                      <SpotCard spot={spot} onDirections={handleDirections} onCardClick={handleMarkerClick} />
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6b6b80' }}>
                  {t('no_results')}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      <div 
        className={`sidebar-toggle ${sidebarCollapsed ? 'closed' : 'open'}`}
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
      >
        {sidebarCollapsed ? '▶' : '◀'}
      </div>

      {/* MAP */}
      <div 
        className={`map-fullscreen ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}
        onClick={() => {
          // Close detail panel when tapping on map background
          if (bottomSheetState === 'detail') {
            setSelectedSpot(null);
            setBottomSheetState('peek');
          }
        }}
      >
        <MapComponent
          ref={mapComponentRef}
          spots={spots}
          center={mapCenter}
          selectedSpotId={selectedSpot?.id}
          onSpotClick={handleMarkerClick}
          userLocation={latitude && longitude ? [latitude, longitude] : null}
          style={{ width: '100%', height: '100%', borderRadius: 0 }}
        />
      </div>

      {/* ROUTING NAVIGATION BAR */}
      {isRouting && routingDest && (
        <div style={{
          position: 'fixed',
          bottom: isNavigating ? '20px' : (typeof window !== 'undefined' && window.innerWidth >= 768 ? '20px' : '170px'),
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 250,
          background: isNavigating ? 'rgba(0,80,20,0.95)' : 'rgba(13,13,18,0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: `1px solid ${isNavigating ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.1)'}`,
          borderRadius: '16px',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          maxWidth: '420px',
          width: 'calc(100% - 32px)',
          boxShadow: isNavigating ? '0 8px 32px rgba(34,197,94,0.3)' : '0 8px 32px rgba(0,0,0,0.5)',
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {isNavigating ? '🧭 ' + t('navigating') : '📍'} {routingDest.name}
            </div>
            <div style={{ fontSize: '12px', color: isNavigating ? '#86efac' : '#8b8b9e', marginTop: '3px', fontWeight: isNavigating ? 600 : 400 }}>
              {isNavigating && navInfo
                ? `📏 ${navInfo.dist.toFixed(1)} ${t('km')} · ⏱️ ~${navInfo.dur} ${t('minutes')}`
                : routingDest.distance
                  ? `${routingDest.distance.toFixed(1)} km`
                  : routingDest.address?.substring(0, 35)
              }
            </div>
          </div>
          {!isNavigating ? (
            <button
              onClick={startNavMode}
              style={{
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                border: 'none', borderRadius: '12px', color: '#fff',
                padding: '10px 18px', fontSize: '13px', fontWeight: 700,
                cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              🚀 {t('go_now')}
            </button>
          ) : null}
          <button
            onClick={() => { isNavigating ? stopNavMode() : (() => { handleClearRoute(); setRoutingDest(null); })(); }}
            style={{
              background: isNavigating ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.08)',
              border: `1px solid ${isNavigating ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.15)'}`,
              borderRadius: '12px', color: isNavigating ? '#fca5a5' : '#a0a0b0',
              padding: '10px 14px', fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >
            {isNavigating ? '⏹️ ' + t('stop') : '✕ ' + t('cancel')}
          </button>
        </div>
      )}

      {/* MOBILE BOTTOM SHEET */}
      <div className="bottom-sheet-overlay">
        <div
          ref={sheetRef}
          className="bottom-sheet"
          style={{
            transform: bottomSheetState === 'full' 
              ? 'translateY(0)' 
              : bottomSheetState === 'detail' 
                ? 'translateY(0)' 
                : 'translateY(calc(100% - 160px))' // peek state
          }}
        >
          <div 
            className="bottom-sheet-handle"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ cursor: 'grab', padding: '12px 0' }}
          >
            <div className="bottom-sheet-handle-bar" />
          </div>
          
          <div className="bottom-sheet-content">
            {bottomSheetState === 'detail' && selectedSpot ? (
              <div className="spot-detail-sheet" style={{ position: 'relative' }}>
                {/* X Close button */}
                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedSpot(null); setBottomSheetState('peek'); }}
                  style={{
                    position: 'absolute', top: '10px', right: '10px', zIndex: 10,
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
                    border: 'none', color: '#fff', fontSize: '16px',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  ✕
                </button>
                <img 
                  src={selectedSpot.images?.[0] || 'https://via.placeholder.com/400x200?text=No+Image'} 
                  className="spot-hero" 
                  alt={selectedSpot.name} 
                />
                <div className="spot-info">
                  <div className="spot-name">{selectedSpot.name}</div>
                  <div className="spot-meta">{selectedSpot.address}</div>
                  {selectedSpot.distance != null && (
                    <div style={{ fontSize: '13px', color: '#86efac', marginTop: '4px', fontWeight: 600 }}>
                      📍 {selectedSpot.distance.toFixed(1)} {t('km_from_you')}
                    </div>
                  )}
                  <div className="spot-actions" style={{ marginTop: '12px' }}>
                    <button 
                      onClick={() => {
                        handleDirections(selectedSpot);
                        setTimeout(() => {
                          if (mapComponentRef.current) {
                            mapComponentRef.current.startNavigation(
                              [selectedSpot.latitude, selectedSpot.longitude],
                              selectedSpot.name
                            );
                            setIsNavigating(true);
                          }
                        }, 1500);
                      }} 
                      style={{ 
                        flex: 1, padding: '14px', fontSize: '14px', fontWeight: 700,
                        border: 'none', borderRadius: '14px', cursor: 'pointer',
                        background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff',
                      }}
                    >
                      🚀 {t('go_now')}
                    </button>
                    <button 
                      onClick={() => handleDirections(selectedSpot)} 
                      className="btn btn-primary" 
                      style={{ flex: 1, padding: '14px' }}
                    >
                      🧭 {t('directions')}
                    </button>
                    {selectedSpot.phone && (
                      <a href={`tel:${selectedSpot.phone}`} className="btn btn-secondary" style={{ padding: '14px' }}>
                        📞
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="bottom-sheet-title">
                  {spots.length} {t('spots_nearby')}
                </div>
                {isLoading ? (
                  <div style={{ textAlign: 'center', padding: '20px' }}>{t('loading')}</div>
                ) : spots.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {spots.map((spot) => (
                      <div key={spot.id}>
                        <SpotCard spot={spot} onDirections={handleDirections} onCardClick={handleMarkerClick} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#6b6b80' }}>
                    {t('no_results')}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      {/* FAB — Đăng tin (Mobile + Desktop) — hide when detail/full on mobile */}
      {bottomSheetState === 'peek' && (
        <Link href="/business/post" style={{ textDecoration: 'none' }}>
          <button className="fab-post" title={t('post_spot')}>
            ➕
          </button>
          <span className="fab-post-label">{t('post_spot')}</span>
        </Link>
      )}
      {/* Hidden Semantic SEO Heading & Keywords Block for Google Indexing */}
      <div style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0 }}>
        <h1>MapGo.vn - Tìm bãi đỗ xe quanh đây, Quán ăn có bãi đỗ xe, Nhà vệ sinh gần đây, Quán cafe có bãi đỗ xe tại TP.HCM</h1>
        <h2>Bản đồ tiện ích thông minh tìm kiếm địa điểm đỗ xe ô tô, xe máy, quán ăn, nhà hàng, quán cà phê và nhà vệ sinh công cộng gần bạn nhất</h2>
        <p>
          MapGo.vn giúp bạn tìm bãi đỗ xe quanh đây, quán ăn có bãi đỗ xe, quán cafe đỗ xe ô tô, nhà vệ sinh công cộng sạch sẽ gần đây tại Quận 1, Quận 3, Quận 7, TP Thủ Đức, Bình Thạnh, Gò Vấp, Phú Nhuận, Quận 10 và toàn bộ TP.HCM. Hỗ trợ chỉ đường GPS trực tiếp trên bản đồ miễn phí 24/7.
        </p>
      </div>
    </div>
  );
}

// Mock data
function getMockSpots(): Spot[] {
  return [
    {
      id: '1',
      name: 'Bãi xe Nguyễn Huệ',
      type: 'PARKING_LOT',
      address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
      latitude: 10.7735,
      longitude: 106.7031,
      description: 'Bãi xe rộng rãi, an ninh 24/7',
      phone: '0901234567',
      images: [],
      carSlots: 50,
      bikeSlots: 200,
      pricePerHourCar: 30000,
      pricePerHourBike: 5000,
      openTime: '06:00',
      closeTime: '22:00',
      rating: 4.5,
      reviewCount: 128,
      isPremium: true,
      isVerified: true,
      status: 'active',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
    {
      id: '2',
      name: 'Quán Phở 24',
      type: 'RESTAURANT',
      address: '45 Lê Lợi, Quận 1, TP.HCM',
      latitude: 10.7739,
      longitude: 106.6999,
      description: 'Quán ăn có chỗ gửi xe miễn phí',
      phone: '0909876543',
      images: [],
      carSlots: 10,
      bikeSlots: 30,
      pricePerHourBike: 0,
      openTime: '06:00',
      closeTime: '23:00',
      rating: 4.2,
      reviewCount: 85,
      isPremium: false,
      isVerified: true,
      status: 'active',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15',
    }
  ];
}
