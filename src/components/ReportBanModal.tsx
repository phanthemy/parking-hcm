'use client';

import React, { useState } from 'react';
import api from '@/lib/api';

interface Props {
  lat: number;
  lng: number;
  onClose: () => void;
  onSuccess: () => void;
}

const TIME_PRESETS = [
  { label: '🌅 Sáng\n6–9h', value: '06:00-09:00', short: 'Sáng 6-9h' },
  { label: '🌆 Chiều\n16–19h', value: '16:00-19:00', short: 'Chiều 16-19h' },
  { label: '🌅🌆 Cả 2\ncao điểm', value: '06:00-09:00,16:00-19:00', short: 'Sáng + Chiều' },
  { label: '☀️ Cả ngày\n6–22h', value: '06:00-22:00', short: 'Cả ngày' },
  { label: '✏️ Tự\nnhập', value: 'custom', short: 'Tự nhập' },
];

const BAN_TYPES = [
  { v: 'NO_PARKING', label: '🅿️ Cấm đậu', hint: 'Không được đỗ xe' },
  { v: 'NO_STOPPING', label: '⛔ Cấm dừng', hint: 'Không được dừng, kể cả chớp nhoáng' },
  { v: 'TIME_LIMITED', label: '⏱️ Giới hạn giờ', hint: 'Chỉ đậu được trong khung giờ nhất định' },
];

const BAN_DAYS = [
  { v: 'ALL', label: '📆 Hằng ngày' },
  { v: 'WEEKDAY', label: '🗓️ Thứ 2–6' },
  { v: 'WEEKEND', label: '🎉 T7–CN' },
];

export default function ReportBanModal({ lat, lng, onClose, onSuccess }: Props) {
  const [street, setStreet] = useState('');
  const [banType, setBanType] = useState('NO_PARKING');
  const [banDays, setBanDays] = useState('ALL');
  const [timePreset, setTimePreset] = useState('');
  const [customTime, setCustomTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const banTimeRanges = timePreset === 'custom' ? customTime : timePreset;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!street.trim()) { setError('Vui lòng nhập tên đường'); return; }
    if (!banTimeRanges) { setError('Vui lòng chọn khung giờ cấm'); return; }

    setLoading(true);
    setError('');
    try {
      await api.post('/api/bans', { lat, lng, street, banTimeRanges, banType, banDays });
      setDone(true);
    } catch {
      setError('Có lỗi xảy ra, thử lại sau');
    } finally {
      setLoading(false);
    }
  };

  const chipStyle = (active: boolean, color = '#6366f1') => ({
    padding: '6px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
    background: active ? `${color}33` : 'rgba(255,255,255,0.05)',
    border: `1.5px solid ${active ? color : 'rgba(255,255,255,0.1)'}`,
    color: active ? '#fff' : '#9ca3af',
    fontWeight: active ? 700 : 400,
    transition: 'all 0.15s',
    whiteSpace: 'nowrap' as const,
  });

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'linear-gradient(160deg,#1a1a2e 0%,#16213e 100%)',
          border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: '24px 24px 0 0',
          padding: '20px 20px 40px',
          width: '100%', maxWidth: 480,
          maxHeight: '92vh', overflowY: 'auto',
        }}
      >
        {/* Drag handle */}
        <div style={{ width: 36, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2, margin: '0 auto 18px' }} />

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>🚫 Biển cấm đậu xe</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>Crowdsource từ cộng đồng tài xế</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: 22, cursor: 'pointer', padding: 4 }}>✕</button>
        </div>

        {/* HOW IT WORKS — giải thích 2 chiều sử dụng */}
        <div style={{
          background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)',
          borderRadius: 14, padding: '14px 16px', marginBottom: 20,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#a5b4fc', marginBottom: 10 }}>
            💡 Tính năng này hoạt động thế nào?
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>🗺️</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#d1d5db' }}>Xem biển cấm trên bản đồ</div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                  Các vòng tròn đỏ <strong style={{ color: '#f87171' }}>🚫</strong> trên bản đồ = khu vực có biển cấm đậu/dừng.
                  Bấm vào để xem giờ cấm và loại cấm.
                </div>
              </div>
            </div>
            <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>📝</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#d1d5db' }}>Báo biển cấm mới</div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                  Bạn thấy biển cấm ngoài đường chưa có trên app? Điền form bên dưới.
                  Sau khi <strong style={{ color: '#a5b4fc' }}>≥3 người xác nhận</strong>, biển sẽ tự động hiện trên bản đồ.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer nhỏ gọn */}
        <div style={{ fontSize: 11, color: '#d97706', marginBottom: 18, padding: '8px 12px', background: 'rgba(234,179,8,0.08)', borderRadius: 8, borderLeft: '3px solid #d97706' }}>
          ⚠️ Chỉ mang tính tham khảo. Tài xế tự xác minh biển báo thực tế trước khi đậu xe.
        </div>

        {done ? (
          /* Success state */
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>✅</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Gửi thành công!</div>
            <div style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.6, marginBottom: 24 }}>
              Cảm ơn bạn đã đóng góp!<br />
              Báo cáo sẽ hiện trên bản đồ sau khi <strong style={{ color: '#a5b4fc' }}>3 tài xế xác nhận</strong>.
            </div>
            <button
              onClick={onClose}
              style={{ padding: '12px 32px', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', color: '#fff' }}
            >
              Đóng
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Bước 1: Tên đường */}
            <div>
              <label style={{ fontSize: 13, color: '#d1d5db', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
                <span style={{ background: 'rgba(239,68,68,0.2)', color: '#f87171', borderRadius: '50%', width: 20, height: 20, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 }}>1</span>
                Đường / khu vực có biển cấm *
              </label>
              <input
                value={street} onChange={e => setStreet(e.target.value)}
                placeholder="VD: Lê Lợi đoạn trước Vincom (Q1)"
                style={{
                  width: '100%', padding: '11px 14px', borderRadius: 10, boxSizing: 'border-box',
                  background: 'rgba(255,255,255,0.06)', border: `1.5px solid ${street ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.12)'}`,
                  color: '#fff', fontSize: 14, outline: 'none',
                }}
              />
            </div>

            {/* Bước 2: Khung giờ */}
            <div>
              <label style={{ fontSize: 13, color: '#d1d5db', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
                <span style={{ background: 'rgba(239,68,68,0.2)', color: '#f87171', borderRadius: '50%', width: 20, height: 20, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 }}>2</span>
                Khung giờ cấm *
              </label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {TIME_PRESETS.map(p => (
                  <button
                    key={p.value} type="button"
                    onClick={() => setTimePreset(p.value)}
                    style={chipStyle(timePreset === p.value, '#6366f1')}
                  >
                    {p.short}
                  </button>
                ))}
              </div>
              {timePreset === 'custom' && (
                <input
                  value={customTime} onChange={e => setCustomTime(e.target.value)}
                  placeholder="VD: 06:00-09:00,16:00-19:00"
                  style={{
                    marginTop: 8, padding: '10px 14px', borderRadius: 8, boxSizing: 'border-box',
                    background: 'rgba(255,255,255,0.05)', border: '1.5px solid #6366f1',
                    color: '#fff', fontSize: 13, outline: 'none', width: '100%',
                  }}
                />
              )}
            </div>

            {/* Bước 3: Loại cấm + Ngày — cùng hàng */}
            <div>
              <label style={{ fontSize: 13, color: '#d1d5db', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
                <span style={{ background: 'rgba(239,68,68,0.2)', color: '#f87171', borderRadius: '50%', width: 20, height: 20, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 }}>3</span>
                Loại cấm &amp; Ngày áp dụng
              </label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                {BAN_TYPES.map(opt => (
                  <button key={opt.v} type="button" onClick={() => setBanType(opt.v)} style={chipStyle(banType === opt.v, '#ef4444')}>
                    {opt.label}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {BAN_DAYS.map(opt => (
                  <button key={opt.v} type="button" onClick={() => setBanDays(opt.v)} style={{ ...chipStyle(banDays === opt.v, '#10b981'), flex: 1 }}>
                    {opt.label}
                  </button>
                ))}
              </div>
              {/* Hint cho loại đang chọn */}
              <div style={{ fontSize: 11, color: '#6b7280', marginTop: 6 }}>
                ℹ️ {BAN_TYPES.find(b => b.v === banType)?.hint}
              </div>
            </div>

            {error && (
              <div style={{ color: '#fca5a5', fontSize: 13, padding: '8px 12px', background: 'rgba(239,68,68,0.1)', borderRadius: 8, display: 'flex', gap: 6, alignItems: 'center' }}>
                ❌ {error}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              style={{
                padding: '14px', borderRadius: 14, fontSize: 16, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer',
                background: loading ? 'rgba(99,102,241,0.3)' : 'linear-gradient(135deg,#ef4444,#dc2626)',
                border: 'none', color: '#fff',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(239,68,68,0.35)',
                transition: 'all 0.2s',
              }}
            >
              {loading ? '⏳ Đang gửi...' : '🚫 Gửi báo cáo'}
            </button>

            <p style={{ fontSize: 11, color: '#4b5563', textAlign: 'center', margin: 0, lineHeight: 1.6 }}>
              📍 Tọa độ: {lat.toFixed(4)}, {lng.toFixed(4)} &nbsp;·&nbsp; Cần ≥3 xác nhận để tự động duyệt
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
