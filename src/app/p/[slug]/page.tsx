import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import pool from '@/lib/pg';
import DeepLinkClientActions from './DeepLinkClientActions';
import { SPOT_TYPE_LABELS, SPOT_TYPE_ICONS } from '@/lib/types';
import { formatCurrency, formatHours, formatPhone } from '@/lib/format';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getSpotBySlugOrId(slug: string) {
  try {
    const isNumeric = /^\d+$/.test(slug);
    const query = isNumeric
      ? `SELECT *, lat as latitude, lon as longitude FROM places WHERE id = $1 AND status = 'ACTIVE' LIMIT 1;`
      : `SELECT *, lat as latitude, lon as longitude FROM places WHERE slug = $1 AND status = 'ACTIVE' LIMIT 1;`;

    const res = await pool.query(query, [isNumeric ? parseInt(slug, 10) : slug]);
    if (res.rows.length === 0) {
      // Fallback try matching by clean slug
      const fallbackQuery = `SELECT *, lat as latitude, lon as longitude FROM places WHERE slug ILIKE $1 AND status = 'ACTIVE' LIMIT 1;`;
      const fbRes = await pool.query(fallbackQuery, [`%${slug}%`]);
      if (fbRes.rows.length > 0) return fbRes.rows[0];
      return null;
    }
    return res.rows[0];
  } catch (error) {
    console.error('Error fetching spot in /p/[slug]:', error);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const spot = await getSpotBySlugOrId(slug);

  if (!spot) {
    return {
      title: 'Địa điểm không tồn tại | MapGo.vn',
      description: 'Không tìm thấy bãi đỗ xe hoặc địa điểm yêu cầu trên hệ thống MapGo.vn',
    };
  }

  const spotName = spot.name || 'Bãi đỗ xe';
  const spotAddress = spot.address || 'TP. Hồ Chí Minh';
  const priceCar = spot.price_info ? `${parseInt(spot.price_info, 10).toLocaleString('vi-VN')}đ/h` : 'Giá niêm yết';
  const carSlots = spot.car_slots ? `${spot.car_slots} chỗ ô tô` : 'Có chỗ đỗ ô tô & xe máy';

  const title = `${spotName} – ${spotAddress} | MapGo.vn`;
  const description = `${spotName} tại ${spotAddress}. ${carSlots}, giá từ ${priceCar}. Mở cửa ${spot.open_time || '06:00'} - ${spot.close_time || '22:00'}. Chỉ đường GPS 1-chạm trên MapGo.vn.`;
  const canonicalUrl = `https://mapgo.vn/p/${spot.slug || slug}`;
  const imageUrl = spot.image_url || 'https://mapgo.vn/logo.png';

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'MapGo.vn',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: spotName,
        },
      ],
      type: 'website',
      locale: 'vi_VN',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
      creator: '@MapGoVN',
    },
  };
}

export default async function DeepLinkSpotPage({ params }: PageProps) {
  const { slug } = await params;
  const rawSpot = await getSpotBySlugOrId(slug);

  if (!rawSpot) {
    notFound();
  }

  const spot = {
    id: rawSpot.id.toString(),
    slug: rawSpot.slug || `spot-${rawSpot.id}`,
    name: rawSpot.name,
    type: rawSpot.category === 'PARKING' ? 'PARKING_LOT' : rawSpot.category,
    address: rawSpot.address || 'TP. Hồ Chí Minh',
    latitude: parseFloat(rawSpot.latitude),
    longitude: parseFloat(rawSpot.longitude),
    phone: rawSpot.phone || '',
    openTime: rawSpot.open_time || '06:00',
    closeTime: rawSpot.close_time || '22:00',
    pricePerHourCar: rawSpot.price_info ? parseInt(rawSpot.price_info, 10) : 20000,
    pricePerHourBike: rawSpot.price_info ? Math.round(parseInt(rawSpot.price_info, 10) / 4) : 5000,
    carSlots: rawSpot.car_slots || 0,
    bikeSlots: rawSpot.bike_slots || 0,
    rating: rawSpot.rating || 5.0,
    reviewCount: rawSpot.review_count || 0,
    verified: rawSpot.verified || false,
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ParkingFacility',
    name: spot.name,
    address: {
      '@type': 'PostalAddress',
      streetAddress: spot.address,
      addressLocality: 'Hồ Chí Minh',
      addressRegion: 'TP.HCM',
      addressCountry: 'VN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: spot.latitude,
      longitude: spot.longitude,
    },
    openingHours: `${spot.openTime}-${spot.closeTime}`,
    priceRange: `${spot.pricePerHourBike}đ - ${spot.pricePerHourCar}đ`,
    telephone: spot.phone || '+84900000000',
    url: `https://mapgo.vn/p/${spot.slug}`,
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '20px 16px 60px', color: '#f8fafc', minHeight: '100vh' }}>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="/logo.png" alt="MapGo" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
          </div>
          <span style={{ fontSize: '16px', fontWeight: 800, color: '#ffffff' }}>MapGo.vn</span>
        </Link>
        <Link href="/" style={{ color: '#818cf8', fontSize: '13px', textDecoration: 'none', fontWeight: 600 }}>
          ← Về Bản đồ chính
        </Link>
      </div>

      {/* Main Spot Card */}
      <div
        style={{
          background: 'rgba(30, 41, 59, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.4)',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
          <span style={{ background: 'rgba(37, 99, 235, 0.2)', border: '1px solid rgba(37, 99, 235, 0.4)', color: '#93c5fd', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 700 }}>
            {SPOT_TYPE_LABELS[spot.type as any] || 'Bãi đỗ xe'}
          </span>
          {spot.verified && (
            <span style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#6ee7b7', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 700 }}>
              ✓ Đã xác thực thực địa
            </span>
          )}
        </div>

        <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#ffffff', lineHeight: 1.3, marginBottom: '8px' }}>
          {spot.name}
        </h1>

        <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.5, marginBottom: '18px' }}>
          📍 {spot.address}
        </p>

        {/* Feature Specs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: '12px', padding: '12px' }}>
            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>SỨC CHỨA</div>
            <div style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: 600 }}>🚗 {spot.carSlots || 15} ô tô</div>
            <div style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: 600 }}>🏍️ {spot.bikeSlots || 100} xe máy</div>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: '12px', padding: '12px' }}>
            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>GIÁ THAM KHẢO</div>
            <div style={{ fontSize: '13px', color: '#38bdf8', fontWeight: 700 }}>🚗 {formatCurrency(spot.pricePerHourCar)}/h</div>
            <div style={{ fontSize: '13px', color: '#38bdf8', fontWeight: 700 }}>🏍️ {formatCurrency(spot.pricePerHourBike)}/h</div>
          </div>
        </div>

        {/* Hours & Phone */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px', fontSize: '13px', color: '#cbd5e1' }}>
          <div>⏰ Giờ mở cửa: <strong style={{ color: '#fff' }}>{spot.openTime} – {spot.closeTime}</strong></div>
          {spot.phone && (
            <div>📞 Điện thoại: <a href={`tel:${spot.phone}`} style={{ color: '#60a5fa', textDecoration: 'none', fontWeight: 600 }}>{formatPhone(spot.phone)}</a></div>
          )}
        </div>

        {/* Client Interactive Actions: Open MapGo, Google Maps, Share, Copy Link, Save */}
        <DeepLinkClientActions spot={spot} />
      </div>

      {/* Footer Banner */}
      <div style={{ textAlign: 'center', color: '#64748b', fontSize: '12px' }}>
        MapGo.vn • Trợ lý tìm bãi đỗ xe và tiện ích đường phố TP.HCM
      </div>
    </div>
  );
}
