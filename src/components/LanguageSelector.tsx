'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLocale } from '@/contexts/LocaleContext';
import { LANGUAGES, LanguageOption } from '@/lib/i18n';

interface LanguageSelectorProps {
  compact?: boolean;
  align?: 'right' | 'left';
}

export default function LanguageSelector({ compact = false, align = 'right' }: LanguageSelectorProps) {
  const { locale, setLocale } = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentLang = LANGUAGES.find((l) => l.code === locale) || LANGUAGES[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (lang: LanguageOption) => {
    setLocale(lang.code);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block', zIndex: 99999 }}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: compact ? '5px 10px' : '6px 12px',
          background: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '20px',
          color: '#ffffff',
          fontSize: compact ? '12px' : '13px',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          outline: 'none',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
        }}
      >
        <span style={{ fontSize: '15px', lineHeight: 1 }}>{currentLang.flag}</span>
        <span>{compact ? currentLang.short : currentLang.name}</span>
        <span style={{ fontSize: '10px', opacity: 0.7, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            ...(align === 'right' ? { right: 0 } : { left: 0 }),
            minWidth: '160px',
            background: 'rgba(18, 18, 26, 0.96)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '16px',
            padding: '6px',
            boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
            zIndex: 999999,
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
          }}
        >
          {LANGUAGES.map((lang) => {
            const isSelected = lang.code === locale;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleSelect(lang)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  background: isSelected ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
                  border: isSelected ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
                  color: isSelected ? '#a5b4fc' : '#e2e8f0',
                  fontSize: '13px',
                  fontWeight: isSelected ? 600 : 400,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <span style={{ fontSize: '18px' }}>{lang.flag}</span>
                <span style={{ flex: 1 }}>{lang.name}</span>
                {isSelected && <span style={{ color: '#818cf8', fontWeight: 'bold' }}>✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
