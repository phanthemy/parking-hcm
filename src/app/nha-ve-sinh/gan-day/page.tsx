import { Metadata } from 'next';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { getDistrictFromAddress } from '@/lib/district';

export const metadata: Metadata = {
  title: 'Nhà vệ sinh công cộng gần đây TP.HCM – Tìm WC công cộng | MapGo.vn',
  description: 'Tìm nhà vệ sinh công cộng gần đây tại TP.HCM theo GPS. Vị trí WC công cộng gần Bến Thành, trung tâm Quận 1, công viên — miễn phí, cập nhật liên tục.',
  keywords: [
    'nhà vệ sinh công cộng gần đây TP.HCM',
    'nhà vệ sinh gần đây',
    'WC công cộng Sài Gòn',
    'nhà vệ sinh công cộng gần Bến Thành',
    'tìm nhà vệ sinh gần đây',
    'toilet công cộng TP.HCM',
  ],
  alternates: { canonical: 'https://mapgo.vn/nha-ve-sinh/gan-day' },
};

export default async function NhaVeSinhPage() {
  let spots: { id: string; slug: string | null; name: string; address: string; openTime: string | null; closeTime: string | null }[] = [];
  try {
    spots = await prisma.parkingSpot.findMany({
      where: {
        status: { in: ['active', 'ACTIVE'] },
        type: { in: ['RESTROOM', 'toilet', 'REST_ROOM'] },
      },
      select: { id: true, slug: true, name: true, address: true, openTime: true, closeTime: true },
      take: 60,
    });
  } catch (e) {
    console.error('DB error:', e);
  }

  const byDistrict = spots.reduce((acc, spot) => {
    const d = getDistrictFromAddress(spot.address);
    if (!acc[d]) acc[d] = [];
    acc[d].push(spot);
    return acc;
  }, {} as Record<string, typeof spots>);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 16px', color: '#e2e8f0', minHeight: '100vh' }}>
      {/* Breadcrumb */}
      <nav style={{ fontSize: 14, color: '#94a3b8', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Link href="/" style={{ color: '#818cf8', textDecoration: 'none', fontWeight: 500 }}>MapGo.vn</Link>
        <span>›</span>
        <span style={{ color: '#cbd5e1' }}>Nhà vệ sinh công cộng gần đây</span>
      </nav>

      {/* Main Heading */}
      <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 12, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1.3 }}>
        🚻 Nhà vệ sinh công cộng gần đây tại TP.HCM
      </h1>
      <p style={{ color: '#94a3b8', marginBottom: 28, lineHeight: 1.7, fontSize: 16 }}>
        Danh sách <strong>{spots.length} nhà vệ sinh công cộng, WC sạch sẽ</strong> tại TP.HCM.
        Bật định vị GPS để tìm điểm vệ sinh gần nhất — mở cửa 24/7 hoặc theo giờ hành chính.
      </p>

      {/* CTA Button */}
      <div style={{ marginBottom: 36 }}>
        <Link
          href="/?type=RESTROOM"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            color: '#ffffff',
            padding: '14px 28px',
            borderRadius: 999,
            fontWeight: 700,
            fontSize: 15,
            textDecoration: 'none',
            boxShadow: '0 4px 14px rgba(59, 130, 246, 0.35)',
            transition: 'transform 0.2s',
          }}
        >
          📍 Tìm nhà vệ sinh gần tôi nhất trên bản đồ
        </Link>
      </div>

      {/* Info Tip */}
      <div style={{
        background: 'rgba(59, 130, 246, 0.1)',
        border: '1px solid rgba(59, 130, 246, 0.25)',
        borderRadius: 12,
        padding: '16px 20px',
        marginBottom: 36,
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }}>
        <span style={{ fontSize: 20 }}>💡</span>
        <p style={{ margin: 0, color: '#93c5fd', fontSize: 14, lineHeight: 1.5 }}>
          Truy cập <Link href="/" style={{ color: '#60a5fa', fontWeight: 600 }}>mapgo.vn</Link> trên điện thoại và bấm <strong>Bật định vị</strong> để hệ thống tự động lọc nhà vệ sinh trong bán kính 1km gần bạn nhất.
        </p>
      </div>

      {/* Grouped by district */}
      {Object.keys(byDistrict).length > 0 ? (
        Object.entries(byDistrict).map(([district, distSpots]) => (
          <div key={district} style={{ marginBottom: 36 }}>
            <h2 style={{
              fontSize: 20,
              fontWeight: 700,
              color: '#f8fafc',
              marginBottom: 16,
              borderLeft: '4px solid #3b82f6',
              paddingLeft: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span>🚻 Nhà vệ sinh tại {district}</span>
              <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 400 }}>{distSpots.length} địa điểm</span>
            </h2>

            <div style={{ display: 'grid', gap: 12 }}>
              {distSpots.map((spot) => (
                <Link
                  key={spot.id}
                  href={`/spot/${spot.id}`}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 12,
                    padding: '16px 20px',
                    textDecoration: 'none',
                    color: '#ffffff',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0, paddingRight: 16 }}>
                    <div style={{ fontWeight: 700, fontSize: 16, color: '#ffffff', marginBottom: 4 }}>
                      🚻 {spot.name}
                    </div>
                    <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5 }}>
                      📍 {spot.address}
                    </div>
                    {(spot.openTime || spot.closeTime) && (
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                        🕒 {spot.openTime || '06:00'} - {spot.closeTime || '22:00'}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                    <span style={{
                      background: 'rgba(59, 130, 246, 0.15)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      color: '#60a5fa',
                      padding: '4px 12px',
                      borderRadius: 99,
                      fontSize: 13,
                      fontWeight: 600,
                      whiteSpace: 'nowrap'
                    }}>
                      WC Công cộng
                    </span>
                    <span style={{ fontSize: 12, color: '#818cf8', fontWeight: 500 }}>
                      Chỉ đường GPS →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 12,
          padding: '32px 24px',
          textAlign: 'center',
          color: '#94a3b8'
        }}>
          <p style={{ margin: 0, fontSize: 15 }}>Đang tải danh sách nhà vệ sinh công cộng...</p>
        </div>
      )}

      {/* Internal Links */}
      <div style={{
        marginTop: 48,
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 16,
        padding: '24px'
      }}>
        <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16, color: '#ffffff' }}>
          🔍 Tiện ích khác tại TP.HCM
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <Link href="/quan-an/co-bai-xe" style={{ padding: '8px 18px', borderRadius: 99, background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#fbbf24', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
            🍜 Quán ăn có bãi xe ô tô
          </Link>
          <Link href="/cafe/co-bai-xe" style={{ padding: '8px 18px', borderRadius: 99, background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
            ☕ Quán cafe có chỗ đậu xe
          </Link>
          <Link href="/bai-do-xe-tphcm" style={{ padding: '8px 18px', borderRadius: 99, background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', color: '#a5b4fc', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
            🅿️ Toàn bộ bãi giữ xe TP.HCM
          </Link>
          <Link href="/bai-do-xe/quan-1" style={{ padding: '8px 18px', borderRadius: 99, background: 'rgba(168, 85, 247, 0.15)', border: '1px solid rgba(168, 85, 247, 0.3)', color: '#c084fc', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
            🅿️ Bãi giữ xe Quận 1
          </Link>
        </div>
      </div>

      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'Nhà vệ sinh công cộng gần đây TP.HCM',
            url: 'https://mapgo.vn/nha-ve-sinh/gan-day',
            numberOfItems: spots.length,
            itemListElement: spots.slice(0, 20).map((s, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: s.name,
              url: `https://mapgo.vn/spot/${s.id}`,
            })),
          }),
        }}
      />
    </div>
  );
}
