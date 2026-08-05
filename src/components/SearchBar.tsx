'use client';

import React from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChange,
  onSearch,
  placeholder = 'Tìm bãi xe, quán ăn, café...',
}: SearchBarProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) onSearch(value);
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <span style={{ fontSize: '18px', display: 'flex', alignItems: 'center' }}>🔍</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          flex: 1,
          border: 'none',
          outline: 'none',
          background: 'transparent',
          color: 'inherit',
          fontSize: '15px',
          padding: '12px 8px',
        }}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          style={{
            background: 'none',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            opacity: 0.5,
            fontSize: '16px',
            padding: '4px 8px',
          }}
          aria-label="Xóa tìm kiếm"
        >
          ✕
        </button>
      )}
    </form>
  );
}
