'use client';

import React from 'react';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

export default function StarRating({
  rating,
  maxStars = 5,
  size = 'md',
  showValue = true,
  interactive = false,
  onChange,
}: StarRatingProps) {
  const sizeMap = { sm: '14px', md: '18px', lg: '24px' };
  const fontSize = sizeMap[size];

  const handleClick = (star: number) => {
    if (interactive && onChange) {
      onChange(star);
    }
  };

  return (
    <span className="rating" style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
      {Array.from({ length: maxStars }, (_, i) => {
        const starValue = i + 1;
        const filled = starValue <= Math.floor(rating);
        const halfFilled = !filled && starValue - 0.5 <= rating;

        return (
          <span
            key={i}
            onClick={() => handleClick(starValue)}
            style={{
              fontSize,
              cursor: interactive ? 'pointer' : 'default',
              color: filled || halfFilled ? '#f59e0b' : '#4b5563',
              transition: 'color 0.15s ease',
            }}
            role={interactive ? 'button' : undefined}
            aria-label={interactive ? `${starValue} sao` : undefined}
          >
            {filled ? '★' : halfFilled ? '★' : '☆'}
          </span>
        );
      })}
      {showValue && (
        <span style={{ marginLeft: '6px', fontSize: size === 'sm' ? '12px' : '14px', opacity: 0.8 }}>
          {rating.toFixed(1)}
        </span>
      )}
    </span>
  );
}
