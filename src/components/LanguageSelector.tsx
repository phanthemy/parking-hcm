'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLocale } from '@/contexts/LocaleContext';
import { LANGUAGES, LanguageOption } from '@/lib/i18n';

interface LanguageSelectorProps {
  compact?: boolean;
  align?: 'right' | 'left';
}

export default function LanguageSelector({ compact = false, align = 'right' }: LanguageSelectorProps) {
  const { locale, setLocale } = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left?: number; right?: number }>({ top: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  const currentLang = LANGUAGES.find((l) => l.code === locale) || LANGUAGES[0];

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      if (align === 'right') {
        setCoords({
          top: rect.bottom + 6,
          right: Math.max(8, window.innerWidth - rect.right),
        });
      } else {
        setCoords({
          top: rect.bottom + 6,
          left: Math.max(8, rect.left),
        });
      }
    }
  };

  const toggleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen) {
      updatePosition();
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        buttonRef.current && !buttonRef.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    }

    function handleScrollOrResize() {
      if (isOpen) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside as any);
      window.addEventListener('scroll', handleScrollOrResize, true);
      window.addEventListener('resize', handleScrollOrResize);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside as any);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen]);

  const handleSelect = (lang: LanguageOption, e: React.MouseEvent) => {
    e.stopPropagation();
    setLocale(lang.code);
    setIsOpen(false);
  };

  return (
    <div style={{ display: 'inline-block' }}>
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleOpen}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: compact ? '6px 12px' : '7px 14px',
          background: 'rgba(30, 30, 45, 0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '20px',
          color: '#ffffff',
          fontSize: compact ? '12px' : '13px',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          outline: 'none',
          boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
        }}
      >
        <span style={{ fontSize: '13px', lineHeight: 1 }}>🌐</span>
        <span>{compact ? currentLang.short : currentLang.name}</span>
        <span style={{ fontSize: '10px', opacity: 0.8, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
      </button>

      {/* Portal Dropdown Menu attached directly to document.body */}
      {isOpen && mounted && createPortal(
        <div
          ref={dropdownRef}
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'fixed',
            top: `${coords.top}px`,
            ...(coords.right !== undefined ? { right: `${coords.right}px` } : { left: `${coords.left}px` }),
            minWidth: '170px',
            background: '#14141f',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            borderRadius: '16px',
            padding: '6px',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255,255,255,0.1)',
            zIndex: 9999999,
            display: 'flex',
            flexDirection: 'column',
            gap: '3px',
          }}
        >
          {LANGUAGES.map((lang) => {
            const isSelected = lang.code === locale;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={(e) => handleSelect(lang, e)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  background: isSelected ? 'rgba(99, 102, 241, 0.35)' : 'transparent',
                  border: isSelected ? '1px solid rgba(99, 102, 241, 0.5)' : '1px solid transparent',
                  color: isSelected ? '#a5b4fc' : '#ffffff',
                  fontSize: '13px',
                  fontWeight: isSelected ? 600 : 400,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ fontSize: '18px' }}>{lang.flag}</span>
                <span style={{ flex: 1 }}>{lang.name}</span>
                {isSelected && <span style={{ color: '#818cf8', fontWeight: 'bold' }}>✓</span>}
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </div>
  );
}
