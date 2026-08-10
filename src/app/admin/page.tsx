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
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Edit Modal states
  const [editingSpot, setEditingSpot] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [newMediaUrl, setNewMediaUrl] = useState('');

  const openEditModal = (spot: Spot) => {
    setEditingSpot({
      ...spot,
      images: Array.isArray(spot.images) ? [...spot.images] : [],
    });
  };

  const openCreateModal = () => {
    setEditingSpot({
      id: '', // Empty ID = Create new mode
      name: '',
      type: 'PARKING_LOT',
      address: '',
      pricePerHourCar: 20000,
      openTime: '06:00',
      closeTime: '22:00',
      phone: '',
      website: '',
      images: [],
      status: 'active',
    });
  };

  const handleSaveSpot = async () => {
    if (!editingSpot) return;
    setIsSaving(true);
    try {
      if (editingSpot.id) {
        // Update existing spot
        const updated = await api.put<Spot>(`/api/spots/${editingSpot.id}`, editingSpot);
        setSpots((prev) =>
          prev.map((s) => (s.id === editingSpot.id ? { ...s, ...updated, images: editingSpot.images } : s))
        );
        alert('✅ Đã cập nhật thông tin địa điểm & ảnh/video slide thành công!');
      } else {
        // Create brand new spot
        const created = await api.post<Spot>('/api/spots', editingSpot);
        setSpots((prev) => [{ ...created, images: editingSpot.images }, ...prev]);
        alert('✅ Đã thêm mới địa điểm thành công! Đã hiển thị live trên trang chủ.');
      }
      setEditingSpot(null);
    } catch (err: any) {
      alert('❌ Lỗi khi lưu: ' + (err.message || 'Vui lòng thử lại'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleMediaFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingMedia(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post<{ url: string }>('/api/upload', formData);
      if (res.url) {
        setEditingSpot((prev: any) => ({
          ...prev,
          images: [...(prev.images || []), res.url],
        }));
      }
    } catch (err: any) {
      alert('❌ Lỗi tải tệp: ' + (err.message || 'Không thể upload'));
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleAddDirectUrl = () => {
    if (!newMediaUrl.trim()) return;
    setEditingSpot((prev: any) => ({
      ...prev,
      images: [...(prev.images || []), newMediaUrl.trim()],
    }));
    setNewMediaUrl('');
  };

  const handleRemoveMedia = (index: number) => {
    setEditingSpot((prev: any) => ({
      ...prev,
      images: prev.images.filter((_: any, i: number) => i !== index),
    }));
  };

  useEffect(() => {
    const role = user?.role?.toString().toUpperCase();
    if (!authLoading && (!isAuthenticated || role !== 'ADMIN')) {
      router.push('/auth/login');
      return;
    }
    if (isAuthenticated && role === 'ADMIN') {
      fetchAllSpots();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated, user]);

  const fetchAllSpots = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<{ spots?: Spot[]; data?: Spot[] }>('/api/admin/spots?limit=1000');
      const list = res.spots || res.data || [];
      setSpots(list);
    } catch {
      setSpots([]);
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

  const filteredSpots = spots.filter((s) => {
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && s.type !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = s.name?.toLowerCase().includes(q);
      const matchAddr = s.address?.toLowerCase().includes(q);
      if (!matchName && !matchAddr) return false;
    }
    return true;
  });

  const totalItems = filteredSpots.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedSpots = filteredSpots.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getCategoryCount = (type: string) => {
    return spots.filter((s) => (statusFilter === 'all' || s.status === statusFilter) && (type === 'all' || s.type === type)).length;
  };

  // Stats
  const totalSpots = spots.length;
  const activeCount = spots.filter((s) => s.status === 'active').length;
  const pendingCount = spots.filter((s) => s.status === 'pending').length;
  const hiddenCount = spots.filter((s) => s.status === 'hidden').length;

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
        {/* Top Header & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>⚙️ Quản trị hệ thống</h1>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              className="btn-secondary"
              onClick={() => router.push('/admin/facebook')}
              style={{ padding: '10px 18px', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', borderColor: 'rgba(59,130,246,0.4)', color: '#3b82f6' }}
            >
              📱 Facebook Crawler
            </button>
            <button
              className="btn-primary"
              onClick={openCreateModal}
              style={{ padding: '10px 18px', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              ➕ Thêm địa điểm mới
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
            <p style={{ fontSize: '32px', fontWeight: 700 }}>{totalSpots}</p>
            <p style={{ fontSize: '13px', opacity: 0.6 }}>Tổng địa điểm</p>
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
            <p style={{ fontSize: '32px', fontWeight: 700, color: '#6b7280' }}>{hiddenCount}</p>
            <p style={{ fontSize: '13px', opacity: 0.6 }}>Đã ẩn</p>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto' }}>
          {([
            { value: 'all', label: 'Tất cả trạng thái', count: totalSpots },
            { value: 'pending', label: '⏳ Chờ duyệt', count: pendingCount },
            { value: 'active', label: '✅ Hoạt động', count: activeCount },
            { value: 'hidden', label: '🔒 Đã ẩn', count: hiddenCount },
          ] as const).map((tab) => (
            <button
              key={tab.value}
              className={`badge ${statusFilter === tab.value ? 'badge-active' : ''}`}
              onClick={() => { setStatusFilter(tab.value); setCurrentPage(1); }}
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

        {/* Category Filter Chips */}
        <div style={{ marginBottom: '16px' }}>
          <p style={{ fontSize: '13px', color: '#a0a0b0', marginBottom: '8px', fontWeight: 600 }}>Lọc theo loại hình dịch vụ:</p>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {[
              { id: 'all', label: '🌐 Tất cả dịch vụ' },
              { id: 'PARKING_LOT', label: '🅿️ Bãi đỗ xe' },
              { id: 'RESTAURANT', label: '🍜 Quán ăn / Nhà hàng' },
              { id: 'CAFE', label: '☕ Cà phê' },
              { id: 'RESTROOM', label: '🚻 Nhà vệ sinh' },
              { id: 'GARAGE', label: '🔧 Garage sửa xe' },
              { id: 'CARWASH', label: '🚿 Rửa xe' },
              { id: 'SERVICE', label: '🏢 Dịch vụ khác' },
            ].map((cat) => {
              const isSelected = categoryFilter === cat.id;
              const count = getCategoryCount(cat.id);
              return (
                <button
                  key={cat.id}
                  onClick={() => { setCategoryFilter(cat.id); setCurrentPage(1); }}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    background: isSelected ? 'linear-gradient(135deg, #3b82f6, #6366f1)' : 'rgba(255,255,255,0.06)',
                    color: isSelected ? '#fff' : '#a0a0b0',
                    border: isSelected ? 'none' : '1px solid rgba(255,255,255,0.1)',
                    fontSize: '13px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    fontWeight: isSelected ? 600 : 400,
                    transition: 'all 0.2s',
                  }}
                >
                  {cat.label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Bar Box */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ position: 'relative', maxWidth: '480px' }}>
            <input
              type="text"
              placeholder="🔍 Tìm nhanh địa điểm theo tên, đường, quận..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              style={{
                width: '100%',
                padding: '10px 16px',
                paddingRight: '36px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '10px',
                color: '#fff',
                fontSize: '14px',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); setCurrentPage(1); }}
                style={{
                  position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: '#a0a0b0', cursor: 'pointer', fontSize: '14px'
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Spots Table */}
        <div className="card" style={{ overflow: 'hidden' }}>
          {isLoading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <p style={{ opacity: 0.6 }}>⏳ Đang tải danh sách địa điểm...</p>
            </div>
          ) : filteredSpots.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <p style={{ fontSize: '48px', marginBottom: '12px' }}>📭</p>
              <p style={{ fontSize: '15px', fontWeight: 600 }}>Không tìm thấy địa điểm phù hợp</p>
              <p style={{ fontSize: '13px', opacity: 0.6 }}>Thử thay đổi bộ lọc loại hình hoặc từ khóa tìm kiếm</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.1))' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', opacity: 0.6, fontWeight: 500, fontSize: '12px' }}>Tên địa điểm</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', opacity: 0.6, fontWeight: 500, fontSize: '12px' }}>Loại hình</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', opacity: 0.6, fontWeight: 500, fontSize: '12px' }}>Trạng thái</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', opacity: 0.6, fontWeight: 500, fontSize: '12px' }}>Đánh giá</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', opacity: 0.6, fontWeight: 500, fontSize: '12px' }}>Premium</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', opacity: 0.6, fontWeight: 500, fontSize: '12px' }}>Ngày tạo</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', opacity: 0.6, fontWeight: 500, fontSize: '12px' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedSpots.map((spot) => (
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
                      <td style={{ padding: '14px 16px' }}>
                        {spot.isPremium ? '✨ Có' : '—'}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '13px', opacity: 0.6 }}>
                        {formatDate(spot.createdAt)}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                          <button
                            className="btn-secondary"
                            onClick={() => openEditModal(spot)}
                            disabled={actionLoading === spot.id}
                            style={{ fontSize: '12px', padding: '6px 12px', color: '#3b82f6', borderColor: 'rgba(59,130,246,0.4)', fontWeight: 600 }}
                          >
                            ✏️ Sửa
                          </button>
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

          {/* Pagination Controls Bar */}
          {totalItems > 0 && (
            <div
              style={{
                padding: '16px 20px',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                background: 'rgba(255,255,255,0.02)',
              }}
            >
              <p style={{ fontSize: '13px', color: '#a0a0b0', margin: 0 }}>
                Hiển thị <strong>{(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalItems)}</strong> trong tổng số <strong>{totalItems}</strong> địa điểm
              </p>

              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <button
                  className="btn-secondary"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{ padding: '6px 14px', fontSize: '13px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                >
                  ◀ Trước
                </button>

                <div style={{ display: 'flex', gap: '4px' }}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                    .map((p, idx, arr) => {
                      const prev = arr[idx - 1];
                      const showEllipsis = prev && p - prev > 1;
                      return (
                        <React.Fragment key={p}>
                          {showEllipsis && <span style={{ color: '#a0a0b0', padding: '0 4px' }}>...</span>}
                          <button
                            onClick={() => setCurrentPage(p)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '6px',
                              background: currentPage === p ? '#3b82f6' : 'rgba(255,255,255,0.05)',
                              color: currentPage === p ? '#fff' : '#a0a0b0',
                              border: '1px solid rgba(255,255,255,0.1)',
                              fontSize: '13px',
                              fontWeight: currentPage === p ? 700 : 400,
                              cursor: 'pointer',
                            }}
                          >
                            {p}
                          </button>
                        </React.Fragment>
                      );
                    })}
                </div>

                <button
                  className="btn-secondary"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  style={{ padding: '6px 14px', fontSize: '13px', cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer' }}
                >
                  Sau ▶
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* EDIT SPOT MODAL */}
      {editingSpot && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#13131a',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '720px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'sticky',
                top: 0,
                background: '#13131a',
                zIndex: 10,
              }}
            >
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#fff' }}>
                  ✏️ Chỉnh sửa thông tin & Slide Ảnh/Video
                </h3>
                <p style={{ fontSize: '12px', color: '#a0a0b0', margin: '4px 0 0 0' }}>
                  ID: {editingSpot.id}
                </p>
              </div>
              <button
                onClick={() => setEditingSpot(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#a0a0b0',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '4px 8px',
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Row 1: Name & Type */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#a0a0b0', marginBottom: '6px' }}>
                    Tên địa điểm
                  </label>
                  <input
                    type="text"
                    value={editingSpot.name || ''}
                    onChange={(e) => setEditingSpot({ ...editingSpot, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '14px',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#a0a0b0', marginBottom: '6px' }}>
                    Loại địa điểm
                  </label>
                  <select
                    value={editingSpot.type || 'PARKING_LOT'}
                    onChange={(e) => setEditingSpot({ ...editingSpot, type: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: '#1c1c28',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '14px',
                    }}
                  >
                    <option value="PARKING_LOT">🅿️ Bãi xe</option>
                    <option value="RESTAURANT">🍜 Quán ăn / Nhà hàng</option>
                    <option value="CAFE">☕ Cà phê</option>
                    <option value="RESTROOM">🚻 Nhà vệ sinh</option>
                    <option value="GARAGE">🔧 Garage sửa xe</option>
                    <option value="CARWASH">🚿 Rửa xe</option>
                    <option value="SERVICE">🏢 Dịch vụ khác</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Address */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#a0a0b0', marginBottom: '6px' }}>
                  Địa chỉ
                </label>
                <input
                  type="text"
                  value={editingSpot.address || ''}
                  onChange={(e) => setEditingSpot({ ...editingSpot, address: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '14px',
                  }}
                />
              </div>

              {/* Row 3: Price & Hours */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#a0a0b0', marginBottom: '6px' }}>
                    Giá / giờ (VNĐ)
                  </label>
                  <input
                    type="number"
                    value={editingSpot.pricePerHourCar || editingSpot.pricePerHour || 0}
                    onChange={(e) => setEditingSpot({ ...editingSpot, pricePerHourCar: parseFloat(e.target.value) || 0 })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '14px',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#a0a0b0', marginBottom: '6px' }}>
                    Giờ mở cửa
                  </label>
                  <input
                    type="text"
                    value={editingSpot.openTime || '06:00'}
                    onChange={(e) => setEditingSpot({ ...editingSpot, openTime: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '14px',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#a0a0b0', marginBottom: '6px' }}>
                    Giờ đóng cửa
                  </label>
                  <input
                    type="text"
                    value={editingSpot.closeTime || '22:00'}
                    onChange={(e) => setEditingSpot({ ...editingSpot, closeTime: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '14px',
                    }}
                  />
                </div>
              </div>

              {/* Row 4: Phone & Website */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#a0a0b0', marginBottom: '6px' }}>
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    value={editingSpot.phone || ''}
                    onChange={(e) => setEditingSpot({ ...editingSpot, phone: e.target.value })}
                    placeholder="0901234567"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '14px',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#a0a0b0', marginBottom: '6px' }}>
                    Website / Fanpage
                  </label>
                  <input
                    type="text"
                    value={editingSpot.website || ''}
                    onChange={(e) => setEditingSpot({ ...editingSpot, website: e.target.value })}
                    placeholder="https://facebook.com/..."
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '14px',
                    }}
                  />
                </div>
              </div>

              {/* MEDIA MANAGEMENT SECTION */}
              <div
                style={{
                  borderTop: '1px solid rgba(255,255,255,0.1)',
                  paddingTop: '20px',
                  marginTop: '4px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <label style={{ fontSize: '15px', fontWeight: 700, color: '#3b82f6' }}>
                    🖼️ Danh sách Slide Hình Ảnh & Video Review ({editingSpot.images?.length || 0})
                  </label>
                </div>

                {/* Upload or Add Direct URL */}
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#fff', margin: '0 0 8px 0' }}>
                    Tải tệp Ảnh (.jpg, .png) hoặc Video (.mp4) lên server:
                  </p>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <label
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 16px',
                        background: uploadingMedia ? '#4b5563' : '#3b82f6',
                        color: '#fff',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: uploadingMedia ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {uploadingMedia ? '⏳ Đang tải...' : '📁 Tải Ảnh / Video từ máy tính'}
                      <input
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleMediaFileUpload}
                        disabled={uploadingMedia}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>

                  <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#fff', margin: '0 0 8px 0' }}>
                      Hoặc dán đường dẫn URL trực tiếp:
                    </p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        placeholder="https://example.com/photo.jpg hoặc /videos/review.mp4"
                        value={newMediaUrl}
                        onChange={(e) => setNewMediaUrl(e.target.value)}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.15)',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '13px',
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddDirectUrl}
                        className="btn-primary"
                        style={{ padding: '8px 16px', fontSize: '13px', whiteSpace: 'nowrap' }}
                      >
                        ➕ Thêm URL
                      </button>
                    </div>
                  </div>
                </div>

                {/* Media Preview Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px' }}>
                  {editingSpot.images?.map((url: string, idx: number) => {
                    const isVid = url.endsWith('.mp4') || url.endsWith('.webm') || url.includes('/videos/');
                    return (
                      <div
                        key={idx}
                        style={{
                          position: 'relative',
                          height: '100px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          border: '1px solid rgba(255,255,255,0.2)',
                          background: '#000',
                        }}
                      >
                        {isVid ? (
                          <>
                            <video
                              src={url}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              muted
                            />
                            <div style={{ position: 'absolute', top: '4px', left: '4px', background: '#ef4444', color: '#fff', fontSize: '9px', fontWeight: 700, padding: '2px 5px', borderRadius: '4px' }}>
                              🎬 Video
                            </div>
                          </>
                        ) : (
                          <img
                            src={url}
                            alt=""
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => { (e.target as HTMLElement).style.opacity = '0.3'; }}
                          />
                        )}

                        <button
                          type="button"
                          onClick={() => handleRemoveMedia(idx)}
                          style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            background: 'rgba(239, 68, 68, 0.9)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 5,
                          }}
                          title="Xóa tệp này"
                        >
                          ✕
                        </button>
                        <div style={{ position: 'absolute', bottom: '4px', left: '4px', background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '10px', padding: '1px 5px', borderRadius: '4px' }}>
                          #{idx + 1}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end',
                background: '#13131a',
                position: 'sticky',
                bottom: 0,
              }}
            >
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setEditingSpot(null)}
                style={{ padding: '10px 20px', fontSize: '14px' }}
              >
                ✕ Hủy
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleSaveSpot}
                disabled={isSaving}
                style={{ padding: '10px 24px', fontSize: '14px', fontWeight: 700 }}
              >
                {isSaving ? '⏳ Đang lưu...' : '💾 Lưu thay đổi'}
              </button>
            </div>
          </div>
        </div>
      )}
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
