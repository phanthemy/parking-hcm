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
    
    // Mô tả SEO chi tiết hơn
    const priceInfo = spot.pricePerHour > 0 ? ` Giá từ ${spot.pricePerHour.toLocaleString('vi-VN')}đ/giờ.` : '';
    const hoursInfo = spot.openTime && spot.closeTime ? ` Mở cửa ${spot.openTime} - ${spot.closeTime}.` : '';
    const description = `${spot.name} - ${typeLabel} tại ${spot.address}.${priceInfo}${hoursInfo} ${spot.description || ''} Xem chi tiết giá giữ xe, giờ mở cửa và chỉ đường GPS trên MapGo.vn.`.trim();

    const imageUrl = spot.images?.[0]?.url;

    // Keywords động theo loại spot + quận
    const typeKeywords: Record<string, string[]> = {
      'PARKING_LOT': ['bãi đỗ xe', 'bãi giữ xe', 'chỗ đậu xe', 'chỗ giữ xe', 'gửi xe'],
      'RESTAURANT': ['quán ăn có bãi đỗ xe', 'nhà hàng có chỗ đậu xe', 'quán ăn có chỗ giữ xe'],
      'CAFE': ['quán cafe có bãi đỗ xe', 'quán cà phê có chỗ giữ xe', 'quán cafe đậu xe ô tô'],
      'RESTROOM': ['nhà vệ sinh công cộng', 'toilet gần đây', 'WC công cộng'],
      'SERVICE': ['trạm xăng', 'rửa xe', 'sửa xe', 'dịch vụ xe'],
    };
    const spotKeywords = (typeKeywords[spot.type] || ['bãi đỗ xe']).flatMap(kw => [
      `${kw} ${district}`,
      `${kw} gần đây`,
    ]);

    return {
      title,
      description,
      keywords: [
        spot.name,
        `${typeLabel} ${district}`,
        `${typeLabel} ${spot.address.split(',')[0]}`,
        ...spotKeywords,
        `giá giữ xe ${district}`,
        `giữ xe ô tô ${district}`,
        `giữ xe máy ${district}`,
      ],
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
