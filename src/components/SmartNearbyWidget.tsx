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
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const lat = latitude || 10.7769;
    const lng = longitude || 106.7009;

    const fetchQuickAssist = async () => {
      setIsLoading(true);
      try {
        const res = await api.get<{ success: boolean; services: Record<string, QuickService> }>(
          `/api/nearby/quick-assist?lat=${lat}&lng=${lng}`
        );
        if (res.success && res.services) {
          setServices(res.services);
        }
      } catch (err) {
        console.error('Failed to load quick assist:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuickAssist();
  }, [latitude, longitude]);

  if (!services) return null;

  const items = [
    {
      key: 'parking',
      icon: '🅿️',
      title: 'Bãi đỗ xe',
      data: services.parking,
      color: '#3b82f6',
      bg: 'rgba(59, 130, 246, 0.15)',
      border: 'rgba(59, 130, 246, 0.35)',
    },
    {
      key: 'fuel',
      icon: '⛽',
      title: 'Cây xăng',
      data: services.fuel,
      color: '#f97316',
      bg: 'rgba(249, 115, 22, 0.15)',
      border: 'rgba(249, 115, 22, 0.35)',
    },
    {
      key: 'ev_charging',
      icon: '⚡',
      title: 'Trạm sạc EV',
      data: services.ev_charging,
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.15)',
      border: 'rgba(16, 185, 129, 0.35)',
    },
    {
      key: 'car_repair',
      icon: '🔧',
      title: 'Vá vỏ / Cứu hộ',
      data: services.car_repair,
      color: '#a855f7',
      bg: 'rgba(168, 85, 247, 0.15)',
      border: 'rgba(168, 85, 247, 0.35)',
    },
  ];

  return (
    <div style={{
      display: 'flex',
      gap: '8px',
      overflowX: 'auto',
      padding: '4px 2px 10px',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
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
              border: `1px solid ${item.border}`,
              borderRadius: '16px',
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              color: '#ffffff',
              textAlign: 'left',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}
          >
            <span style={{ fontSize: '20px' }}>{item.icon}</span>
            <div>
              <div style={{ fontSize: '11px', color: item.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                {item.title}
              </div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc', whiteSpace: 'nowrap' }}>
                {item.data.distanceText}
                <span style={{ fontSize: '11px', fontWeight: 500, color: '#94a3b8', marginLeft: '4px' }}>
                  → Đi ngay
                </span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
