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
  onSelectService: (service: QuickService) => void;
}

export default function SmartNearbyWidget({ latitude, longitude, onSelectService }: SmartNearbyWidgetProps) {
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
      { key: 'parking', icon: '🅿️', label: 'Bãi xe gần nhất', color: '#60a5fa' },
      { key: 'fuel', icon: '⛽', label: 'Cây xăng gần nhất', color: '#fb923c' },
      { key: 'ev_charging', icon: '⚡', label: 'Trạm sạc EV gần nhất', color: '#34d399' },
      { key: 'restaurant', icon: '🍜', label: 'Quán ăn gần nhất', color: '#f43f5e' },
      { key: 'restroom', icon: '🚻', label: 'WC công cộng gần nhất', color: '#38bdf8' },
      { key: 'cafe', icon: '☕', label: 'Cà phê gần nhất', color: '#eab308' },
      { key: 'car_repair', icon: '🔧', label: 'Cứu hộ / Vá vỏ', color: '#c084fc' },
    ];

    // Ưu tiên theo khung giờ
    let priorityKeys: string[] = [];
    if (hour >= 6 && hour < 10) {
      // Sáng: Ưu tiên Bãi xe, Cà phê, Cây xăng, Trạm sạc
      priorityKeys = ['parking', 'cafe', 'fuel', 'ev_charging', 'restroom', 'car_repair'];
    } else if (hour >= 11 && hour < 14) {
      // Trưa: Ưu tiên Quán ăn, WC, Bãi xe, Cà phê
      priorityKeys = ['restaurant', 'restroom', 'parking', 'cafe', 'fuel', 'ev_charging'];
    } else if (hour >= 17 && hour < 22) {
      // Tối: Ưu tiên Quán ăn, Bãi giữ xe, Cây xăng, Cứu hộ
      priorityKeys = ['restaurant', 'parking', 'fuel', 'cafe', 'car_repair', 'ev_charging'];
    } else {
      // Đêm: Ưu tiên Bãi xe, Cây xăng, Cứu hộ, WC
      priorityKeys = ['parking', 'fuel', 'car_repair', 'restroom', 'ev_charging'];
    }

    return priorityKeys
      .map(key => {
        const conf = allConfigs.find(c => c.key === key);
        const data = services[key];
        return data && conf ? { ...conf, data } : null;
      })
      .filter(Boolean) as Array<{ key: string; icon: string; label: string; color: string; data: QuickService }>;
  }, [services]);

  if (sortedItems.length === 0) return null;

  return (
    <div style={{
      display: 'flex',
      gap: '6px',
      overflowX: 'auto',
      padding: '2px 0 4px',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
      WebkitOverflowScrolling: 'touch',
    }}>
      {sortedItems.map((item) => (
        <button
          key={item.key}
          onClick={() => onSelectService(item.data)}
          title={`${item.label}: ${item.data.name} (${item.data.distanceText})`}
          style={{
            flex: '0 0 auto',
            background: 'rgba(20, 26, 38, 0.88)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '18px',
            padding: '5px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            cursor: 'pointer',
            color: '#ffffff',
            transition: 'all 0.15s ease',
            boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
          }}
        >
          <span style={{ fontSize: '14px' }}>{item.icon}</span>
          <span style={{ fontSize: '12px', fontWeight: 700, color: item.color }}>
            {item.data.distanceText}
          </span>
        </button>
      ))}
    </div>
  );
}
