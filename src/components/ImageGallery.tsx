'use client';

import React, { useState } from 'react';
import { getDefaultImageForSpot } from '@/lib/images';
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
    const defaultImg = getDefaultImageForSpot(spotType, spotId);
    return (
      <div
        style={{
          width: '100%',
          height: '300px',
          borderRadius: 'var(--radius-lg, 12px)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <img 
          src={defaultImg} 
          alt={`${altPrefix}`}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{
          position: 'absolute', bottom: '12px', right: '12px',
          background: 'rgba(0,0,0,0.6)', color: '#fff',
          padding: '4px 12px', borderRadius: '20px', fontSize: '12px',
        }}>
          Ảnh minh họa
        </div>
      </div>
    );
  }

  const goTo = (index: number) => {
    if (index < 0) setCurrentIndex(images.length - 1);
    else if (index >= images.length) setCurrentIndex(0);
    else setCurrentIndex(index);
  };

  const isVideo = (url: string) => {
    if (!url) return false;
    return url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.ogg') || url.includes('/videos/') || url.includes('video');
  };

  const currentMedia = images[currentIndex];
  const isCurrentVideo = isVideo(currentMedia);

  return (
    <div style={{ position: 'relative', width: '100%', borderRadius: 'var(--radius-lg, 12px)', overflow: 'hidden' }}>
      {/* Main Media (Image or Video) */}
      <div
        style={{
          width: '100%',
          height: '350px',
          position: 'relative',
          overflow: 'hidden',
          background: '#0a0a0f',
        }}
      >
        {isCurrentVideo ? (
          <video
            src={currentMedia}
            controls
            autoPlay
            loop
            muted
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <img
            src={currentMedia}
            alt={`${altPrefix} ${currentIndex + 1}`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'opacity 0.3s ease',
            }}
          />
        )}

        {/* Video badge if video */}
        {isCurrentVideo && (
          <div style={{
            position: 'absolute', top: '12px', left: '12px',
            background: 'rgba(239, 68, 68, 0.9)',
            backdropFilter: 'blur(8px)',
            color: '#ffffff',
            fontSize: '12px',
            fontWeight: 700,
            padding: '5px 12px',
            borderRadius: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
            zIndex: 10,
          }}>
            🎬 Video Review Thực Tế
          </div>
        )}


        {/* Gradient overlay */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '80px',
            background: 'linear-gradient(transparent, rgba(0,0,0,0.5))',
          }}
        />

        {/* Counter */}
        <span
          style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            background: 'rgba(0,0,0,0.6)',
            color: 'white',
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '12px',
          }}
        >
          {currentIndex + 1} / {images.length}
        </span>
      </div>

      {/* Nav Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={() => goTo(currentIndex - 1)}
            style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(0,0,0,0.5)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              fontSize: '18px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s ease',
            }}
            aria-label="Ảnh trước"
          >
            ‹
          </button>
          <button
            onClick={() => goTo(currentIndex + 1)}
            style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(0,0,0,0.5)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              fontSize: '18px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s ease',
            }}
            aria-label="Ảnh tiếp"
          >
            ›
          </button>
        </>
      )}

      {/* Dots */}
      {images.length > 1 && images.length <= 10 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '6px',
            padding: '12px 0',
          }}
        >
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              style={{
                width: i === currentIndex ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                background: i === currentIndex ? 'var(--color-primary, #10b981)' : 'rgba(255,255,255,0.3)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              aria-label={`Ảnh ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
