/**
 * MAPGO SEO ENGINE - GRANULAR JSON-LD NODE BUILDERS
 * Clean, decoupled functions for building individual Schema.org entities
 */

import { SchemaNode } from './graph';

export function buildWebSiteNode(baseUrl = 'https://mapgo.vn'): SchemaNode {
  return {
    '@type': 'WebSite',
    '@id': `${baseUrl}/#website`,
    url: `${baseUrl}/`,
    name: 'MapGo - Bản đồ Tiện ích Giao thông & Đô thị',
    description: 'Nền tảng tìm kiếm bãi đỗ xe, trạm sạc EV, gara sửa xe, cây xăng và nhà vệ sinh công cộng theo thời gian thực.',
    publisher: { '@id': `${baseUrl}/#organization` },
    potentialAction: buildSearchActionNode(baseUrl),
  };
}

export function buildSearchActionNode(baseUrl = 'https://mapgo.vn'): SchemaNode {
  return {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${baseUrl}/search?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  };
}

export function buildOrganizationNode(baseUrl = 'https://mapgo.vn'): SchemaNode {
  return {
    '@type': 'Organization',
    '@id': `${baseUrl}/#organization`,
    name: 'MapGo Vietnam',
    url: baseUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${baseUrl}/logo.png`,
      caption: 'MapGo - Mobility Search Engine',
    },
    sameAs: [
      'https://www.facebook.com/mapgo.vn',
      'https://zalo.me/mapgo',
    ],
  };
}

export interface BreadcrumbStep {
  name: string;
  url: string;
}

export function buildBreadcrumbNode(steps: BreadcrumbStep[], baseUrl = 'https://mapgo.vn'): SchemaNode {
  const currentUrl = steps[steps.length - 1]?.url || baseUrl;
  return {
    '@type': 'BreadcrumbList',
    '@id': `${currentUrl.startsWith('http') ? currentUrl : `${baseUrl}${currentUrl}`}#breadcrumb`,
    itemListElement: steps.map((step, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: step.name,
      item: step.url.startsWith('http') ? step.url : `${baseUrl}${step.url}`,
    })),
  };
}

export interface RealSpotData {
  id: string;
  name: string;
  slug?: string;
  address: string;
  district?: string;
  province?: string;
  lat: number;
  lng: number;
  phone?: string;
  pricePerHour?: number;
  pricingList?: Array<{ vehicleType: string; priceType: string; amount: number }>;
  parkingDetail?: {
    is247?: boolean;
    openTime?: string;
    closeTime?: string;
    heightLimit?: number;
    totalCarSlots?: number;
    totalBikeSlots?: number;
    hasGuard247?: boolean;
    hasCCTV?: boolean;
    hasRoof?: boolean;
    hasEvCharging?: boolean;
  };
  reviews?: {
    rating: number;
    reviewCount: number;
  };
  updatedAt?: Date | string;
}

export function buildParkingFacilityNode(spot: RealSpotData, canonicalUrl: string): SchemaNode {
  // Format price range
  let priceRange = 'Tham khảo tại bãi';
  if (spot.pricingList && spot.pricingList.length > 0) {
    const amounts = spot.pricingList.map(p => p.amount);
    const min = Math.min(...amounts);
    const max = Math.max(...amounts);
    priceRange = `${min.toLocaleString('vi-VN')}đ - ${max.toLocaleString('vi-VN')}đ`;
  } else if (spot.pricePerHour && spot.pricePerHour > 0) {
    priceRange = `${spot.pricePerHour.toLocaleString('vi-VN')}đ / giờ`;
  }

  // Amenities
  const amenities: SchemaNode[] = [];
  if (spot.parkingDetail) {
    const d = spot.parkingDetail;
    if (d.hasGuard247 || d.is247) {
      amenities.push({ '@type': 'LocationFeatureSpecification', name: 'Bảo vệ 24/7', value: true });
    }
    if (d.hasCCTV) {
      amenities.push({ '@type': 'LocationFeatureSpecification', name: 'Camera an ninh CCTV', value: true });
    }
    if (d.hasRoof) {
      amenities.push({ '@type': 'LocationFeatureSpecification', name: 'Mái che / Hầm giữ xe', value: true });
    }
    if (d.heightLimit) {
      amenities.push({ '@type': 'LocationFeatureSpecification', name: 'Giới hạn chiều cao hầm', value: `${d.heightLimit}m` });
    }
    if (d.hasEvCharging) {
      amenities.push({ '@type': 'LocationFeatureSpecification', name: 'Có trạm sạc xe điện', value: true });
    }
  }

  const node: SchemaNode = {
    '@type': 'ParkingFacility',
    '@id': `${canonicalUrl}#facility`,
    name: spot.name,
    identifier: spot.id,
    url: canonicalUrl,
    mainEntityOfPage: canonicalUrl,
    dateModified: spot.updatedAt ? new Date(spot.updatedAt).toISOString() : new Date().toISOString(),
    isAccessibleForFree: false,
    priceRange: priceRange,
    telephone: spot.phone || undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: spot.address,
      addressLocality: spot.district || 'TP. Hồ Chí Minh',
      addressRegion: spot.province || 'TP. Hồ Chí Minh',
      addressCountry: 'VN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: spot.lat,
      longitude: spot.lng,
    },
  };

  if (amenities.length > 0) {
    node.amenityFeature = amenities;
  }

  if (spot.reviews && spot.reviews.reviewCount > 0) {
    node.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: spot.reviews.rating.toString(),
      reviewCount: spot.reviews.reviewCount.toString(),
    };
  }

  return node;
}

export function buildFaqNodeFromData(faqs: Array<{ question: string; answer: string }>): SchemaNode {
  return {
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  };
}

export function buildDistrictCollectionNode(
  districtName: string,
  provinceName: string,
  url: string,
  spots: Array<{ name: string; url: string }>
): SchemaNode {
  return {
    '@type': 'CollectionPage',
    '@id': `${url}#collection`,
    name: `Top bãi đỗ xe ${districtName} - ${provinceName}`,
    url: url,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: spots.length,
      itemListElement: spots.map((s, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: s.name,
        url: s.url,
      })),
    },
  };
}
