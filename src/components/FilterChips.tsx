'use client';

import React from 'react';
import type { SpotType } from '@/lib/types';

interface FilterChipsProps {
  selectedType: SpotType | 'all';
  onTypeChange: (type: SpotType | 'all') => void;
  selectedSort: 'nearest' | 'cheapest' | 'rating';
  onSortChange: (sort: 'nearest' | 'cheapest' | 'rating') => void;
}

const typeFilters: { value: SpotType | 'all'; label: string; icon: string }[] = [
  { value: 'all', label: 'Tất cả', icon: '📍' },
  { value: 'PARKING_LOT', label: 'Bãi xe', icon: '🅿️' },
  { value: 'RESTAURANT', label: 'Quán ăn', icon: '🍜' },
  { value: 'CAFE', label: 'Café', icon: '☕' },
  { value: 'RESTROOM', label: 'Vệ sinh', icon: '🚻' },
  { value: 'SERVICE', label: 'Dịch vụ', icon: '🔧' },
];

const sortOptions: { value: 'nearest' | 'cheapest' | 'rating'; label: string }[] = [
  { value: 'nearest', label: 'Gần nhất' },
  { value: 'cheapest', label: 'Rẻ nhất' },
  { value: 'rating', label: 'Đánh giá cao' },
];

export default function FilterChips({
  selectedType,
  onTypeChange,
  selectedSort,
  onSortChange,
}: FilterChipsProps) {
  return (
    <div className="filter-chips">
      {/* Type Filters */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {typeFilters.map((filter) => (
          <button
            key={filter.value}
            className={`badge ${selectedType === filter.value ? 'badge-active' : ''}`}
            onClick={() => onTypeChange(filter.value)}
            style={{
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              padding: '8px 14px',
              fontSize: '13px',
              border: 'none',
              transition: 'all 0.2s ease',
            }}
          >
            {filter.icon} {filter.label}
          </button>
        ))}
      </div>

      {/* Sort Options */}
      <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
        <span style={{ fontSize: '13px', opacity: 0.6, display: 'flex', alignItems: 'center', marginRight: '4px' }}>
          Sắp xếp:
        </span>
        {sortOptions.map((opt) => (
          <button
            key={opt.value}
            className={`badge ${selectedSort === opt.value ? 'badge-active' : ''}`}
            onClick={() => onSortChange(opt.value)}
            style={{
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              padding: '6px 12px',
              fontSize: '12px',
              border: 'none',
              transition: 'all 0.2s ease',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
