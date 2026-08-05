'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/format';
import { SPOT_TYPE_LABELS, SPOT_TYPE_ICONS } from '@/lib/types';
import type { Spot } from '@/lib/types';

export default function BusinessDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [spots, setSpots] = useState<Spot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== 'business')) {
      router.push('/auth/login');
      return;
    }
    fetchMySpots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated, user]);

  const fetchMySpots = async () => {
    setIsLoading(true);
    try {
      const data = await api.get<{ data: Spot[] }>('/api/business/spots');
      setSpots(data.data || []);
    } catch {
      // Mock data for dev
      setSpots(getMockBusinessSpots());
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
        <div className="container" style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px' }}>
          <div className="skeleton" style={{ height: '120px', borderRadius: '12px', marginBottom: '16px' }} />
          <div className="skeleton" style={{ height: '300px', borderRadius: '12px' }} />
        </div>
      </div>
    );
  }

  // Stats
  const totalSpots = spots.length;
  const activeSpots = spots.filter((s) => s.status === 'active').length;
  const pendingSpots = spots.filter((s) => s.status === 'pending').length;
  const totalReviews = spots.reduce((sum, s) => sum + s.reviewCount, 0);
  const avgRating = spots.length > 0 ? spots.reduce((sum, s) => sum + s.rating, 0) / spots.length : 0;

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />

      <main className="container" style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px', flex: 1 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700 }}>📊 Quản lý doanh nghiệp</h1>
            <p style={{ fontSize: '14px', opacity: 0.6, marginTop: '4px' }}>
              Xin chào, {user?.name}
            </p>
          </div>
          <Link href="/business/post">
            <button className="btn-primary" style={{ padding: '12px 24px', fontSize: '14px' }}>
              ➕ Đăng tin mới
            </button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
            <p style={{ fontSize: '28px', fontWeight: 700 }}>{totalSpots}</p>
            <p style={{ fontSize: '13px', opacity: 0.6 }}>Tổng tin đăng</p>
          </div>
          <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
            <p style={{ fontSize: '28px', fontWeight: 700, color: '#10b981' }}>{activeSpots}</p>
            <p style={{ fontSize: '13px', opacity: 0.6 }}>Đang hoạt động</p>
          </div>
          <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
            <p style={{ fontSize: '28px', fontWeight: 700, color: '#f59e0b' }}>{pendingSpots}</p>
            <p style={{ fontSize: '13px', opacity: 0.6 }}>Chờ duyệt</p>
          </div>
          <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
            <p style={{ fontSize: '28px', fontWeight: 700 }}>{totalReviews}</p>
            <p style={{ fontSize: '13px', opacity: 0.6 }}>Tổng đánh giá</p>
          </div>
          <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
            <p style={{ fontSize: '28px', fontWeight: 700, color: '#f59e0b' }}>⭐ {avgRating.toFixed(1)}</p>
            <p style={{ fontSize: '13px', opacity: 0.6 }}>Điểm TB</p>
          </div>
        </div>

        {/* Spots Table */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.1))' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600 }}>📋 Danh sách tin đăng</h2>
          </div>

          {isLoading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <p style={{ opacity: 0.6 }}>⏳ Đang tải...</p>
            </div>
          ) : spots.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <p style={{ fontSize: '48px', marginBottom: '12px' }}>📭</p>
              <p style={{ fontSize: '15px', fontWeight: 600, marginBottom: '8px' }}>Chưa có tin đăng nào</p>
              <p style={{ fontSize: '13px', opacity: 0.6, marginBottom: '16px' }}>
                Bắt đầu đăng tin để tiếp cận khách hàng
              </p>
              <Link href="/business/post">
                <button className="btn-primary">➕ Đăng tin đầu tiên</button>
              </Link>
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
                    <th style={{ padding: '12px 16px', textAlign: 'left', opacity: 0.6, fontWeight: 500, fontSize: '12px' }}>Giá xe máy</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', opacity: 0.6, fontWeight: 500, fontSize: '12px' }}>Ngày tạo</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', opacity: 0.6, fontWeight: 500, fontSize: '12px' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {spots.map((spot) => (
                    <tr
                      key={spot.id}
                      style={{
                        borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.06))',
                        transition: 'background 0.15s',
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
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--color-primary, #10b981)', fontWeight: 600 }}>
                        {spot.pricePerHourBike != null ? formatCurrency(spot.pricePerHourBike, '/giờ') : '-'}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '13px', opacity: 0.6 }}>
                        {formatDate(spot.createdAt)}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <Link href={`/spot/${spot.id}`}>
                            <button className="btn-secondary" style={{ fontSize: '12px', padding: '6px 12px' }}>
                              👁️ Xem
                            </button>
                          </Link>
                          <Link href={`/business/post?edit=${spot.id}`}>
                            <button className="btn-secondary" style={{ fontSize: '12px', padding: '6px 12px' }}>
                              ✏️ Sửa
                            </button>
                          </Link>
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

function getMockBusinessSpots(): Spot[] {
  return [
    {
      id: 'b1',
      name: 'Bãi xe Nguyễn Huệ',
      type: 'PARKING_LOT',
      address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
      latitude: 10.7735,
      longitude: 106.7031,
      description: 'Bãi xe rộng rãi',
      phone: '0901234567',
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
      id: 'b2',
      name: 'Bãi xe Lê Lợi',
      type: 'PARKING_LOT',
      address: '45 Lê Lợi, Quận 1, TP.HCM',
      latitude: 10.7739,
      longitude: 106.6999,
      images: [],
      carSlots: 20,
      bikeSlots: 100,
      pricePerHourBike: 3000,
      rating: 4.0,
      reviewCount: 42,
      isPremium: false,
      isVerified: true,
      status: 'pending',
      createdAt: '2024-03-15',
      updatedAt: '2024-03-15',
    },
  ];
}
