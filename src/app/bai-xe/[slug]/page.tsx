import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/prisma';

// Mapping slug -> tên quận đẹp + từ khóa SEO
const DISTRICT_CONFIG: Record<string, {
  name: string;
  nameVi: string;
  keywords: string[];
  description: string;
}> = {
  'quan-1': {
    name: 'Quận 1',
    nameVi: 'Quận 1',
    keywords: ['bãi đỗ xe Quận 1', 'bãi giữ xe Quận 1 TP.HCM', 'chỗ đậu xe trung tâm Sài Gòn'],
    description: 'Tìm bãi đỗ xe ô tô, xe máy tại Quận 1 TP.HCM. Danh sách bãi xe gần Bến Thành, Nguyễn Huệ, phố đi bộ — chỉ đường GPS real-time.',
  },
  'quan-3': {
    name: 'Quận 3',
    nameVi: 'Quận 3',
    keywords: ['bãi đỗ xe Quận 3', 'bãi giữ xe Quận 3 TP.HCM', 'chỗ đậu xe Quận 3'],
    description: 'Tìm bãi đỗ xe ô tô, xe máy tại Quận 3 TP.HCM. Bãi xe gần Võ Văn Tần, Nam Kỳ Khởi Nghĩa — cập nhật mới nhất.',
  },
  'quan-5': {
    name: 'Quận 5',
    nameVi: 'Quận 5',
    keywords: ['bãi đỗ xe Quận 5', 'bãi giữ xe Chợ Lớn', 'chỗ đậu xe Quận 5'],
    description: 'Tìm bãi đỗ xe ô tô, xe máy tại Quận 5 TP.HCM (khu Chợ Lớn). Bãi xe gần Thuận Kiều Plaza, Đại lộ Hùng Vương.',
  },
  'quan-7': {
    name: 'Quận 7',
    nameVi: 'Quận 7',
    keywords: ['bãi đỗ xe Quận 7', 'bãi giữ xe Phú Mỹ Hưng', 'chỗ đậu xe Quận 7'],
    description: 'Tìm bãi đỗ xe ô tô tại Quận 7 TP.HCM — khu Phú Mỹ Hưng, Crescent Mall, SC VivoCity. Chỉ đường GPS tức thì.',
  },
  'quan-10': {
    name: 'Quận 10',
    nameVi: 'Quận 10',
    keywords: ['bãi đỗ xe Quận 10', 'bãi giữ xe Quận 10 TP.HCM', 'chỗ đậu xe Lý Thường Kiệt'],
    description: 'Tìm bãi đỗ xe ô tô, xe máy tại Quận 10 TP.HCM. Bãi xe gần Lý Thường Kiệt, Cao Thắng, bệnh viện Quận 10.',
  },
  'binh-thanh': {
    name: 'Bình Thạnh',
    nameVi: 'Quận Bình Thạnh',
    keywords: ['bãi đỗ xe Bình Thạnh', 'bãi giữ xe Bình Thạnh TP.HCM', 'chỗ đậu xe Bình Thạnh'],
    description: 'Tìm bãi đỗ xe ô tô, xe máy tại Quận Bình Thạnh TP.HCM. Bãi xe gần Vincom Đồng Khởi, Landmark 81, cầu Sài Gòn.',
  },
  'phu-nhuan': {
    name: 'Phú Nhuận',
    nameVi: 'Quận Phú Nhuận',
    keywords: ['bãi đỗ xe Phú Nhuận', 'bãi giữ xe Phú Nhuận TP.HCM', 'chỗ đậu xe Phú Nhuận'],
    description: 'Tìm bãi đỗ xe ô tô, xe máy tại Quận Phú Nhuận TP.HCM. Bãi xe gần Phan Xích Long, Hoàng Văn Thụ, Nguyễn Kiệm.',
  },
  'tan-binh': {
    name: 'Tân Bình',
    nameVi: 'Quận Tân Bình',
    keywords: ['bãi đỗ xe Tân Bình', 'bãi giữ xe Tân Bình TP.HCM', 'chỗ đậu xe sân bay Tân Sơn Nhất'],
    description: 'Tìm bãi đỗ xe ô tô, xe máy tại Quận Tân Bình TP.HCM. Bãi xe gần sân bay Tân Sơn Nhất, Trường Chinh, Cộng Hòa.',
  },
  'thu-duc': {
    name: 'TP Thủ Đức',
    nameVi: 'Thành phố Thủ Đức',
    keywords: ['bãi đỗ xe Thủ Đức', 'bãi giữ xe TP Thủ Đức', 'chỗ đậu xe Thủ Đức TP.HCM'],
    description: 'Tìm bãi đỗ xe ô tô tại TP Thủ Đức TP.HCM — khu vực Bình Thạnh, Thủ Đức, Linh Đàm. Chỉ đường GPS real-time.',
  },
  'binh-tan': {
    name: 'Bình Tân',
    nameVi: 'Quận Bình Tân',
    keywords: ['bãi đỗ xe Bình Tân', 'bãi giữ xe Bình Tân TP.HCM', 'chỗ đậu xe Aeon Mall Bình Tân'],
    description: 'Tìm bãi đỗ xe ô tô, xe máy tại Quận Bình Tân TP.HCM. Bãi xe gần Aeon Mall Bình Tân, Quốc lộ 1A.',
  },
};

// Generate static params for all districts
export async function generateStaticParams() {
  return Object.keys(DISTRICT_CONFIG).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const config = DISTRICT_CONFIG[slug];
  if (!config) return {};

  const title = `Bãi đỗ xe ${config.name} TP.HCM – Tìm nhanh qua GPS | MapGo`;
  return {
    title,
    description: config.description,
    keywords: config.keywords,
    alternates: { canonical: `https://mapgo.vn/bai-xe/${slug}` },
    openGraph: {
      title,
      description: config.description,
      url: `https://mapgo.vn/bai-xe/${slug}`,
    },
  };
}

export default async function BaiXeDistrictPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const config = DISTRICT_CONFIG[slug];
  if (!config) notFound();

  // Lấy bãi xe theo quận từ DB
  let spots: { id: string; name: string; address: string; carSlots: number }[] = [];
  try {
    spots = await prisma.parkingSpot.findMany({
      where: {
        status: { in: ['active', 'ACTIVE'] },
        type: 'parking',
        address: { contains: config.name },
      },
      select: { id: true, name: true, address: true, carSlots: true },
      take: 20,
    });
  } catch (e) {
    console.error('Landing page DB error:', e);
  }

  const ALL_DISTRICTS = Object.entries(DISTRICT_CONFIG);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px', fontFamily: 'Inter, sans-serif' }}>
      {/* Breadcrumb */}
      <nav style={{ fontSize: 14, color: '#888', marginBottom: 16 }}>
        <Link href="/" style={{ color: '#6366f1' }}>MapGo.vn</Link>
        {' › '}
        <Link href="/bai-xe/quan-1" style={{ color: '#6366f1' }}>Bãi đỗ xe</Link>
        {' › '}
        <span>{config.name}</span>
      </nav>

      {/* H1 — từ khóa chính */}
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, color: '#1e1b4b' }}>
        🅿️ Bãi đỗ xe {config.name} TP.HCM
      </h1>
      <p style={{ color: '#555', marginBottom: 24, lineHeight: 1.7 }}>
        {config.description}
      </p>

      {/* CTA button */}
      <div style={{ marginBottom: 32 }}>
        <Link
          href={`/?q=${encodeURIComponent(config.name)}&type=parking`}
          style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            color: '#fff',
            padding: '12px 28px',
            borderRadius: 999,
            fontWeight: 600,
            fontSize: 16,
            textDecoration: 'none',
          }}
        >
          📍 Xem bản đồ bãi xe {config.name}
        </Link>
      </div>

      {/* Danh sách bãi xe */}
      {spots.length > 0 ? (
        <>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16, color: '#1e1b4b' }}>
            Danh sách bãi đỗ xe tại {config.name} ({spots.length} địa điểm)
          </h2>
          <div style={{ display: 'grid', gap: 12 }}>
            {spots.map((spot) => (
              <Link
                key={spot.id}
                href={`/spot/${spot.id}`}
                style={{
                  display: 'block',
                  background: '#f8f8ff',
                  border: '1px solid #e0e0ff',
                  borderRadius: 12,
                  padding: '14px 18px',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'box-shadow 0.2s',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 16, color: '#1e1b4b', marginBottom: 4 }}>
                  🅿️ {spot.name}
                </div>
                <div style={{ fontSize: 14, color: '#666' }}>{spot.address}</div>
                {spot.carSlots && spot.carSlots > 0 && (
                  <span style={{
                    display: 'inline-block', marginTop: 8,
                    background: '#fef3c7', color: '#92400e',
                    padding: '2px 10px', borderRadius: 99, fontSize: 13,
                  }}>
                    🚗 {spot.carSlots} chỗ ô tô
                  </span>
                )}
              </Link>
            ))}
          </div>
        </>
      ) : (
        <div style={{ background: '#f3f4f6', borderRadius: 12, padding: '24px', textAlign: 'center', color: '#666' }}>
          <p>Đang cập nhật dữ liệu bãi xe tại {config.name}.</p>
          <Link href="/" style={{ color: '#6366f1' }}>← Về trang chủ xem bản đồ</Link>
        </div>
      )}

      {/* Internal links — các Quận khác */}
      <div style={{ marginTop: 48 }}>
        <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 12, color: '#374151' }}>
          Tìm bãi đỗ xe ở Quận khác
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {ALL_DISTRICTS.filter(([s]) => s !== slug).map(([s, cfg]) => (
            <Link
              key={s}
              href={`/bai-xe/${s}`}
              style={{
                padding: '6px 16px', borderRadius: 999,
                background: '#ede9fe', color: '#5b21b6',
                fontSize: 14, textDecoration: 'none', fontWeight: 500,
              }}
            >
              {cfg.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Cross-links to category pages */}
      <div style={{ marginTop: 32, background: '#fafafa', borderRadius: 12, padding: '20px 24px' }}>
        <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 12, color: '#374151' }}>
          Tìm tiện ích khác tại {config.name}
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <Link href={`/quan-an/co-bai-xe`} style={{ padding: '6px 16px', borderRadius: 999, background: '#fef3c7', color: '#92400e', fontSize: 14, textDecoration: 'none' }}>
            🍜 Quán ăn có bãi xe
          </Link>
          <Link href={`/cafe/co-bai-xe`} style={{ padding: '6px 16px', borderRadius: 999, background: '#d1fae5', color: '#065f46', fontSize: 14, textDecoration: 'none' }}>
            ☕ Cafe có bãi xe
          </Link>
          <Link href={`/nha-ve-sinh/gan-day`} style={{ padding: '6px 16px', borderRadius: 999, background: '#dbeafe', color: '#1e40af', fontSize: 14, textDecoration: 'none' }}>
            🚻 Nhà vệ sinh gần đây
          </Link>
        </div>
      </div>

      {/* Schema JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: `Bãi đỗ xe ${config.name} TP.HCM`,
            description: config.description,
            url: `https://mapgo.vn/bai-xe/${slug}`,
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
