/**
 * SIMULATE CACHE TRAFFIC & PROVE HIT RATIO / SINGLEFLIGHT SAVINGS
 */

// Embedded Geohash & SingleFlight Cache for standalone Node.js testing
const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';

function encodeGeohash(latitude, longitude, precision = 6) {
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

function buildSpatialCacheKey(lat, lng, category, radiusKm = 3) {
  const geohash = encodeGeohash(lat, lng, 6);
  return `spatial:${category}:${radiusKm}km:${geohash}`;
}

class SpatialSingleFlightCache {
  constructor() {
    this.cache = new Map();
    this.inFlight = new Map();
    this.hits = 0;
    this.misses = 0;
    this.singleFlightSaves = 0;
  }

  async fetchWithSingleFlight(key, fetcher, ttlSeconds = 120) {
    const entry = this.cache.get(key);
    if (entry && Date.now() < entry.expiresAt) {
      this.hits++;
      return entry.data;
    }

    this.misses++;

    const activePromise = this.inFlight.get(key);
    if (activePromise) {
      this.singleFlightSaves++;
      return activePromise;
    }

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
}

const spatialCache = new SpatialSingleFlightCache();

async function main() {
  console.log('⚡ BẮT ĐẦU MÔ PHỎNG 1.000 TRAFFIC REQUESTS QUA GEOHASH SINGLEFLIGHT CACHE...\n');

  const driverLocations = [
    { lat: 10.7769, lng: 106.7009, label: 'Quận 1 - Bến Nghé' },
    { lat: 10.7772, lng: 106.7012, label: 'Quận 1 - Lê Lợi' },
    { lat: 10.7765, lng: 106.7005, label: 'Quận 1 - Đồng Khởi' },
    { lat: 10.7325, lng: 106.7065, label: 'Quận 7 - Phú Mỹ Hưng' },
    { lat: 10.8000, lng: 106.6600, label: 'Tân Bình - Sân Bay' },
  ];

  let simulatedDbQueries = 0;

  async function mockDbFetch(lat, lng) {
    simulatedDbQueries++;
    await new Promise((r) => setTimeout(r, 15));
    return [
      { id: 'spot-1', name: 'Bãi đỗ xe Diamond Plaza', distance: 150 },
      { id: 'spot-2', name: 'Bãi đỗ xe Vincom Center', distance: 320 },
    ];
  }

  const promises = [];
  for (let i = 0; i < 1000; i++) {
    const loc = driverLocations[i % driverLocations.length];
    const cacheKey = buildSpatialCacheKey(loc.lat, loc.lng, 'PARKING', 3);

    promises.push(
      spatialCache.fetchWithSingleFlight(
        cacheKey,
        () => mockDbFetch(loc.lat, loc.lng),
        120
      )
    );
  }

  await Promise.all(promises);

  const metrics = spatialCache.getMetrics();
  console.log('📊 KẾT QUẢ ĐO ĐẠC TELEMETRY CACHE THỰC TẾ:');
  console.table({
    'Tổng Requests gửi đi': 1000,
    'Số lần thực sự query Database': simulatedDbQueries,
    'Cache Hits': metrics.cacheHits,
    'Cache Misses': metrics.cacheMisses,
    'Tỷ lệ Hit Rate': metrics.hitRatio,
    'SingleFlight Promises gộp thành công': metrics.singleFlightCoalescedRequests,
    'Số Key Geohash đang cache': metrics.cacheSize,
  });

  console.log(`\n🎉 HIỆU QUẢ: Giảm ${1000 - simulatedDbQueries} truy vấn DB (Tiết kiệm ${Math.round(((1000 - simulatedDbQueries) / 1000) * 100)}% tải DB)!`);
}

main().catch(console.error);
