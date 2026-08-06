import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import SpotDetailClient from './SpotDetailClient';
import { SPOT_TYPE_LABELS } from '@/lib/types';
import { Metadata } from 'next';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  
  try {
    const spot = await prisma.parkingSpot.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!spot) {
      return { title: 'Không tìm thấy' };
    }

    // Trích quận từ địa chỉ
    const districtMatch = spot.address.match(/Quận \d+|Quận [A-ZÀ-Ỹa-zà-ỹ ]+|TP\. Thủ Đức|Huyện [A-ZÀ-Ỹa-zà-ỹ ]+/);
    const district = districtMatch ? districtMatch[0] : 'TP.HCM';
    
    const typeLabel = SPOT_TYPE_LABELS[spot.type as keyof typeof SPOT_TYPE_LABELS] || 'Bãi đỗ xe';
    const title = `${spot.name} - ${typeLabel} tại ${district}`;
    const description = `${spot.name} - ${spot.address}. ${spot.description || ''} Xem chi tiết giá, giờ mở cửa và chỉ đường GPS trên MapGo.vn.`;

    const imageUrl = spot.images?.[0]?.url;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `https://mapgo.vn/spot/${spot.id}`,
        images: imageUrl ? [{ url: imageUrl }] : [{ url: 'https://mapgo.vn/logo.png' }],
      },
      alternates: {
        canonical: `https://mapgo.vn/spot/${spot.id}`,
      }
    };
  } catch {
    return { title: 'Lỗi tải trang' };
  }
}

export default async function SpotPage({ params }: Props) {
  const { id } = await params;
  
  let spot: any = null;
  try {
    spot = await prisma.parkingSpot.findUnique({
      where: { id },
      include: {
        images: true,
        reviews: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: { select: { reviews: true } },
      },
    });
  } catch {
    // DB error — sẽ fallback ở client
  }

  if (!spot) {
    notFound();
  }

  // Chuyển data cho client component
  const initialSpot = {
    id: spot.id,
    name: spot.name,
    address: spot.address,
    description: spot.description,
    latitude: spot.lat,
    longitude: spot.lng,
    lat: spot.lat,
    lng: spot.lng,
    type: spot.type,
    carSlots: spot.carSlots,
    bikeSlots: spot.bikeSlots,
    pricePerHour: spot.pricePerHour,
    pricePerHourCar: spot.pricePerHour,
    pricePerHourBike: spot.pricePerHour > 0 ? Math.round(spot.pricePerHour / 4) : 0,
    openTime: spot.openTime,
    closeTime: spot.closeTime,
    phone: spot.phone,
    website: spot.website,
    isPremium: spot.isPremium,
    isVerified: spot.status === 'ACTIVE',
    status: spot.status?.toLowerCase() || 'active',
    ownerId: spot.ownerId,
    images: spot.images?.map((img: any) => img.url) || [],
    rating: 4.0 + Math.random() * 1.0, // placeholder
    reviewCount: spot._count?.reviews || 0,
    createdAt: spot.createdAt.toISOString(),
    updatedAt: spot.updatedAt.toISOString(),
    source: spot.source,
    googleRating: spot.googleRating,
    googlePlaceId: spot.googlePlaceId,
  };

  const typeLabel = SPOT_TYPE_LABELS[spot.type as keyof typeof SPOT_TYPE_LABELS] || 'Địa điểm';

  // JSON-LD Structured Data
  const spotSchema = {
    "@context": "https://schema.org",
    "@type": spot.type === 'PARKING_LOT' ? 'ParkingFacility' : spot.type === 'RESTAURANT' ? 'Restaurant' : spot.type === 'CAFE' ? 'CafeOrCoffeeShop' : 'LocalBusiness',
    "name": spot.name,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": spot.address,
      "addressLocality": "Hồ Chí Minh",
      "addressCountry": "VN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": spot.lat,
      "longitude": spot.lng
    },
    "url": `https://mapgo.vn/spot/${spot.id}`,
    "telephone": spot.phone || undefined,
    "image": spot.images?.[0]?.url || "https://mapgo.vn/logo.png",
    ...(spot.openTime && spot.closeTime ? {
      "openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        "opens": spot.openTime,
        "closes": spot.closeTime
      }
    } : {}),
    ...(spot.googleRating ? { "aggregateRating": { "@type": "AggregateRating", "ratingValue": spot.googleRating, "bestRating": 5 } } : {}),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Trang chủ", "item": "https://mapgo.vn" },
      { "@type": "ListItem", "position": 2, "name": typeLabel, "item": "https://mapgo.vn" },
      { "@type": "ListItem", "position": 3, "name": spot.name, "item": `https://mapgo.vn/spot/${spot.id}` }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(spotSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <SpotDetailClient id={id} initialSpot={initialSpot as any} />
    </>
  );
}
