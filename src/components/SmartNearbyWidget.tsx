'use client';

import React, { useEffect, useState } from 'react';
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

  if (!services) return null;

  const items = [
    {
      key: 'parking',
      icon: '🅿️',
      title: 'Bãi xe',
      data: services.parking,
      color: '#60a5fa',
      bg: 'rgba(30, 41, 59, 0.85)',
      border: 'rgba(96, 165, 250, 0.3)',
    },
    {
      key: 'fuel',
      icon: '⛽',
      title: 'Cây xăng',
      data: services.fuel,
      color: '#fb923c',
      bg: 'rgba(30, 41, 59, 0.85)',
      border: 'rgba(251, 146, 60, 0.3)',
    },
    {
      key: 'ev_charging',
      icon: '⚡',
      title: 'Trạm sạc',
      data: services.ev_charging,
      color: '#34d399',
      bg: 'rgba(30, 41, 59, 0.85)',
      border: 'rgba(52, 211, 153, 0.3)',
    },
    {
      key: 'car_repair',
      icon: '🔧',
      title: 'Cứu hộ',
      data: services.car_repair,
      color: '#c084fc',
      bg: 'rgba(30, 41, 59, 0.85)',
      border: 'rgba(192, 132, 252, 0.3)',
    },
  ];

  return (
    <div style={{
      display: 'flex',
      gap: '8px',
      overflowX: 'auto',
      padding: '2px 0 4px',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
      WebkitOverflowScrolling: 'touch',
    }}>
      {items.map((item) => {
        if (!item.data) return null;
        return (
          <button
            key={item.key}
            onClick={() => onSelectService(item.data!)}
            style={{
              flex: '0 0 auto',
              background: item.bg,
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: `1px solid ${item.border}`,
              borderRadius: '20px',
              padding: '6px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              color: '#ffffff',
              transition: 'all 0.15s ease',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}
          >
            <span style={{ fontSize: '15px' }}>{item.icon}</span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#f1f5f9' }}>{item.title}</span>
            <span style={{ fontSize: '11px', fontWeight: 700, color: item.color, background: 'rgba(255,255,255,0.08)', padding: '1px 6px', borderRadius: '10px' }}>
              {item.data.distanceText}
            </span>
          </button>
        );
      })}
    </div>
  );
}
