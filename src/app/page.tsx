'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import SpotCard from '@/components/SpotCard';
import ImageGallery from '@/components/ImageGallery';
import LanguageSelector from '@/components/LanguageSelector';
import ReportBanModal from '@/components/ReportBanModal';
import { useLocale } from '@/contexts/LocaleContext';
import { useAuth } from '@/hooks/useAuth';
import { useGeolocation } from '@/hooks/useGeolocation';
import api from '@/lib/api';
import { haversine } from '@/lib/haversine';
import type { Spot, SpotType } from '@/lib/types';
import type { MapHandle } from '@/components/Map';
import SmartNearbyWidget from '@/components/SmartNearbyWidget';
import PwaInstallBanner from '@/components/PwaInstallBanner';
import UserRetentionDrawer from '@/components/UserRetentionDrawer';
import CommunityReportModal from '@/components/CommunityReportModal';
import { useUserRetention } from '@/contexts/UserRetentionContext';
import { trackEvent } from '@/lib/analytics';

const MapComponent = dynamic(() => import('@/components/Map'), { ssr: false });

export default function HomePage() {
  const { locale, setLocale, t } = useLocale();
  const { user, isAuthenticated } = useAuth();
  const { latitude, longitude } = useGeolocation();
  const { toggleFavorite, checkIsFavorite, saveRecentPlace, saveRecentlyViewed } = useUserRetention();
  const [spots, setSpots] = useState<Spot[]>([]);

  // Telemetry: track home opened and GPS
  useEffect(() => {
    trackEvent('home_opened');
  }, []);

  useEffect(() => {
    if (latitude && longitude) {
      trackEvent('gps_granted', { metadata: { lat: latitude, lng: longitude } });
    }
  }, [latitude, longitude]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<SpotType | 'all'>('all');
  const [hasCarParking, setHasCarParking] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [bottomSheetState, setBottomSheetState] = useState<'peek' | 'full' | 'detail'>('peek');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isRouting, setIsRouting] = useState(false);
  const [showBanReport, setShowBanReport] = useState(false);
  const [showRetentionDrawer, setShowRetentionDrawer] = useState(false);
  const [showSpotReportModal, setShowSpotReportModal] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [streetViewFullscreen, setStreetViewFullscreen] = useState(false);
  const mapComponentRef = useRef<MapHandle>(null);


  // Bottom sheet gesture ref
  const sheetRef = useRef<HTMLDivElement>(null);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);

  const [visibleLimit, setVisibleLimit] = useState(25);

  const fetchSpots = useCallback(async () => {
    setIsLoading(true);
    setVisibleLimit(25);
    try {
      const params = new URLSearchParams();
      if (activeFilter !== 'all') params.set('type', activeFilter);
      if (searchQuery) params.set('search', searchQuery);
      if (latitude) params.set('lat', String(latitude));
      if (longitude) params.set('lng', String(longitude));
      if (hasCarParking) params.set('hasCarParking', '1');
      // Tối ưu hiệu năng mobile: 180 điểm gần nhất để đảm bảo phản hồi tức thì, mượt mà 60 FPS
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
      params.set('limit', activeFilter === 'all' ? (isMobile ? '180' : '350') : '500');

      const data = await api.get<{ spots: Spot[]; totalCount?: number }>(`/api/spots?${params.toString()}`);
      setSpots(data.spots || []);
      // Auto-expand bottom sheet when search has results
      if (searchQuery && (data.spots || []).length > 0 && isMobile) {
        setBottomSheetState('full');
      }
    } catch {
      setSpots(getMockSpots());
    } finally {
      setIsLoading(false);
    }
  }, [activeFilter, searchQuery, latitude, longitude, hasCarParking]);

  // Fetch count từ /api/stats siêu nhẹ (< 1KB, 2ms) không tốn băng thông và CPU điện thoại
  const [allCounts, setAllCounts] = useState<Record<string, number>>({});
  const fetchAllCounts = useCallback(async () => {
    try {
      const data = await api.get<{ success: boolean; active_places: number; categories: Record<string, number> }>(`/api/stats`);
      if (data && data.categories) {
        const counts: Record<string, number> = {
          all: data.active_places || 1811,
          PARKING_LOT: data.categories['PARKING'] || 704,
          PARKING: data.categories['PARKING'] || 704,
          FUEL: data.categories['FUEL'] || 746,
          EV_CHARGING: data.categories['EV_CHARGING'] || 26,
          CAR_REPAIR: data.categories['CAR_REPAIR'] || 94,
          CAR_WASH: data.categories['CAR_WASH'] || 51,
          INSPECTION: data.categories['INSPECTION'] || 7,
          RESTROOM: data.categories['RESTROOM'] || 59,
          RESTAURANT: data.categories['RESTAURANT'] || 49,
          CAFE: data.categories['CAFE'] || 39,
          SERVICE: data.categories['SERVICE'] || 36,
        };
        setAllCounts(counts);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchAllCounts(); }, [fetchAllCounts]);

  useEffect(() => {
    fetchSpots();
  }, [fetchSpots]);

  // Fix Leaflet white space khi sidebar collapse/expand
  // Leaflet cần biết container thay đổi kích thước để re-render tiles
  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 350); // sau khi CSS transition 0.3s kết thúc
    return () => clearTimeout(timer);
  }, [sidebarCollapsed]);

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
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const routeTo = params.get('route_to');
    const destLat = params.get('lat');
    const destLng = params.get('lng');
    const destName = params.get('name');

    if (routeTo && destLat && destLng && destName) {
      const startLat = latitude || 10.7769;
      const startLng = longitude || 106.7009;
      const parsedLat = parseFloat(destLat);
      const parsedLng = parseFloat(destLng);
      const decodedName = decodeURIComponent(destName);

      const targetSpot: Spot = {
        id: routeTo,
        slug: `spot-${routeTo}`,
        name: decodedName,
        address: 'Địa điểm đến',
        latitude: parsedLat,
        longitude: parsedLng,
        type: 'PARKING_LOT',
        carSlots: 0,
        bikeSlots: 0,
        basePricePerHour: 0,
        openTime: '00:00',
        closeTime: '24:00',
        images: [],
        rating: 5,
        reviewCount: 0,
        isPremium: false,
        status: 'ACTIVE'
      };

      setRoutingDest(targetSpot);
      setSelectedSpot(targetSpot);
      setIsRouting(true);

      // Load full spot detail in background to get exact category & address
      api.get<Spot>(`/api/spots/${routeTo}`).then((fullSpot) => {
        if (fullSpot && fullSpot.id) {
          setRoutingDest(fullSpot);
          setSelectedSpot(fullSpot);
        }
      }).catch(() => {});

      const timer = setTimeout(() => {
        if (mapComponentRef.current) {
          mapComponentRef.current.showRoute(
            [startLat, startLng],
            [parsedLat, parsedLng],
            decodedName
          );
          setIsRouting(true);
          window.history.replaceState({}, '', '/');
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [latitude, longitude]);

  const mapCenter: [number, number] = useMemo(
    () => [latitude || 10.7769, longitude || 106.7009],
    [latitude, longitude]
  );

  // Tính toán 4 bãi xe / địa điểm tương tự gần nhất khi chọn 1 POI
  const nearbyAlternatives = useMemo(() => {
    if (!selectedSpot || !spots || spots.length <= 1) return [];
    const others = spots.filter(s => s.id !== selectedSpot.id);
    return others
      .map(s => {
        const d = haversine(selectedSpot.latitude, selectedSpot.longitude, s.latitude, s.longitude);
        return { ...s, distanceMeters: Math.round(d * 1000) };
      })
      .sort((a, b) => a.distanceMeters - b.distanceMeters)
      .slice(0, 4);
  }, [selectedSpot, spots]);

  const handleMarkerClick = useCallback((spot: Spot) => {
    setSelectedSpot(spot);
    saveRecentlyViewed(spot);
    setBottomSheetState('detail');
    if (mapComponentRef.current) {
      mapComponentRef.current.panTo([spot.latitude, spot.longitude]);
    }
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      setSidebarCollapsed(false);
    }
  }, [saveRecentlyViewed]);

  const [routingDest, setRoutingDest] = useState<Spot | null>(null);

  const handleDirections = useCallback((spot: Spot) => {
    const startLat = latitude || 10.7769;
    const startLng = longitude || 106.7009;
    saveRecentPlace(spot);
    if (mapComponentRef.current) {
      mapComponentRef.current.showRoute(
        [startLat, startLng],
        [spot.latitude, spot.longitude],
        spot.name
      );
      setIsRouting(true);
      setRoutingDest(spot);
      setSelectedSpot(spot);
      if (typeof window !== 'undefined' && window.innerWidth < 768) {
        setBottomSheetState('peek');
      }
    }
  }, [latitude, longitude, saveRecentPlace]);

  const handleSelectQuickService = useCallback((service: any) => {
    const startLat = latitude || 10.7769;
    const startLng = longitude || 106.7009;
    const targetSpot: Spot = {
      id: service.id,
      slug: `spot-${service.id}`,
      name: service.name,
      address: service.address,
      latitude: service.latitude,
      longitude: service.longitude,
      phone: service.phone,
      type: service.category === 'PARKING' ? 'PARKING_LOT' : service.category,
      carSlots: 0,
      bikeSlots: 0,
      basePricePerHour: 0,
      openTime: '00:00',
      closeTime: '24:00',
      images: [],
      rating: 5,
      reviewCount: 0,
      isPremium: false,
      status: 'ACTIVE',
      metadata: service.metadata
    };
    setRoutingDest(targetSpot);
    setSelectedSpot(targetSpot);
    setIsRouting(true);
    trackEvent('nearby_clicked', { category: service.category, spot_id: service.id, metadata: { name: service.name } });
    if (mapComponentRef.current) {
      mapComponentRef.current.showRoute(
        [startLat, startLng],
        [service.latitude, service.longitude],
        service.name
      );
    }
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setBottomSheetState('peek');
    }
  }, [latitude, longitude]);

  // In-app real-time navigation
  const [isNavigating, setIsNavigating] = useState(false);
  const [navInfo, setNavInfo] = useState<{ dist: number; dur: number } | null>(null);

  const startNavMode = useCallback(() => {
    if (!routingDest || !mapComponentRef.current) return;
    trackEvent('navigation_started', { spot_id: routingDest.id, category: routingDest.type, metadata: { name: routingDest.name } });
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
    fetchSpots();
  }, [fetchSpots]);

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
    }
    setIsRouting(false);
    setRoutingDest(null);
    fetchSpots();
  }, [fetchSpots]);

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
    { id: 'all', name: t('all') || 'Tất cả', icon: '🌐' },
    { id: 'PARKING_LOT', name: 'Bãi xe', icon: '🅿️' },
    { id: 'FUEL', name: 'Cây xăng', icon: '⛽' },
    { id: 'EV_CHARGING', name: 'Trạm sạc EV', icon: '⚡' },
    { id: 'CAR_REPAIR', name: 'Gara / Vá vỏ', icon: '🔧' },
    { id: 'CAR_WASH', name: 'Rửa xe', icon: '🚿' },
    { id: 'INSPECTION', name: 'Đăng kiểm', icon: '📋' },
    { id: 'RESTROOM', name: 'Vệ sinh', icon: '🚻' },
    { id: 'RESTAURANT', name: 'Quán ăn', icon: '🍜' },
    { id: 'CAFE', name: 'Cà phê', icon: '☕' },
  ];

  // chipCounts: dùng allCounts (không filter) để show ngay khi load, không đợi tương tác
  // Khi đang lọc category, chip active show count filtered, chip khác show count từ allCounts
  const getChipCount = (id: string): number => {
    if (id === 'all') return allCounts['all'] ?? 1811;
    const isActive = activeFilter === id;
    if (isActive) return spots.length; // số kết quả đang lọc
    return allCounts[id] ?? 0; // tổng theo category, không phụ thuộc filter
  };

  return (
    <div className="page-map-layout">

      {/* STREET VIEW FULLSCREEN MODAL */}
      {streetViewFullscreen && selectedSpot && selectedSpot.latitude && selectedSpot.longitude && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 99999, background: '#000',
          display: 'flex', flexDirection: 'column',
        }}>
          {/* Floating close button — nổi bật, dễ thấy */}
          <button
            onClick={() => setStreetViewFullscreen(false)}
            style={{
              position: 'absolute', top: '16px', right: '16px', zIndex: 100001,
              background: '#e53935',
              border: '3px solid #fff',
              color: '#fff',
              width: '48px', height: '48px',
              borderRadius: '50%',
              fontSize: '22px', fontWeight: 700,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
              lineHeight: 1,
            }}
          >✕</button>

          {/* Spot name chip */}
          <div style={{
            position: 'absolute', top: '18px', left: '16px', zIndex: 100001,
            background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)',
            padding: '8px 14px', borderRadius: '20px',
            color: '#fff', fontWeight: 600, fontSize: '13px',
            maxWidth: 'calc(100% - 90px)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            📍 {selectedSpot.name}
          </div>

          {/* Full iframe */}
          <iframe
            src={`https://www.google.com/maps/embed/v1/streetview?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&location=${selectedSpot.latitude},${selectedSpot.longitude}&fov=90&pitch=10`}
            style={{ width: '100%', height: '100%', border: 'none' }}
            allowFullScreen
          />
        </div>
      )}


      {/* MOBILE FLOATING HEADER (SIÊU MỎNG ~110PX CHUẨN GOOGLE MAPS / WAZE) */}
      <div className="floating-search" style={{
        position: 'fixed',
        top: '8px',
        left: '50%',
        transform: isNavigating ? 'translate(-50%, -60px)' : 'translate(-50%, 0)',
        opacity: isNavigating ? 0 : 1,
        pointerEvents: isNavigating ? 'none' : 'auto',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        width: 'calc(100% - 20px)',
        maxWidth: '460px',
        zIndex: 500,
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
      }}>
        {/* TẦNG 1: BRAND HEADER & TIỆN ÍCH PHỤ (GỌN GÀNG 28PX) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <img src="/logo.png" alt="MapGo" style={{ width: '24px', height: '24px', borderRadius: '50%', boxShadow: '0 2px 6px rgba(0,0,0,0.4)' }} />
            <span style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.3px', textShadow: '0 2px 8px rgba(0,0,0,0.9)' }}>
              MapGo
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* Admin icon nhỏ gọn 28px */}
            {isAuthenticated && user?.role?.toString().toUpperCase() === 'ADMIN' && (
              <Link
                href="/admin"
                title="Quản trị MapGo"
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'rgba(30, 41, 59, 0.85)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(245,158,11,0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#f59e0b',
                  fontSize: '13px',
                  textDecoration: 'none',
                }}
              >
                👑
              </Link>
            )}

            {/* Nút Địa điểm đã lưu / Yêu thích / Nhà / Cơ quan */}
            <button
              onClick={() => setShowRetentionDrawer(true)}
              title="Địa điểm đã lưu & Yêu thích"
              style={{
                height: '28px',
                padding: '0 10px',
                borderRadius: '14px',
                background: 'rgba(30, 41, 59, 0.85)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                color: '#fbbf24',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <span>⭐</span> Đã lưu
            </button>

            {/* Nút báo cấm đỗ icon tròn 28px */}
            <button
              onClick={() => setShowBanReport(true)}
              title="Báo biển cấm đỗ xe"
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'rgba(30, 41, 59, 0.85)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(239,68,68,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#f87171',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              🚫
            </button>

            <LanguageSelector compact={true} align="right" />
          </div>
        </div>

        {/* TẦNG 2: THANH TÌM KIẾM BO TRÒN COMPACT 38PX */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(15, 23, 42, 0.94)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '20px',
          padding: '2px 8px 2px 14px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
          height: '38px',
        }}>
          <span style={{ fontSize: '14px', color: '#94a3b8', marginRight: '6px' }}>🔍</span>
          <input
            type="text"
            placeholder={t('search_placeholder') || 'Bạn muốn tìm gì? (Bãi xe, quán ăn, WC...)'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && doSearch()}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#f8fafc',
              fontSize: '13px',
              padding: '4px 0',
            }}
          />
          {searchQuery ? (
            <button
              onClick={() => { setSearchQuery(''); fetchSpots(); }}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                fontSize: '13px',
                padding: '2px 6px',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
          ) : null}
        </div>

        {/* TẦNG 3: TRỢ LÝ 1-CHẠM GẦN BẠN (TỰ ĐỘNG ẨN KHI ĐANG DẪN ĐƯỜNG) */}
        {!isRouting && !isNavigating && (
          <div style={{ marginTop: '1px' }}>
            <SmartNearbyWidget
              latitude={latitude}
              longitude={longitude}
              activeServiceKey={activeFilter !== 'all' ? activeFilter : null}
              onSelectService={(service, key) => {
                setActiveFilter(service.category === 'PARKING' ? 'PARKING_LOT' : service.category as any);
                handleSelectQuickService(service);
              }}
            />
          </div>
        )}
      </div>

      {/* DESKTOP SIDEBAR */}
      <div className={`desktop-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src="/logo.png" alt="MapGo" style={{ width: '38px', height: '38px', borderRadius: '50%' }} />
              <span style={{ fontSize: '18px', fontWeight: 700 }}>MapGo.vn</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isAuthenticated && user?.role?.toString().toUpperCase() === 'ADMIN' && (
                <Link
                  href="/admin"
                  style={{
                    padding: '4px 10px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: 700,
                    textDecoration: 'none',
                    boxShadow: '0 2px 8px rgba(245,158,11,0.4)',
                  }}
                >
                  👑 Admin
                </Link>
              )}
              <LanguageSelector compact={true} />
            </div>
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

        {/* SMART NEARBY 1-TAP DRIVER ROW */}
        <div style={{ padding: '8px 16px 4px' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
            ⚡ Trợ lý 1-chạm gần bạn
          </div>
          <SmartNearbyWidget latitude={latitude} longitude={longitude} onSelectService={handleSelectQuickService} />
        </div>

        <div className="sidebar-chips">
          {categories.map((c) => {
            const isActive = activeFilter === c.id;
            const count = getChipCount(c.id);
            return (
              <div
                key={c.id}
                className={`chip ${isActive ? 'active' : ''}`}
                onClick={() => setActiveFilter(c.id as any)}
                style={{
                  fontSize: '12px', padding: '6px 12px',
                  ...(isActive ? {
                    background: 'linear-gradient(135deg,rgba(201,168,76,0.5),rgba(155,120,45,0.45))',
                    borderColor: '#E8C870',
                    color: '#F5E6A0',
                    fontWeight: 700,
                    boxShadow: '0 0 10px rgba(201,168,76,0.4)',
                  } : {}),
                }}
              >
                {isActive && '✓ '}{c.icon} {c.name}
                {count > 0 && (
                  <span style={{
                    marginLeft: 4,
                    background: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
                    borderRadius: 99, padding: '0px 5px',
                    fontSize: '11px', fontWeight: 600,
                  }}>{count}</span>
                )}
              </div>
            );
          })}
          <div
            className={`chip ${hasCarParking ? 'active' : ''}`}
            onClick={() => setHasCarParking(v => !v)}
            style={{ fontSize: '12px', padding: '6px 12px', ...(hasCarParking ? {
              background: 'rgba(234,179,8,0.25)', borderColor: '#eab308',
              color: '#fde047', fontWeight: 700,
            } : {}) }}
          >
            {hasCarParking && '✓ '}🚗 Có bãi ô tô
          </div>
        </div>

        {/* Nút Báo biển cấm đậu — nổi bật cho tài xế */}
        <div
          onClick={() => setShowBanReport(true)}
          style={{
            margin: '10px 0 4px',
            padding: '11px 16px',
            borderRadius: 12,
            background: 'linear-gradient(135deg, rgba(239,68,68,0.18), rgba(124,58,237,0.18))',
            border: '1px solid rgba(239,68,68,0.45)',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 10,
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'linear-gradient(135deg,rgba(239,68,68,0.32),rgba(124,58,237,0.32))')}
          onMouseLeave={e => (e.currentTarget.style.background = 'linear-gradient(135deg,rgba(239,68,68,0.18),rgba(124,58,237,0.18))')}
        >
          <span style={{ fontSize: 22 }}>🚫</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fca5a5' }}>Báo biển cấm đậu xe</div>
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>Chụp ảnh + gim vị trí — chia sẻ với tài xế khác</div>
          </div>
          <span style={{ marginLeft: 'auto', fontSize: 18, color: '#ef4444' }}>›</span>
        </div>

        <div className="sidebar-results">
          {selectedSpot ? (
            <div className="spot-detail-sidebar">
              <button
                className="btn-back-prominent"
                onClick={() => setSelectedSpot(null)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 20px', marginBottom: '12px',
                  borderRadius: 99, border: 'none',
                  background: '#fff', color: '#0d0d12',
                  fontSize: 14, fontWeight: 800, cursor: 'pointer',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
                }}
              >
                &#9664; {t('back')}
              </button>
              <div style={{ marginBottom: '16px' }}>
                <ImageGallery images={selectedSpot.images || []} altPrefix={selectedSpot.name} spotType={selectedSpot.type} spotId={selectedSpot.id} />
              </div>
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
                  <div style={{ color: '#a0a0b0', fontSize: '14px', whiteSpace: 'pre-wrap', lineHeight: '1.7', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '12px 16px' }}>
                    {selectedSpot.description}
                  </div>
                </div>
              )}


              <div className="streetview-section">

                  <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px', color: 'var(--text-secondary)' }}>📍 Nhìn bên ngoài địa điểm</h3>

                  <div className="streetview-iframe-wrapper">
                    <iframe
                      className="streetview-iframe"
                      loading="lazy"
                      allowFullScreen
                      src={`https://www.google.com/maps/embed/v1/streetview?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&location=${selectedSpot.latitude},${selectedSpot.longitude}&fov=90&pitch=10`}
                    ></iframe>
                  </div>
                  <button
                    onClick={() => setStreetViewFullscreen(true)}
                    className="streetview-btn"
                    style={{ marginTop: '8px' }}
                  >
                    <span>⛶</span> Xem toàn màn hình
                  </button>
                </div>

                {/* BÃI XE / ĐỊA ĐIỂM TƯƠNG TỰ GẦN ĐÂY CHO DESKTOP SIDEBAR */}
                {nearbyAlternatives.length > 0 && (
                  <div style={{
                    marginTop: '20px',
                    padding: '16px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#f8fafc',
                      marginBottom: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}>
                      <span>🏢</span> Địa điểm tương tự gần đây
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {nearbyAlternatives.map((alt) => (
                        <button
                          key={alt.id}
                          onClick={() => {
                            setSelectedSpot(alt);
                            if (mapComponentRef.current) {
                              mapComponentRef.current.panTo([alt.latitude, alt.longitude]);
                            }
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 14px',
                            borderRadius: '12px',
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid rgba(255, 255, 255, 0.06)',
                            cursor: 'pointer',
                            textAlign: 'left',
                            color: '#ffffff',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <div style={{ flex: 1, minWidth: 0, paddingRight: '10px' }}>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {alt.name}
                            </div>
                            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {alt.address}
                            </div>
                          </div>
                          <div style={{
                            fontSize: '12px',
                            fontWeight: 700,
                            color: '#38bdf8',
                            background: 'rgba(56, 189, 248, 0.1)',
                            padding: '4px 8px',
                            borderRadius: '8px',
                            flexShrink: 0,
                          }}>
                            📍 {alt.distanceMeters < 1000 ? `${alt.distanceMeters}m` : `${(alt.distanceMeters / 1000).toFixed(1)}km`}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

            </div>
          ) : (
            <>
              {isLoading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>{t('loading')}</div>
              ) : spots.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {spots.slice(0, visibleLimit).map((spot) => (
                    <div key={spot.id} onClick={() => handleMarkerClick(spot)} style={{ cursor: 'pointer' }}>
                      <SpotCard spot={spot} onDirections={handleDirections} onCardClick={handleMarkerClick} />
                    </div>
                  ))}
                  {spots.length > visibleLimit && (
                    <button
                      onClick={() => setVisibleLimit((prev) => prev + 25)}
                      style={{
                        padding: '12px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        color: '#38bdf8',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        marginTop: '4px',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      Xem thêm ({spots.length - visibleLimit} địa điểm khác)
                    </button>
                  )}
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
          showBans={!isRouting}
          style={{ width: '100%', height: '100%', borderRadius: 0 }}
        />
      </div>

      {/* ROUTING NAVIGATION BAR (COMPACT 96PX CHUẨN GOOGLE MAPS / WAZE: 1 PRIMARY CTA + DRAG HANDLE) */}
      {isRouting && routingDest && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 300,
          background: isNavigating ? 'rgba(6, 78, 59, 0.96)' : 'rgba(15, 23, 42, 0.96)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: `1px solid ${isNavigating ? 'rgba(52, 211, 153, 0.4)' : 'rgba(255,255,255,0.12)'}`,
          borderRadius: '20px',
          padding: '8px 14px 10px',
          display: 'flex',
          flexDirection: 'column',
          maxWidth: '430px',
          width: 'calc(100% - 24px)',
          boxShadow: '0 12px 36px rgba(0,0,0,0.6)',
          transition: 'all 0.25s ease',
        }}>
          {/* Drag Handle Indicator */}
          <div
            onClick={() => { setBottomSheetState('detail'); setSelectedSpot(routingDest); }}
            style={{ width: '32px', height: '3px', background: 'rgba(255,255,255,0.25)', borderRadius: '2px', margin: '0 auto 6px', cursor: 'pointer' }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              onClick={() => { setBottomSheetState('detail'); setSelectedSpot(routingDest); }}
              style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}
            >
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {isNavigating ? '🧭 ' + t('navigating') : '📍 ' + routingDest.name}
              </div>
              <div style={{ fontSize: '12px', color: isNavigating ? '#86efac' : '#38bdf8', marginTop: '2px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span>
                  {isNavigating && navInfo
                    ? `🚗 ~${navInfo.dur} phút`
                    : `🚗 ~${Math.max(1, Math.round((typeof routingDest.distance === 'number' ? routingDest.distance : parseFloat(routingDest.distance || '2.4')) * 2.5))} phút`
                  }
                </span>
                <span style={{ opacity: 0.4 }}>•</span>
                <span style={{ color: '#94a3b8', fontWeight: 400 }}>
                  {isNavigating && navInfo
                    ? `${navInfo.dist.toFixed(1)} km`
                    : (typeof routingDest.distance === 'number' ? `${(routingDest.distance as number).toFixed(1)} km` : (routingDest.distance || routingDest.address?.substring(0, 28)))
                  }
                </span>
              </div>
            </div>

            {!isNavigating ? (
              <button
                onClick={startNavMode}
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 12px rgba(16,185,129,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>🟢</span> {t('go_now') || 'Đi ngay'}
              </button>
            ) : null}

            <button
              onClick={() => { isNavigating ? stopNavMode() : (() => { handleClearRoute(); setRoutingDest(null); })(); }}
              title={isNavigating ? t('stop') : t('cancel')}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                color: '#94a3b8',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              ✕
            </button>
          </div>
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
          >
            <div className="bottom-sheet-handle-bar" />
            <button
              className="bs-arrow-btn"
              onClick={(e) => {
                e.stopPropagation();
                if (bottomSheetState === 'detail') { setSelectedSpot(null); setBottomSheetState('peek'); }
                else setBottomSheetState(s => s === 'peek' ? 'full' : 'peek');
              }}
            >
              <span className="bs-arrow-icon">
                {bottomSheetState === 'peek' ? '▲' : '▼'}
              </span>
              <span className="bs-arrow-label">
                {bottomSheetState === 'peek' ? t('expand') : t('collapse')}
              </span>
            </button>
          </div>
          
          <div className="bottom-sheet-content">
            {bottomSheetState === 'detail' && selectedSpot ? (
              <div className="spot-detail-sheet" style={{ position: 'relative' }}>
                {/* Sticky back bar */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 16px',
                  background: 'rgba(13,13,18,0.95)', backdropFilter: 'blur(12px)',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                  position: 'sticky', top: 0, zIndex: 20,
                  marginBottom: 8,
                }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedSpot(null); setBottomSheetState('peek'); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '10px 20px', borderRadius: 99, border: 'none',
                      background: '#fff', color: '#0d0d12',
                      fontSize: 14, fontWeight: 800, cursor: 'pointer',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.5)',
                      flexShrink: 0,
                    }}
                  >
                    &#9664; {t('back')}
                  </button>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#fff', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {selectedSpot?.name}
                  </span>
                </div>
                <div style={{ marginBottom: '12px', padding: '0 4px' }}>
                  <ImageGallery images={selectedSpot.images || []} altPrefix={selectedSpot.name} spotType={selectedSpot.type} spotId={selectedSpot.id} />
                </div>
                <div className="spot-info">
                  <div className="spot-name">{selectedSpot.name}</div>
                  <div className="spot-meta">{selectedSpot.address}</div>
                  {selectedSpot.distance != null && (
                    <div style={{ fontSize: '13px', color: '#86efac', marginTop: '4px', fontWeight: 600 }}>
                      📍 {typeof selectedSpot.distance === 'number' ? `${(selectedSpot.distance as number).toFixed(1)} ${t('km_from_you')}` : String(selectedSpot.distance)}
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

                  {/* Secondary Retentions & Community Actions */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '10px' }}>
                    <button
                      onClick={() => toggleFavorite(selectedSpot)}
                      style={{
                        padding: '9px',
                        borderRadius: '10px',
                        background: checkIsFavorite(selectedSpot.id) ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                        border: `1px solid ${checkIsFavorite(selectedSpot.id) ? '#f59e0b' : 'rgba(255, 255, 255, 0.1)'}`,
                        color: checkIsFavorite(selectedSpot.id) ? '#fbbf24' : '#cbd5e1',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                      }}
                    >
                      ⭐ {checkIsFavorite(selectedSpot.id) ? 'Đã lưu' : 'Lưu lại'}
                    </button>
                    <button
                      onClick={() => {
                        const url = `${window.location.origin}/p/${selectedSpot.slug || selectedSpot.id}`;
                        if (navigator.share) {
                          navigator.share({ title: selectedSpot.name, url }).catch(() => {});
                        } else {
                          navigator.clipboard.writeText(url);
                          alert('Đã sao chép liên kết chia sẻ!');
                        }
                      }}
                      style={{
                        padding: '9px',
                        borderRadius: '10px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#cbd5e1',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                      }}
                    >
                      📤 Chia sẻ
                    </button>
                    <button
                      onClick={() => setShowSpotReportModal(true)}
                      style={{
                        padding: '9px',
                        borderRadius: '10px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#f87171',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                      }}
                    >
                      ⚠️ Báo cáo
                    </button>
                  </div>


                  <div className="streetview-section">

                      <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px', color: 'var(--text-secondary)' }}>📍 Nhìn bên ngoài địa điểm</h3>

                      <div className="streetview-iframe-wrapper">
                        <iframe
                          className="streetview-iframe"
                          loading="lazy"
                          allowFullScreen
                          src={`https://www.google.com/maps/embed/v1/streetview?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&location=${selectedSpot.latitude},${selectedSpot.longitude}&fov=90&pitch=10`}
                        ></iframe>
                      </div>
                      <button
                        onClick={() => setStreetViewFullscreen(true)}
                        className="streetview-btn"
                        style={{ marginTop: '8px' }}
                      >
                        <span>⛶</span> Xem toàn màn hình
                      </button>
                    </div>

                    {/* BÃI XE / ĐỊA ĐIỂM TƯƠNG TỰ GẦN ĐÂY (GOOGLE MAPS UX) */}
                    {nearbyAlternatives.length > 0 && (
                      <div style={{
                        marginTop: '16px',
                        padding: '14px',
                        background: 'rgba(30, 41, 59, 0.6)',
                        borderRadius: '16px',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                      }}>
                        <div style={{
                          fontSize: '13px',
                          fontWeight: 700,
                          color: '#f8fafc',
                          marginBottom: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>🏢</span> Địa điểm tương tự gần đây
                          </span>
                          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500 }}>Chạm để xem</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {nearbyAlternatives.map((alt) => (
                            <button
                              key={alt.id}
                              onClick={() => {
                                setSelectedSpot(alt);
                                if (mapComponentRef.current) {
                                  mapComponentRef.current.panTo([alt.latitude, alt.longitude]);
                                }
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '10px 12px',
                                borderRadius: '12px',
                                background: 'rgba(15, 23, 42, 0.8)',
                                border: '1px solid rgba(255, 255, 255, 0.06)',
                                cursor: 'pointer',
                                textAlign: 'left',
                                color: '#ffffff',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              <div style={{ flex: 1, minWidth: 0, paddingRight: '8px' }}>
                                <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {alt.name}
                                </div>
                                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {alt.address}
                                </div>
                              </div>
                              <div style={{
                                fontSize: '12px',
                                fontWeight: 800,
                                color: '#38bdf8',
                                background: 'rgba(56, 189, 248, 0.1)',
                                padding: '4px 8px',
                                borderRadius: '8px',
                                flexShrink: 0,
                              }}>
                                📍 {alt.distanceMeters < 1000 ? `${alt.distanceMeters}m` : `${(alt.distanceMeters / 1000).toFixed(1)}km`}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                </div>
              </div>
            ) : (
              <>
                <div className="bottom-sheet-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>
                    {allCounts['all'] && allCounts['all'] > spots.length
                      ? `${t('showing')} ${spots.length}/${allCounts['all']} ${t('spots_label')}`
                      : `${spots.length} ${t('spots_nearby')}`}
                  </span>
                  {allCounts['all'] && allCounts['all'] > spots.length && (
                    <span style={{ fontSize: 11, color: '#6b6b80' }}>{t('nearest_label')}</span>
                  )}
                </div>
                {isLoading ? (
                  <div style={{ textAlign: 'center', padding: '20px' }}>{t('loading')}</div>
                ) : spots.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Banner báo biển cấm đậu — luôn ở đầu danh sách */}
                    <div
                      onClick={() => setShowBanReport(true)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '12px 14px', borderRadius: 12,
                        background: 'linear-gradient(135deg,rgba(239,68,68,0.15),rgba(124,58,237,0.15))',
                        border: '1px solid rgba(239,68,68,0.4)',
                        cursor: 'pointer', flexShrink: 0,
                      }}
                    >
                      <span style={{ fontSize: 22 }}>🚫</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#fca5a5' }}>{t('report_ban_title')}</div>
                        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>{t('report_ban_desc')}</div>
                      </div>
                      <span style={{ color: '#ef4444', fontSize: 16 }}>›</span>
                    </div>
                    {spots.slice(0, visibleLimit).map((spot) => (
                      <div key={spot.id}>
                        <SpotCard spot={spot} onDirections={handleDirections} onCardClick={handleMarkerClick} />
                      </div>
                    ))}
                    {spots.length > visibleLimit && (
                      <button
                        onClick={() => setVisibleLimit((prev) => prev + 25)}
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '12px',
                          color: '#38bdf8',
                          fontSize: '13px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          marginTop: '4px',
                          marginBottom: '20px',
                        }}
                      >
                        Xem thêm ({spots.length - visibleLimit} địa điểm khác)
                      </button>
                    )}
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
      {/* FAB — Đăng tin nổi bật với pulse animation */}
      {bottomSheetState === 'peek' && (
        <Link href="/business/post" style={{ textDecoration: 'none' }}>
          <div style={{
            position: 'fixed',
            bottom: '100px',
            right: '16px',
            zIndex: 500,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
          }}>
            {/* Pulse ring */}
            <div style={{
              position: 'absolute',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'rgba(251,191,36,0.3)',
              animation: 'fabPulse 2s ease-in-out infinite',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
            }} />
            <button
              className="fab-post"
              title={t('post_spot')}
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                border: '2px solid rgba(255,255,255,0.3)',
                color: '#fff',
                fontSize: '22px',
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(245,158,11,0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.2s',
                position: 'relative',
                zIndex: 1,
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1.0)')}
            >
              ✏️
            </button>
            <span style={{
              background: 'linear-gradient(135deg,#f59e0b,#ef4444)',
              color: '#fff',
              fontSize: '11px',
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: 99,
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 8px rgba(245,158,11,0.4)',
              letterSpacing: '0.3px',
            }}>
              ✏️ Đăng tin
            </span>
          </div>
        </Link>
      )}
      {/* Hidden Semantic SEO Heading & Keywords Block for Google Indexing */}
      <div style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0 }}>
        <h1>Bãi giữ xe TP.HCM — Tìm bãi gửi xe, chỗ đậu xe ô tô, quán ăn có bãi xe, nhà vệ sinh công cộng gần đây | MapGo.vn</h1>
        <h2>Bãi giữ xe ô tô gần đây — Bản đồ tìm chỗ đậu xe ô tô, bãi gửi xe máy, quán cafe có chỗ đậu xe, WC công cộng tại Sài Gòn</h2>
        <p>
          MapGo.vn là bản đồ bãi giữ xe TP.HCM với hơn 408 bãi giữ xe ô tô, xe máy, bãi gửi xe qua đêm và chỗ đậu xe an toàn tại Quận 1, Quận 2, Quận 3, Quận 4, Quận 5, Quận 6, Quận 7, Quận 8, Quận 10, Quận 11, Quận 12, Bình Thạnh, Phú Nhuận, Tân Bình, Tân Phú, Gò Vấp, TP Thủ Đức, Bình Tân, Nhà Bè, Hóc Môn, Củ Chi, Bình Chánh, Cần Giờ và toàn bộ 22 quận huyện TP.HCM.
        </p>
        <p>
          Hỗ trợ tìm kiếm nhanh quán ăn có chỗ đậu xe ô tô, quán cafe có bãi giữ xe rộng rãi, tiệm rửa xe, garage sửa xe ô tô, nhà vệ sinh công cộng sạch sẽ gần nhất. Bản đồ chỉ đường GPS trực tiếp miễn phí 24/7. Cập nhật bảng giá gửi xe ô tô TP.HCM và điểm báo biển cấm đậu xe mới nhất 2026.
        </p>

        {/* Semantic FAQ matching Schema.org */}
        <section>
          <h3>Câu hỏi thường gặp về bãi giữ xe & tiện ích MapGo</h3>
          <article>
            <h4>Làm sao tìm bãi đỗ xe gần nhất trên MapGo?</h4>
            <p>Bạn chỉ cần mở bản đồ MapGo.vn, cho phép truy cập vị trí, hệ thống sẽ hiển thị các bãi đỗ xe ô tô, xe máy gần bạn nhất kèm chỉ đường GPS trực tiếp.</p>
          </article>
          <article>
            <h4>MapGo có cung cấp giá gửi xe không?</h4>
            <p>Một số bãi xe có giá tham khảo do cộng đồng cập nhật. Giá thực tế có thể thay đổi tùy thời điểm, vui lòng xác nhận tại điểm đỗ.</p>
          </article>
          <article>
            <h4>Làm sao tìm nhà vệ sinh công cộng gần nhất TP.HCM?</h4>
            <p>Trên MapGo.vn, chọn bộ lọc 'Nhà vệ sinh công cộng' để xem các vị trí gần bạn nhất, kèm khoảng cách và chỉ đường.</p>
          </article>
          <article>
            <h4>Bãi giữ xe ô tô qua đêm ở TP.HCM tìm ở đâu?</h4>
            <p>Bạn có thể lọc các bãi giữ xe mở cửa 24/7 trên MapGo.vn hoặc xem danh mục bãi giữ xe qua đêm để tìm vị trí có bảo vệ an toàn.</p>
          </article>
        </section>
      </div>

      {/* Modal báo biển cấm đậu — luôn render, fallback tọa độ trung tâm HCM nếu chưa có GPS */}
      {showBanReport && (
        <ReportBanModal
          lat={latitude ?? 10.7769}
          lng={longitude ?? 106.7009}
          onClose={() => setShowBanReport(false)}
          onSuccess={() => {
            setShowBanReport(false);
            alert('✅ Cảm ơn! Báo cáo đã được ghi nhận. Khi đủ 3 người xác nhận, biển báo sẽ hiện trên bản đồ.');
          }}
        />
      )}

      {/* User Retention Drawer (Favorites, Home, Work, Recent Places) */}
      <UserRetentionDrawer
        isOpen={showRetentionDrawer}
        onClose={() => setShowRetentionDrawer(false)}
        onSelectSpot={(spotSummary) => {
          const fullSpot: Spot = {
            id: spotSummary.id,
            slug: spotSummary.slug || `spot-${spotSummary.id}`,
            name: spotSummary.name,
            address: spotSummary.address,
            type: spotSummary.type as any,
            latitude: spotSummary.latitude,
            longitude: spotSummary.longitude,
            carSlots: spotSummary.carSlots || 0,
            bikeSlots: 0,
            basePricePerHour: spotSummary.pricePerHourCar || 0,
            pricePerHourCar: spotSummary.pricePerHourCar,
            openTime: '06:00',
            closeTime: '22:00',
            rating: spotSummary.rating || 5.0,
            reviewCount: 0,
            images: [],
            isPremium: false,
            status: 'ACTIVE',
          };
          setSelectedSpot(fullSpot);
          setBottomSheetState('detail');
          if (mapComponentRef.current) {
            mapComponentRef.current.panTo([spotSummary.latitude, spotSummary.longitude]);
          }
        }}
        onNavigateLocation={(lat, lng, name) => {
          const startLat = latitude || 10.7769;
          const startLng = longitude || 106.7009;
          if (mapComponentRef.current) {
            mapComponentRef.current.showRoute([startLat, startLng], [lat, lng], name);
            setIsRouting(true);
          }
        }}
      />

      {/* Community Data Report Modal (5 loại báo cáo) */}
      {showSpotReportModal && selectedSpot && (
        <CommunityReportModal
          spot={selectedSpot}
          onClose={() => setShowSpotReportModal(false)}
          onSuccess={() => {
            setShowSpotReportModal(false);
          }}
        />
      )}

      {/* PWA Install Banner (Visit >= 2, Session >= 30s, <= 1 time/week) */}
      <PwaInstallBanner />
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
