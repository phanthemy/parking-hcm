'use client';

import React, { useState } from 'react';
import { useUserRetention } from '@/contexts/UserRetentionContext';
import { RetentionSpotSummary, SavedLocation } from '@/lib/user-retention';
import { formatCurrency } from '@/lib/format';
import { SPOT_TYPE_LABELS } from '@/lib/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectSpot: (spot: RetentionSpotSummary) => void;
  onNavigateLocation: (lat: number, lng: number, name: string) => void;
}

export default function UserRetentionDrawer({ isOpen, onClose, onSelectSpot, onNavigateLocation }: Props) {
  const {
    favorites,
    recentPlaces,
    recentlyViewed,
    homeLocation,
    workLocation,
    saveHome,
    saveWork,
    removeHome,
    removeWork,
  } = useUserRetention();

  const [activeTab, setActiveTab] = useState<'favorites' | 'recent' | 'saved_places'>('favorites');
  const [editingHome, setEditingHome] = useState(false);
  const [editingWork, setEditingWork] = useState(false);
  const [homeAddressInput, setHomeAddressInput] = useState('');
  const [workAddressInput, setWorkAddressInput] = useState('');

  if (!isOpen) return null;

  const handleSaveHome = (e: React.FormEvent) => {
    e.preventDefault();
    if (!homeAddressInput.trim()) return;
    // Default coordinate if manual input, or geocoded
    const newLoc: SavedLocation = {
      name: 'Nhà riêng',
      address: homeAddressInput.trim(),
      latitude: 10.7769,
      longitude: 106.7009,
      updatedAt: new Date().toISOString(),
    };
    saveHome(newLoc);
    setEditingHome(false);
  };

  const handleSaveWork = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workAddressInput.trim()) return;
    const newLoc: SavedLocation = {
      name: 'Công ty / Cơ quan',
      address: workAddressInput.trim(),
      latitude: 10.7769,
      longitude: 106.7009,
      updatedAt: new Date().toISOString(),
    };
    saveWork(newLoc);
    setEditingWork(false);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(165deg, #13131e 0%, #0d0d14 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '24px 24px 0 0',
          padding: '20px 20px 32px',
          width: '100%',
          maxWidth: '520px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.8)',
          animation: 'slideUp 0.25s ease',
        }}
      >
        {/* Handle */}
        <div style={{ width: '36px', height: '4px', background: 'rgba(255, 255, 255, 0.25)', borderRadius: '2px', margin: '0 auto 16px' }} />

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff' }}>
            Địa điểm của tôi
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: '#94a3b8',
              fontSize: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        {/* Quick Nav: Home & Work */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
          {/* Home */}
          <div
            style={{
              background: 'rgba(37, 99, 235, 0.1)',
              border: '1px solid rgba(37, 99, 235, 0.3)',
              borderRadius: '14px',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#93c5fd' }}>🏠 Nhà riêng</span>
              {homeLocation && (
                <button
                  onClick={() => removeHome()}
                  style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '11px', cursor: 'pointer' }}
                >
                  Xóa
                </button>
              )}
            </div>
            {homeLocation ? (
              <div>
                <p style={{ fontSize: '12px', color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '8px' }}>
                  {homeLocation.address}
                </p>
                <button
                  onClick={() => {
                    onNavigateLocation(homeLocation.latitude, homeLocation.longitude, 'Nhà riêng');
                    onClose();
                  }}
                  style={{
                    background: '#2563eb',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    width: '100%',
                  }}
                >
                  Dẫn đường
                </button>
              </div>
            ) : editingHome ? (
              <form onSubmit={handleSaveHome} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <input
                  type="text"
                  placeholder="Nhập địa chỉ nhà..."
                  value={homeAddressInput}
                  onChange={(e) => setHomeAddressInput(e.target.value)}
                  style={{
                    padding: '6px 8px',
                    borderRadius: '6px',
                    background: 'rgba(0,0,0,0.4)',
                    border: '1px solid #3b82f6',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                  autoFocus
                />
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button type="submit" style={{ flex: 1, padding: '4px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>Lưu</button>
                  <button type="button" onClick={() => setEditingHome(false)} style={{ padding: '4px 8px', background: 'rgba(255,255,255,0.1)', color: '#94a3b8', border: 'none', borderRadius: '4px', fontSize: '11px' }}>Hủy</button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setEditingHome(true)}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  color: '#94a3b8',
                  border: '1px dashed rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  padding: '8px',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                + Thêm địa chỉ
              </button>
            )}
          </div>

          {/* Work */}
          <div
            style={{
              background: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '14px',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#c4b5fd' }}>🏢 Công ty</span>
              {workLocation && (
                <button
                  onClick={() => removeWork()}
                  style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '11px', cursor: 'pointer' }}
                >
                  Xóa
                </button>
              )}
            </div>
            {workLocation ? (
              <div>
                <p style={{ fontSize: '12px', color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '8px' }}>
                  {workLocation.address}
                </p>
                <button
                  onClick={() => {
                    onNavigateLocation(workLocation.latitude, workLocation.longitude, 'Công ty');
                    onClose();
                  }}
                  style={{
                    background: '#7c3aed',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    width: '100%',
                  }}
                >
                  Dẫn đường
                </button>
              </div>
            ) : editingWork ? (
              <form onSubmit={handleSaveWork} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <input
                  type="text"
                  placeholder="Nhập địa chỉ công ty..."
                  value={workAddressInput}
                  onChange={(e) => setWorkAddressInput(e.target.value)}
                  style={{
                    padding: '6px 8px',
                    borderRadius: '6px',
                    background: 'rgba(0,0,0,0.4)',
                    border: '1px solid #8b5cf6',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                  autoFocus
                />
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button type="submit" style={{ flex: 1, padding: '4px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>Lưu</button>
                  <button type="button" onClick={() => setEditingWork(false)} style={{ padding: '4px 8px', background: 'rgba(255,255,255,0.1)', color: '#94a3b8', border: 'none', borderRadius: '4px', fontSize: '11px' }}>Hủy</button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setEditingWork(true)}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  color: '#94a3b8',
                  border: '1px dashed rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  padding: '8px',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                + Thêm địa chỉ
              </button>
            )}
          </div>
        </div>

        {/* Tab navigation */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', marginBottom: '12px' }}>
          <button
            onClick={() => setActiveTab('favorites')}
            style={{
              flex: 1,
              padding: '10px 0',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'favorites' ? '2px solid #3b82f6' : '2px solid transparent',
              color: activeTab === 'favorites' ? '#ffffff' : '#94a3b8',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            ⭐ Yêu thích ({favorites.length})
          </button>
          <button
            onClick={() => setActiveTab('recent')}
            style={{
              flex: 1,
              padding: '10px 0',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'recent' ? '2px solid #3b82f6' : '2px solid transparent',
              color: activeTab === 'recent' ? '#ffffff' : '#94a3b8',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            🕒 Đã đến ({recentPlaces.length})
          </button>
          <button
            onClick={() => setActiveTab('saved_places')}
            style={{
              flex: 1,
              padding: '10px 0',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'saved_places' ? '2px solid #3b82f6' : '2px solid transparent',
              color: activeTab === 'saved_places' ? '#ffffff' : '#94a3b8',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            👁️ Vừa xem ({recentlyViewed.length})
          </button>
        </div>

        {/* Tab Content */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
          {activeTab === 'favorites' && (
            favorites.length > 0 ? (
              favorites.map((spot) => (
                <div
                  key={spot.id}
                  onClick={() => {
                    onSelectSpot(spot);
                    onClose();
                  }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    padding: '12px 14px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0, paddingRight: '12px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {spot.name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {spot.address}
                    </div>
                    {spot.pricePerHourCar ? (
                      <div style={{ fontSize: '11px', color: '#38bdf8', marginTop: '4px', fontWeight: 600 }}>
                        {formatCurrency(spot.pricePerHourCar)}/h
                      </div>
                    ) : null}
                  </div>
                  <div style={{ flexShrink: 0, textAlign: 'right' }}>
                    <span style={{ fontSize: '11px', background: 'rgba(37, 99, 235, 0.2)', color: '#93c5fd', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>
                      {SPOT_TYPE_LABELS[spot.type as any] || 'Bãi xe'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '32px 16px', color: '#64748b', fontSize: '13px' }}>
                Chưa có địa điểm yêu thích nào.<br />Bấm vào biểu tượng ⭐ trên bãi xe để lưu vào đây.
              </div>
            )
          )}

          {activeTab === 'recent' && (
            recentPlaces.length > 0 ? (
              recentPlaces.map((spot) => (
                <div
                  key={spot.id}
                  onClick={() => {
                    onSelectSpot(spot);
                    onClose();
                  }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    padding: '12px 14px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0, paddingRight: '12px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {spot.name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {spot.address}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigateLocation(spot.latitude, spot.longitude, spot.name);
                      onClose();
                    }}
                    style={{
                      background: 'rgba(37, 99, 235, 0.2)',
                      color: '#60a5fa',
                      border: '1px solid rgba(37, 99, 235, 0.4)',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  >
                    Chỉ đường →
                  </button>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '32px 16px', color: '#64748b', fontSize: '13px' }}>
                Chưa có lịch sử di chuyển nào.
              </div>
            )
          )}

          {activeTab === 'saved_places' && (
            recentlyViewed.length > 0 ? (
              recentlyViewed.map((spot) => (
                <div
                  key={spot.id}
                  onClick={() => {
                    onSelectSpot(spot);
                    onClose();
                  }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    padding: '12px 14px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {spot.name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {spot.address}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '32px 16px', color: '#64748b', fontSize: '13px' }}>
                Chưa có địa điểm vừa xem.
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
