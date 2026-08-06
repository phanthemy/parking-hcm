'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { formatDate } from '@/lib/format';
import { SPOT_TYPE_LABELS, SPOT_TYPE_ICONS } from '@/lib/types';
import type { Spot } from '@/lib/types';

export default function AdminPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [spots, setSpots] = useState<Spot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'hidden'>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== 'admin')) {
      router.push('/auth/login');
      return;
    }
    fetchAllSpots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated, user]);

  const fetchAllSpots = async () => {
    setIsLoading(true);
    try {
      const data = await api.get<{ spots: Spot[] }>('/api/admin/spots');
      setSpots(data.spots || []);
    } catch {
      setSpots(getMockAdminSpots());
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (spotId: string, action: 'approve' | 'hide' | 'delete') => {
    setActionLoading(spotId);
    try {
      if (action === 'delete') {
        await api.delete(`/api/admin/spots/${spotId}`);
        setSpots((prev) => prev.filter((s) => s.id !== spotId));
      } else {
        const status = action === 'approve' ? 'active' : 'hidden';
        await api.patch(`/api/admin/spots/${spotId}`, { status });
        setSpots((prev) =>
          prev.map((s) => (s.id === spotId ? { ...s, status } : s))
        );
      }
    } catch {
      // In dev, simulate the action
      if (action === 'delete') {
        setSpots((prev) => prev.filter((s) => s.id !== spotId));
      } else {
        const status = action === 'approve' ? 'active' : 'hidden';
        setSpots((prev) =>
          prev.map((s) =>
            s.id === spotId ? { ...s, status: status as Spot['status'] } : s
          )
        );
      }
    } finally {
      setActionLoading(null);
    }
  };

  const filteredSpots = statusFilter === 'all' ? spots : spots.filter((s) => s.status === statusFilter);

  // Stats
  const totalSpots = spots.length;
  const activeCount = spots.filter((s) => s.status === 'active').length;
  const pendingCount = spots.filter((s) => s.status === 'pending').length;
  const hiddenCount = spots.filter((s) => s.status === 'hidden').length;
  const autoSyncPendingCount = spots.filter((s) => 
    s.status === 'pending' && (s.source === 'GOOGLE_MAPS' || s.source === 'OSM')
  ).length;

  const statusLabels: Record<string, string> = {
    active: '✅ Hoạt động',
    pending: '⏳ Chờ duyệt',
    hidden: '🔒 Đã ẩn',
  };

  const statusColors: Record<string, string> = {
    active: '#10b981',
    pending: '#f59e0b',
    hidden: '#6b7280',
  };

  const getSourceBadge = (source?: string) => {
    switch (source) {
      case 'GOOGLE_MAPS': return <span className="badge" style={{ fontSize: '11px', background: '#4285F4' }}>🌐 Google Maps</span>;
      case 'OSM': return <span className="badge" style={{ fontSize: '11px', background: '#7ebc6f' }}>🗺️ OpenStreetMap</span>;
      default: return <span className="badge" style={{ fontSize: '11px' }}>✍️ Thủ công</span>;
    }
  };

  if (authLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
          <div className="skeleton" style={{ height: '100px', borderRadius: '12px', marginBottom: '16px' }} />
          <div className="skeleton" style={{ height: '400px', borderRadius: '12px' }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />

      <main className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', flex: 1 }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>⚙️ Quản trị hệ thống</h1>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
            <p style={{ fontSize: '32px', fontWeight: 700 }}>{totalSpots}</p>
            <p style={{ fontSize: '13px', opacity: 0.6 }}>Tổng bãi xe</p>
          </div>
          <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
            <p style={{ fontSize: '32px', fontWeight: 700, color: '#10b981' }}>{activeCount}</p>
            <p style={{ fontSize: '13px', opacity: 0.6 }}>Hoạt động</p>
          </div>
          <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
            <p style={{ fontSize: '32px', fontWeight: 700, color: '#f59e0b' }}>{pendingCount}</p>
            <p style={{ fontSize: '13px', opacity: 0.6 }}>Chờ duyệt</p>
          </div>
          <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
            <p style={{ fontSize: '32px', fontWeight: 700, color: '#4285F4' }}>{autoSyncPendingCount}</p>
            <p style={{ fontSize: '13px', opacity: 0.6 }}>Sync mới</p>
          </div>
          <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
            <p style={{ fontSize: '32px', fontWeight: 700, color: '#6b7280' }}>{hiddenCount}</p>
            <p style={{ fontSize: '13px', opacity: 0.6 }}>Đã ẩn</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto' }}>
          {([
            { value: 'all', label: 'Tất cả', count: totalSpots },
            { value: 'pending', label: '⏳ Chờ duyệt', count: pendingCount },
            { value: 'active', label: '✅ Hoạt động', count: activeCount },
            { value: 'hidden', label: '🔒 Đã ẩn', count: hiddenCount },
          ] as const).map((tab) => (
            <button
              key={tab.value}
              className={`badge ${statusFilter === tab.value ? 'badge-active' : ''}`}
              onClick={() => setStatusFilter(tab.value)}
              style={{
                cursor: 'pointer',
                padding: '8px 16px',
                fontSize: '13px',
                border: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Spots Table */}
        <div className="card" style={{ overflow: 'hidden' }}>
          {isLoading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <p style={{ opacity: 0.6 }}>⏳ Đang tải...</p>
            </div>
          ) : filteredSpots.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <p style={{ fontSize: '48px', marginBottom: '12px' }}>📭</p>
              <p style={{ fontSize: '15px', fontWeight: 600 }}>Không có kết quả</p>
              <p style={{ fontSize: '13px', opacity: 0.6 }}>Không có bãi xe nào với trạng thái này</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.1))' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', opacity: 0.6, fontWeight: 500, fontSize: '12px' }}>Tên</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', opacity: 0.6, fontWeight: 500, fontSize: '12px' }}>Loại</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', opacity: 0.6, fontWeight: 500, fontSize: '12px' }}>Trạng thái</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', opacity: 0.6, fontWeight: 500, fontSize: '12px' }}>Đánh giá</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', opacity: 0.6, fontWeight: 500, fontSize: '12px' }}>Premium</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', opacity: 0.6, fontWeight: 500, fontSize: '12px' }}>Nguồn</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', opacity: 0.6, fontWeight: 500, fontSize: '12px' }}>Ngày tạo</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', opacity: 0.6, fontWeight: 500, fontSize: '12px' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSpots.map((spot) => (
                    <tr
                      key={spot.id}
                      style={{
                        borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.06))',
                        transition: 'background 0.15s',
                        opacity: actionLoading === spot.id ? 0.5 : 1,
                      }}
                    >
                      <td style={{ padding: '14px 16px' }}>
                        <div>
                          <p style={{ fontWeight: 600 }}>{spot.name}</p>
                          <p style={{ fontSize: '12px', opacity: 0.5, marginTop: '2px' }}>{spot.address}</p>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span className="badge" style={{ fontSize: '12px' }}>
                          {SPOT_TYPE_ICONS[spot.type]} {SPOT_TYPE_LABELS[spot.type]}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ color: statusColors[spot.status], fontWeight: 500, fontSize: '13px' }}>
                          {statusLabels[spot.status]}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        ⭐ {spot.rating.toFixed(1)} ({spot.reviewCount})
                        {spot.googleRating != null && <span style={{ fontSize: '11px', display: 'block', opacity: 0.7, marginTop: '2px' }}>⭐ {spot.googleRating} (Google)</span>}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {spot.isPremium ? '✨ Có' : '—'}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {getSourceBadge(spot.source)}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '13px', opacity: 0.6 }}>
                        {formatDate(spot.createdAt)}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                          {spot.status === 'pending' && (
                            <button
                              className="btn-primary"
                              onClick={() => handleAction(spot.id, 'approve')}
                              disabled={actionLoading === spot.id}
                              style={{ fontSize: '12px', padding: '6px 12px' }}
                            >
                              ✅ Duyệt
                            </button>
                          )}
                          {spot.status === 'active' && (
                            <button
                              className="btn-secondary"
                              onClick={() => handleAction(spot.id, 'hide')}
                              disabled={actionLoading === spot.id}
                              style={{ fontSize: '12px', padding: '6px 12px' }}
                            >
                              🔒 Ẩn
                            </button>
                          )}
                          {spot.status === 'hidden' && (
                            <button
                              className="btn-primary"
                              onClick={() => handleAction(spot.id, 'approve')}
                              disabled={actionLoading === spot.id}
                              style={{ fontSize: '12px', padding: '6px 12px' }}
                            >
                              🔓 Mở lại
                            </button>
                          )}
                          <button
                            className="btn-secondary"
                            onClick={() => {
                              if (confirm('Bạn có chắc chắn muốn xóa bãi xe này?')) {
                                handleAction(spot.id, 'delete');
                              }
                            }}
                            disabled={actionLoading === spot.id}
                            style={{ fontSize: '12px', padding: '6px 12px', color: '#ef4444' }}
                          >
                            🗑️ Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function getMockAdminSpots(): Spot[] {
  return [
    {
      id: 'a1',
      name: 'Bãi xe Nguyễn Huệ',
      type: 'PARKING_LOT',
      address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
      latitude: 10.7735,
      longitude: 106.7031,
      images: [],
      carSlots: 50,
      bikeSlots: 200,
      pricePerHourCar: 30000,
      pricePerHourBike: 5000,
      openTime: '06:00',
      closeTime: '22:00',
      rating: 4.5,
      reviewCount: 128,
      isPremium: true,
      isVerified: true,
      status: 'active',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
    {
      id: 'a2',
      name: 'Quán Phở Bình Dân',
      type: 'RESTAURANT',
      address: '45 Lê Lợi, Quận 1, TP.HCM',
      latitude: 10.7739,
      longitude: 106.6999,
      images: [],
      carSlots: 5,
      bikeSlots: 20,
      pricePerHourBike: 0,
      rating: 4.2,
      reviewCount: 85,
      isPremium: false,
      isVerified: false,
      status: 'pending',
      createdAt: '2024-03-15',
      updatedAt: '2024-03-15',
    },
    {
      id: 'a3',
      name: 'The Coffee House - Đồng Khởi',
      type: 'CAFE',
      address: '86 Đồng Khởi, Quận 1, TP.HCM',
      latitude: 10.7756,
      longitude: 106.7024,
      images: [],
      carSlots: 5,
      bikeSlots: 40,
      pricePerHourBike: 3000,
      rating: 4.7,
      reviewCount: 256,
      isPremium: true,
      isVerified: true,
      status: 'active',
      createdAt: '2024-02-01',
      updatedAt: '2024-02-01',
    },
    {
      id: 'a4',
      name: 'Rửa xe Tân Tiến',
      type: 'SERVICE',
      address: '10 Hai Bà Trưng, Quận 3, TP.HCM',
      latitude: 10.7790,
      longitude: 106.6950,
      images: [],
      carSlots: 3,
      bikeSlots: 10,
      pricePerHourBike: 2000,
      rating: 3.8,
      reviewCount: 12,
      isPremium: false,
      isVerified: false,
      status: 'hidden',
      createdAt: '2024-03-20',
      updatedAt: '2024-03-20',
    },
  ];
}
