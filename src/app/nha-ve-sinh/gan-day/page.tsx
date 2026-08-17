import { Metadata } from 'next';
import Link from 'next/link';
import prisma from '@/lib/prisma';

export const metadata: Metadata = {
  title: 'Nhà vệ sinh công cộng gần đây TP.HCM – Tìm WC công cộng | MapGo',
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
  let spots: { id: string; name: string; address: string }[] = [];
  try {
    spots = await prisma.parkingSpot.findMany({
      where: {
        status: { in: ['active', 'ACTIVE'] },
        type: 'toilet',
      },
      select: { id: true, name: true, address: true },
      take: 40,
    });
  } catch (e) {
    console.error('DB error:', e);
  }

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
      <nav style={{ fontSize: 14, color: '#888', marginBottom: 16 }}>
        <Link href="/" style={{ color: '#6366f1' }}>MapGo.vn</Link>
        {' › '}
        <span>Nhà vệ sinh gần đây</span>
      </nav>

      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, color: '#1e1b4b' }}>
        🚻 Nhà vệ sinh công cộng gần đây tại TP.HCM
      </h1>
      <p style={{ color: '#555', marginBottom: 24, lineHeight: 1.7, fontSize: 16 }}>
        Danh sách <strong>{spots.length} nhà vệ sinh công cộng</strong> tại TP.HCM.
        Bật GPS để tìm WC gần nhất — cập nhật liên tục từ cộng đồng.
      </p>

      <div style={{ marginBottom: 32 }}>
        <Link
          href="/?type=toilet"
          style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
            color: '#fff',
            padding: '12px 28px',
            borderRadius: 999,
            fontWeight: 600,
            fontSize: 16,
            textDecoration: 'none',
          }}
        >
          📍 Tìm nhà vệ sinh gần tôi nhất
        </Link>
      </div>

      {/* Info box */}
      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: '16px 20px', marginBottom: 32 }}>
        <p style={{ margin: 0, color: '#1e40af', fontSize: 15 }}>
          💡 <strong>Mẹo:</strong> Truy cập <Link href="/" style={{ color: '#6366f1' }}>mapgo.vn</Link> từ điện thoại, 
          bật vị trí GPS để tìm nhà vệ sinh gần nhất chính xác nhất.
        </p>
      </div>

      {Object.entries(byDistrict).map(([district, distSpots]) => (
        <div key={district} style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#1e1b4b', marginBottom: 12, borderLeft: '4px solid #3b82f6', paddingLeft: 12 }}>
            🚻 Nhà vệ sinh tại {district} ({distSpots.length})
          </h2>
          <div style={{ display: 'grid', gap: 10 }}>
            {distSpots.map((spot) => (
              <Link
                key={spot.id}
                href={`/spot/${spot.id}`}
                style={{
                  display: 'block',
                  background: '#eff6ff', border: '1px solid #bfdbfe',
                  borderRadius: 10, padding: '12px 16px',
                  textDecoration: 'none', color: 'inherit',
                }}
              >
                <div style={{ fontWeight: 600, color: '#1e1b4b' }}>🚻 {spot.name}</div>
                <div style={{ fontSize: 13, color: '#777', marginTop: 2 }}>{spot.address}</div>
              </Link>
            ))}
          </div>
        </div>
      ))}

      <div style={{ marginTop: 40, background: '#fafafa', borderRadius: 12, padding: '20px 24px' }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Tìm tiện ích khác</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <Link href="/quan-an/co-bai-xe" style={{ padding: '6px 16px', borderRadius: 999, background: '#fef3c7', color: '#92400e', fontSize: 14, textDecoration: 'none' }}>🍜 Quán ăn có bãi xe</Link>
          <Link href="/cafe/co-bai-xe" style={{ padding: '6px 16px', borderRadius: 999, background: '#d1fae5', color: '#065f46', fontSize: 14, textDecoration: 'none' }}>☕ Cafe có bãi xe</Link>
          <Link href="/bai-xe/quan-1" style={{ padding: '6px 16px', borderRadius: 999, background: '#ede9fe', color: '#5b21b6', fontSize: 14, textDecoration: 'none' }}>🅿️ Bãi xe Quận 1</Link>
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'Nhà vệ sinh công cộng gần đây TP.HCM',
            url: 'https://mapgo.vn/nha-ve-sinh/gan-day',
            numberOfItems: spots.length,
            itemListElement: spots.slice(0, 10).map((s, i) => ({
              '@type': 'ListItem', position: i + 1, name: s.name,
              url: `https://mapgo.vn/spot/${s.id}`,
            })),
          }),
        }}
      />
    </div>
  );
}
