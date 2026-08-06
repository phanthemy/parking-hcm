'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { useLocale } from '@/contexts/LocaleContext';
import type { SpotType } from '@/lib/types';

interface PostFormData {
  name: string;
  type: SpotType;
  address: string;
  latitude: string;
  longitude: string;
  description: string;
  phone: string;
  website: string;
  carSlots: string;
  bikeSlots: string;
  pricePerHourCar: string;
  pricePerHourBike: string;
  openTime: string;
  closeTime: string;
  services: string;
  menuItems: { name: string; price: string; description: string }[];
  promotionTitle: string;
  promotionDescription: string;
}

const initialFormData: PostFormData = {
  name: '',
  type: 'PARKING_LOT',
  address: '',
  latitude: '',
  longitude: '',
  description: '',
  phone: '',
  website: '',
  carSlots: '',
  bikeSlots: '',
  pricePerHourCar: '',
  pricePerHourBike: '',
  openTime: '06:00',
  closeTime: '22:00',
  services: '',
  menuItems: [{ name: '', price: '', description: '' }],
  promotionTitle: '',
  promotionDescription: '',
};

export default function BusinessPostPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [form, setForm] = useState<PostFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { t } = useLocale();

  // Auto-fill GPS from browser
  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        updateField('latitude', pos.coords.latitude.toString());
        updateField('longitude', pos.coords.longitude.toString());
      });
    }
  };

  const updateField = <K extends keyof PostFormData>(field: K, value: PostFormData[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const addMenuItem = () => {
    setForm((prev) => ({
      ...prev,
      menuItems: [...prev.menuItems, { name: '', price: '', description: '' }],
    }));
  };

  const updateMenuItem = (index: number, field: string, value: string) => {
    setForm((prev) => {
      const items = [...prev.menuItems];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, menuItems: items };
    });
  };

  const removeMenuItem = (index: number) => {
    setForm((prev) => ({
      ...prev,
      menuItems: prev.menuItems.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.name || !form.address || !form.phone) {
      setError(t('required_fields_error'));
      return;
    }

    setIsSubmitting(true);
    try {
      const body = {
        name: form.name,
        type: form.type,
        address: form.address,
        latitude: parseFloat(form.latitude) || 10.7769,
        longitude: parseFloat(form.longitude) || 106.7009,
        description: form.description,
        phone: form.phone,
        website: form.website,
        carSlots: parseInt(form.carSlots) || 0,
        bikeSlots: parseInt(form.bikeSlots) || 0,
        pricePerHourCar: parseInt(form.pricePerHourCar) || undefined,
        pricePerHourBike: parseInt(form.pricePerHourBike) || undefined,
        openTime: form.openTime,
        closeTime: form.closeTime,
        services: form.services
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        menu: form.menuItems
          .filter((m) => m.name)
          .map((m) => ({
            name: m.name,
            price: parseInt(m.price) || 0,
            description: m.description,
          })),
        promotions: form.promotionTitle
          ? [{ title: form.promotionTitle, description: form.promotionDescription }]
          : [],
      };

      await api.post('/api/spots', body);
      setSuccess(true);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setError(apiErr.message || t('post_error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: 'var(--radius-md, 8px)',
    border: '1px solid var(--border-color, rgba(255,255,255,0.15))',
    background: 'var(--bg-tertiary, rgba(255,255,255,0.05))',
    color: 'inherit',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 500,
    marginBottom: '6px',
    opacity: 0.8,
  };

  if (success) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
          <div className="card" style={{ padding: '40px', textAlign: 'center', maxWidth: '400px' }}>
            <p style={{ fontSize: '48px', marginBottom: '12px' }}>🎉</p>
             <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>{t('post_success')}</h2>
            <p style={{ fontSize: '14px', opacity: 0.6, marginBottom: '24px' }}>
               {t('post_pending')}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <Link href="/business/dashboard">
                <button className="btn-primary">📊 {t('to_dashboard')}</button>
              </Link>
              <button className="btn-secondary" onClick={() => { setSuccess(false); setForm(initialFormData); }}>
                ➕ {t('post_another')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />

      <main className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', flex: 1 }}>
        <Link href="/" style={{ display: 'inline-flex', fontSize: '14px', opacity: 0.7, marginBottom: '16px' }}>
          ← {t('back_to_map')}
        </Link>

        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>➕ {t('post_spot_title')}</h1>

        <form onSubmit={handleSubmit}>
          {/* Basic Info */}
          <div className="card" style={{ padding: '24px', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>📋 {t('basic_info')}</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div>
                <label style={labelStyle}>{t('name_label')}</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="VD: Bãi xe Nguyễn Huệ"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>{t('type_label')}</label>
                <select
                  value={form.type}
                  onChange={(e) => updateField('type', e.target.value as SpotType)}
                  style={inputStyle}
                >
                  <option value="PARKING_LOT">{t('type_parking')}</option>
                  <option value="RESTAURANT">{t('type_restaurant')}</option>
                  <option value="CAFE">{t('type_cafe')}</option>
                  <option value="RESTROOM">{t('type_restroom')}</option>
                  <option value="SERVICE">{t('type_service')}</option>
                </select>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>{t('address_label')}</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  placeholder="VD: 123 Nguyễn Huệ, Quận 1, TP.HCM"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>{t('latitude')}</label>
                <input
                  type="text"
                  value={form.latitude}
                  onChange={(e) => updateField('latitude', e.target.value)}
                  placeholder="VD: 10.7735"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>{t('longitude')}</label>
                <input
                  type="text"
                  value={form.longitude}
                  onChange={(e) => updateField('longitude', e.target.value)}
                  placeholder="VD: 106.7031"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>&nbsp;</label>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={getLocation}
                  style={{ ...inputStyle, cursor: 'pointer', textAlign: 'center' }}
                >
                  📍 {t('get_location')}
                </button>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>{t('description')}</label>
                <textarea
                  value={form.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Mô tả chi tiết về bãi xe, dịch vụ..."
                  rows={4}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>
            </div>
          </div>

          {/* Parking Details */}
          <div className="card" style={{ padding: '24px', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>🚗 {t('parking_and_price')}</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div>
                <label style={labelStyle}>{t('car_slots_label')}</label>
                <input
                  type="number"
                  value={form.carSlots}
                  onChange={(e) => updateField('carSlots', e.target.value)}
                  placeholder="0"
                  min="0"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>{t('bike_slots_label')}</label>
                <input
                  type="number"
                  value={form.bikeSlots}
                  onChange={(e) => updateField('bikeSlots', e.target.value)}
                  placeholder="0"
                  min="0"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>{t('car_price_label')}</label>
                <input
                  type="number"
                  value={form.pricePerHourCar}
                  onChange={(e) => updateField('pricePerHourCar', e.target.value)}
                  placeholder="30000"
                  min="0"
                  step="1000"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>{t('bike_price_label')}</label>
                <input
                  type="number"
                  value={form.pricePerHourBike}
                  onChange={(e) => updateField('pricePerHourBike', e.target.value)}
                  placeholder="5000"
                  min="0"
                  step="1000"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>{t('open_time')}</label>
                <input
                  type="time"
                  value={form.openTime}
                  onChange={(e) => updateField('openTime', e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>{t('close_time')}</label>
                <input
                  type="time"
                  value={form.closeTime}
                  onChange={(e) => updateField('closeTime', e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="card" style={{ padding: '24px', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>📞 {t('contact')}</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div>
                <label style={labelStyle}>{t('phone_label')}</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="0901234567"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Website</label>
                <input
                  type="url"
                  value={form.website}
                  onChange={(e) => updateField('website', e.target.value)}
                  placeholder="https://example.com"
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="card" style={{ padding: '24px', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>🔧 {t('services')}</h2>
            <label style={labelStyle}>{t('services_hint')}</label>
            <input
              type="text"
              value={form.services}
              onChange={(e) => updateField('services', e.target.value)}
              placeholder="Rửa xe, Bảo vệ 24/7, WiFi miễn phí..."
              style={inputStyle}
            />
          </div>

          {/* Menu (for restaurants/cafes) */}
          {(form.type === 'RESTAURANT' || form.type === 'CAFE') && (
            <div className="card" style={{ padding: '24px', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>🍽️ {t('menu')}</h2>

              {form.menuItems.map((item, index) => (
                <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '12px', alignItems: 'flex-end' }}>
                  <div style={{ flex: 2 }}>
                    {index === 0 && <label style={labelStyle}>Tên món</label>}
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateMenuItem(index, 'name', e.target.value)}
                      placeholder="Tên món"
                      style={inputStyle}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    {index === 0 && <label style={labelStyle}>Giá (VNĐ)</label>}
                    <input
                      type="number"
                      value={item.price}
                      onChange={(e) => updateMenuItem(index, 'price', e.target.value)}
                      placeholder="50000"
                      style={inputStyle}
                    />
                  </div>
                  <div style={{ flex: 2 }}>
                    {index === 0 && <label style={labelStyle}>Mô tả</label>}
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateMenuItem(index, 'description', e.target.value)}
                      placeholder="Mô tả ngắn"
                      style={inputStyle}
                    />
                  </div>
                  {form.menuItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMenuItem(index)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        fontSize: '18px',
                        padding: '10px',
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                className="btn-secondary"
                onClick={addMenuItem}
                style={{ fontSize: '13px', marginTop: '8px' }}
              >
                ➕ {t('add_dish')}
              </button>
            </div>
          )}

          {/* Promotion */}
          <div className="card" style={{ padding: '24px', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>🎁 {t('promotions')}</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>{t('promo_title')}</label>
                <input
                  type="text"
                  value={form.promotionTitle}
                  onChange={(e) => updateField('promotionTitle', e.target.value)}
                  placeholder="VD: Giảm 20% cho khách hàng mới"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>{t('promo_desc')}</label>
                <textarea
                  value={form.promotionDescription}
                  onChange={(e) => updateField('promotionDescription', e.target.value)}
                  placeholder="Chi tiết ưu đãi..."
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p style={{ color: '#ef4444', fontSize: '14px', marginBottom: '16px', textAlign: 'center' }}>
              ⚠️ {error}
            </p>
          )}

          {/* Submit */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginBottom: '40px' }}>
            <Link href="/business/dashboard">
              <button type="button" className="btn-secondary" style={{ padding: '14px 28px' }}>
                {t('cancel')}
              </button>
            </Link>
            <button
              className="btn-primary"
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '14px 28px',
                fontSize: '15px',
                fontWeight: 600,
                opacity: isSubmitting ? 0.6 : 1,
              }}
            >
              {isSubmitting ? '⏳ ' + t('submitting') : '📤 ' + t('submit_post')}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
