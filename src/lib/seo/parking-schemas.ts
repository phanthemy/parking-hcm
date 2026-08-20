/**
 * MAPGO SEO ENGINE - PARKING FACILITY & LOCAL ENTITY SCHEMAS
 */

import { SchemaNode } from './graph';
import { ParkingSpot } from '@/domain/spot.parking';

export function buildParkingFacilitySchema(spot: ParkingSpot, baseUrl = 'https://mapgo.vn'): SchemaNode {
  const url = `${baseUrl}/bai-xe/${spot.slug || spot.id}`;
  
  // Format giá vé
  let priceRange = 'Tham khảo tại bãi';
  if (spot.pricing && spot.pricing.length > 0) {
    const min = Math.min(...spot.pricing.map(p => p.amount));
    const max = Math.max(...spot.pricing.map(p => p.amount));
    priceRange = `${min.toLocaleString('vi-VN')}đ - ${max.toLocaleString('vi-VN')}đ`;
  }

  // Tiện ích
  const amenities: SchemaNode[] = [];
  if (spot.parkingDetails) {
    if (spot.parkingDetails.security.hasGuard247) {
      amenities.push({ '@type': 'LocationFeatureSpecification', name: 'Bảo vệ 24/7', value: true });
    }
    if (spot.parkingDetails.security.hasCCTV) {
      amenities.push({ '@type': 'LocationFeatureSpecification', name: 'Camera an ninh CCTV', value: true });
    }
    if (spot.parkingDetails.security.hasRoof) {
      amenities.push({ '@type': 'LocationFeatureSpecification', name: 'Bãi đỗ xe có mái che', value: true });
    }
    if (spot.parkingDetails.heightLimit) {
      amenities.push({ '@type': 'LocationFeatureSpecification', name: 'Giới hạn chiều cao hầm', value: `${spot.parkingDetails.heightLimit}m` });
    }
    if (spot.parkingDetails.evSupport.hasEvCharging) {
      amenities.push({ '@type': 'LocationFeatureSpecification', name: 'Trạm sạc xe điện', value: true });
    }
  }

  return {
    '@type': 'ParkingFacility',
    '@id': `${url}#facility`,
    name: spot.name,
    identifier: spot.id,
    url: url,
    mainEntityOfPage: url,
    dateModified: spot.updatedAt ? new Date(spot.updatedAt).toISOString() : new Date().toISOString(),
    isAccessibleForFree: false,
    priceRange: priceRange,
    telephone: spot.phone || undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: spot.address.street || spot.address.full,
      addressLocality: spot.address.district,
      addressRegion: spot.address.province,
      addressCountry: 'VN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: spot.geo.latitude,
      longitude: spot.geo.longitude,
    },
    maximumAttendeeCapacity: spot.parkingDetails?.capacity.totalCarSlots
      ? spot.parkingDetails.capacity.totalCarSlots + (spot.parkingDetails.capacity.totalBikeSlots || 0)
      : undefined,
    amenityFeature: amenities.length > 0 ? amenities : undefined,
    image: spot.images && spot.images.length > 0 ? spot.images.map(img => img.url) : undefined,
    aggregateRating: spot.reviews?.reviewCount > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: spot.reviews.rating.toString(),
      reviewCount: spot.reviews.reviewCount.toString(),
    } : undefined,
  };
}

export interface FaqItem {
  question: string;
  answer: string;
}

export function buildFaqSchema(faqs: FaqItem[]): SchemaNode {
  return {
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export interface DistrictHubContext {
  districtName: string;
  provinceName: string;
  url: string;
  spots: Array<{ name: string; url: string; pricePerHour?: number }>;
}

export function buildDistrictHubSchema(context: DistrictHubContext): SchemaNode {
  return {
    '@type': 'CollectionPage',
    '@id': `${context.url}#collection`,
    name: `Danh sách bãi đỗ xe ${context.districtName} - ${context.provinceName}`,
    url: context.url,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: context.spots.length,
      itemListElement: context.spots.map((spot, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: spot.name,
        url: spot.url,
      })),
    },
  };
}
