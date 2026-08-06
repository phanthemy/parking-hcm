'use client';

import React, { useState, useEffect } from 'react';
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

interface SpotDetailClientProps {
  id: string;
  initialSpot?: Spot | null;
}

export default function SpotDetailClient({ id, initialSpot }: SpotDetailClientProps) {
  const { t } = useLocale();

  const [spot, setSpot] = useState<Spot | null>(initialSpot || null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(!initialSpot);
  const [error, setError] = useState('');

  const fetchSpot = async () => {
    if (initialSpot) return; // Skip if provided initially
    setIsLoading(true);
    try {
      const data = await api.get<Spot>(`/api/spots/${id}`);
      setSpot(data);
    } catch {
      setError(t('load_error'));
      // Mock data for development
      setSpot(getMockSpot(id));
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const data = await api.get<{ data: Review[] }>(`/api/spots/${id}/reviews`);
      setReviews(data.data || []);
    } catch {
      setReviews(getMockReviews());
    }
  };

  useEffect(() => {
    if (id) {
      if (!initialSpot) {
        fetchSpot();
      }
      fetchReviews();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, initialSpot]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
        <div className="container" style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
          <div className="skeleton" style={{ height: '350px', borderRadius: '12px', marginBottom: '20px' }} />
          <div className="skeleton" style={{ height: '24px', width: '60%', borderRadius: '6px', marginBottom: '12px' }} />
          <div className="skeleton" style={{ height: '16px', width: '80%', borderRadius: '6px', marginBottom: '8px' }} />
          <div className="skeleton" style={{ height: '16px', width: '40%', borderRadius: '6px' }} />
        </div>
      </div>
    );
  }

  if (error && !spot) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '48px', marginBottom: '12px' }}>😔</p>
            <p style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>{t('not_found')}</p>
            <p style={{ fontSize: '14px', opacity: 0.6, marginBottom: '20px' }}>{error}</p>
            <Link href="/">
              <button className="btn-primary">← {t('back_home')}</button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!spot) return null;

  // Calculate rating breakdown
  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => Math.floor(r.rating) === star).length;
    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
    return { star, count, percentage };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-primary, #0d0d12)', color: '#fff' }}>
      <Header />

      <main className="container" style={{ maxWidth: '900px', margin: '0 auto', padding: '20px', flex: 1 }}>
        {/* Back Link */}
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '14px', opacity: 0.7, marginBottom: '16px' }}>
          ← {t('back')}
        </Link>

        {/* Image Gallery */}
        <ImageGallery images={spot.images} altPrefix={spot.name} />

        {/* Header Info */}
        <div style={{ marginTop: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 700, flex: 1 }}>{spot.name}</h1>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span className="badge">
                {SPOT_TYPE_ICONS[spot.type]} {SPOT_TYPE_LABELS[spot.type]}
              </span>
              {spot.isPremium && <span className="badge badge-premium">✨ Premium</span>}
              {spot.isVerified && <span className="badge">✅ {t('verified')}</span>}
            </div>
          </div>

          <p style={{ fontSize: '15px', opacity: 0.7, marginBottom: '8px' }}>
            📍 {spot.address}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <StarRating rating={spot.rating} />
            <span style={{ fontSize: '13px', opacity: 0.6 }}>
              ({spot.reviewCount} {t('reviews')})
            </span>
          </div>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '24px' }}>
            <button
              className="btn-primary"
              style={{ padding: '12px 24px' }}
              onClick={() => {
                window.location.href = `/?route_to=${spot.id}&lat=${spot.latitude}&lng=${spot.longitude}&name=${encodeURIComponent(spot.name)}`;
              }}
            >
              🧭 {t('directions')}
            </button>
            {spot.phone && (
              <a href={`tel:${spot.phone}`}>
                <button className="btn-secondary" style={{ padding: '12px 24px' }}>
                  📞 {formatPhone(spot.phone)}
                </button>
              </a>
            )}
            <button
              className="btn-secondary"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: spot.name,
                    text: `${spot.name} - ${spot.address}`,
                    url: window.location.href,
                  });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert(t('link_copied'));
                }
              }}
              style={{ padding: '12px 24px' }}
            >
              📤 {t('share')}
            </button>
          </div>
        </div>

        {/* Info Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div className="card" style={{ padding: '16px' }}>
            <h3 style={{ fontSize: '13px', opacity: 0.6, marginBottom: '8px' }}>{t('parking_slots')}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {spot.carSlots > 0 && (
                <span style={{ fontSize: '15px' }}>🚗 {spot.carSlots} {t('car_slots')}</span>
              )}
              {spot.bikeSlots > 0 && (
                <span style={{ fontSize: '15px' }}>🏍️ {spot.bikeSlots} {t('bike_slots')}</span>
              )}
            </div>
          </div>

          <div className="card" style={{ padding: '16px' }}>
            <h3 style={{ fontSize: '13px', opacity: 0.6, marginBottom: '8px' }}>{t('pricing')}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {spot.pricePerHourBike != null && (
                <span style={{ fontSize: '15px', color: 'var(--color-primary, #10b981)', fontWeight: 600 }}>
                  🏍️ {formatCurrency(spot.pricePerHourBike, '/giờ')}
                </span>
              )}
              {spot.pricePerHourCar != null && (
                <span style={{ fontSize: '15px', color: 'var(--color-primary, #10b981)', fontWeight: 600 }}>
                  🚗 {formatCurrency(spot.pricePerHourCar, '/giờ')}
                </span>
              )}
            </div>
          </div>

          <div className="card" style={{ padding: '16px' }}>
            <h3 style={{ fontSize: '13px', opacity: 0.6, marginBottom: '8px' }}>{t('opening_hours')}</h3>
            <span style={{ fontSize: '15px' }}>
              🕐 {formatHours(spot.openTime, spot.closeTime)}
            </span>
          </div>
        </div>

        {/* Description */}
        {spot.description && (
          <div className="card" style={{ padding: '20px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>📝 {t('description')}</h2>
            <p style={{ fontSize: '14px', lineHeight: 1.7, opacity: 0.85 }}>{spot.description}</p>
          </div>
        )}

        {/* Business Profile: Menu, Services, Promotions */}
        {spot.menu && spot.menu.length > 0 && (
          <div className="card" style={{ padding: '20px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>🍽️ Menu</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {spot.menu.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 0',
                    borderBottom: i < spot.menu!.length - 1 ? '1px solid var(--border-color, rgba(255,255,255,0.1))' : 'none',
                  }}
                >
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 500 }}>{item.name}</p>
                    {item.description && (
                      <p style={{ fontSize: '12px', opacity: 0.6, marginTop: '2px' }}>{item.description}</p>
                    )}
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-primary, #10b981)' }}>
                    {formatCurrency(item.price)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {spot.services && spot.services.length > 0 && (
          <div className="card" style={{ padding: '20px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>🔧 {t('services')}</h2>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {spot.services.map((service, i) => (
                <span key={i} className="badge" style={{ padding: '6px 12px', fontSize: '13px' }}>
                  {service}
                </span>
              ))}
            </div>
          </div>
        )}

        {spot.promotions && spot.promotions.length > 0 && (
          <div className="card" style={{ padding: '20px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>🎁 {t('promotions')}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {spot.promotions.map((promo, i) => (
                <div key={i} style={{ padding: '12px', background: 'var(--bg-tertiary, rgba(255,255,255,0.05))', borderRadius: '8px' }}>
                  <p style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>{promo.title}</p>
                  <p style={{ fontSize: '13px', opacity: 0.7 }}>{promo.description}</p>
                  {promo.validUntil && (
                    <p style={{ fontSize: '12px', opacity: 0.5, marginTop: '4px' }}>
                      {t('valid_until')}: {promo.validUntil}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mini Map */}
        <div className="card" style={{ padding: '20px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>📍 {t('location')}</h2>
          <div style={{ height: '250px', borderRadius: '12px', overflow: 'hidden' }}>
            <MapComponent
              spots={[spot]}
              center={[spot.latitude, spot.longitude]}
              zoom={16}
              style={{ height: '100%', minHeight: '250px' }}
            />
          </div>
        </div>

        {/* Reviews Section */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>
            ⭐ {t('reviews_section')} ({reviews.length})
          </h2>

          <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'center', minWidth: '80px' }}>
                <p style={{ fontSize: '36px', fontWeight: 700 }}>{spot.rating.toFixed(1)}</p>
                <StarRating rating={spot.rating} size="sm" showValue={false} />
                <p style={{ fontSize: '12px', opacity: 0.6, marginTop: '4px' }}>{spot.reviewCount} {t('reviews')}</p>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {ratingBreakdown.map((rb) => (
                  <div key={rb.star} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', width: '30px' }}>{rb.star} ★</span>
                    <div style={{ flex: 1, height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)' }}>
                      <div
                        style={{
                          width: `${rb.percentage}%`,
                          height: '100%',
                          borderRadius: '4px',
                          background: 'var(--color-primary, #10b981)',
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '12px', opacity: 0.6, width: '25px' }}>{rb.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <ReviewForm spotId={id} onReviewSubmitted={fetchReviews} />
          </div>

          {reviews.length === 0 ? (
            <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
              <p style={{ fontSize: '32px', marginBottom: '8px' }}>💬</p>
              <p style={{ fontSize: '14px', opacity: 0.6 }}>{t('no_reviews')}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {reviews.map((review) => (
                <div key={review.id} className="card" style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #667eea, #764ba2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '16px',
                          fontWeight: 600,
                        }}
                      >
                        {review.userName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: 600 }}>{review.userName}</p>
                        <p style={{ fontSize: '11px', opacity: 0.5 }}>{formatRelativeTime(review.createdAt)}</p>
                      </div>
                    </div>
                    <StarRating rating={review.rating} size="sm" />
                  </div>
                  <p style={{ fontSize: '14px', lineHeight: 1.6, opacity: 0.85 }}>{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// Mock data for development
function getMockSpot(id: string): Spot {
  return {
    id,
    name: 'Bãi xe Nguyễn Huệ',
    type: 'PARKING_LOT',
    address: '123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
    latitude: 10.7735,
    longitude: 106.7031,
    description:
      'Bãi xe rộng rãi, an ninh 24/7. Có camera giám sát, nhân viên trực suốt ngày đêm.',
    phone: '0901234567',
    website: 'https://example.com',
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
    services: ['Rửa xe', 'Bảo vệ 24/7', 'Camera giám sát', 'WiFi miễn phí'],
    promotions: [
      {
        title: 'Giảm 20%',
        description: 'Áp dụng cho lần gửi xe đầu tiên',
        validUntil: '31/12/2024',
      },
    ],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  };
}

function getMockReviews(): Review[] {
  return [
    {
      id: 'r1',
      spotId: '1',
      userId: 'u1',
      userName: 'Nguyễn Văn A',
      rating: 5,
      comment: 'Bãi xe rất rộng rãi và an ninh tốt.',
      createdAt: '2024-03-15T10:30:00',
    },
  ];
}
