'use client';

import React, { useEffect, useState, useMemo } from 'react';
import api from '@/lib/api';

interface QuickService {
  id: string;
  name: string;
  category: string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  distanceMeters: number;
  distanceText: string;
}

interface SmartNearbyWidgetProps {
  latitude: number | null;
  longitude: number | null;
  activeServiceKey?: string | null;
  onSelectService: (service: QuickService, key: string) => void;
}

export default function SmartNearbyWidget({
  latitude,
  longitude,
  activeServiceKey,
  onSelectService
}: SmartNearbyWidgetProps) {
  const [services, setServices] = useState<Record<string, QuickService> | null>(null);

  useEffect(() => {
    const lat = latitude || 10.7769;
    const lng = longitude || 106.7009;

    const fetchQuickAssist = async () => {
      try {
        const res = await api.get<{ success: boolean; services: Record<string, QuickService> }>(
          `/api/nearby/quick-assist?lat=${lat}&lng=${lng}`
        );
        if (res.success && res.services) {
          setServices(res.services);
        }
      } catch (err) {
        console.error('Failed to load quick assist:', err);
      }
    };

    fetchQuickAssist();
  }, [latitude, longitude]);

  // Adaptive Quick Assist theo ngữ cảnh thời gian trong ngày
  const sortedItems = useMemo(() => {
    if (!services) return [];
    const hour = new Date().getHours();

    const allConfigs = [
      { key: 'parking', icon: '🅿️', label: 'Bãi xe gần nhất', activeColor: '#38bdf8' },
      { key: 'fuel', icon: '⛽', label: 'Cây xăng gần nhất', activeColor: '#fb923c' },
      { key: 'ev_charging', icon: '⚡', label: 'Trạm sạc EV', activeColor: '#34d399' },
      { key: 'restaurant', icon: '🍜', label: 'Quán ăn gần nhất', activeColor: '#f43f5e' },
      { key: 'restroom', icon: '🚻', label: 'WC công cộng', activeColor: '#38bdf8' },
      { key: 'cafe', icon: '☕', label: 'Cà phê gần nhất', activeColor: '#fbbf24' },
      { key: 'car_repair', icon: '🔧', label: 'Cứu hộ / Vá vỏ', activeColor: '#c084fc' },
    ];

    let priorityKeys: string[] = [];
    if (hour >= 6 && hour < 10) {
      priorityKeys = ['parking', 'cafe', 'fuel', 'ev_charging', 'restroom', 'car_repair'];
    } else if (hour >= 11 && hour < 14) {
      priorityKeys = ['restaurant', 'restroom', 'parking', 'cafe', 'fuel', 'ev_charging'];
    } else if (hour >= 17 && hour < 22) {
      priorityKeys = ['restaurant', 'parking', 'fuel', 'cafe', 'car_repair', 'ev_charging'];
    } else {
      priorityKeys = ['parking', 'fuel', 'car_repair', 'restroom', 'ev_charging'];
    }

    return priorityKeys
      .map(key => {
        const conf = allConfigs.find(c => c.key === key);
        const data = services[key];
        return data && conf ? { ...conf, data } : null;
      })
      .filter(Boolean) as Array<{ key: string; icon: string; label: string; activeColor: string; data: QuickService }>;
  }, [services]);

  if (sortedItems.length === 0) return null;

  return (
    <div style={{
      display: 'flex',
      gap: '5px',
      overflowX: 'auto',
      padding: '0 0 2px',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
      WebkitOverflowScrolling: 'touch',
    }}>
      {sortedItems.map((item) => {
        const isActive = activeServiceKey === item.key;
        return (
          <button
            key={item.key}
            onClick={() => onSelectService(item.data, item.key)}
            title={`${item.label}: ${item.data.name} (${item.data.distanceText})`}
            style={{
              flex: '0 0 auto',
              background: isActive ? 'rgba(245, 158, 11, 0.16)' : 'rgba(15, 23, 42, 0.88)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: `1px solid ${isActive ? 'rgba(245, 158, 11, 0.6)' : 'rgba(255, 255, 255, 0.1)'}`,
              borderRadius: '16px',
              padding: '4px 9px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              color: '#ffffff',
              transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: isActive ? '0 0 10px rgba(245, 158, 11, 0.3)' : '0 2px 6px rgba(0,0,0,0.3)',
              transform: isActive ? 'scale(1.02)' : 'scale(1)',
            }}
          >
            <span style={{ fontSize: '13px' }}>{item.icon}</span>
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              color: isActive ? '#fde047' : '#f8fafc',
              letterSpacing: '-0.2px'
            }}>
              {item.data.distanceText}
            </span>
          </button>
        );
      })}
    </div>
  );
}
