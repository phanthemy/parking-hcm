'use client';

import React from 'react';
import Link from 'next/link';
import type { Spot } from '@/lib/types';
import { formatCurrency, formatHours } from '@/lib/format';
import { SPOT_TYPE_LABELS, SPOT_TYPE_ICONS } from '@/lib/types';
import { useLocale } from '@/contexts/LocaleContext';
import { getCategoryBrand } from '@/lib/images';
import { useUserRetention } from '@/contexts/UserRetentionContext';
import CommunityReportModal from './CommunityReportModal';

interface SpotCardProps {
  spot: Spot;
  onDirections?: (spot: Spot) => void;
  onCardClick?: (spot: Spot) => void;
}

export default function SpotCard({ spot, onDirections, onCardClick }: SpotCardProps) {
  const { t } = useLocale();
  const { toggleFavorite, checkIsFavorite } = useUserRetention();
  const isFavorite = checkIsFavorite(spot.id);
  const [showReportModal, setShowReportModal] = React.useState(false);
  const [failedUrls, setFailedUrls] = React.useState<string[]>([]);
  const [isVisible, setIsVisible] = React.useState(false);
  const [activeImageIndex, setActiveImageIndex] = React.useState(0);
  const [touchStartX, setTouchStartX] = React.useState<number | null>(null);
  const cardRef = React.useRef<HTMLDivElement>(null);

  // Filter out any broken image URLs dynamically
  const validImages = React.useMemo(() => {
    return (spot.images || []).filter(url => !failedUrls.includes(url));
  }, [spot.images, failedUrls]);

  const hasValidImages = validImages.length > 0;

  // IntersectionObserver: chỉ load Street View / map khi card xuất hiện trên màn hình
  React.useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
      { rootMargin: '100px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleImageError = (url: string) => {
    setFailedUrls(prev => [...prev, url]);
  };

  const handlePrevImg = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (validImages.length === 0) return;
    setActiveImageIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
  };

  const handleNextImg = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (validImages.length === 0) return;
    setActiveImageIndex((prev) => (prev + 1) % validImages.length);
  };

  const handleDotClick = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveImageIndex(index);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null || validImages.length <= 1) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 35) {
      if (diff > 0) {
        setActiveImageIndex((prev) => (prev + 1) % validImages.length);
      } else {
        setActiveImageIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
      }
    }
    setTouchStartX(null);
  };



  const handleDirections = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDirections) {
      onDirections(spot);
    }
  };

  const handleCall = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (spot.phone) {
      window.location.href = `tel:${spot.phone}`;
    }
  };

  // Map spot type to i18n key for full translation support
  const TYPE_KEY_MAP: Record<string, 'parking'|'restaurant'|'cafe'|'restroom'|'service'|'garage'|'carwash'> = {
    PARKING_LOT: 'parking',
    RESTAURANT: 'restaurant',
    CAFE: 'cafe',
    RESTROOM: 'restroom',
    SERVICE: 'service',
    GARAGE: 'garage',
    CARWASH: 'carwash',
  };
  const typeIcon = SPOT_TYPE_ICONS[spot.type] || '📍';
  const typeLabel = TYPE_KEY_MAP[spot.type] ? t(TYPE_KEY_MAP[spot.type]) : (SPOT_TYPE_LABELS[spot.type] || spot.type);
  const hasImage = spot.images && spot.images.length > 0;
  const rating = (spot.rating || 0).toFixed(1);
  const distanceText = spot.distance != null
    ? (typeof spot.distance === 'number' ? `${(spot.distance as number).toFixed(1)} km` : String(spot.distance))
    : null;

  const cardContent = (
    <div ref={cardRef} style={{
        background: '#1a1a24',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '14px',
        overflow: 'hidden',
        transition: 'border-color 0.2s, transform 0.2s',
        cursor: 'pointer',
      }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        {/* Thumbnail 16:9 Carousel */}
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{ position: 'relative', width: '100%', paddingTop: '56.25%', overflow: 'hidden', background: '#1c1c28' }}
        >
          {hasValidImages ? (
            <>
              {(() => {
                const currentMedia = validImages[activeImageIndex % validImages.length];
                const isVideo = currentMedia?.endsWith('.mp4') || currentMedia?.endsWith('.webm') || currentMedia?.includes('/videos/');
                
                if (isVideo) {
                  return (
                    <>
                      <video
                        src={currentMedia}
                        autoPlay
                        loop
                        muted
                        playsInline
                        style={{
                          position: 'absolute', top: 0, left: 0,
                          width: '100%', height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                      <div style={{
                        position: 'absolute', top: '8px', right: '8px',
                        background: 'rgba(239, 68, 68, 0.9)',
                        backdropFilter: 'blur(6px)',
                        color: '#fff', fontSize: '10px', fontWeight: 700,
                        padding: '2px 7px', borderRadius: '8px',
                        zIndex: 12,
                      }}>
                        🎬 Video
                      </div>
                    </>
                  );
                }

                return (
                  <img
                    src={currentMedia}
                    alt={spot.name}
                    onError={() => handleImageError(currentMedia)}
                    style={{
                      position: 'absolute', top: 0, left: 0,
                      width: '100%', height: '100%',
                      objectFit: 'cover',
                      transition: 'opacity 0.2s ease-in-out',
                    }}
                  />
                );
              })()}


              {/* Prev Image Arrow Button */}
              {validImages.length > 1 && (
                <button
                  onClick={handlePrevImg}
                  style={{
                    position: 'absolute',
                    left: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(4px)',
                    WebkitBackdropFilter: 'blur(4px)',
                    color: '#ffffff',
                    border: '1px solid rgba(255,255,255,0.25)',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    zIndex: 12,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                  }}
                  aria-label="Ảnh trước"
                >
                  ‹
                </button>
              )}

              {/* Next Image Arrow Button */}
              {validImages.length > 1 && (
                <button
                  onClick={handleNextImg}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(4px)',
                    WebkitBackdropFilter: 'blur(4px)',
                    color: '#ffffff',
                    border: '1px solid rgba(255,255,255,0.25)',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    zIndex: 12,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                  }}
                  aria-label="Ảnh kế tiếp"
                >
                  ›
                </button>
              )}

              {/* Photo Count Badge */}
              {validImages.length > 1 && (
                <div style={{
                  position: 'absolute',
                  bottom: '8px',
                  right: '8px',
                  background: 'rgba(0,0,0,0.7)',
                  backdropFilter: 'blur(6px)',
                  WebkitBackdropFilter: 'blur(6px)',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontSize: '10px',
                  fontWeight: 600,
                  color: '#f0f0f0',
                  zIndex: 12,
                  border: '1px solid rgba(255,255,255,0.15)',
                }}>
                  📷 {(activeImageIndex % validImages.length) + 1}/{validImages.length}
                </div>
              )}

              {/* Slide Dots Indicator */}
              {validImages.length > 1 && (
                <div style={{
                  position: 'absolute',
                  bottom: '8px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  gap: '4px',
                  zIndex: 12,
                  background: 'rgba(0,0,0,0.45)',
                  padding: '3px 8px',
                  borderRadius: '10px',
                  backdropFilter: 'blur(4px)',
                }}>
                  {validImages.map((_, idx) => (
                    <div
                      key={idx}
                      onClick={(e) => handleDotClick(e, idx)}
                      style={{
                        width: idx === (activeImageIndex % validImages.length) ? '14px' : '5px',
                        height: '5px',
                        borderRadius: '3px',
                        background: idx === (activeImageIndex % validImages.length) ? '#3b82f6' : 'rgba(255,255,255,0.45)',
                        transition: 'all 0.25s ease',
                        cursor: 'pointer',
                      }}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (() => {
            const brand = getCategoryBrand(spot.type);
            return (
              <div style={{
                position: 'absolute', top: 0, left: 0,
                width: '100%', height: '100%',
                background: brand.bg,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                textAlign: 'center',
                boxShadow: 'inset 0 0 30px rgba(0,0,0,0.3)',
              }}>
                <span style={{ fontSize: '38px', marginBottom: '2px', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.35))' }}>{brand.icon}</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', letterSpacing: '0.2px', textShadow: '0 2px 4px rgba(0,0,0,0.6)' }}>
                  {brand.label}
                </span>
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.75)', marginTop: '2px' }}>
                  {spot.source === 'MANUAL' ? '✓ Đã xác thực' : 'MapGo Verified'}
                </span>
              </div>
            );
          })()}



          {/* Overlay badges — small pills */}
          <div style={{
            position: 'absolute', top: '8px', left: '8px',
            display: 'flex', gap: '6px',
          }}>
            <span style={{
              background: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              padding: '3px 8px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: 600,
              color: '#e0e0e0',
              letterSpacing: '0.02em',
            }}>
              {typeIcon} {typeLabel}
            </span>
            {spot.isPremium && (
              <span style={{
                background: 'rgba(201,168,76,0.75)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                padding: '3px 8px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: 600,
                color: '#fff',
              }}>
                ✨ {t('premium')}
              </span>
            )}
          </div>

          {/* Distance pill top-right */}
          {distanceText && (
            <span style={{
              position: 'absolute', top: '8px', right: '8px',
              background: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              padding: '3px 8px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: 600,
              color: '#a0a0b0',
            }}>
              📍 {distanceText}
            </span>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: '12px 14px 14px' }}>
          {/* Name + Rating row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <h3 style={{
              fontSize: '15px', fontWeight: 700, lineHeight: 1.3,
              flex: 1, marginRight: '8px',
              color: '#f0f0f0',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {spot.name}
            </h3>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '3px',
              flexShrink: 0,
            }}>
              <span style={{ fontSize: '13px' }}>⭐</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#f0f0f0' }}>{rating}</span>
              <span style={{ fontSize: '11px', color: '#6b6b80' }}>({spot.reviewCount || 0})</span>
            </div>
          </div>

          {/* Address */}
          <p style={{
            fontSize: '12px', color: '#6b6b80', lineHeight: 1.4,
            marginBottom: '10px',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {spot.address}
          </p>

          {/* Info grid 2 columns */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '6px 12px',
            fontSize: '12px',
            color: '#a0a0b0',
            marginBottom: '12px',
          }}>
            {spot.carSlots > 0 && (
              <span>🚗 <strong style={{ color: '#d0d0d8' }}>{spot.carSlots}</strong> {t('car_slots')}</span>
            )}
            {spot.bikeSlots > 0 && (
              <span>🏍️ <strong style={{ color: '#d0d0d8' }}>{spot.bikeSlots}</strong> {t('bike_slots')}</span>
            )}
            {(spot.pricePerHourCar != null && spot.pricePerHourCar > 0) && (
              <span>💰 <strong style={{ color: '#d0d0d8', fontWeight: 700 }}>{formatCurrency(spot.pricePerHourCar, '/h')}</strong></span>
            )}
            {(spot.pricePerHourCar === 0 || (spot.pricePerHourBike === 0 && spot.pricePerHourCar == null)) && (
              <span style={{ color: '#10b981' }}>🎉 <strong>{t('free')}</strong></span>
            )}
            {(spot.openTime || spot.closeTime) && (
              <span>🕐 {formatHours(spot.openTime, spot.closeTime)}</span>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={handleDirections}
              style={{
                flex: 1,
                padding: '9px 12px',
                fontSize: '13px',
                fontWeight: 600,
                border: 'none',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #C9A84C, #9AAAB8)',
                color: '#0D0D0A',
                cursor: 'pointer',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              🧭 {t('directions')}
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleFavorite(spot);
              }}
              title={isFavorite ? 'Đã lưu yêu thích' : 'Lưu yêu thích'}
              style={{
                padding: '9px 12px',
                fontSize: '13px',
                fontWeight: 600,
                border: isFavorite ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(255,255,255,0.12)',
                borderRadius: '12px',
                background: isFavorite ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255,255,255,0.05)',
                color: isFavorite ? '#fbbf24' : '#a0a0b0',
                cursor: 'pointer',
              }}
            >
              {isFavorite ? '⭐' : '☆'}
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowReportModal(true);
              }}
              title="Báo cáo tình trạng còn/hết chỗ, giá, vị trí"
              style={{
                padding: '9px 12px',
                fontSize: '13px',
                fontWeight: 600,
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.05)',
                color: '#a0a0b0',
                cursor: 'pointer',
              }}
            >
              ⚠️
            </button>
            {spot.phone && (
              <button
                onClick={handleCall}
                style={{
                  padding: '9px 12px',
                  fontSize: '13px',
                  fontWeight: 600,
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.05)',
                  color: '#a0a0b0',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
              >
                📞
              </button>
            )}
          </div>
        </div>
      </div>
  );

  // When onCardClick is provided, use div (stay on page). Otherwise use Link (navigate to detail page).
  return (
    <>
      {onCardClick ? (
        <div onClick={() => onCardClick(spot)} style={{ textDecoration: 'none', color: 'inherit' }}>
          {cardContent}
        </div>
      ) : (
        <Link href={`/p/${spot.slug || spot.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          {cardContent}
        </Link>
      )}

      {showReportModal && (
        <CommunityReportModal
          spot={spot}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </>
  );
}
