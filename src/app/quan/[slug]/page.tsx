import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import Header from '@/components/Header';
import { SPOT_TYPE_LABELS, SPOT_TYPE_ICONS } from '@/lib/types';
import { Metadata } from 'next';
import Link from 'next/link';

const DISTRICTS: Record<string, string> = {
  'quan-1': 'Quận 1',
  'quan-3': 'Quận 3',
  'quan-4': 'Quận 4',
  'quan-5': 'Quận 5',
  'quan-6': 'Quận 6',
  'quan-7': 'Quận 7',
  'quan-8': 'Quận 8',
  'quan-10': 'Quận 10',
  'quan-11': 'Quận 11',
  'quan-12': 'Quận 12',
  'binh-tan': 'Quận Bình Tân',
  'binh-thanh': 'Quận Bình Thạnh',
  'go-vap': 'Quận Gò Vấp',
  'phu-nhuan': 'Quận Phú Nhuận',
  'tan-binh': 'Quận Tân Bình',
  'tan-phu': 'Quận Tân Phú',
  'thu-duc': 'TP. Thủ Đức',
  'binh-chanh': 'Huyện Bình Chánh',
  'cu-chi': 'Huyện Củ Chi',
  'hoc-mon': 'Huyện Hóc Môn',
  'nha-be': 'Huyện Nhà Bè',
  'can-gio': 'Huyện Cần Giờ'
};

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const districtName = DISTRICTS[slug];

  if (!districtName) {
    return { title: 'Không tìm thấy' };
  }

  const title = `Bãi đỗ xe ${districtName} - Quán ăn, Café có chỗ đỗ xe | MapGo.vn`;
  const description = `Danh sách bãi đỗ xe ô tô, xe máy, quán ăn có bãi đỗ xe, quán cafe và tiện ích tại ${districtName}, TP.HCM. Tìm nhanh, chỉ đường GPS miễn phí.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://mapgo.vn/quan/${slug}`,
    },
    alternates: {
      canonical: `https://mapgo.vn/quan/${slug}`,
    }
  };
}

export default async function DistrictPage({ params }: Props) {
  const { slug } = await params;
  const districtName = DISTRICTS[slug];

  if (!districtName) {
    notFound();
  }

  // Lấy danh sách spots trong quận — dùng đúng field names từ schema
  const spots = await prisma.parkingSpot.findMany({
    where: {
      status: { in: ['active', 'ACTIVE'] },
      address: {
        contains: districtName,
      },
    },
    include: {
      images: true,
      _count: {
        select: { reviews: true }
      }
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // JSON-LD ItemList cho SEO
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `Bãi đỗ xe và tiện ích tại ${districtName}`,
    "itemListElement": spots.map((spot, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": spot.name,
      "url": `https://mapgo.vn/spot/${spot.id}`
    }))
  };

  // Breadcrumb JSON-LD
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Trang chủ", "item": "https://mapgo.vn" },
      { "@type": "ListItem", "position": 2, "name": districtName, "item": `https://mapgo.vn/quan/${slug}` }
    ]
  };

  // Tính center map từ spots — dùng đúng field lat/lng
  const centerLat = spots.length > 0 ? spots[0].lat : 10.762622;
  const centerLng = spots.length > 0 ? spots[0].lng : 106.660172;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-primary, #0d0d12)', color: '#fff' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Header />
      
      <main className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', flex: 1 }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>
          Bãi đỗ xe và tiện ích tại {districtName}
        </h1>
        <p style={{ opacity: 0.7, marginBottom: '24px' }}>
          Tìm thấy {spots.length} địa điểm tại khu vực {districtName}, TP.HCM
        </p>

        {spots.length === 0 ? (
          <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
            <p style={{ fontSize: '48px', marginBottom: '12px' }}>📭</p>
            <p style={{ fontSize: '15px', fontWeight: 600 }}>Chưa có địa điểm nào</p>
            <p style={{ fontSize: '13px', opacity: 0.6 }}>Khu vực {districtName} chưa có dữ liệu. Hãy quay lại sau!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {spots.map((spot) => {
              const typeLabel = SPOT_TYPE_LABELS[spot.type as keyof typeof SPOT_TYPE_LABELS] || 'Địa điểm';
              const typeIcon = SPOT_TYPE_ICONS[spot.type as keyof typeof SPOT_TYPE_ICONS] || '📍';
              const reviewCount = spot._count?.reviews || 0;
              const thumbnailUrl = spot.images?.[0]?.url;

              return (
                <article key={spot.id} className="card" style={{ padding: '20px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                  {/* Thumbnail */}
                  {thumbnailUrl && (
                    <div style={{ width: '120px', height: '80px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                      <img
                        src={thumbnailUrl}
                        alt={spot.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        loading="lazy"
                      />
                    </div>
                  )}

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                      <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>
                        <Link href={`/spot/${spot.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          {spot.name}
                        </Link>
                      </h2>
                      <span className="badge" style={{ fontSize: '11px' }}>
                        {typeIcon} {typeLabel}
                      </span>
                    </div>
                    <p style={{ fontSize: '14px', opacity: 0.7, marginBottom: '8px' }}>📍 {spot.address}</p>
                    
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap', fontSize: '13px', opacity: 0.85 }}>
                      {reviewCount > 0 && (
                        <span>💬 {reviewCount} đánh giá</span>
                      )}
                      {spot.pricePerHour > 0 && (
                        <span style={{ color: 'var(--color-primary, #10b981)' }}>💰 {spot.pricePerHour.toLocaleString('vi-VN')}đ/giờ</span>
                      )}
                      {spot.openTime && spot.closeTime && (
                        <span>🕐 {spot.openTime} - {spot.closeTime}</span>
                      )}
                      {spot.phone && (
                        <span>📞 {spot.phone}</span>
                      )}
                    </div>
                  </div>

                  {/* CTA */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Link href={`/spot/${spot.id}`}>
                      <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>Xem chi tiết</button>
                    </Link>
                    <Link href={`/?lat=${spot.lat}&lng=${spot.lng}`}>
                      <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>🗺️ Bản đồ</button>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Footer SEO text */}
        <div style={{ marginTop: '40px', padding: '24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px' }}>
            Về bãi đỗ xe tại {districtName}
          </h2>
          <p style={{ fontSize: '14px', lineHeight: 1.7, opacity: 0.7 }}>
            MapGo.vn cung cấp danh sách đầy đủ {spots.length} bãi đỗ xe, quán ăn có chỗ đậu xe, quán cà phê và các tiện ích 
            tại khu vực {districtName}, TP.HCM. Tất cả địa điểm đều được cập nhật thường xuyên từ Google Maps và OpenStreetMap, 
            kèm thông tin giá cả, giờ mở cửa, số điện thoại và chỉ đường GPS miễn phí. 
            Truy cập MapGo.vn để tìm bãi đỗ xe gần bạn nhất!
          </p>
        </div>
      </main>
    </div>
  );
}
