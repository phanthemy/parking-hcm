/**
 * POSTGIS 100K CTE POST-LIMIT KNN OPTIMIZED SPATIAL BENCHMARK
 * Uses CTE to perform KNN index search first, then calculates ST_Distance only on the top 20 rows!
 */

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://erp:erp_dev_2026@localhost:5432/mapgo_spatial',
});

async function runCteKnnBenchmark() {
  console.log('⚡ BẮT ĐẦU BENCHMARK POSTGIS CTE POST-LIMIT KNN TRÊN 100.000 POIs...\n');
  const client = await pool.connect();

  try {
    console.log('📦 1. Khởi tạo 100.000 spatial records...');
    await client.query('DROP TABLE IF EXISTS benchmark_places_100k;');
    await client.query(`
      CREATE UNLOGGED TABLE benchmark_places_100k (
        id BIGSERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        address TEXT NOT NULL,
        lat DOUBLE PRECISION NOT NULL,
        lon DOUBLE PRECISION NOT NULL,
        geom GEOMETRY(Point, 4326),
        rating DOUBLE PRECISION DEFAULT 4.5,
        status TEXT DEFAULT 'ACTIVE'
      );

      INSERT INTO benchmark_places_100k (name, category, address, lat, lon, geom, rating)
      SELECT
        'Bãi đỗ xe MapGo #' || i,
        'PARKING',
        'Số ' || (i % 999 + 1) || ' Đường số ' || (i % 50 + 1),
        10.7000 + (random() * 0.2000),
        106.6000 + (random() * 0.2000),
        ST_SetSRID(ST_MakePoint(106.6000 + (random() * 0.2000), 10.7000 + (random() * 0.2000)), 4326),
        4.5
      FROM generate_series(1, 100000) AS i;

      CREATE INDEX idx_100k_geom ON benchmark_places_100k USING gist(geom);
    `);

    console.log('✅ Đã tạo 100.000 records và Index GiST.');

    // 2. CTE Post-LIMIT Pattern
    console.log('\n--- EXPLAIN ANALYZE: CTE POST-LIMIT KNN QUERY ---');
    const cteSql = `
      EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
      WITH nearest AS (
        SELECT id, name, category, address, lat, lon, geom, rating
        FROM benchmark_places_100k
        WHERE status = 'ACTIVE'
          AND geom && ST_Expand(ST_SetSRID(ST_MakePoint(106.7009, 10.7769), 4326), 0.03)
        ORDER BY geom <-> ST_SetSRID(ST_MakePoint(106.7009, 10.7769), 4326)
        LIMIT 20
      )
      SELECT id, name, category, address, lat, lon, rating,
             ST_Distance(geom::geography, ST_SetSRID(ST_MakePoint(106.7009, 10.7769), 4326)::geography) AS exact_distance_m
      FROM nearest;
    `;
    const plan = await client.query(cteSql);
    const execTime = plan.rows[0]['QUERY PLAN'][0]['Execution Time'];
    const planTime = plan.rows[0]['QUERY PLAN'][0]['Planning Time'];

    console.log(`⏱️ Planning Time: ${planTime}ms`);
    console.log(`⏱️ Execution Time: ${execTime}ms`);
    console.log(`🚀 Tốc độ truy vấn trên 100.000 POIs: ${execTime}ms (Tương đương ${Math.round(1000 / execTime)} QPS/core)!`);

    await client.query('DROP TABLE benchmark_places_100k;');
  } finally {
    client.release();
    await pool.end();
  }
}

runCteKnnBenchmark().catch(console.error);
