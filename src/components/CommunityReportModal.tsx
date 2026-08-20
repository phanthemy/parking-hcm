'use client';

import React, { useState } from 'react';
import api from '@/lib/api';
import { Spot } from '@/lib/types';

interface Props {
  spot: Spot;
  onClose: () => void;
  onSuccess?: () => void;
}

type ReportTypeKey = 'AVAILABLE' | 'FULL' | 'PRICE_CHANGED' | 'CLOSED' | 'WRONG_LOCATION';

interface ReportOption {
  key: ReportTypeKey;
  label: string;
  desc: string;
  color: string;
  badge: string;
}

const REPORT_OPTIONS: ReportOption[] = [
  {
    key: 'AVAILABLE',
    label: 'Còn chỗ trống',
    desc: 'Bãi xe còn nhiều vị trí đỗ thuận tiện',
    color: '#10b981',
    badge: 'Xanh'
  },
  {
    key: 'FULL',
    label: 'Hết chỗ đỗ xe',
    desc: 'Bãi hiện đã kín chỗ, không nhận thêm xe',
    color: '#ef4444',
    badge: 'Đỏ'
  },
  {
    key: 'PRICE_CHANGED',
    label: 'Giá gửi xe thay đổi',
    desc: 'Giá thực tế khác với thông tin hiển thị',
    color: '#f59e0b',
    badge: 'Vàng'
  },
  {
    key: 'CLOSED',
    label: 'Đóng cửa / Ngừng hoạt động',
    desc: 'Điểm đỗ đang đóng cửa hoặc không còn kinh doanh',
    color: '#6b7280',
    badge: 'Xám'
  },
  {
    key: 'WRONG_LOCATION',
    label: 'Sai vị trí trên bản đồ',
    desc: 'Tọa độ hoặc địa chỉ hiển thị chưa chính xác',
    color: '#8b5cf6',
    badge: 'Tím'
  }
];

export default function CommunityReportModal({ spot, onClose, onSuccess }: Props) {
  const [selectedType, setSelectedType] = useState<ReportTypeKey>('AVAILABLE');
  const [newPrice, setNewPrice] = useState('');
  const [description, setDescription] = useState('');
  const [reporterContact, setReporterContact] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      let finalDescription = description.trim();
      if (selectedType === 'PRICE_CHANGED' && newPrice.trim()) {
        finalDescription = `[Giá mới: ${newPrice}đ/h] ${finalDescription}`;
      }

      await api.post('/api/admin/reports', {
        spotId: spot.id,
        spotName: spot.name,
        reportType: selectedType,
        description: finalDescription || `${REPORT_OPTIONS.find(o => o.key === selectedType)?.label} tại ${spot.name}`,
        reporterContact: reporterContact.trim()
      });

      setIsSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.error || 'Có lỗi xảy ra khi gửi báo cáo. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
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
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '24px 24px 0 0',
          padding: '20px 20px 36px',
          width: '100%',
          maxWidth: '520px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.8)',
          animation: 'slideUp 0.25s ease',
        }}
      >
        {/* Handle bar */}
        <div style={{ width: '40px', height: '4px', background: 'rgba(255, 255, 255, 0.25)', borderRadius: '2px', margin: '0 auto 16px' }} />

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.01em' }}>
              Báo cáo thông tin bãi xe
            </h2>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '2px' }}>
              {spot.name}
            </p>
          </div>
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

        {isSuccess ? (
          <div style={{ textAlign: 'center', padding: '24px 0 12px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '2px solid #10b981',
              color: '#10b981',
              fontSize: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              ✓
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
              Gửi báo cáo thành công!
            </h3>
            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.6, marginBottom: '24px' }}>
              Cảm ơn đóng góp của bạn! Thông tin sẽ giúp cộng đồng tài xế có dữ liệu đỗ xe chính xác và cập nhật theo thời gian thực.
            </p>
            <button
              onClick={onClose}
              style={{
                background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 32px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                width: '100%',
              }}
            >
              Hoàn tất
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Chọn loại báo cáo */}
            <div>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#cbd5e1', marginBottom: '8px', display: 'block' }}>
                Chọn tình trạng thực tế:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                {REPORT_OPTIONS.map((opt) => {
                  const isSelected = selectedType === opt.key;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setSelectedType(opt.key)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 14px',
                        borderRadius: '12px',
                        background: isSelected ? 'rgba(37, 99, 235, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                        border: `1.5px solid ${isSelected ? opt.color : 'rgba(255, 255, 255, 0.08)'}`,
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: isSelected ? '#ffffff' : '#e2e8f0' }}>
                          {opt.label}
                        </div>
                        <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                          {opt.desc}
                        </div>
                      </div>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        border: `2px solid ${isSelected ? opt.color : 'rgba(255, 255, 255, 0.3)'}`,
                        background: isSelected ? opt.color : 'transparent',
                        flexShrink: 0,
                        marginLeft: '12px',
                      }} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Nếu chọn Đổi giá: hiển thị ô nhập giá mới */}
            {selectedType === 'PRICE_CHANGED' && (
              <div style={{ animation: 'fadeIn 0.2s ease' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px', display: 'block' }}>
                  Giá gửi xe mới (VNĐ / giờ hoặc lượt):
                </label>
                <input
                  type="text"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  placeholder="VD: 30.000đ/giờ hoặc 50.000đ/lượt"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1.5px solid rgba(245, 158, 11, 0.5)',
                    color: '#ffffff',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            )}

            {/* Chi tiết ghi chú bổ sung */}
            <div>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px', display: 'block' }}>
                Ghi chú thêm (Tùy chọn):
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="VD: Đang sửa chữa đường vào, hoặc gửi xe ở cổng phụ số 2..."
                rows={2}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  fontSize: '13px',
                  outline: 'none',
                  resize: 'none',
                  boxSizing: 'border-box',
                  lineHeight: 1.5,
                }}
              />
            </div>

            {/* SĐT / Liên hệ (Tùy chọn) */}
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px', display: 'block' }}>
                Số điện thoại liên hệ xác thực (Tùy chọn):
              </label>
              <input
                type="tel"
                value={reporterContact}
                onChange={(e) => setReporterContact(e.target.value)}
                placeholder="VD: 0901234567"
                style={{
                  width: '100%',
                  padding: '9px 14px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {errorMessage && (
              <div style={{ color: '#fca5a5', fontSize: '13px', padding: '8px 12px', background: 'rgba(239, 68, 68, 0.15)', borderRadius: '8px' }}>
                {errorMessage}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '13px 20px',
                fontSize: '15px',
                fontWeight: 700,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.7 : 1,
                boxShadow: '0 4px 16px rgba(37, 99, 235, 0.4)',
                marginTop: '4px',
              }}
            >
              {isSubmitting ? 'Đang gửi thông tin...' : 'Gửi báo cáo cộng đồng'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
