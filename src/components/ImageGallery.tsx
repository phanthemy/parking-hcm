'use client';

import React, { useState } from 'react';

interface ImageGalleryProps {
  images: string[];
  altPrefix?: string;
}

export default function ImageGallery({ images, altPrefix = 'Hình ảnh' }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div
        style={{
          width: '100%',
          height: '300px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 'var(--radius-lg, 12px)',
          fontSize: '64px',
        }}
      >
        🅿️
      </div>
    );
  }

  const goTo = (index: number) => {
    if (index < 0) setCurrentIndex(images.length - 1);
    else if (index >= images.length) setCurrentIndex(0);
    else setCurrentIndex(index);
  };

  return (
    <div style={{ position: 'relative', width: '100%', borderRadius: 'var(--radius-lg, 12px)', overflow: 'hidden' }}>
      {/* Main Image */}
      <div
        style={{
          width: '100%',
          height: '350px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <img
          src={images[currentIndex]}
          alt={`${altPrefix} ${currentIndex + 1}`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'opacity 0.3s ease',
          }}
        />

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
