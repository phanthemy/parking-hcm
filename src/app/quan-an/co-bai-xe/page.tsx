import { Metadata } from 'next';
import Link from 'next/link';
import prisma from '@/lib/prisma';

export const metadata: Metadata = {
  title: 'Quán ăn có bãi giữ xe ô tô TP.HCM – Nhà hàng có chỗ đậu xe | MapGo.vn',
  description: 'Danh sách quán ăn, nhà hàng có bãi giữ xe, chỗ đậu xe ô tô rộng rãi tại TP.HCM theo từng Quận. Tìm nhanh qua bản đồ GPS, cập nhật mới nhất 2026.',
  keywords: [
    'quán ăn có chỗ đậu ô tô Quận 1',
    'quán ăn có bãi giữ xe TP.HCM',
    'nhà hàng có bãi xe ô tô Sài Gòn',
    'quán ăn có bãi xe gần đây',
    'nhà hàng có chỗ đậu xe TP.HCM',
  ],
  alternates: { canonical: 'https://mapgo.vn/quan-an/co-bai-xe' },
};

export default async function QuanAnCoBaiXePage() {
  let spots: { id: string; slug: string | null; name: string; address: string; carSlots: number | null; openTime: string | null; closeTime: string | null }[] = [];
  try {
    spots = await prisma.parkingSpot.findMany({
      where: {
        status: { in: ['active', 'ACTIVE'] },
        type: { in: ['RESTAURANT', 'restaurant'] },
      },
      select: { id: true, slug: true, name: true, address: true, carSlots: true, openTime: true, closeTime: true },
      orderBy: { carSlots: 'desc' },
      take: 60,
    });
  } catch (e) {
    console.error('DB error:', e);
  }

  const parseDistrict = (address: string) => {
    const m = address.match(/(Qu[aậ]n\s*\d+|Bình Thạnh|Phú Nhuận|Tân Bình|Gò Vấp|Bình Tân|Thủ Đức|TP Thủ Đức|Quận [A-ZĐa-z]+)/i);
    return m ? m[0] : 'Khu vực khác';
  };

  const byDistrict = spots.reduce((acc, spot) => {
    const d = parseDistrict(spot.address);
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
        <span style={{ color: '#cbd5e1' }}>Quán ăn có chỗ đậu ô tô</span>
      </nav>

      {/* Main Heading */}
      <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 12, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1.3 }}>
        🍜 Quán ăn, nhà hàng có bãi giữ xe ô tô tại TP.HCM
      </h1>
      <p style={{ color: '#94a3b8', marginBottom: 28, lineHeight: 1.7, fontSize: 16 }}>
        Danh sách <strong>{spots.length} quán ăn, nhà hàng có bãi giữ xe và chỗ đậu ô tô</strong> thuận tiện tại TP.HCM.
        Tìm nhanh theo từng Quận, xem số chỗ đậu và chỉ đường GPS tức thì.
      </p>

      {/* CTA Button */}
      <div style={{ marginBottom: 36 }}>
        <Link
          href="/?type=RESTAURANT"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'linear-gradient(135deg, #f59e0b, #ea580c)',
            color: '#ffffff',
            padding: '14px 28px',
            borderRadius: 999,
            fontWeight: 700,
            fontSize: 15,
            textDecoration: 'none',
            boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)',
            transition: 'transform 0.2s',
          }}
        >
          📍 Xem bản đồ trực tiếp tất cả quán ăn
        </Link>
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
              borderLeft: '4px solid #f59e0b',
              paddingLeft: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span>🍜 Quán ăn tại {district}</span>
              <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 400 }}>{distSpots.length} địa điểm</span>
            </h2>

            <div style={{ display: 'grid', gap: 12 }}>
              {distSpots.map((spot) => (
                <Link
                  key={spot.id}
                  href={`/bai-xe/${spot.slug || spot.id}`}
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
                      {spot.name}
                    </div>
                    <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5 }}>
                      📍 {spot.address}
                    </div>
                    {(spot.openTime || spot.closeTime) && (
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                        🕒 {spot.openTime || '08:00'} - {spot.closeTime || '22:00'}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                    <span style={{
                      background: 'rgba(245, 158, 11, 0.15)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      color: '#fbbf24',
                      padding: '4px 12px',
                      borderRadius: 99,
                      fontSize: 13,
                      fontWeight: 600,
                      whiteSpace: 'nowrap'
                    }}>
                      🚗 {spot.carSlots ? `${spot.carSlots} chỗ ô tô` : 'Có chỗ đỗ xe'}
                    </span>
                    <span style={{ fontSize: 12, color: '#818cf8', fontWeight: 500 }}>
                      Xem chi tiết →
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
          <p style={{ margin: 0, fontSize: 15 }}>Đang tải danh sách quán ăn có bãi xe...</p>
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
          🔍 Khám phá tiện ích khác tại TP.HCM
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <Link href="/cafe/co-bai-xe" style={{ padding: '8px 18px', borderRadius: 99, background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
            ☕ Quán cafe có chỗ đậu ô tô
          </Link>
          <Link href="/nha-ve-sinh/gan-day" style={{ padding: '8px 18px', borderRadius: 99, background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)', color: '#60a5fa', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
            🚻 Nhà vệ sinh gần đây
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
            name: 'Quán ăn có bãi giữ xe ô tô TP.HCM',
            url: 'https://mapgo.vn/quan-an/co-bai-xe',
            numberOfItems: spots.length,
            itemListElement: spots.slice(0, 20).map((s, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: s.name,
              url: `https://mapgo.vn/bai-xe/${s.slug || s.id}`,
            })),
          }),
        }}
      />
    </div>
  );
}
