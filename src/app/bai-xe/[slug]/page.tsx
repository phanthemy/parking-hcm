'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
import type { Spot, Review } from '@/lib/types';

const MapComponent = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div style={{ width: '100%', height: '250px', background: 'var(--bg-secondary, #1a1a1a)', borderRadius: '12px' }} />
  ),
});

// This page reuses the spot detail but fetches by slug
export default function BaiXeSlugPage() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();
  const { t } = useLocale();

  const [spot, setSpot] = useState<Spot | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;
    setIsLoading(true);
    // The API now supports slug lookup
    api.get<Spot>(`/api/spots/${slug}`)
      .then(data => setSpot(data))
      .catch(() => setError('Không tìm thấy bãi xe'))
      .finally(() => setIsLoading(false));

    api.get<{ data: Review[] }>(`/api/spots/${slug}/reviews`)
      .then(data => setReviews(data.data || []))
      .catch(() => {});
  }, [slug]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
        <div className="container" style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
          <div className="skeleton" style={{ height: '350px', borderRadius: '12px', marginBottom: '20px' }} />
          <div className="skeleton" style={{ height: '24px', width: '60%', borderRadius: '6px', marginBottom: '12px' }} />
          <div className="skeleton" style={{ height: '16px', width: '80%', borderRadius: '6px' }} />
        </div>
      </div>
    );
  }

  if (error || !spot) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '48px', marginBottom: '12px' }}>😔</p>
            <p style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>Không tìm thấy bãi xe</p>
            <p style={{ fontSize: '14px', opacity: 0.6, marginBottom: '20px' }}>{error}</p>
            <Link href="/">
              <button className="btn-primary">← Về trang chủ</button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <div className="container" style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
        <Link href="/" style={{ color: 'var(--text-secondary)', fontSize: '14px', textDecoration: 'none', marginBottom: '16px', display: 'inline-block' }}>
          ← Quay lại
        </Link>

        {/* Image Gallery */}
        <div style={{ marginBottom: '24px' }}>
          <ImageGallery images={spot.images || []} altPrefix={spot.name} />
        </div>

        {/* Title & Info */}
        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>{spot.name}</h1>
        
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
          <span style={{ background: 'var(--primary)', color: '#fff', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>
            {SPOT_TYPE_ICONS[spot.type]} {SPOT_TYPE_LABELS[spot.type] || spot.type}
          </span>
          {spot.isPremium && <span style={{ background: '#f59e0b', color: '#000', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>⭐ PREMIUM</span>}
          {spot.isVerified && <span style={{ background: '#22c55e', color: '#fff', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>✅ ĐÃ XÁC MINH</span>}
        </div>

        <p style={{ fontSize: '14px', opacity: 0.7, marginBottom: '8px' }}>📍 {spot.address}</p>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <StarRating rating={spot.rating || 0} size={'sm'} />
          <span style={{ fontSize: '14px', opacity: 0.6 }}>({spot.reviewCount || 0} đánh giá)</span>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
          <a href={`https://www.google.com/maps/dir/?api=1&destination=${spot.latitude},${spot.longitude}`} target="_blank" rel="noopener">
            <button className="btn-primary" style={{ fontSize: '14px' }}>🧭 Chỉ đường</button>
          </a>
          <button className="btn-secondary" style={{ fontSize: '14px' }} onClick={() => {
            navigator.share?.({ title: spot.name, url: window.location.href }).catch(() => {
              navigator.clipboard.writeText(window.location.href);
            });
          }}>📋 Chia sẻ</button>
        </div>

        {/* Info Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '24px' }}>
          <div style={{ background: 'var(--bg-secondary)', borderRadius: '12px', padding: '16px' }}>
            <p style={{ fontSize: '12px', opacity: 0.5, marginBottom: '8px' }}>Chỗ đỗ xe</p>
            <p style={{ fontSize: '14px' }}>🚗 {spot.carSlots || 0} chỗ ô tô</p>
            <p style={{ fontSize: '14px' }}>🏍️ {spot.bikeSlots || 0} chỗ xe máy</p>
          </div>
          <div style={{ background: 'var(--bg-secondary)', borderRadius: '12px', padding: '16px' }}>
            <p style={{ fontSize: '12px', opacity: 0.5, marginBottom: '8px' }}>Giá gửi xe</p>
            <p style={{ fontSize: '14px' }}>🏍️ {formatCurrency(spot.pricePerHourBike || 0)}/giờ</p>
            <p style={{ fontSize: '14px' }}>🚗 {formatCurrency(spot.pricePerHourCar || 0)}/giờ</p>
          </div>
          <div style={{ background: 'var(--bg-secondary)', borderRadius: '12px', padding: '16px' }}>
            <p style={{ fontSize: '12px', opacity: 0.5, marginBottom: '8px' }}>Giờ mở cửa</p>
            <p style={{ fontSize: '14px' }}>⏰ {spot.openTime} - {spot.closeTime}</p>
          </div>
        </div>

        {/* Description */}
        {spot.description && (
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>Thông tin chi tiết</h2>
            <div style={{ color: 'var(--text-secondary)', fontSize: '14px', whiteSpace: 'pre-wrap', lineHeight: '1.7', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '12px 16px' }}>
              {spot.description}
            </div>
          </div>
        )}

        {/* Contact */}
        {spot.phone && (
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>Liên hệ</h2>
            <a href={`tel:${spot.phone}`} style={{ color: '#3b82f6', fontSize: '16px' }}>📞 {formatPhone(spot.phone)}</a>
          </div>
        )}

        {/* Map */}
        {(spot.latitude) && (
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>📍 Vị trí</h2>
            <div style={{ borderRadius: '12px', overflow: 'hidden', height: '250px' }}>
              <MapComponent spots={[spot]} center={[spot.latitude, spot.longitude!]} zoom={16} />
            </div>
          </div>
        )}

        {/* Reviews */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Đánh giá ({reviews.length})</h2>
          <ReviewForm spotId={spot.id} onReviewSubmitted={() => {
            api.get<{ data: Review[] }>(`/api/spots/${slug}/reviews`).then(data => setReviews(data.data || [])).catch(() => {});
          }} />
          {reviews.map((review: any) => (
            <div key={review.id} style={{ background: 'var(--bg-secondary)', borderRadius: '12px', padding: '16px', marginTop: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: 600, fontSize: '14px' }}>{review.user?.name || review.userName || 'Ẩn danh'}</span>
                <span style={{ fontSize: '12px', opacity: 0.5 }}>{formatRelativeTime(review.createdAt)}</span>
              </div>
              <StarRating rating={review.rating} size={'sm'} />
              {review.comment && <p style={{ fontSize: '14px', marginTop: '8px', opacity: 0.8 }}>{review.comment}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
