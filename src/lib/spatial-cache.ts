/**
 * MAPGO ENTERPRISE SPATIAL CACHE & SINGLEFLIGHT ENGINE
 * Implements:
 * 1. Geohash Spatial Binning (Avoids low hit-rate raw lat/lng keys)
 * 2. SingleFlight Promise Coalescing (Prevents Cache Stampede / Thundering Herd)
 * 3. Cache Metrics (Hit/Miss ratio, Size, In-flight requests)
 */

// Simple, fast Geohash encoder (Base32)
const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';

export function encodeGeohash(latitude: number, longitude: number, precision = 6): string {
  let latMin = -90.0, latMax = 90.0;
  let lonMin = -180.0, lonMax = 180.0;
  let geohash = '';
  let isEven = true;
  let bit = 0;
  let ch = 0;

  while (geohash.length < precision) {
    if (isEven) {
      const lonMid = (lonMin + lonMax) / 2;
      if (longitude >= lonMid) {
        ch |= 1 << (4 - bit);
        lonMin = lonMid;
      } else {
        lonMax = lonMid;
      }
    } else {
      const latMid = (latMin + latMax) / 2;
      if (latitude >= latMid) {
        ch |= 1 << (4 - bit);
        latMin = latMid;
      } else {
        latMax = latMid;
      }
    }

    isEven = !isEven;
    if (bit < 4) {
      bit++;
    } else {
      geohash += BASE32[ch];
      bit = 0;
      ch = 0;
    }
  }

  return geohash;
}

export function buildSpatialCacheKey(
  lat: number,
  lng: number,
  category: string,
  radiusKm = 3
): string {
  // Precision 6: ~1.2km x 0.6km bounding box (Lý tưởng cho tìm kiếm bán kính 1-5km)
  const geohash = encodeGeohash(lat, lng, 6);
  return `spatial:${category}:${radiusKm}km:${geohash}`;
}

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

export class SpatialSingleFlightCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private inFlight = new Map<string, Promise<unknown>>();
  private hits = 0;
  private misses = 0;
  private singleFlightSaves = 0;

  async fetchWithSingleFlight<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds = 120
  ): Promise<T> {
    // 1. Kiểm tra Cache HIT
    const entry = this.cache.get(key);
    if (entry && Date.now() < entry.expiresAt) {
      this.hits++;
      return entry.data as T;
    }

    this.misses++;

    // 2. SingleFlight: Nếu đang có 1 request DB cùng key đang bay -> dùng chung Promise
    const activePromise = this.inFlight.get(key);
    if (activePromise) {
      this.singleFlightSaves++;
      return activePromise as Promise<T>;
    }

    // 3. Khởi tạo Promise duy nhất cho tất cả các concurrent callers
    const fetchPromise = (async () => {
      try {
        const freshData = await fetcher();
        this.cache.set(key, {
          data: freshData,
          expiresAt: Date.now() + ttlSeconds * 1000,
        });
        return freshData;
      } finally {
        this.inFlight.delete(key);
      }
    })();

    this.inFlight.set(key, fetchPromise);
    return fetchPromise;
  }

  getMetrics() {
    const total = this.hits + this.misses;
    return {
      cacheHits: this.hits,
      cacheMisses: this.misses,
      hitRatio: total > 0 ? `${Math.round((this.hits / total) * 100)}%` : '0%',
      singleFlightCoalescedRequests: this.singleFlightSaves,
      cacheSize: this.cache.size,
      activeInFlightRequests: this.inFlight.size,
    };
  }

  clear() {
    this.cache.clear();
    this.inFlight.clear();
  }
}

export const spatialCache = new SpatialSingleFlightCache();
