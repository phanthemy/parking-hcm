'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { formatDate } from '@/lib/format';
import {
  IconDashboard,
  IconMapPin,
  IconDatabase,
  IconFlag,
  IconBarChart,
  IconSearch,
  IconFilter,
  IconPhone,
  IconClock,
  IconShieldCheck,
  IconAlertTriangle,
  IconCheckCircle,
  IconXCircle,
  IconEdit,
  IconTrash,
  IconPlus,
  IconRefresh,
  IconEye,
  IconEyeOff,
  IconImage,
  IconNavigation
} from '@/components/Icons';

type TabType = 'dashboard' | 'pois' | 'quality' | 'reports' | 'analytics';

const DISTRICTS_HCM = [
  'Quận 1', 'Quận 3', 'Quận 4', 'Quận 5', 'Quận 6', 'Quận 7', 'Quận 8',
  'Quận 10', 'Quận 11', 'Quận 12', 'Bình Thạnh', 'Gò Vấp', 'Phú Nhuận',
  'Tân Bình', 'Tân Phú', 'Bình Tân', 'Thủ Đức', 'Củ Chi', 'Hóc Môn',
  'Bình Chánh', 'Nhà Bè', 'Cần Giờ'
];

const CATEGORIES_LIST = [
  { id: 'all', label: 'Tất cả loại hình' },
  { id: 'PARKING', label: 'Bãi đỗ xe' },
  { id: 'FUEL', label: 'Cây xăng' },
  { id: 'CAR_REPAIR', label: 'Gara & Sửa xe' },
  { id: 'CAR_WASH', label: 'Rửa xe' },
  { id: 'EV_CHARGING', label: 'Trạm sạc EV' },
  { id: 'RESTROOM', label: 'Nhà vệ sinh' },
  { id: 'RESTAURANT', label: 'Quán ăn' },
  { id: 'CAFE', label: 'Cà phê' },
  { id: 'SERVICE', label: 'Tiện ích' },
  { id: 'INSPECTION', label: 'Đăng kiểm' }
];

export default function AdminPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  // Active Tab
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Stats & KPIs
  const [statsData, setStatsData] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // POI Management State
  const [spots, setSpots] = useState<any[]>([]);
  const [spotsLoading, setSpotsLoading] = useState(true);
  const [totalSpots, setTotalSpots] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // POI Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [districtFilter, setDistrictFilter] = useState<string>('all');
  const [verifiedFilter, setVerifiedFilter] = useState<string>('all');
  const [qualityIssueFilter, setQualityIssueFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Edit / Create Modal State
  const [editingSpot, setEditingSpot] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // User Reports State
  const [reports, setReports] = useState<any[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportStatusFilter, setReportStatusFilter] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<any | null>(null);

  // Toast Feedback State
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Auth Guard
  useEffect(() => {
    const role = user?.role?.toString().toUpperCase();
    if (!authLoading && (!isAuthenticated || (role && role !== 'ADMIN' && role !== 'DRIVER'))) {
      router.push('/auth/login');
    }
  }, [authLoading, isAuthenticated, user, router]);

  // Fetch Stats Data
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await api.get<any>('/api/admin/stats');
      if (res && res.success) {
        setStatsData(res);
      }
    } catch (err: any) {
      console.error('Error fetching admin stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Fetch Spots List
  const fetchSpots = useCallback(async () => {
    setSpotsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', itemsPerPage.toString());
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (districtFilter !== 'all') params.append('district', districtFilter);
      if (verifiedFilter !== 'all') params.append('verified', verifiedFilter);
      if (qualityIssueFilter !== 'all') params.append('quality_issue', qualityIssueFilter);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const res = await api.get<any>(`/api/admin/spots?${params.toString()}`);
      if (res && res.success) {
        setSpots(res.spots || []);
        setTotalSpots(res.total || 0);
        setTotalPages(res.totalPages || 1);
      }
    } catch (err: any) {
      console.error('Error fetching admin spots:', err);
      showToast('Lỗi khi tải danh sách địa điểm: ' + err.message, 'error');
    } finally {
      setSpotsLoading(false);
    }
  }, [currentPage, itemsPerPage, statusFilter, categoryFilter, districtFilter, verifiedFilter, qualityIssueFilter, searchQuery]);

  // Fetch User Reports
  const fetchReports = useCallback(async () => {
    setReportsLoading(true);
    try {
      const params = new URLSearchParams();
      if (reportStatusFilter !== 'all') params.append('status', reportStatusFilter);
      const res = await api.get<any>(`/api/admin/reports?${params.toString()}`);
      if (res && res.success) {
        setReports(res.reports || []);
      }
    } catch (err: any) {
      console.error('Error fetching reports:', err);
    } finally {
      setReportsLoading(false);
    }
  }, [reportStatusFilter]);

  // Initial Load
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (activeTab === 'pois' || activeTab === 'quality') {
      fetchSpots();
    } else if (activeTab === 'reports') {
      fetchReports();
    }
  }, [activeTab, fetchSpots, fetchReports]);

  // Handle Quick Toggle Status
  const handleToggleStatus = async (spotId: string, currentStatus: string) => {
    setActionLoadingId(spotId);
    const newStatus = currentStatus.toLowerCase() === 'active' ? 'HIDDEN' : 'ACTIVE';
    try {
      await api.patch(`/api/admin/spots/${spotId}`, { status: newStatus });
      setSpots((prev) => prev.map((s) => (s.id === spotId ? { ...s, status: newStatus.toLowerCase() } : s)));
      showToast(`Đã chuyển trạng thái sang: ${newStatus === 'ACTIVE' ? 'Hoạt động' : 'Đã ẩn'}`);
      fetchStats();
    } catch (err: any) {
      showToast('Lỗi khi đổi trạng thái: ' + err.message, 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Quick Toggle Verified
  const handleToggleVerified = async (spotId: string, currentVerified: boolean) => {
    setActionLoadingId(spotId);
    const newVerified = !currentVerified;
    try {
      await api.patch(`/api/admin/spots/${spotId}`, { verified: newVerified });
      setSpots((prev) => prev.map((s) => (s.id === spotId ? { ...s, verified: newVerified, isVerified: newVerified } : s)));
      showToast(`Đã ${newVerified ? 'xác thực thực địa' : 'hủy xác thực'} địa điểm`);
      fetchStats();
    } catch (err: any) {
      showToast('Lỗi cập nhật xác thực: ' + err.message, 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Quick Save Phone on Data Quality Tab
  const handleQuickSavePhone = async (spotId: string, phoneValue: string) => {
    if (!phoneValue.trim()) return;
    setActionLoadingId(spotId);
    try {
      await api.patch(`/api/admin/spots/${spotId}`, { phone: phoneValue.trim() });
      setSpots((prev) => prev.map((s) => (s.id === spotId ? { ...s, phone: phoneValue.trim() } : s)));
      showToast('Đã lưu số điện thoại thành công!');
      fetchStats();
    } catch (err: any) {
      showToast('Lỗi lưu số điện thoại: ' + err.message, 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Open Edit Modal
  const openEditModal = (spot: any) => {
    setEditingSpot({
      ...spot,
      lat: spot.lat || spot.latitude || 10.7769,
      lon: spot.lon || spot.longitude || 106.7009,
      images: Array.isArray(spot.images) ? [...spot.images] : []
    });
  };

  // Open Create Modal
  const openCreateModal = () => {
    setEditingSpot({
      id: '',
      name: '',
      category: 'PARKING',
      address: '',
      lat: 10.7769,
      lon: 106.7009,
      phone: '',
      openTime: '06:00',
      closeTime: '22:00',
      priceInfo: 'Ô tô: 20k/h, Xe máy: 5k/lượt',
      carSlots: 20,
      bikeSlots: 50,
      status: 'ACTIVE',
      verified: false,
      images: []
    });
  };

  // Save Spot from Modal
  const handleSaveSpotModal = async () => {
    if (!editingSpot || !editingSpot.name.trim()) {
      showToast('Tên địa điểm không được để trống', 'error');
      return;
    }
    setIsSaving(true);
    try {
      if (editingSpot.id) {
        // Update
        const res = await api.put<any>(`/api/admin/spots/${editingSpot.id}`, editingSpot);
        if (res && res.success) {
          showToast('Đã cập nhật thông tin địa điểm thành công!');
          setEditingSpot(null);
          fetchSpots();
          fetchStats();
        }
      } else {
        // Create
        const res = await api.post<any>('/api/admin/spots', editingSpot);
        if (res && res.success) {
          showToast('Đã thêm mới địa điểm vào hệ thống!');
          setEditingSpot(null);
          fetchSpots();
          fetchStats();
        }
      }
    } catch (err: any) {
      showToast('Lỗi khi lưu địa điểm: ' + err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Add Image URL to Edit Modal
  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    setEditingSpot((prev: any) => ({
      ...prev,
      images: [...(prev.images || []), newImageUrl.trim()]
    }));
    setNewImageUrl('');
  };

  // Remove Image from Edit Modal
  const handleRemoveImage = (index: number) => {
    setEditingSpot((prev: any) => ({
      ...prev,
      images: prev.images.filter((_: any, i: number) => i !== index)
    }));
  };

  // Update Report Status
  const handleUpdateReportStatus = async (reportId: number, status: string, adminNote: string) => {
    try {
      await api.patch('/api/admin/reports', { id: reportId, status, adminNote });
      showToast(`Đã cập nhật trạng thái báo cáo sang: ${status}`);
      fetchReports();
      fetchStats();
      setSelectedReport(null);
    } catch (err: any) {
      showToast('Lỗi cập nhật báo cáo: ' + err.message, 'error');
    }
  };

  if (authLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#09090b', color: '#f8fafc' }}>
        <Header />
        <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px', width: '100%' }}>
          <div style={{ height: '80px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', marginBottom: '20px' }} />
          <div style={{ height: '400px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#09090b', color: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Header />

      {/* Floating Toast Message */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 99999,
            padding: '12px 20px',
            borderRadius: '10px',
            background: toastMessage.type === 'success' ? '#065f46' : '#991b1b',
            color: '#fff',
            border: toastMessage.type === 'success' ? '1px solid #10b981' : '1px solid #ef4444',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: 600
          }}
        >
          {toastMessage.type === 'success' ? <IconCheckCircle size={18} /> : <IconAlertTriangle size={18} />}
          {toastMessage.text}
        </div>
      )}

      <main style={{ maxWidth: '1360px', margin: '0 auto', padding: '24px 20px', width: '100%', flex: 1 }}>
        {/* Top Header & Fast Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)', padding: '8px', borderRadius: '10px', display: 'flex' }}>
                <IconDatabase size={22} color="#fff" />
              </div>
              <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                MapGo Data Operations
              </h1>
            </div>
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: '4px 0 0 0' }}>
              Hệ thống kiểm soát chất lượng dữ liệu & điều hành POI PostGIS
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => { fetchStats(); if (activeTab === 'pois' || activeTab === 'quality') fetchSpots(); if (activeTab === 'reports') fetchReports(); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 16px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.05)',
                color: '#cbd5e1',
                border: '1px solid rgba(255,255,255,0.1)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <IconRefresh size={15} /> Làm mới
            </button>
            <button
              onClick={openCreateModal}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 18px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                color: '#fff',
                border: 'none',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(59,130,246,0.3)'
              }}
            >
              <IconPlus size={16} /> Thêm POI mới
            </button>
          </div>
        </div>

        {/* 5 Main Module Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '24px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            paddingBottom: '12px',
            overflowX: 'auto'
          }}
        >
          {[
            { id: 'dashboard', label: 'Tổng quan & KPI', icon: IconDashboard, count: null },
            { id: 'pois', label: 'Quản lý POI', icon: IconMapPin, count: statsData?.totalSpots || 0 },
            { id: 'quality', label: 'Data Quality Ops', icon: IconDatabase, count: (statsData?.quality?.missingPhone || 0) + (statsData?.quality?.rawAddress || 0) },
            { id: 'reports', label: 'Báo cáo người dùng', icon: IconFlag, count: statsData?.reports?.pending || 0 },
            { id: 'analytics', label: 'Analytics & Funnel', icon: IconBarChart, count: null }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as TabType);
                  setCurrentPage(1);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  borderRadius: '10px',
                  background: isActive ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255,255,255,0.03)',
                  color: isActive ? '#60a5fa' : '#94a3b8',
                  border: isActive ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid rgba(255,255,255,0.06)',
                  fontSize: '13px',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s'
                }}
              >
                <Icon size={16} />
                {tab.label}
                {tab.count !== null && tab.count > 0 && (
                  <span
                    style={{
                      background: isActive ? '#2563eb' : 'rgba(255,255,255,0.1)',
                      color: '#fff',
                      padding: '2px 7px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 700
                    }}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: DASHBOARD KPI & DATA OPERATIONS */}
        {activeTab === 'dashboard' && (
          <div>
            {/* Top Row: General KPIs + Data Health Score */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              {/* Total Spots */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#94a3b8' }}>Tổng địa điểm</span>
                  <div style={{ background: 'rgba(59,130,246,0.1)', padding: '6px', borderRadius: '8px' }}>
                    <IconMapPin size={18} color="#3b82f6" />
                  </div>
                </div>
                <div style={{ fontSize: '32px', fontWeight: 800, color: '#fff', marginTop: '10px' }}>
                  {statsData?.totalSpots?.toLocaleString() || '1,977'}
                </div>
                <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <IconCheckCircle size={13} /> {statsData?.activeSpots || 1883} đang hoạt động
                </div>
              </div>

              {/* Data Health Score */}
              <div style={{ background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.6), rgba(49, 46, 129, 0.4))', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '14px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#c7d2fe' }}>Data Health Score</span>
                  <div style={{ background: 'rgba(99,102,241,0.2)', padding: '6px', borderRadius: '8px' }}>
                    <IconDatabase size={18} color="#a5b4fc" />
                  </div>
                </div>
                <div style={{ fontSize: '32px', fontWeight: 800, color: '#a5b4fc', marginTop: '10px' }}>
                  {statsData?.dataHealthScore || 35} <span style={{ fontSize: '16px', fontWeight: 500 }}>/ 100</span>
                </div>
                <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '4px' }}>
                  Mục tiêu Sprint 2: Đạt trên 85 điểm
                </div>
              </div>

              {/* Verified Spots */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#94a3b8' }}>Xác thực thực địa</span>
                  <div style={{ background: 'rgba(16,185,129,0.1)', padding: '6px', borderRadius: '8px' }}>
                    <IconShieldCheck size={18} color="#10b981" />
                  </div>
                </div>
                <div style={{ fontSize: '32px', fontWeight: 800, color: '#10b981', marginTop: '10px' }}>
                  {statsData?.verifiedSpots || 0}
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                  {statsData?.quality?.unverified || 1977} địa điểm cần đối soát
                </div>
              </div>

              {/* User Reports */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#94a3b8' }}>Báo cáo cộng đồng</span>
                  <div style={{ background: 'rgba(245,158,11,0.1)', padding: '6px', borderRadius: '8px' }}>
                    <IconFlag size={18} color="#f59e0b" />
                  </div>
                </div>
                <div style={{ fontSize: '32px', fontWeight: 800, color: '#f59e0b', marginTop: '10px' }}>
                  {statsData?.reports?.pending || 0} <span style={{ fontSize: '14px', fontWeight: 400, color: '#94a3b8' }}>chờ xử lý</span>
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                  Tổng cộng: {statsData?.reports?.total || 0} phản hồi
                </div>
              </div>
            </div>

            {/* Middle Row: Data Quality Breakdown Cards */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '20px', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IconAlertTriangle size={18} color="#f59e0b" />
                Các Điểm Nghẽn Dữ Liệu Cần Khắc Phục
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                {/* Missing Phone */}
                <div
                  onClick={() => { setActiveTab('quality'); setQualityIssueFilter('missing_phone'); }}
                  style={{
                    background: 'rgba(239, 68, 68, 0.06)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '10px',
                    padding: '16px',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fca5a5', fontSize: '13px' }}>
                    <IconPhone size={16} /> Thiếu số điện thoại
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#f87171', marginTop: '6px' }}>
                    {statsData?.quality?.missingPhone || 1897}
                  </div>
                  <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
                    Bấm để mở hàng đợi bổ sung SĐT →
                  </div>
                </div>

                {/* Raw Address */}
                <div
                  onClick={() => { setActiveTab('quality'); setQualityIssueFilter('raw_address'); }}
                  style={{
                    background: 'rgba(249, 115, 22, 0.06)',
                    border: '1px solid rgba(249, 115, 22, 0.2)',
                    borderRadius: '10px',
                    padding: '16px',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fdba74', fontSize: '13px' }}>
                    <IconMapPin size={16} /> Địa chỉ tọa độ thô
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#fb923c', marginTop: '6px' }}>
                    {statsData?.quality?.rawAddress || 693}
                  </div>
                  <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
                    Cần gán địa chỉ số nhà/tên đường →
                  </div>
                </div>

                {/* Missing Hours */}
                <div
                  onClick={() => { setActiveTab('quality'); setQualityIssueFilter('missing_hours'); }}
                  style={{
                    background: 'rgba(234, 179, 8, 0.06)',
                    border: '1px solid rgba(234, 179, 8, 0.2)',
                    borderRadius: '10px',
                    padding: '16px',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fde047', fontSize: '13px' }}>
                    <IconClock size={16} /> Thiếu giờ hoạt động
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#facc15', marginTop: '6px' }}>
                    {statsData?.quality?.missingHours || 1420}
                  </div>
                  <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
                    Cần cấu hình giờ mở/đóng cửa →
                  </div>
                </div>

                {/* Unverified */}
                <div
                  onClick={() => { setActiveTab('quality'); setQualityIssueFilter('unverified'); }}
                  style={{
                    background: 'rgba(148, 163, 184, 0.06)',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    borderRadius: '10px',
                    padding: '16px',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e1', fontSize: '13px' }}>
                    <IconShieldCheck size={16} /> Chưa xác thực thực địa
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#cbd5e1', marginTop: '6px' }}>
                    {statsData?.quality?.unverified || 1977}
                  </div>
                  <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
                    Cần đối soát và gán Verified →
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row: Category Breakdown & Recent Activities */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              {/* Categories */}
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '20px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 14px 0' }}>
                  Phân Bổ Theo 7 Danh Mục
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {Object.entries(statsData?.quality?.categories || {}).map(([cat, count]: [string, any]) => {
                    const pct = Math.round((count / (statsData?.totalSpots || 1977)) * 100);
                    return (
                      <div key={cat} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                          <span style={{ color: '#cbd5e1', fontWeight: 600 }}>{cat}</span>
                          <span style={{ color: '#94a3b8' }}>{count} ({pct}%)</span>
                        </div>
                        <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: '#3b82f6', borderRadius: '4px' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Spots */}
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '20px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 14px 0' }}>
                  Cập Nhật Gần Nhất
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {(statsData?.recentSpots || []).map((spot: any) => (
                    <div
                      key={spot.id}
                      style={{
                        padding: '10px 12px',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '10px' }}>
                        <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#f1f5f9' }}>{spot.name}</p>
                        <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis' }}>{spot.address}</p>
                      </div>
                      <span
                        style={{
                          fontSize: '11px',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: spot.status?.toUpperCase() === 'ACTIVE' ? 'rgba(16,185,129,0.15)' : 'rgba(107,114,128,0.2)',
                          color: spot.status?.toUpperCase() === 'ACTIVE' ? '#34d399' : '#9ca3af',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {spot.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: POI MANAGEMENT */}
        {(activeTab === 'pois' || activeTab === 'quality') && (
          <div>
            {/* Filter Bar */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                {/* Search Box */}
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="Tìm tên, địa chỉ, SĐT..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    style={{
                      width: '100%',
                      padding: '8px 12px 8px 34px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '13px'
                    }}
                  />
                  <div style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                    <IconSearch size={15} />
                  </div>
                </div>

                {/* Category Dropdown */}
                <select
                  value={categoryFilter}
                  onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                  style={{
                    padding: '8px 12px',
                    background: '#18181b',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '13px'
                  }}
                >
                  {CATEGORIES_LIST.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>

                {/* District Dropdown */}
                <select
                  value={districtFilter}
                  onChange={(e) => { setDistrictFilter(e.target.value); setCurrentPage(1); }}
                  style={{
                    padding: '8px 12px',
                    background: '#18181b',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '13px'
                  }}
                >
                  <option value="all">Tất cả 22 Quận / Huyện</option>
                  {DISTRICTS_HCM.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>

                {/* Status Dropdown */}
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                  style={{
                    padding: '8px 12px',
                    background: '#18181b',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '13px'
                  }}
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="active">Hoạt động (ACTIVE)</option>
                  <option value="pending">Chờ duyệt (PENDING)</option>
                  <option value="hidden">Đã ẩn (HIDDEN)</option>
                </select>
              </div>

              {/* Quick Quality Issue Filter Chips (Particularly active in Quality Ops) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <IconFilter size={13} /> Lọc vấn đề dữ liệu:
                </span>
                {[
                  { id: 'all', label: 'Tất cả' },
                  { id: 'missing_phone', label: 'Thiếu SĐT' },
                  { id: 'raw_address', label: 'Địa chỉ thô' },
                  { id: 'missing_hours', label: 'Thiếu giờ mở cửa' },
                  { id: 'missing_images', label: 'Thiếu ảnh thật' },
                  { id: 'unverified', label: 'Chưa xác minh' }
                ].map((item) => {
                  const isSel = qualityIssueFilter === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => { setQualityIssueFilter(item.id); setCurrentPage(1); }}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        background: isSel ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.04)',
                        color: isSel ? '#60a5fa' : '#94a3b8',
                        border: isSel ? '1px solid rgba(59,130,246,0.4)' : '1px solid rgba(255,255,255,0.06)',
                        fontSize: '12px',
                        cursor: 'pointer',
                        fontWeight: isSel ? 700 : 400
                      }}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* POI Table */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', overflow: 'hidden' }}>
              {spotsLoading ? (
                <div style={{ padding: '50px', textAlign: 'center', color: '#94a3b8' }}>
                  <IconRefresh size={24} className="animate-spin" />
                  <p style={{ marginTop: '8px', fontSize: '14px' }}>Đang tải danh sách dữ liệu POI...</p>
                </div>
              ) : spots.length === 0 ? (
                <div style={{ padding: '50px', textAlign: 'center', color: '#94a3b8' }}>
                  <IconMapPin size={36} color="#64748b" />
                  <p style={{ marginTop: '12px', fontSize: '15px', fontWeight: 600, color: '#cbd5e1' }}>Không tìm thấy địa điểm nào</p>
                  <p style={{ fontSize: '13px' }}>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', textAlign: 'left' }}>
                        <th style={{ padding: '12px 16px', fontWeight: 600 }}>Tên địa điểm & Địa chỉ</th>
                        <th style={{ padding: '12px 16px', fontWeight: 600 }}>Loại hình</th>
                        <th style={{ padding: '12px 16px', fontWeight: 600 }}>Số điện thoại</th>
                        <th style={{ padding: '12px 16px', fontWeight: 600 }}>Giờ mở cửa</th>
                        <th style={{ padding: '12px 16px', fontWeight: 600 }}>Xác thực</th>
                        <th style={{ padding: '12px 16px', fontWeight: 600 }}>Trạng thái</th>
                        <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {spots.map((spot) => (
                        <tr
                          key={spot.id}
                          style={{
                            borderBottom: '1px solid rgba(255,255,255,0.04)',
                            transition: 'background 0.15s'
                          }}
                        >
                          {/* Name & Address */}
                          <td style={{ padding: '12px 16px', maxWidth: '300px' }}>
                            <div style={{ fontWeight: 600, color: '#f8fafc' }}>{spot.name}</div>
                            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {spot.address}
                            </div>
                          </td>

                          {/* Category */}
                          <td style={{ padding: '12px 16px' }}>
                            <span
                              style={{
                                padding: '4px 8px',
                                borderRadius: '6px',
                                background: 'rgba(59,130,246,0.1)',
                                color: '#60a5fa',
                                border: '1px solid rgba(59,130,246,0.2)',
                                fontSize: '11px',
                                fontWeight: 600
                              }}
                            >
                              {spot.category || spot.type}
                            </span>
                          </td>

                          {/* Phone / Inline Edit for Quality Tab */}
                          <td style={{ padding: '12px 16px' }}>
                            {spot.phone ? (
                              <span style={{ color: '#cbd5e1' }}>{spot.phone}</span>
                            ) : (
                              <span style={{ color: '#f87171', fontSize: '11px' }}>Chưa có SĐT</span>
                            )}
                          </td>

                          {/* Hours */}
                          <td style={{ padding: '12px 16px', color: '#cbd5e1', fontSize: '12px' }}>
                            {spot.openTime && spot.closeTime ? `${spot.openTime} - ${spot.closeTime}` : '24/7'}
                          </td>

                          {/* Verified Badge / Toggle */}
                          <td style={{ padding: '12px 16px' }}>
                            <button
                              onClick={() => handleToggleVerified(spot.id, !!spot.verified)}
                              disabled={actionLoadingId === spot.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                background: spot.verified ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)',
                                color: spot.verified ? '#34d399' : '#94a3b8',
                                border: spot.verified ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(255,255,255,0.1)',
                                fontSize: '11px',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                            >
                              <IconShieldCheck size={13} />
                              {spot.verified ? 'Đã xác thực' : 'Chưa'}
                            </button>
                          </td>

                          {/* Status Badge / Toggle */}
                          <td style={{ padding: '12px 16px' }}>
                            <button
                              onClick={() => handleToggleStatus(spot.id, spot.status)}
                              disabled={actionLoadingId === spot.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                background: spot.status?.toLowerCase() === 'active' ? 'rgba(16,185,129,0.1)' : 'rgba(107,114,128,0.15)',
                                color: spot.status?.toLowerCase() === 'active' ? '#10b981' : '#9ca3af',
                                border: spot.status?.toLowerCase() === 'active' ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(107,114,128,0.2)',
                                fontSize: '11px',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                            >
                              {spot.status?.toLowerCase() === 'active' ? <IconEye size={13} /> : <IconEyeOff size={13} />}
                              {spot.status?.toLowerCase() === 'active' ? 'Hoạt động' : 'Đã ẩn'}
                            </button>
                          </td>

                          {/* Actions */}
                          <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                              <button
                                onClick={() => openEditModal(spot)}
                                style={{
                                  padding: '5px 10px',
                                  borderRadius: '6px',
                                  background: 'rgba(59,130,246,0.1)',
                                  color: '#60a5fa',
                                  border: '1px solid rgba(59,130,246,0.3)',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <IconEdit size={13} /> Sửa
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination Bar */}
              {totalSpots > 0 && (
                <div
                  style={{
                    padding: '14px 20px',
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                    fontSize: '13px',
                    color: '#94a3b8'
                  }}
                >
                  <div>
                    Hiển thị <strong>{(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalSpots)}</strong> trong tổng số <strong>{totalSpots}</strong> POI
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: currentPage === 1 ? '#475569' : '#cbd5e1',
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                      }}
                    >
                      ◀ Trang trước
                    </button>
                    <span style={{ padding: '0 6px', color: '#fff', fontWeight: 600 }}>
                      Trang {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage >= totalPages}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: currentPage >= totalPages ? '#475569' : '#cbd5e1',
                        cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Trang sau ▶
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: USER REPORTS */}
        {activeTab === 'reports' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['all', 'PENDING', 'INVESTIGATING', 'RESOLVED', 'REJECTED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setReportStatusFilter(st)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      background: reportStatusFilter === st ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.03)',
                      color: reportStatusFilter === st ? '#60a5fa' : '#94a3b8',
                      border: reportStatusFilter === st ? '1px solid rgba(59,130,246,0.4)' : '1px solid rgba(255,255,255,0.06)',
                      fontSize: '12px',
                      fontWeight: reportStatusFilter === st ? 700 : 500,
                      cursor: 'pointer'
                    }}
                  >
                    {st === 'all' ? 'Tất cả' : st}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', overflow: 'hidden' }}>
              {reportsLoading ? (
                <div style={{ padding: '50px', textAlign: 'center', color: '#94a3b8' }}>
                  <IconRefresh size={24} className="animate-spin" />
                  <p style={{ marginTop: '8px' }}>Đang tải báo cáo từ cộng đồng...</p>
                </div>
              ) : reports.length === 0 ? (
                <div style={{ padding: '50px', textAlign: 'center', color: '#94a3b8' }}>
                  <IconCheckCircle size={36} color="#10b981" />
                  <p style={{ marginTop: '12px', fontSize: '15px', fontWeight: 600, color: '#cbd5e1' }}>Không có báo cáo nào tồn đọng</p>
                  <p style={{ fontSize: '13px' }}>Hệ thống dữ liệu đang hoạt động ổn định</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', textAlign: 'left' }}>
                        <th style={{ padding: '12px 16px' }}>Thời gian</th>
                        <th style={{ padding: '12px 16px' }}>Địa điểm liên quan</th>
                        <th style={{ padding: '12px 16px' }}>Loại báo cáo</th>
                        <th style={{ padding: '12px 16px' }}>Chi tiết phản hồi</th>
                        <th style={{ padding: '12px 16px' }}>Trạng thái</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right' }}>Xử lý</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.map((rep) => (
                        <tr key={rep.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding: '12px 16px', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                            {formatDate(rep.created_at)}
                          </td>
                          <td style={{ padding: '12px 16px', fontWeight: 600, color: '#f8fafc' }}>
                            {rep.current_spot_name || rep.spot_name || '—'}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ padding: '4px 8px', borderRadius: '6px', background: 'rgba(239,68,68,0.1)', color: '#f87171', fontSize: '11px', fontWeight: 600 }}>
                              {rep.report_type}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', color: '#cbd5e1', maxWidth: '300px' }}>
                            {rep.description || 'Không có mô tả chi tiết'}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ fontWeight: 600, fontSize: '12px', color: rep.status === 'RESOLVED' ? '#10b981' : rep.status === 'PENDING' ? '#f59e0b' : '#94a3b8' }}>
                              {rep.status}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                            <select
                              value={rep.status}
                              onChange={(e) => handleUpdateReportStatus(rep.id, e.target.value, rep.admin_note || '')}
                              style={{
                                padding: '4px 8px',
                                borderRadius: '6px',
                                background: '#18181b',
                                color: '#fff',
                                border: '1px solid rgba(255,255,255,0.15)',
                                fontSize: '12px'
                              }}
                            >
                              <option value="PENDING">Chờ xử lý</option>
                              <option value="INVESTIGATING">Đang kiểm tra</option>
                              <option value="RESOLVED">Đã giải quyết</option>
                              <option value="REJECTED">Từ chối</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: ANALYTICS & FUNNEL */}
        {activeTab === 'analytics' && (
          <div>
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '24px', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IconNavigation size={20} color="#3b82f6" />
                Phễu Chuyển Đổi Hành Vi Tài Xế (Driver Journey)
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
                {[
                  { step: '1. Mở Ứng Dụng (Home Opened)', key: 'homeOpened', color: '#38bdf8' },
                  { step: '2. Cấp Quyền GPS (GPS Granted)', key: 'gpsGranted', color: '#34d399' },
                  { step: '3. Bấm Trợ Lý / Tìm Gần Đây (Nearby Clicked)', key: 'nearbyClicked', color: '#fbbf24' },
                  { step: '4. Bắt Đầu Chỉ Đường (Navigation Started)', key: 'navStarted', color: '#818cf8' },
                  { step: '5. Lưu Địa Điểm Yêu Thích (Favorited)', key: 'favorited', color: '#f472b6' }
                ].map((funnelItem, idx) => {
                  const count = statsData?.activity?.[funnelItem.key] || 0;
                  const baseCount = statsData?.activity?.homeOpened || 1;
                  const pct = Math.min(100, Math.round((count / (baseCount || 1)) * 100)) || (idx === 0 ? 100 : 0);

                  return (
                    <div key={funnelItem.key} style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: '#f1f5f9' }}>{funnelItem.step}</span>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: funnelItem.color }}>
                          {count} lượt ({pct}% phễu)
                        </span>
                      </div>
                      <div style={{ height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.max(4, pct)}%`, height: '100%', background: funnelItem.color, borderRadius: '6px' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* EDIT / CREATE POI MODAL */}
      {editingSpot && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
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
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '18px 24px',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'sticky',
                top: 0,
                background: '#13131a',
                zIndex: 10
              }}
            >
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#fff' }}>
                  {editingSpot.id ? '✏️ Chỉnh Sửa Địa Điểm POI' : '➕ Thêm Mới Địa Điểm POI'}
                </h3>
                {editingSpot.id && (
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>ID: {editingSpot.id}</span>
                )}
              </div>
              <button
                onClick={() => setEditingSpot(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '22px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Row 1: Name & Category */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Tên địa điểm *</label>
                  <input
                    type="text"
                    value={editingSpot.name || ''}
                    onChange={(e) => setEditingSpot({ ...editingSpot, name: e.target.value })}
                    placeholder="VD: Bãi đỗ xe Vincom Center Đồng Khởi"
                    style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Danh mục</label>
                  <select
                    value={editingSpot.category || 'PARKING'}
                    onChange={(e) => setEditingSpot({ ...editingSpot, category: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: '#18181b', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                  >
                    {CATEGORIES_LIST.filter((c) => c.id !== 'all').map((c) => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Address */}
              <div>
                <label style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Địa chỉ chi tiết</label>
                <input
                  type="text"
                  value={editingSpot.address || ''}
                  onChange={(e) => setEditingSpot({ ...editingSpot, address: e.target.value })}
                  placeholder="VD: 72 Lê Thánh Tôn, Bến Nghé, Quận 1, TP.HCM"
                  style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                />
              </div>

              {/* Row 3: Lat & Lon */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Vĩ độ (Latitude) *</label>
                  <input
                    type="number"
                    step="any"
                    value={editingSpot.lat ?? 10.7769}
                    onChange={(e) => setEditingSpot({ ...editingSpot, lat: parseFloat(e.target.value) })}
                    style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Kinh độ (Longitude) *</label>
                  <input
                    type="number"
                    step="any"
                    value={editingSpot.lon ?? 106.7009}
                    onChange={(e) => setEditingSpot({ ...editingSpot, lon: parseFloat(e.target.value) })}
                    style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                  />
                </div>
              </div>

              {/* Row 4: Phone & Opening Hours */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Số điện thoại</label>
                  <input
                    type="text"
                    value={editingSpot.phone || ''}
                    onChange={(e) => setEditingSpot({ ...editingSpot, phone: e.target.value })}
                    placeholder="VD: 0901234567"
                    style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Giờ mở cửa</label>
                  <input
                    type="text"
                    value={editingSpot.openTime || '06:00'}
                    onChange={(e) => setEditingSpot({ ...editingSpot, openTime: e.target.value })}
                    placeholder="06:00"
                    style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Giờ đóng cửa</label>
                  <input
                    type="text"
                    value={editingSpot.closeTime || '22:00'}
                    onChange={(e) => setEditingSpot({ ...editingSpot, closeTime: e.target.value })}
                    placeholder="22:00"
                    style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                  />
                </div>
              </div>

              {/* Row 5: Price Info & Slots */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Thông tin giá gửi</label>
                  <input
                    type="text"
                    value={editingSpot.priceInfo || ''}
                    onChange={(e) => setEditingSpot({ ...editingSpot, priceInfo: e.target.value })}
                    placeholder="VD: 20k/giờ đầu, 5k xe máy"
                    style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Chỗ ô tô</label>
                  <input
                    type="number"
                    value={editingSpot.carSlots || 0}
                    onChange={(e) => setEditingSpot({ ...editingSpot, carSlots: parseInt(e.target.value || '0') })}
                    style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Chỗ xe máy</label>
                  <input
                    type="number"
                    value={editingSpot.bikeSlots || 0}
                    onChange={(e) => setEditingSpot({ ...editingSpot, bikeSlots: parseInt(e.target.value || '0') })}
                    style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                  />
                </div>
              </div>

              {/* Row 6: Toggles (Status & Verified) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    id="verifiedToggle"
                    checked={!!editingSpot.verified}
                    onChange={(e) => setEditingSpot({ ...editingSpot, verified: e.target.checked })}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <label htmlFor="verifiedToggle" style={{ fontSize: '13px', color: '#f8fafc', cursor: 'pointer', fontWeight: 600 }}>
                    🛡️ Đã xác thực thực địa (Verified)
                  </label>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <label style={{ fontSize: '13px', color: '#94a3b8' }}>Trạng thái:</label>
                  <select
                    value={(editingSpot.status || 'ACTIVE').toUpperCase()}
                    onChange={(e) => setEditingSpot({ ...editingSpot, status: e.target.value })}
                    style={{ padding: '6px 12px', background: '#18181b', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', fontSize: '12px' }}
                  >
                    <option value="ACTIVE">Hoạt động (ACTIVE)</option>
                    <option value="PENDING">Chờ duyệt (PENDING)</option>
                    <option value="HIDDEN">Tạm ẩn (HIDDEN)</option>
                  </select>
                </div>
              </div>

              {/* Row 7: Images Manager */}
              <div>
                <label style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  <IconImage size={14} /> Danh sách URL hình ảnh thực tế
                </label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="text"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="Dán link ảnh (https://...)"
                    style={{ flex: 1, padding: '8px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                  />
                  <button
                    type="button"
                    onClick={handleAddImage}
                    style={{ padding: '8px 16px', borderRadius: '8px', background: '#3b82f6', color: '#fff', border: 'none', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    + Thêm
                  </button>
                </div>
                {editingSpot.images && editingSpot.images.length > 0 && (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {editingSpot.images.map((img: string, i: number) => (
                      <div key={i} style={{ position: 'relative', width: '80px', height: '60px', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.2)' }}>
                        <img src={img} alt="Spot" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(i)}
                          style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(0,0,0,0.7)', border: 'none', color: '#f87171', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', cursor: 'pointer' }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                background: '#13131a'
              }}
            >
              <button
                type="button"
                onClick={() => setEditingSpot(null)}
                style={{ padding: '9px 18px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.1)', fontSize: '13px', cursor: 'pointer' }}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleSaveSpotModal}
                disabled={isSaving}
                style={{
                  padding: '9px 22px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                  color: '#fff',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: isSaving ? 'not-allowed' : 'pointer'
                }}
              >
                {isSaving ? 'Đang lưu...' : '💾 Lưu địa điểm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
