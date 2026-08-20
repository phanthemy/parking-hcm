const { execSync } = require('child_process');
const { Client } = require('pg');
const fs = require('fs');

const HCM_BBOX = '10.3,106.3,11.2,107.1'; // TP.HCM

const CATEGORIES = [
  { name: 'fuel', filter: '["amenity"="fuel"]' },
  { name: 'ev_charging', filter: '["amenity"="charging_station"]' },
  { name: 'car_repair', filter: '["shop"="car_repair"]' },
  { name: 'car_repair', filter: '["shop"="tyres"]' },
  { name: 'car_wash', filter: '["amenity"="car_wash"]' },
  { name: 'car_wash', filter: '["shop"="car_wash"]' },
  { name: 'parking', filter: '["amenity"="parking"]' }
];

function createSlug(text, id) {
  const base = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${base}-${id}`.slice(0, 100);
}

function cleanName(tags, category) {
  if (tags.name) return tags.name;
  if (tags['name:vi']) return tags['name:vi'];
  if (tags['name:en']) return tags['name:en'];
  if (tags.brand) return `Trạm xăng ${tags.brand}`;
  if (tags.operator) return `Trạm ${tags.operator}`;

  const categoryNames = {
    fuel: 'Cây xăng',
    ev_charging: 'Trạm sạc xe điện EV',
    car_repair: 'Garage sửa xe ô tô',
    car_wash: 'Tiệm rửa xe',
    parking: 'Bãi đỗ xe'
  };
  return categoryNames[category] || 'Điểm dịch vụ';
}

function cleanAddress(tags, lat, lon) {
  const parts = [];
  if (tags['addr:housenumber']) parts.push(tags['addr:housenumber']);
  if (tags['addr:street']) parts.push(tags['addr:street']);
  if (tags['addr:suburb'] || tags['addr:ward']) parts.push(tags['addr:suburb'] || tags['addr:ward']);
  if (tags['addr:district']) parts.push(tags['addr:district']);
  if (tags['addr:city']) parts.push(tags['addr:city']);
  else parts.push('TP. Hồ Chí Minh');

  return parts.length > 1 ? parts.join(', ') : `Khu vực tọa độ (${lat.toFixed(4)}, ${lon.toFixed(4)}), TP.HCM`;
}

function fetchWithCurl(filter) {
  const query = `[out:json][timeout:60];(node${filter}(${HCM_BBOX});way${filter}(${HCM_BBOX}););out center;`;
  const tmpFile = `/tmp/osm_query_${Date.now()}.json`;
  try {
    const cmd = `curl -s -A "MapGoBot/1.0" --data-urlencode "data=${query}" "https://overpass-api.de/api/interpreter" -o "${tmpFile}"`;
    execSync(cmd, { timeout: 70000 });
    const content = fs.readFileSync(tmpFile, 'utf8');
    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
    const parsed = JSON.parse(content);
    return parsed.elements || [];
  } catch (e) {
    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
    console.error(`Curl error for ${filter}:`, e.message);
    return [];
  }
}

async function run() {
  const pg = new Client({
    connectionString: 'postgresql://erp:erp_dev_2026@localhost:5432/mapgo_spatial'
  });
  await pg.connect();
  console.log('Connected to PostgreSQL mapgo_spatial!');

  let totalInserted = 0;

  for (const cat of CATEGORIES) {
    console.log(`\n- Đang thu thập dữ liệu: ${cat.name} (${cat.filter})...`);
    const elements = fetchWithCurl(cat.filter);
    console.log(`  ✓ Nhận được ${elements.length} records`);

    let catCount = 0;
    for (const el of elements) {
      const lat = el.lat || el.center?.lat;
      const lon = el.lon || el.center?.lon;
      const tags = el.tags || {};

      if (!lat || !lon) continue;

      const name = cleanName(tags, cat.name);
      const address = cleanAddress(tags, lat, lon);
      const slug = createSlug(name, el.id);
      const phone = tags.phone || tags['contact:phone'] || null;
      const openTime = tags.opening_hours || null;

      const query = `
        INSERT INTO places (osm_id, slug, name, category, address, lat, lon, phone, open_time, source, metadata)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (slug) DO UPDATE SET
          name = EXCLUDED.name,
          address = EXCLUDED.address,
          lat = EXCLUDED.lat,
          lon = EXCLUDED.lon,
          category = EXCLUDED.category,
          metadata = EXCLUDED.metadata;
      `;

      const metadata = {
        osm_type: el.type,
        brand: tags.brand || null,
        operator: tags.operator || null,
        opening_hours: tags.opening_hours || null,
        capacity: tags.capacity || null,
        socket_types: tags['socket:type2'] || tags['socket:ccs'] || null,
        fee: tags.fee || null
      };

      try {
        await pg.query(query, [
          el.id,
          slug,
          name,
          cat.name,
          address,
          lat,
          lon,
          phone,
          openTime,
          'osm_overpass',
          JSON.stringify(metadata)
        ]);
        catCount++;
        totalInserted++;
      } catch (err) {}
    }

    console.log(`  => Đã lưu thành công ${catCount} địa điểm vào PostGIS!`);
    // Delay 3s
    execSync('sleep 3');
  }

  console.log(`\n🎉 HOÀN TẤT CÀO TOÀN DIỆN DỮ LIỆU Ô TÔ TP.HCM!`);
  console.log(`- Tổng số địa điểm được thêm mới / cập nhật: ${totalInserted}`);

  // Thống kê phân loại POIs trong DB
  const stats = await pg.query(`
    SELECT category, COUNT(*) as total
    FROM places
    GROUP BY category
    ORDER BY total DESC;
  `);

  console.log('\n--- THỐNG KÊ TOÀN BỘ POI THEO CHUYÊN NGÀNH TRONG POSTGIS ---');
  stats.rows.forEach(r => {
    console.log(`* ${r.category.toUpperCase().padEnd(15)} : ${r.total} địa điểm`);
  });

  const totalCount = await pg.query('SELECT COUNT(*) FROM places;');
  console.log(`\n=> TỔNG CỘNG TRONG POSTGIS DATABASE: ${totalCount.rows[0].count} ĐỊA ĐIỂM!`);

  await pg.end();
}

run().catch(console.error);
