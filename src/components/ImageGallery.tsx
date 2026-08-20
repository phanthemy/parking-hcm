'use client';

import React, { useState } from 'react';
import { getCategoryBrand } from '@/lib/images';
import { SPOT_TYPE_LABELS } from '@/lib/types';

interface ImageGalleryProps {
  images: string[];
  altPrefix?: string;
  spotType?: string;
  spotId?: string;
}

export default function ImageGallery({ images, altPrefix = 'Địa điểm', spotType, spotId }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    const brand = getCategoryBrand(spotType || 'PARKING');
    return (
      <div
        style={{
          width: '100%',
          height: '220px',
          borderRadius: 'var(--radius-lg, 12px)',
          overflow: 'hidden',
          position: 'relative',
          background: brand.bg,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          textAlign: 'center',
          boxShadow: 'inset 0 0 40px rgba(0,0,0,0.3)',
        }}
      >
        <span style={{ fontSize: '48px', marginBottom: '8px', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))' }}>
          {brand.icon}
        </span>
        <span style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', letterSpacing: '0.3px', textShadow: '0 2px 6px rgba(0,0,0,0.6)' }}>
          {brand.label}
        </span>
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', marginTop: '4px', maxWidth: '80%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {altPrefix}
        </span>
        <div style={{
          position: 'absolute', bottom: '10px', right: '12px',
          background: 'rgba(0,0,0,0.5)', color: 'rgba(255,255,255,0.85)',
          padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600,
        }}>
          Dữ liệu bản đồ MapGo
        </div>
      </div>
    );
  }

  const goTo = (index: number) => {
    setCurrentIndex(index);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const next = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div
      style={{
        width: '100%',
        borderRadius: 'var(--radius-lg, 12px)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '300px',
          position: 'relative',
        }}
      >
        <img
          src={images[currentIndex]}
          alt={`${altPrefix} - Ảnh ${currentIndex + 1}`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />

        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              style={{
                position: 'absolute',
                left: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(0, 0, 0, 0.5)',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
              }}
            >
              &#8249;
            </button>
            <button
              onClick={next}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(0, 0, 0, 0.5)',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
              }}
            >
              &#8250;
            </button>
          </>
        )}

        <div
          style={{
            position: 'absolute',
            bottom: '8px',
            right: '8px',
            background: 'rgba(0, 0, 0, 0.6)',
            color: '#fff',
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '12px',
          }}
        >
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {images.length > 1 && (
        <div
          style={{
            display: 'flex',
            gap: '8px',
            marginTop: '8px',
            overflowX: 'auto',
            paddingBottom: '4px',
          }}
        >
          {images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`Thumbnail ${i + 1}`}
              onClick={() => goTo(i)}
              style={{
                width: '60px',
                height: '60px',
                objectFit: 'cover',
                borderRadius: 'var(--radius-sm, 6px)',
                cursor: 'pointer',
                border: i === currentIndex ? '2px solid var(--primary, #6366f1)' : '2px solid transparent',
                opacity: i === currentIndex ? 1 : 0.6,
                transition: 'all 0.2s',
                flexShrink: 0,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
