import prisma from '@/lib/prisma';
import type { Metadata } from 'next';

// Server-side metadata generation for SEO
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  
  try {
    const spot = await prisma.parkingSpot.findUnique({
      where: { id },
      select: { name: true, address: true, description: true, type: true, pricePerHour: true, phone: true }
    });

    if (!spot) {
      return {
        title: 'Bãi đỗ xe không tồn tại | MapGo.vn',
        description: 'Tìm bãi đỗ xe gần bạn trên MapGo.vn'
      };
    }

    const typeLabels: Record<string, string> = {
      PARKING_LOT: 'Bãi đỗ xe',
      RESTAURANT: 'Quán ăn có bãi xe',
      CAFE: 'Quán cafe có bãi xe',
      CARWASH: 'Rửa xe',
      GARAGE: 'Garage sửa xe',
    };

    const title = `${spot.name} - ${typeLabels[spot.type] || 'Bãi đỗ xe'} | MapGo.vn`;
    const desc = spot.description 
      ? spot.description.substring(0, 160) 
      : `${spot.name} tại ${spot.address}. ${spot.pricePerHour > 0 ? `Giá từ ${spot.pricePerHour.toLocaleString('vi-VN')}đ/giờ.` : ''} ${spot.phone ? `Liên hệ: ${spot.phone}` : ''} Tìm bãi đỗ xe trên MapGo.vn`;

    return {
      title,
      description: desc,
      openGraph: {
        title,
        description: desc,
        url: `https://mapgo.vn/spot/${id}`,
        siteName: 'MapGo.vn',
        type: 'article',
      },
      alternates: {
        canonical: `https://mapgo.vn/spot/${id}`,
      },
    };
  } catch {
    return {
      title: 'Bãi đỗ xe | MapGo.vn',
      description: 'Tìm bãi đỗ xe gần bạn trên MapGo.vn'
    };
  }
}

// Server-side pre-rendered HTML for SEO crawlers
async function SpotStructuredData({ id }: { id: string }) {
  try {
    const spot = await prisma.parkingSpot.findUnique({
      where: { id },
      select: { name: true, address: true, description: true, lat: true, lng: true, phone: true, pricePerHour: true, type: true, openTime: true, closeTime: true }
    });

    if (!spot) return null;

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'ParkingFacility',
      name: spot.name,
      address: {
        '@type': 'PostalAddress',
        streetAddress: spot.address,
        addressLocality: 'Hồ Chí Minh',
        addressCountry: 'VN'
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: spot.lat,
        longitude: spot.lng
      },
      telephone: spot.phone || undefined,
      openingHours: `Mo-Su ${spot.openTime}-${spot.closeTime}`,
      description: spot.description || `${spot.name} tại ${spot.address}`,
      url: `https://mapgo.vn/spot/${id}`,
    };

    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    );
  } catch {
    return null;
  }
}

export default async function SpotLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  return (
    <>
      {/* @ts-expect-error Async Server Component */}
      <SpotStructuredData id={id} />
      {children}
    </>
  );
}
