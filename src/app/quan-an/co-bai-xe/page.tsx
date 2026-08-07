import { Metadata } from 'next';
import Link from 'next/link';
import prisma from '@/lib/prisma';

export const metadata: Metadata = {
  title: 'Quán ăn có bãi đỗ xe TP.HCM – Nhà hàng có chỗ đậu ô tô | MapGo',
  description: 'Danh sách quán ăn, nhà hàng có bãi đỗ xe ô tô tại TP.HCM theo từng Quận. Tìm nhanh qua bản đồ GPS — cập nhật mới nhất.',
  keywords: [
    'quán ăn có chỗ đậu ô tô Quận 1',
    'quán ăn có bãi đỗ xe TP.HCM',
    'nhà hàng có bãi xe ô tô Sài Gòn',
    'quán ăn có bãi xe gần đây',
    'nhà hàng có chỗ đậu xe TP.HCM',
  ],
  alternates: { canonical: 'https://mapgo.vn/quan-an/co-bai-xe' },
};

export default async function QuanAnCoBaiXePage() {
  let spots: { id: string; name: string; address: string; carSlots: number }[] = [];
  try {
    spots = await prisma.parkingSpot.findMany({
      where: {
        status: { in: ['active', 'ACTIVE'] },
        type: 'restaurant',
        carSlots: { gt: 0 },
      },
      select: { id: true, name: true, address: true, carSlots: true },
      orderBy: { carSlots: 'desc' },
      take: 30,
    });
  } catch (e) {
    console.error('DB error:', e);
  }

  // Group by district
  // Group by district (parse from address — e.g., "Quận 1", "Quận 7")
  const parseDistrict = (address: string) => {
    const m = address.match(/(Qu[aậ]n\s*\d+|Bình Thạnh|Phú Nhuận|Tân Bình|Gò Vấp|Bình Tân|Thủ Đức|TP Thủ Đức)/i);
    return m ? m[0] : 'TP.HCM';
  };
  const byDistrict = spots.reduce((acc, spot) => {
    const d = parseDistrict(spot.address);
    if (!acc[d]) acc[d] = [];
    acc[d].push(spot);
    return acc;
  }, {} as Record<string, typeof spots>);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px', fontFamily: 'Inter, sans-serif' }}>
      {/* Breadcrumb */}
      <nav style={{ fontSize: 14, color: '#888', marginBottom: 16 }}>
        <Link href="/" style={{ color: '#6366f1' }}>MapGo.vn</Link>
        {' › '}
        <span>Quán ăn có bãi đỗ xe</span>
      </nav>

      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, color: '#1e1b4b' }}>
        🍜 Quán ăn có bãi đỗ xe ô tô tại TP.HCM
      </h1>
      <p style={{ color: '#555', marginBottom: 24, lineHeight: 1.7, fontSize: 16 }}>
        Danh sách <strong>{spots.length} quán ăn, nhà hàng có bãi đỗ xe ô tô</strong> tại TP.HCM.
        Tìm nhanh theo Quận, xem số chỗ đậu và chỉ đường GPS tức thì.
      </p>

      <div style={{ marginBottom: 32 }}>
        <Link
          href="/?type=restaurant&hasCarParking=1"
          style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg,#f59e0b,#ef4444)',
            color: '#fff',
            padding: '12px 28px',
            borderRadius: 999,
            fontWeight: 600,
            fontSize: 16,
            textDecoration: 'none',
          }}
        >
          📍 Xem bản đồ quán ăn có bãi xe
        </Link>
      </div>

      {/* Grouped by district */}
      {Object.entries(byDistrict).map(([district, distSpots]) => (
        <div key={district} style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#1e1b4b', marginBottom: 12, borderLeft: '4px solid #f59e0b', paddingLeft: 12 }}>
            🍜 Quán ăn có bãi xe tại {district}
          </h2>
          <div style={{ display: 'grid', gap: 10 }}>
            {distSpots.map((spot) => (
              <Link
                key={spot.id}
                href={`/spot/${spot.id}`}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: '#fffbeb', border: '1px solid #fde68a',
                  borderRadius: 10, padding: '12px 16px',
                  textDecoration: 'none', color: 'inherit',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: '#1e1b4b' }}>{spot.name}</div>
                  <div style={{ fontSize: 13, color: '#777', marginTop: 2 }}>{spot.address}</div>
                </div>
                {spot.carSlots && (
                  <span style={{
                    flexShrink: 0, marginLeft: 12,
                    background: '#fef3c7', color: '#92400e',
                    padding: '3px 10px', borderRadius: 99, fontSize: 13, fontWeight: 500,
                  }}>
                    🚗 {spot.carSlots} chỗ
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      ))}

      {/* Internal links */}
      <div style={{ marginTop: 40, background: '#fafafa', borderRadius: 12, padding: '20px 24px' }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Xem thêm</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <Link href="/cafe/co-bai-xe" style={{ padding: '6px 16px', borderRadius: 999, background: '#d1fae5', color: '#065f46', fontSize: 14, textDecoration: 'none' }}>☕ Cafe có bãi xe</Link>
          <Link href="/nha-ve-sinh/gan-day" style={{ padding: '6px 16px', borderRadius: 999, background: '#dbeafe', color: '#1e40af', fontSize: 14, textDecoration: 'none' }}>🚻 Nhà vệ sinh gần đây</Link>
          <Link href="/bai-xe/quan-1" style={{ padding: '6px 16px', borderRadius: 999, background: '#ede9fe', color: '#5b21b6', fontSize: 14, textDecoration: 'none' }}>🅿️ Bãi xe Quận 1</Link>
          <Link href="/bai-xe/quan-7" style={{ padding: '6px 16px', borderRadius: 999, background: '#ede9fe', color: '#5b21b6', fontSize: 14, textDecoration: 'none' }}>🅿️ Bãi xe Quận 7</Link>
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'Quán ăn có bãi đỗ xe ô tô TP.HCM',
            description: 'Danh sách quán ăn, nhà hàng có chỗ đậu xe ô tô tại TP.HCM',
            url: 'https://mapgo.vn/quan-an/co-bai-xe',
            numberOfItems: spots.length,
            itemListElement: spots.slice(0, 10).map((s, i) => ({
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
