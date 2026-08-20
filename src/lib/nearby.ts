/**
 * MAPGO SMART NEARBY & RELATED CATEGORY ENGINE
 * Computes closest POIs and cross-category semantic links
 */

import prisma from '@/lib/prisma';
import { haversineDistance } from '@/lib/haversine';

export interface NearbySpotSummary {
  id: string;
  name: string;
  slug: string;
  address: string;
  distanceMeters: number;
  pricePerHour?: number;
  type: string;
}

export async function getNearbySpotsForPOI(
  currentSpotId: string,
  lat: number,
  lng: number,
  limit = 5
): Promise<NearbySpotSummary[]> {
  try {
    const candidateSpots = await prisma.parkingSpot.findMany({
      where: {
        id: { not: currentSpotId },
        status: { in: ['active', 'ACTIVE'] },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        address: true,
        lat: true,
        lng: true,
        pricePerHour: true,
        type: true,
      },
      take: 50, // Lấy mẫu bán kính gần
    });

    const withDistance = candidateSpots.map(s => {
      const dist = haversineDistance(lat, lng, s.lat, s.lng);
      return {
        id: s.id,
        name: s.name,
        slug: s.slug || s.id,
        address: s.address,
        distanceMeters: Math.round(dist * 1000),
        pricePerHour: s.pricePerHour,
        type: s.type,
      };
    });

    withDistance.sort((a, b) => a.distanceMeters - b.distanceMeters);
    return withDistance.slice(0, limit);
  } catch (e) {
    console.error('Error fetching nearby spots:', e);
    return [];
  }
}
