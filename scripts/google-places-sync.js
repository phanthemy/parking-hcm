#!/usr/bin/env node
/**
 * google-places-sync.js — Cào dữ liệu từ Google Maps Places API (New)
 * 
 * Sử dụng:
 *   node scripts/google-places-sync.js [category] [lat] [lng] [radius_meters] [--dry-run]
 * 
 * Ví dụ:
 *   node scripts/google-places-sync.js all 10.7769 106.7009 5000
 */

const { PrismaClient } = require('../node_modules/.prisma/client');
const p = new PrismaClient();
const fs = require('fs');
const path = require('path');

// ============================
// 🔑 LOAD API KEY
// ============================
let GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
if (!GOOGLE_MAPS_API_KEY) {
  try {
    const envPath = path.join(__dirname, '../.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/GOOGLE_MAPS_API_KEY=(.*)/);
    if (match) GOOGLE_MAPS_API_KEY = match[1].trim();
  } catch (err) {
    // Ignore
  }
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ============================
// 📋 CATEGORY CONFIG
// ============================
const CATEGORY_QUERIES = {
  parking: {
    dbType: 'PARKING_LOT',
    includedTypes: ['parking'],
  },
  restaurant: {
    dbType: 'RESTAURANT',
    includedTypes: ['restaurant', 'meal_takeaway', 'food_court'],
  },
  cafe: {
    dbType: 'CAFE',
    includedTypes: ['cafe', 'coffee_shop'],
  },
  toilet: {
    dbType: 'RESTROOM',
    includedTypes: ['public_restroom'],
  },
  gas_station: {
    dbType: 'SERVICE',
    includedTypes: ['gas_station'],
  },
};

// ============================
// 🌍 GRID GENERATOR
// ============================
function generateGrid(centerLat, centerLng, radiusMeters, gridRadius = 1500) {
  if (radiusMeters <= gridRadius) {
    return [{ lat: centerLat, lng: centerLng }];
  }
  
  const points = [];
  const latDegree = 111320; // 1 degree lat = ~111.32 km
  const lngDegree = 111320 * Math.cos(centerLat * Math.PI / 180);
  
  // Step distance = gridRadius * 1.5 to overlap nicely
  const stepMeters = gridRadius * 1.5;
  const stepLat = stepMeters / latDegree;
  const stepLng = stepMeters / lngDegree;
  
  const maxSteps = Math.ceil(radiusMeters / stepMeters);
  
  for (let i = -maxSteps; i <= maxSteps; i++) {
    for (let j = -maxSteps; j <= maxSteps; j++) {
      const lat = centerLat + i * stepLat;
      const lng = centerLng + j * stepLng;
      
      const dLat = (lat - centerLat) * latDegree;
      const dLng = (lng - centerLng) * lngDegree;
      const dist = Math.sqrt(dLat * dLat + dLng * dLng);
      
      if (dist <= radiusMeters) {
        points.push({ lat, lng });
      }
    }
  }
  
  // Always include center
  if (points.length === 0) {
    points.push({ lat: centerLat, lng: centerLng });
  }
  
  return points;
}

// ============================
// 📡 GOOGLE PLACES API FETCH
// ============================
async function fetchGooglePlaces(includedTypes, lat, lng, radius) {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Thiếu GOOGLE_MAPS_API_KEY');
  }

  const url = 'https://places.googleapis.com/v1/places:searchNearby';
  const body = {
    includedTypes,
    locationRestriction: {
      circle: {
        center: { latitude: lat, longitude: lng },
        radius: radius
      }
    },
    maxResultCount: 20
  };

  const headers = {
    'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
    'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.internationalPhoneNumber,places.regularOpeningHours,places.rating,places.googleMapsUri',
    'Content-Type': 'application/json'
  };

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Google API Lỗi ${res.status}: ${errText}`);
  }

  const json = await res.json();
  return json.places || [];
}

// ============================
// 🔧 MAIN SCRAPER
// ============================
async function syncCategory(categoryKey, centerLat, centerLng, totalRadiusMeters, isDryRun) {
  const config = CATEGORY_QUERIES[categoryKey];
  if (!config) {
    console.error(`❌ Unknown category: ${categoryKey}. Valid: ${Object.keys(CATEGORY_QUERIES).join(', ')}`);
    return 0;
  }

  console.log(`\n🔍 Đang đồng bộ [${categoryKey}] bằng Google Maps Places API...`);
  console.log(`   Center: (${centerLat}, ${centerLng}) | Radius: ${totalRadiusMeters}m`);

  const gridRadius = 1500;
  const gridPoints = generateGrid(centerLat, centerLng, totalRadiusMeters, gridRadius);
  console.log(`   📍 Tạo ${gridPoints.length} điểm quét trong lưới (bán kính quét ${gridRadius}m/điểm)`);

  let added = 0;
  let skipped = 0;
  const seenPlaceIds = new Set();

  for (let i = 0; i < gridPoints.length; i++) {
    const point = gridPoints[i];
    console.log(`   ⏳ Quét điểm [${i + 1}/${gridPoints.length}] (${point.lat.toFixed(5)}, ${point.lng.toFixed(5)})...`);
    
    let places;
    try {
      places = await fetchGooglePlaces(config.includedTypes, point.lat, point.lng, gridRadius);
    } catch (err) {
      console.error(`   ❌ Lỗi fetch Google Places: ${err.message}`);
      await sleep(2000);
      continue;
    }

    for (const place of places) {
      if (!place.id || seenPlaceIds.has(place.id)) {
        continue;
      }
      seenPlaceIds.add(place.id);

      const placeLat = place.location?.latitude;
      const placeLng = place.location?.longitude;
      if (!placeLat || !placeLng) {
        skipped++;
        continue;
      }

      const name = place.displayName?.text || 'Không có tên';
      
      // Check duplicate by proximity (within 50m) and type
      const existing = await p.parkingSpot.findFirst({
        where: {
          lat: { gte: placeLat - 0.0005, lte: placeLat + 0.0005 },
          lng: { gte: placeLng - 0.0005, lte: placeLng + 0.0005 },
          type: config.dbType,
        }
      });

      if (existing) {
        skipped++;
        continue;
      }

      // Parse times
      let openTime = null;
      let closeTime = null;
      if (place.regularOpeningHours?.periods?.length > 0) {
        const period = place.regularOpeningHours.periods[0];
        if (period.open?.time) {
          openTime = `${period.open.time.substring(0, 2)}:${period.open.time.substring(2, 4)}`;
        }
        if (period.close?.time) {
          closeTime = `${period.close.time.substring(0, 2)}:${period.close.time.substring(2, 4)}`;
        }
      }

      let pricePerHour = 0;
      if (config.dbType === 'CAFE' || config.dbType === 'RESTAURANT') pricePerHour = 50000;
      else if (config.dbType === 'SERVICE') pricePerHour = 10000;

      const record = {
        name: name,
        address: place.formattedAddress || 'TP.HCM',
        lat: placeLat,
        lng: placeLng,
        type: config.dbType,
        status: 'PENDING',
        isPremium: false,
        description: '',
        phone: place.internationalPhoneNumber || null,
        website: place.googleMapsUri || null,
        openTime: openTime,
        closeTime: closeTime,
        pricePerHour,
        source: 'GOOGLE_MAPS',
        sourceId: place.id,
        googlePlaceId: place.id,
        googleRating: place.rating || null,
        lastSyncedAt: new Date()
      };

      if (isDryRun) {
        console.log(`      👀 [DRY RUN] Sẽ thêm: "${name}" — ${record.address}`);
        added++;
      } else {
        try {
          await p.parkingSpot.create({ data: record });
          console.log(`      ✅ THÊM MỚI: "${name}"`);
          added++;
        } catch (err) {
          console.error(`      ❌ Lỗi lưu DB: ${name} — ${err.message}`);
          skipped++;
        }
      }
    }
    
    // Ngủ một chút giữa các lần gọi API để tránh rate limit
    await sleep(2000);
  }

  console.log(`\n🎉 Hoàn thành [${categoryKey}]: Thêm ${added} điểm mới, bỏ qua ${skipped} trùng/lỗi.`);
  return added;
}

// ============================
// 🚀 ENTRY POINT
// ============================
(async () => {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const cleanArgs = args.filter(a => a !== '--dry-run');

  const category = cleanArgs[0] || 'all';
  const latStr = cleanArgs[1] || '10.7769';
  const lngStr = cleanArgs[2] || '106.7009';
  const radiusStr = cleanArgs[3] || '5000'; // 5000m default

  const lat = parseFloat(latStr);
  const lng = parseFloat(lngStr);
  const radius = parseFloat(radiusStr);

  console.log(`====================================`);
  console.log(`🗺️  MapGo.vn — Google Places Sync`);
  if (isDryRun) console.log(`   [CHẾ ĐỘ DRY-RUN - KHÔNG LƯU DB]`);
  console.log(`====================================`);
  console.log(`Category: ${category} | Center: (${lat}, ${lng}) | Radius: ${radius}m`);

  if (!GOOGLE_MAPS_API_KEY) {
    console.error(`❌ Không tìm thấy GOOGLE_MAPS_API_KEY trong môi trường. Thoát...`);
    process.exit(1);
  }

  let totalAdded = 0;

  if (category === 'all') {
    for (const key of Object.keys(CATEGORY_QUERIES)) {
      totalAdded += await syncCategory(key, lat, lng, radius, isDryRun);
      await sleep(3000);
    }
  } else {
    totalAdded += await syncCategory(category, lat, lng, radius, isDryRun);
  }

  await p.$disconnect();
  console.log(`\n✅ Tổng cộng đã thêm: ${totalAdded} điểm.`);
  console.log('✅ Xong! Chạy "npm run dev" để xem kết quả tại http://localhost:3000');
  
  if (!isDryRun) {
    // Return count to stdout for auto-sync.js to parse
    console.log(`RESULT_ADDED:${totalAdded}`);
  }
})();
