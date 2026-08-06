#!/usr/bin/env node
/**
 * scrape-overpass.js — Cào dữ liệu địa điểm từ OpenStreetMap (Overpass API)
 * 
 * Sử dụng:
 *   node scrape-overpass.js [category] [lat] [lng] [radius_km]
 * 
 * Ví dụ:
 *   node scrape-overpass.js parking 10.7769 106.7009 5
 *   node scrape-overpass.js restaurant 10.7769 106.7009 3
 *   node scrape-overpass.js cafe 10.7769 106.7009 3
 *   node scrape-overpass.js toilet 10.7769 106.7009 5
 *   node scrape-overpass.js all 10.7769 106.7009 5
 */

const { PrismaClient } = require('./node_modules/.prisma/client');
const p = new PrismaClient();

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

// ============================
// 📋 CATEGORY MAPPING CONFIG
// ============================
const CATEGORY_QUERIES = {
  parking: {
    dbType: 'PARKING_LOT',
    overpassFilter: `
      node["amenity"="parking"](BBOX);
      way["amenity"="parking"](BBOX);
      node["amenity"="parking_space"](BBOX);
      node["parking"="multi-storey"](BBOX);
      way["parking"="multi-storey"](BBOX);
    `,
  },
  restaurant: {
    dbType: 'RESTAURANT',
    overpassFilter: `
      node["amenity"="restaurant"](BBOX);
      node["amenity"="food_court"](BBOX);
      node["amenity"="fast_food"](BBOX);
    `,
  },
  cafe: {
    dbType: 'CAFE',
    overpassFilter: `
      node["amenity"="cafe"](BBOX);
      node["amenity"="coffee_shop"](BBOX);
    `,
  },
  toilet: {
    dbType: 'RESTROOM',
    overpassFilter: `
      node["amenity"="toilets"](BBOX);
      node["amenity"="toilet"](BBOX);
    `,
  },
  gas_station: {
    dbType: 'SERVICE',
    overpassFilter: `
      node["amenity"="fuel"](BBOX);
      way["amenity"="fuel"](BBOX);
    `,
  },
};

// ============================
// 🌍 REVERSE GEOCODE
// ============================
async function reverseGeocode(lat, lng) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'MapGo.vn Scraper/1.0 (software@rtrobotics.com)' }
    });
    const data = await res.json();
    return data;
  } catch {
    return null;
  }
}

function buildAddress(geo) {
  if (!geo?.address) return null;
  const a = geo.address;
  const houseNumber = a.house_number || '';
  const road = a.road || a.pedestrian || a.suburb || '';
  const ward = a.quarter || a.suburb || a.village || '';
  const district = a.city_district || a.district || a.county || '';

  const parts = [];
  if (houseNumber && road) parts.push(`${houseNumber} ${road}`);
  else if (road) parts.push(road);
  if (ward && !road.includes(ward)) parts.push(ward.startsWith('Phường') ? ward : `Phường ${ward}`);
  if (district) parts.push(district.startsWith('Quận') || district.includes('Thủ Đức') ? district : `Quận ${district}`);
  parts.push('TP.HCM');

  return parts.length >= 2 ? parts.join(', ').replace(/,\s*Thành phố Hồ Chí Minh/gi, '') : null;
}

// ============================
// 📡 OVERPASS FETCH
// ============================
async function fetchOverpass(query) {
  const body = `[out:json][timeout:60];\n(\n${query}\n);\nout center;`;
  const res = await fetch(OVERPASS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(body)}`,
  });
  if (!res.ok) throw new Error(`Overpass HTTP ${res.status}`);
  const json = await res.json();
  return json.elements || [];
}

// ============================
// 🔧 MAIN SCRAPER
// ============================
async function scrapeCategory(categoryKey, lat, lng, radiusKm) {
  const config = CATEGORY_QUERIES[categoryKey];
  if (!config) {
    console.error(`Unknown category: ${categoryKey}. Valid: ${Object.keys(CATEGORY_QUERIES).join(', ')}`);
    return;
  }

  const R = radiusKm * 1000; // meters
  // Bounding box: lat±Δlat, lng±Δlng
  const dLat = (R / 111320).toFixed(6);
  const dLng = (R / (111320 * Math.cos(lat * Math.PI / 180))).toFixed(6);
  const bbox = `${lat - dLat},${lng - dLng},${+lat + +dLat},${+lng + +dLng}`;
  const query = config.overpassFilter.replace(/BBOX/g, bbox);

  console.log(`\n🔍 Đang tìm [${categoryKey}] trong bán kính ${radiusKm}km quanh (${lat}, ${lng})...`);

  let elements;
  try {
    elements = await fetchOverpass(query);
  } catch (err) {
    console.error('Overpass error:', err.message);
    return;
  }

  console.log(`📦 Overpass trả về ${elements.length} điểm thô.`);

  let added = 0, skipped = 0;

  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    const elLat = el.lat ?? el.center?.lat;
    const elLng = el.lon ?? el.center?.lon;
    if (!elLat || !elLng) { skipped++; continue; }

    const tags = el.tags || {};
    const rawName = tags.name || tags['name:vi'] || tags['name:en'] || '';
    if (!rawName) { skipped++; continue; }

    // Check duplicate by proximity (within 50m)
    const existing = await p.parkingSpot.findFirst({
      where: {
        lat: { gte: elLat - 0.0005, lte: elLat + 0.0005 },
        lng: { gte: elLng - 0.0005, lte: elLng + 0.0005 },
        type: config.dbType,
      }
    });
    if (existing) { skipped++; continue; }

    // Reverse geocode
    await sleep(1200);
    const geo = await reverseGeocode(elLat, elLng);
    const address = buildAddress(geo) || `${rawName}, TP.HCM`;

    // Build record
    const record = {
      name: rawName,
      address,
      lat: elLat,
      lng: elLng,
      type: config.dbType,
      status: 'active',
      isPremium: false,
      description: tags.description || '',
      phone: tags.phone || tags['contact:phone'] || null,
      website: tags.website || tags['contact:website'] || null,
      openTime: tags.opening_hours ? tags.opening_hours.split('-')[0]?.trim() : null,
      closeTime: tags.opening_hours ? tags.opening_hours.split('-')[1]?.trim() : null,
    };

    try {
      await p.parkingSpot.create({ data: record });
      console.log(`  ✅ [${i + 1}/${elements.length}] THÊM: "${rawName}" — ${address}`);
      added++;
    } catch (err) {
      console.error(`  ❌ Lỗi tạo: ${rawName} — ${err.message}`);
      skipped++;
    }
  }

  console.log(`\n🎉 Hoàn thành [${categoryKey}]: Thêm ${added} điểm mới, bỏ qua ${skipped} trùng/rỗng.`);
}

// ============================
// 🚀 ENTRY POINT
// ============================
(async () => {
  const [,, category = 'all', latStr = '10.7769', lngStr = '106.7009', radiusStr = '5'] = process.argv;
  const lat = parseFloat(latStr);
  const lng = parseFloat(lngStr);
  const radius = parseFloat(radiusStr);

  console.log(`====================================`);
  console.log(`🗺️  MapGo.vn — Overpass Scraper`);
  console.log(`====================================`);
  console.log(`Category: ${category} | Center: (${lat}, ${lng}) | Radius: ${radius}km`);

  if (category === 'all') {
    for (const key of Object.keys(CATEGORY_QUERIES)) {
      await scrapeCategory(key, lat, lng, radius);
      await sleep(3000);
    }
  } else {
    await scrapeCategory(category, lat, lng, radius);
  }

  await p.$disconnect();
  console.log('\n✅ Xong! Chạy "npm run dev" để xem kết quả tại http://localhost:3000');
})();
