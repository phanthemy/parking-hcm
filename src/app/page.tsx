'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import SpotCard from '@/components/SpotCard';
import { useGeolocation } from '@/hooks/useGeolocation';
import api from '@/lib/api';
import type { Spot, SpotType } from '@/lib/types';
import type { MapHandle } from '@/components/Map';

const MapComponent = dynamic(() => import('@/components/Map'), { ssr: false });

export default function HomePage() {
  const { latitude, longitude } = useGeolocation();
  const [spots, setSpots] = useState<Spot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<SpotType | 'all'>('all');
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
  }, [activeFilter, searchQuery, latitude, longitude]);

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
    if (window.innerWidth >= 768) {
      setSidebarCollapsed(false);
    }
  }, []);

  const handleDirections = useCallback((spot: Spot) => {
    if (!latitude || !longitude) {
      alert('Chưa xác định được vị trí của bạn. Vui lòng bật GPS.');
      return;
    }
    if (mapComponentRef.current) {
      mapComponentRef.current.showRoute(
        [latitude, longitude],
        [spot.latitude, spot.longitude],
        spot.name
      );
      setIsRouting(true);
      setBottomSheetState('peek');
    }
  }, [latitude, longitude]);

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
      setBottomSheetState('peek');
      setSelectedSpot(null);
    }
  };

  const categories = [
    { id: 'all', name: 'Tất cả', icon: '🌐' },
    { id: 'PARKING_LOT', name: 'Bãi xe', icon: '🚗' },
    { id: 'RESTAURANT', name: 'Quán ăn', icon: '🍜' },
    { id: 'CAFE', name: 'Cà phê', icon: '☕' },
    { id: 'RESTROOM', name: 'Vệ sinh', icon: '🚻' },
    { id: 'SERVICE', name: 'Dịch vụ', icon: '🛒' },
  ];

  return (
    <div className="page-map-layout">
      {/* MOBILE HEADER / SEARCH */}
      <div className="floating-search">
        <div className="search-input-wrap">
          <input
            className="search-field"
            type="text"
            placeholder="Tìm địa điểm, bãi xe..."
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
      </div>

      {/* DESKTOP SIDEBAR */}
      <div className={`desktop-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ fontSize: '24px' }}>🅿️</span>
            <span style={{ fontSize: '18px', fontWeight: 700 }}>ParkingHCM</span>
          </div>
          <div className="search-bar" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}>
            <input
              type="text"
              placeholder="Tìm kiếm..."
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
        </div>

        <div className="sidebar-results">
          {selectedSpot ? (
            <div className="spot-detail-sidebar">
              <button className="btn btn-ghost" onClick={() => setSelectedSpot(null)} style={{ marginBottom: '12px' }}>
                ◀ Quay lại
              </button>
              <img src={selectedSpot.images?.[0] || 'https://via.placeholder.com/400x200?text=No+Image'} alt={selectedSpot.name} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '12px', marginBottom: '16px' }} />
              <h2 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 8px' }}>{selectedSpot.name}</h2>
              <p style={{ color: '#a0a0b0', marginBottom: '16px' }}>{selectedSpot.address}</p>
              
              <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                <button onClick={() => handleDirections(selectedSpot)} className="btn btn-primary" style={{ flex: 1 }}>
                  🧭 Chỉ đường
                </button>
                {selectedSpot.phone && (
                  <a href={`tel:${selectedSpot.phone}`} className="btn btn-secondary" style={{ flex: 1 }}>
                    📞 Gọi điện
                  </a>
                )}
              </div>

              {selectedSpot.description && (
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>Thông tin</h3>
                  <p style={{ color: '#a0a0b0', fontSize: '14px' }}>{selectedSpot.description}</p>
                </div>
              )}
            </div>
          ) : (
            <>
              {isLoading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>Đang tải...</div>
              ) : spots.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {spots.map((spot) => (
                    <div key={spot.id} onClick={() => handleMarkerClick(spot)} style={{ cursor: 'pointer' }}>
                      <SpotCard spot={spot} onDirections={handleDirections} />
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6b6b80' }}>
                  Không tìm thấy kết quả.
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
      <div className={`map-fullscreen ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
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
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="bottom-sheet-handle">
            <div className="bottom-sheet-handle-bar" />
          </div>
          
          <div className="bottom-sheet-content">
            {bottomSheetState === 'detail' && selectedSpot ? (
              <div className="spot-detail-sheet">
                <img 
                  src={selectedSpot.images?.[0] || 'https://via.placeholder.com/400x200?text=No+Image'} 
                  className="spot-hero" 
                  alt={selectedSpot.name} 
                />
                <div className="spot-info">
                  <div className="spot-name">{selectedSpot.name}</div>
                  <div className="spot-meta">{selectedSpot.address}</div>
                  <div className="spot-actions">
                    <button onClick={() => handleDirections(selectedSpot)} className="btn btn-primary" style={{ flex: 1, padding: '12px' }}>
                      🧭 Chỉ đường
                    </button>
                    {selectedSpot.phone && (
                      <a href={`tel:${selectedSpot.phone}`} className="btn btn-secondary" style={{ flex: 1, padding: '12px' }}>
                        📞 Gọi điện
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="bottom-sheet-title">
                  {spots.length} địa điểm gần bạn
                </div>
                {isLoading ? (
                  <div style={{ textAlign: 'center', padding: '20px' }}>Đang tải...</div>
                ) : spots.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {spots.map((spot) => (
                      <div key={spot.id} onClick={() => handleMarkerClick(spot)}>
                        <SpotCard spot={spot} onDirections={handleDirections} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#6b6b80' }}>
                    Không tìm thấy kết quả.
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      {/* FAB — Đăng tin (Mobile + Desktop) */}
      <Link href="/business/post" style={{ textDecoration: 'none' }}>
        <button className="fab-post" title="Đăng tin địa điểm">
          ➕
        </button>
        <span className="fab-post-label">Đăng tin</span>
      </Link>
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
