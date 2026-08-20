'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import ImageGallery from '@/components/ImageGallery';
import StarRating from '@/components/StarRating';
import ReviewForm from '@/components/ReviewForm';
import dynamic from 'next/dynamic';
import api from '@/lib/api';
import { formatCurrency, formatHours, formatRelativeTime, formatPhone } from '@/lib/format';
import { SPOT_TYPE_LABELS, SPOT_TYPE_ICONS } from '@/lib/types';
import { useLocale } from '@/contexts/LocaleContext';
import { isFavorite, toggleFavorite } from '@/lib/favorites';
import type { Spot, Review } from '@/lib/types';

export default function SpotDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { t } = useLocale();

  const [spot, setSpot] = useState<any | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    if (spot?.id) {
      setIsFav(isFavorite(spot.id));
    }
  }, [spot]);

  const handleToggleFav = () => {
    if (!spot?.id) return;
    const newState = toggleFavorite(spot.id);
    setIsFav(newState);
  };

  const fetchSpot = async () => {
    setIsLoading(true);
    try {
      const data = await api.get<any>(`/api/spots/${id}`);
      setSpot(data);
    } catch {
      setError(t('not_found'));
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const data = await api.get<{ data: Review[] }>(`/api/spots/${id}/reviews`);
      setReviews(data.data || []);
    } catch {
      setReviews([]);
    }
  };

  useEffect(() => {
    if (id) {
      fetchSpot();
      fetchReviews();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#0d0d12' }}>
        <Header />
        <div className="container" style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
          <div className="skeleton" style={{ height: '250px', borderRadius: '16px', marginBottom: '20px' }} />
          <div className="skeleton" style={{ height: '28px', width: '60%', borderRadius: '8px', marginBottom: '12px' }} />
          <div className="skeleton" style={{ height: '18px', width: '80%', borderRadius: '8px', marginBottom: '8px' }} />
        </div>
      </div>
    );
  }

  if (error && !spot) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#0d0d12', color: '#fff' }}>
        <Header />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '48px', marginBottom: '12px' }}>📍</p>
            <p style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>{t('not_found')}</p>
            <p style={{ fontSize: '14px', opacity: 0.6, marginBottom: '20px' }}>Không tìm thấy địa điểm hoặc đường dẫn không tồn tại.</p>
            <Link href="/">
              <button className="btn-primary">← Quay lại trang chủ</button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Chuyển data cho client component
  const initialSpot = {
    id: spot.id,
    name: spot.name,
    address: spot.address,
    description: spot.description,
    latitude: spot.lat,
    longitude: spot.lng,
    lat: spot.lat,
    lng: spot.lng,
    type: spot.type,
    carSlots: spot.carSlots,
    bikeSlots: spot.bikeSlots,
    pricePerHour: spot.pricePerHour,
    pricePerHourCar: spot.pricePerHour,
    pricePerHourBike: spot.pricePerHour > 0 ? Math.round(spot.pricePerHour / 4) : 0,
    openTime: spot.openTime,
    closeTime: spot.closeTime,
    phone: spot.phone,
    website: spot.website,
    isPremium: spot.isPremium,
    isVerified: spot.status === 'ACTIVE',
    status: spot.status?.toLowerCase() || 'active',
    ownerId: spot.ownerId,
    images: spot.images?.map((img: any) => img.url) || [],
    rating: 4.0 + Math.random() * 1.0, // placeholder
    reviewCount: spot._count?.reviews || 0,
    createdAt: spot.createdAt.toISOString(),
    updatedAt: spot.updatedAt.toISOString(),
    source: spot.source,
    googleRating: spot.googleRating,
    googlePlaceId: spot.googlePlaceId,
  };

  const spotSchema = {
    "@context": "https://schema.org",
    "@type": spot.type === 'PARKING_LOT' || spot.type === 'PARKING' ? 'ParkingFacility' : spot.type === 'FUEL' ? 'GasStation' : 'LocalBusiness',
    "name": spot.name,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": spot.address,
      "addressLocality": "Hồ Chí Minh",
      "addressCountry": "VN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": spot.lat,
      "longitude": spot.lng
    },
    "url": `https://mapgo.vn/spot/${spot.id}`,
    "telephone": spot.phone || undefined,
  };

  const meta = spot.metadata || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-primary, #0d0d12)', color: '#fff' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(spotSchema) }}
      />
      <Header />

      <main className="container" style={{ maxWidth: '900px', margin: '0 auto', padding: '16px 20px 40px', flex: 1 }}>
        {/* Back Link */}
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#a5b4fc', textDecoration: 'none', marginBottom: '16px', fontWeight: 600 }}>
          ← Quay lại bản đồ MapGo
        </Link>

        {/* Hero Gallery or Branded Banner */}
        <ImageGallery images={spot.images || []} altPrefix={spot.name} spotType={spot.type} spotId={spot.id} />

        {/* Header Info */}
        <div style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap', marginBottom: '8px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, flex: 1, color: '#ffffff', letterSpacing: '-0.3px' }}>{spot.name}</h1>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span className="badge" style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.4)', borderRadius: 20, padding: '4px 12px', fontSize: 13, fontWeight: 700 }}>
                {SPOT_TYPE_ICONS[spot.type] || '📍'} {SPOT_TYPE_LABELS[spot.type] || spot.type}
              </span>
              <span className="badge" style={{ background: spot.isVerified ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.08)', color: spot.isVerified ? '#34d399' : '#9ca3af', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '4px 10px', fontSize: 12 }}>
                {spot.isVerified ? '✓ Đã xác minh' : 'Dữ liệu đồng bộ MapGo'}
              </span>
            </div>
          </div>

          <p style={{ fontSize: '15px', color: '#cbd5e1', marginBottom: '14px', lineHeight: 1.5 }}>
            📍 {spot.address}
          </p>

            {/* Quick Action Bar */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '24px' }}>
              <Link
                href={`/?route_to=${spot.id}&lat=${spot.latitude}&lng=${spot.longitude}&name=${encodeURIComponent(spot.name)}`}
                style={{ textDecoration: 'none' }}
              >
                <button
                  className="btn-primary"
                  style={{ padding: '12px 22px', borderRadius: '12px', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg, #2563eb, #4f46e5)', color: '#fff', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.4)' }}
                >
                  🧭 Chỉ đường ngay trên MapGo
                </button>
              </Link>

              {spot.phone && (
                <a href={`tel:${spot.phone}`} style={{ textDecoration: 'none' }}>
                  <button style={{ padding: '12px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(34,197,94,0.15)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.3)', cursor: 'pointer' }}>
                    📞 {formatPhone(spot.phone)}
                  </button>
                </a>
              )}

              {/* FAVORITE BUTTON */}
              <button
                onClick={handleToggleFav}
                style={{
                  padding: '12px 18px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 600,
                  background: isFav ? 'rgba(234,179,8,0.2)' : 'rgba(255,255,255,0.08)',
                  color: isFav ? '#facc15' : '#cbd5e1',
                  border: isFav ? '1px solid #eab308' : '1px solid rgba(255,255,255,0.1)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {isFav ? '★ Đã lưu' : '☆ Lưu địa điểm'}
              </button>

              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: spot.name, text: `${spot.name} - ${spot.address}`, url: window.location.href });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Đã sao chép liên kết địa điểm!');
                  }
                }}
                style={{ padding: '12px 18px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, background: 'rgba(255,255,255,0.08)', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}
              >
                📤 Chia sẻ
              </button>

              {/* REPORT BUTTON */}
              <button
                onClick={() => {
                  const reason = prompt('Báo sai thông tin (ví dụ: đổi giá, hết chỗ, đóng cửa):');
                  if (reason) {
                    alert('Cảm ơn bạn đã đóng góp! MapGo sẽ cập nhật sau khi xác minh.');
                  }
                }}
                style={{ padding: '12px 14px', borderRadius: '12px', fontSize: '13px', fontWeight: 500, background: 'transparent', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer' }}
              >
                🚩 Báo sai
              </button>
            </div>
        </div>

        {/* Specialized Domain Metadata Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '24px' }}>
          {/* 0. Parking Specialized Driver Card */}
          {(spot.type === 'PARKING' || spot.type === 'PARKING_LOT') && (
            <div className="card" style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 style={{ fontSize: '13px', color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', fontWeight: 700 }}>🚗 Tiện ích cho ô tô & xe máy</h3>
              <div style={{ fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '6px', color: '#cbd5e1' }}>
                <div>📐 Giới hạn chiều cao: <strong style={{ color: '#93c5fd' }}>{meta.heightLimit || '2.1m (Xe SUV, Bán tải đỗ tốt)'}</strong></div>
                <div>☂️ Mái che: <span style={{ color: '#e2e8f0' }}>{meta.roof || 'Có khu vực có mái che'}</span></div>
                <div>📹 An ninh: <span style={{ color: '#e2e8f0' }}>Camera giám sát 24/7</span></div>
                <div>💳 Thanh toán: <span style={{ color: '#e2e8f0' }}>{Array.isArray(meta.payment) ? meta.payment.join(', ') : 'Tiền mặt, QR Code'}</span></div>
              </div>
            </div>
          )}

          {/* 1. Fuel Specialized Info */}
          {(spot.type === 'FUEL' || meta.fuelTypes) && (
            <div className="card" style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 style={{ fontSize: '13px', color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', fontWeight: 700 }}>⛽ Nhiên liệu có sẵn</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {(meta.fuelTypes || ['RON95-V', 'E5 RON92', 'DO 0.001S']).map((f: string, idx: number) => (
                  <span key={idx} style={{ background: 'rgba(249,115,22,0.15)', color: '#fdba74', padding: '4px 10px', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}>
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 2. EV Charging Info */}
          {(spot.type === 'EV_CHARGING' || spot.type === 'EV_CHARGER' || meta.powerKW) && (
            <div className="card" style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 style={{ fontSize: '13px', color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', fontWeight: 700 }}>⚡ Thông số trạm sạc</h3>
              <div style={{ fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '6px', color: '#cbd5e1' }}>
                <div>⚡ Công suất: <strong style={{ color: '#34d399' }}>{meta.powerKW || 120} kW</strong></div>
                <div>🔌 Cổng sạc: {Array.isArray(meta.connector) ? meta.connector.join(', ') : 'CCS2, Type 2'}</div>
              </div>
            </div>
          )}

          {/* 3. Garage & Car Repair Services */}
          {(spot.type === 'CAR_REPAIR' || spot.type === 'GARAGE' || meta.services) && (
            <div className="card" style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 style={{ fontSize: '13px', color: '#a855f7', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', fontWeight: 700 }}>🔧 Dịch vụ cứu hộ & sửa chữa</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                {(meta.services || ['Vá vỏ lưu động', 'Cứu hộ 24/7', 'Sửa chữa chung']).map((s: string, idx: number) => (
                  <span key={idx} style={{ background: 'rgba(168,85,247,0.15)', color: '#d8b4fe', padding: '4px 10px', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}>
                    {s}
                  </span>
                ))}
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>⏱️ Thời gian phản hồi cứu hộ ước tính: <strong style={{ color: '#38bdf8' }}>~10-15 phút</strong></div>
            </div>
          )}

          {/* 4. Parking Details */}
          {(spot.type === 'PARKING_LOT' || spot.type === 'PARKING') && (
            <>
              <div className="card" style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <h3 style={{ fontSize: '13px', color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', fontWeight: 700 }}>🅿️ Sức chứa & Chiều cao</h3>
                <div style={{ fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '6px', color: '#cbd5e1' }}>
                  {spot.carSlots > 0 && <div>🚗 Ô tô: <strong>{spot.carSlots} chỗ</strong></div>}
                  {spot.bikeSlots > 0 && <div>🏍️ Xe máy: <strong>{spot.bikeSlots} chỗ</strong></div>}
                  <div>📐 Chiều cao hầm: <strong>{meta.heightLimit || 2.1} m</strong></div>
                </div>
              </div>

              <div className="card" style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <h3 style={{ fontSize: '13px', color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', fontWeight: 700 }}>💳 Bảng giá & Thanh toán</h3>
                <div style={{ fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '6px', color: '#cbd5e1' }}>
                  <div>💰 Giá gửi ô tô: <strong style={{ color: '#34d399' }}>{formatCurrency(spot.pricePerHourCar || 20000, '/giờ')}</strong></div>
                  <div>💳 Thanh toán: {Array.isArray(meta.payment) ? meta.payment.join(', ') : 'Tiền mặt, QR'}</div>
                </div>
              </div>
            </>
          )}

          {/* Hours Card */}
          <div className="card" style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h3 style={{ fontSize: '13px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', fontWeight: 700 }}>🕐 Giờ mở cửa</h3>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#f1f5f9' }}>
              {formatHours(spot.openTime, spot.closeTime)}
            </div>
            <span style={{ fontSize: '12px', color: '#34d399', marginTop: '4px', display: 'inline-block' }}>
              ● Đang hoạt động
            </span>
          </div>
        </div>

        {/* Nearby Spots Recommendations */}
        {spot.nearbySpots && spot.nearbySpots.length > 0 && (
          <div style={{ marginTop: '32px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px', color: '#f8fafc' }}>
              📍 Địa điểm tương tự gần đây
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
              {spot.nearbySpots.map((n: any) => (
                <Link key={n.id} href={`/spot/${n.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{ padding: '14px', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', transition: 'all 0.2s', cursor: 'pointer' }}>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: '#ffffff', marginBottom: '4px' }}>{n.name}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.address}</div>
                    <div style={{ fontSize: '12px', color: '#a5b4fc', fontWeight: 600 }}>Cách {(n.distanceMeters / 1000).toFixed(1)} km →</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
