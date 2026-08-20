'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserRetention } from '@/contexts/UserRetentionContext';
import CommunityReportModal from '@/components/CommunityReportModal';
import { Spot } from '@/lib/types';

interface Props {
  spot: any;
}

export default function DeepLinkClientActions({ spot }: Props) {
  const router = useRouter();
  const [toastMessage, setToastMessage] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  const handleOpenMapGo = () => {
    // Navigate to homepage with query param to focus and route to this spot
    router.push(`/?route_to=${spot.id}&lat=${spot.latitude}&lng=${spot.longitude}&name=${encodeURIComponent(spot.name)}`);
  };

  const handleGoogleMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${spot.latitude},${spot.longitude}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleShare = async () => {
    const shareUrl = typeof window !== 'undefined' ? window.location.href : `https://mapgo.vn/p/${spot.slug}`;
    const shareData = {
      title: `${spot.name} | MapGo.vn`,
      text: `Xem vị trí bãi đỗ xe ${spot.name} tại ${spot.address} trên MapGo`,
      url: shareUrl,
    };

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
        showToast('Đã chia sẻ địa điểm thành công!');
        return;
      } catch (err) {
        // User cancelled or share failed, fallback to copy
      }
    }

    // Fallback copy link to clipboard
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        showToast('Đã sao chép liên kết vào bộ nhớ tạm!');
      } catch {
        showToast('Không thể sao chép liên kết.');
      }
    }
  };

  const handleToggleFavorite = () => {
    // Save to localStorage directly
    try {
      const raw = localStorage.getItem('mapgo_favorites');
      const list = raw ? JSON.parse(raw) : [];
      const exists = list.some((item: any) => item.id === spot.id);
      let updated;
      if (exists) {
        updated = list.filter((item: any) => item.id !== spot.id);
        setIsFavorite(false);
        showToast('Đã bỏ lưu khỏi danh sách yêu thích');
      } else {
        updated = [{
          id: spot.id,
          name: spot.name,
          address: spot.address,
          type: spot.type,
          latitude: spot.latitude,
          longitude: spot.longitude,
          pricePerHourCar: spot.pricePerHourCar,
          rating: spot.rating,
          timestamp: new Date().toISOString()
        }, ...list];
        setIsFavorite(true);
        showToast('Đã lưu bãi xe vào danh sách yêu thích ⭐');
      }
      localStorage.setItem('mapgo_favorites', JSON.stringify(updated));
    } catch {
      showToast('Đã cập nhật yêu thích');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Primary Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <button
          onClick={handleOpenMapGo}
          style={{
            background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '12px',
            padding: '12px 14px',
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          🧭 Mở trong MapGo
        </button>

        <button
          onClick={handleGoogleMaps}
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '12px',
            padding: '12px 14px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          📍 Google Maps
        </button>
      </div>

      {/* Secondary Actions: Share, Save, Community Report */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '4px' }}>
        <button
          onClick={handleShare}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
            padding: '10px',
            color: '#cbd5e1',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          📤 Chia sẻ
        </button>

        <button
          onClick={handleToggleFavorite}
          style={{
            background: isFavorite ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.05)',
            border: `1px solid ${isFavorite ? '#f59e0b' : 'rgba(255, 255, 255, 0.1)'}`,
            borderRadius: '10px',
            padding: '10px',
            color: isFavorite ? '#fbbf24' : '#cbd5e1',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          ⭐ {isFavorite ? 'Đã lưu' : 'Lưu lại'}
        </button>

        <button
          onClick={() => setShowReportModal(true)}
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '10px',
            padding: '10px',
            color: '#f87171',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          ⚠️ Báo cáo
        </button>
      </div>

      {/* Toast message */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#1e293b',
            color: '#ffffff',
            border: '1px solid #3b82f6',
            borderRadius: '10px',
            padding: '10px 20px',
            fontSize: '13px',
            fontWeight: 600,
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            zIndex: 10000,
            animation: 'fadeIn 0.2s ease',
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* Community Report Modal */}
      {showReportModal && (
        <CommunityReportModal
          spot={spot as Spot}
          onClose={() => setShowReportModal(false)}
          onSuccess={() => showToast('Báo cáo đã được ghi nhận!')}
        />
      )}
    </div>
  );
}
