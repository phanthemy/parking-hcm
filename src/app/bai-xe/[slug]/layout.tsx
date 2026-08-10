import prisma from '@/lib/prisma';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const spot = await prisma.parkingSpot.findFirst({
      where: { slug },
      select: { name: true, address: true, description: true, type: true, pricePerHour: true, phone: true }
    });

    if (!spot) {
      return { title: 'Bãi đỗ xe không tồn tại | MapGo.vn' };
    }

    const typeLabels: Record<string, string> = {
      PARKING_LOT: 'Bãi đỗ xe', RESTAURANT: 'Quán ăn có bãi xe',
      CAFE: 'Quán cafe có bãi xe', CARWASH: 'Rửa xe', GARAGE: 'Garage sửa xe',
    };

    const title = `${spot.name} - ${typeLabels[spot.type] || 'Bãi đỗ xe'} | MapGo.vn`;
    const desc = spot.description?.substring(0, 160) 
      || `${spot.name} tại ${spot.address}. Tìm bãi đỗ xe trên MapGo.vn`;

    return {
      title, description: desc,
      openGraph: { title, description: desc, url: `https://mapgo.vn/bai-xe/${slug}`, siteName: 'MapGo.vn', type: 'article' },
      alternates: { canonical: `https://mapgo.vn/bai-xe/${slug}` },
    };
  } catch {
    return { title: 'Bãi đỗ xe | MapGo.vn' };
  }
}

async function SpotStructuredData({ slug }: { slug: string }) {
  try {
    const spot = await prisma.parkingSpot.findFirst({
      where: { slug },
      select: { name: true, address: true, description: true, lat: true, lng: true, phone: true, openTime: true, closeTime: true }
    });
    if (!spot) return null;

    const jsonLd = {
      '@context': 'https://schema.org', '@type': 'ParkingFacility',
      name: spot.name,
      address: { '@type': 'PostalAddress', streetAddress: spot.address, addressLocality: 'Hồ Chí Minh', addressCountry: 'VN' },
      geo: { '@type': 'GeoCoordinates', latitude: spot.lat, longitude: spot.lng },
      telephone: spot.phone || undefined,
      openingHours: `Mo-Su ${spot.openTime}-${spot.closeTime}`,
      description: spot.description || `${spot.name} tại ${spot.address}`,
      url: `https://mapgo.vn/bai-xe/${slug}`,
    };

    return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
  } catch { return null; }
}

export default async function BaiXeLayout({ children, params }: { children: React.ReactNode; params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <>
      <SpotStructuredData slug={slug} />
      {children}
    </>
  );
}
