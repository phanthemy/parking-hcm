'use client';

import React, { useState } from 'react';
import StarRating from './StarRating';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';

interface ReviewFormProps {
  spotId: string;
  onReviewSubmitted?: () => void;
}

export default function ReviewForm({ spotId, onReviewSubmitted }: ReviewFormProps) {
  const { isAuthenticated } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isAuthenticated) {
    return (
      <div
        className="card"
        style={{
          padding: '24px',
          textAlign: 'center',
        }}
      >
        <p style={{ fontSize: '15px', marginBottom: '12px', opacity: 0.8 }}>
          🔒 Đăng nhập để viết đánh giá
        </p>
        <a href="/auth/login">
          <button className="btn-primary" style={{ padding: '10px 24px' }}>
            Đăng nhập
          </button>
        </a>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (rating === 0) {
      setError('Vui lòng chọn số sao đánh giá');
      return;
    }
    if (comment.trim().length < 10) {
      setError('Nhận xét phải có ít nhất 10 ký tự');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post(`/api/spots/${spotId}/reviews`, { rating, comment });
      setSuccess(true);
      setRating(0);
      setComment('');
      if (onReviewSubmitted) onReviewSubmitted();
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setError(apiErr.message || 'Không thể gửi đánh giá. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div
        className="card"
        style={{
          padding: '24px',
          textAlign: 'center',
        }}
      >
        <p style={{ fontSize: '24px', marginBottom: '8px' }}>✅</p>
        <p style={{ fontSize: '15px', fontWeight: 600 }}>Cảm ơn bạn đã đánh giá!</p>
        <p style={{ fontSize: '13px', opacity: 0.7, marginTop: '4px' }}>
          Đánh giá của bạn đã được gửi thành công.
        </p>
        <button
          className="btn-secondary"
          onClick={() => setSuccess(false)}
          style={{ marginTop: '12px', fontSize: '13px' }}
        >
          Viết đánh giá khác
        </button>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: '24px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
        ✍️ Viết đánh giá
      </h3>

      <form onSubmit={handleSubmit}>
        {/* Rating */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '13px', opacity: 0.7, marginBottom: '8px', display: 'block' }}>
            Đánh giá sao *
          </label>
          <StarRating rating={rating} size="lg" interactive onChange={setRating} showValue={false} />
        </div>

        {/* Comment */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '13px', opacity: 0.7, marginBottom: '8px', display: 'block' }}>
            Nhận xét *
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Chia sẻ trải nghiệm của bạn về bãi xe này..."
            rows={4}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 'var(--radius-md, 8px)',
              border: '1px solid var(--border-color, rgba(255,255,255,0.15))',
              background: 'var(--bg-tertiary, rgba(255,255,255,0.05))',
              color: 'inherit',
              fontSize: '14px',
              resize: 'vertical',
              outline: 'none',
              transition: 'border-color 0.2s ease',
            }}
          />
        </div>

        {/* Error */}
        {error && (
          <p style={{ color: '#ef4444', fontSize: '13px', marginBottom: '12px' }}>
            ⚠️ {error}
          </p>
        )}

        {/* Submit */}
        <button
          className="btn-primary"
          type="submit"
          disabled={isSubmitting}
          style={{
            width: '100%',
            padding: '12px',
            opacity: isSubmitting ? 0.6 : 1,
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
          }}
        >
          {isSubmitting ? '⏳ Đang gửi...' : '📤 Gửi đánh giá'}
        </button>
      </form>
    </div>
  );
}
