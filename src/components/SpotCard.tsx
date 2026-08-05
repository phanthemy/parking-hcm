'use client';

import React from 'react';
import Link from 'next/link';
import type { Spot } from '@/lib/types';
import { formatCurrency, formatHours } from '@/lib/format';
import { SPOT_TYPE_LABELS, SPOT_TYPE_ICONS } from '@/lib/types';

interface SpotCardProps {
  spot: Spot;
  onDirections?: (spot: Spot) => void;
}

export default function SpotCard({ spot, onDirections }: SpotCardProps) {
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

  const typeLabel = SPOT_TYPE_LABELS[spot.type] || spot.type;
  const typeIcon = SPOT_TYPE_ICONS[spot.type] || '📍';
  const hasImage = spot.images && spot.images.length > 0;
  const rating = (spot.rating || 0).toFixed(1);
  const distanceText = spot.distance != null ? `${spot.distance.toFixed(1)} km` : null;

  return (
    <Link href={`/spot/${spot.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div style={{
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
        {/* Thumbnail 16:9 */}
        <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', overflow: 'hidden' }}>
          {hasImage ? (
            <img
              src={spot.images[0]}
              alt={spot.name}
              style={{
                position: 'absolute', top: 0, left: 0,
                width: '100%', height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <div style={{
              position: 'absolute', top: 0, left: 0,
              width: '100%', height: '100%',
              background: '#252530',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '32px', opacity: 0.4,
            }}>
              {typeIcon}
            </div>
          )}

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
                background: 'rgba(139,92,246,0.6)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                padding: '3px 8px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: 600,
                color: '#fff',
              }}>
                ✨ Premium
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
              <span>🚗 <strong style={{ color: '#d0d0d8' }}>{spot.carSlots}</strong> chỗ ô tô</span>
            )}
            {spot.bikeSlots > 0 && (
              <span>🏍️ <strong style={{ color: '#d0d0d8' }}>{spot.bikeSlots}</strong> chỗ xe máy</span>
            )}
            {(spot.pricePerHourCar != null && spot.pricePerHourCar > 0) && (
              <span>💰 <strong style={{ color: '#d0d0d8', fontWeight: 700 }}>{formatCurrency(spot.pricePerHourCar, '/h')}</strong></span>
            )}
            {(spot.pricePerHourCar === 0 || (spot.pricePerHourBike === 0 && spot.pricePerHourCar == null)) && (
              <span style={{ color: '#10b981' }}>🎉 <strong>Miễn phí</strong></span>
            )}
            {(spot.openTime || spot.closeTime) && (
              <span>🕐 {formatHours(spot.openTime, spot.closeTime)}</span>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleDirections}
              style={{
                flex: 1,
                padding: '9px 14px',
                fontSize: '13px',
                fontWeight: 600,
                border: 'none',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                color: '#fff',
                cursor: 'pointer',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              🧭 Chỉ đường
            </button>
            {spot.phone && (
              <button
                onClick={handleCall}
                style={{
                  padding: '9px 14px',
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
    </Link>
  );
}
