const { PrismaClient } = require('@prisma/client');
const sqlite = new PrismaClient();
const { Client } = require('pg');

async function migrate() {
  console.log('Connecting to PostgreSQL mapgo_spatial...');
  const pg = new Client({
    connectionString: 'postgresql://erp:erp_dev_2026@localhost:5432/mapgo_spatial'
  });
  await pg.connect();
  console.log('Connected to PostgreSQL!');

  const spots = await sqlite.parkingSpot.findMany({
    where: { status: { in: ['active', 'ACTIVE'] } }
  });
  console.log(`Found ${spots.length} spots in SQLite to migrate...`);

  let count = 0;
  for (const s of spots) {
    const category = s.type ? s.type.toLowerCase() : 'parking';
    const query = `
      INSERT INTO places (slug, name, category, address, lat, lon, phone, open_time, close_time, price_info, car_slots, bike_slots, status, source)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        address = EXCLUDED.address,
        lat = EXCLUDED.lat,
        lon = EXCLUDED.lon,
        category = EXCLUDED.category;
    `;
    const values = [
      s.slug || s.id,
      s.name,
      category,
      s.address,
      s.lat,
      s.lng,
      s.phone || null,
      s.openTime || null,
      s.closeTime || null,
      s.pricePerHour ? `${s.pricePerHour} VND` : null,
      s.carSlots || 0,
      s.bikeSlots || 0,
      'ACTIVE',
      'sqlite_migration'
    ];

    await pg.query(query, values);
    count++;
  }

  console.log(`Successfully migrated ${count} spots to PostgreSQL + PostGIS!`);

  // Test ST_DWithin query around Ben Thanh market (lat 10.7725, lon 106.6980) radius 2km
  const testRes = await pg.query(`
    SELECT name, category, address,
           ROUND(ST_Distance(geom::geography, ST_SetSRID(ST_MakePoint(106.6980, 10.7725), 4326)::geography)::numeric, 1) as distance_meters
    FROM places
    WHERE ST_DWithin(geom::geography, ST_SetSRID(ST_MakePoint(106.6980, 10.7725), 4326)::geography, 2000)
    ORDER BY distance_meters ASC
    LIMIT 10;
  `);

  console.log('\n--- TEST POSTGIS SPATIAL SEARCH (BÁN KÍNH 2KM QUANH CHỢ BẾN THÀNH) ---');
  console.log(`Tìm thấy ${testRes.rows.length} địa điểm trong 2km:`);
  testRes.rows.forEach(r => {
    console.log(`- [${r.category.toUpperCase()}] ${r.name} (${r.distance_meters}m)`);
  });

  await pg.end();
}

migrate().catch(console.error);
