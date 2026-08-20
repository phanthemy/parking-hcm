/**
 * POSTGIS 100,000 POI SYNTHETIC SCALE BENCHMARK
 * Generates 100k spatial records, builds GiST R-Tree indexes, and runs EXPLAIN (ANALYZE, BUFFERS)
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: 'postgresql://erp:erp_dev_2026@localhost:5432/mapgo_spatial',
});

async function run100kBenchmark() {
  console.log('🚀 BẮT ĐẦU BENCHMARK THỰC TẾ TRÊN 100.000 POIs (POSTGIS GIST R-TREE)...\n');
  const client = await pool.connect();

  try {
    // 1. Tạo bảng unlogged tạm 100k POIs
    console.log('📦 1. Tạo bảng benchmark_places_100k và sinh 100.000 records...');
    await client.query(`
      DROP TABLE IF EXISTS benchmark_places_100k;
      CREATE UNLOGGED TABLE benchmark_places_100k (
        id BIGSERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        address TEXT NOT NULL,
        lat DOUBLE PRECISION NOT NULL,
        lon DOUBLE PRECISION NOT NULL,
        geom GEOMETRY(Point, 4326),
        rating DOUBLE PRECISION DEFAULT 4.5,
        verified BOOLEAN DEFAULT false,
        confidence_score DOUBLE PRECISION DEFAULT 0.85,
        status TEXT DEFAULT 'ACTIVE'
      );
    `);

    // Sinh 100.000 records phân bố tại TP.HCM & Hà Nội
    await client.query(`
      INSERT INTO benchmark_places_100k (name, category, address, lat, lon, geom, rating, verified, confidence_score)
      SELECT
        'Bãi đỗ xe MapGo #' || i AS name,
        CASE (i % 5)
          WHEN 0 THEN 'PARKING'
          WHEN 1 THEN 'EV_CHARGING'
          WHEN 2 THEN 'GARAGE'
          WHEN 3 THEN 'FUEL'
          ELSE 'RESTROOM'
        END AS category,
        'Số ' || (i % 999 + 1) || ' Đường số ' || (i % 50 + 1) || ', TP. Hồ Chí Minh' AS address,
        10.7000 + (random() * 0.2000) AS lat,
        106.6000 + (random() * 0.2000) AS lon,
        ST_SetSRID(ST_MakePoint(106.6000 + (random() * 0.2000), 10.7000 + (random() * 0.2000)), 4326) AS geom,
        3.5 + (random() * 1.5) AS rating,
        (random() > 0.6) AS verified,
        0.5 + (random() * 0.5) AS confidence_score
      FROM generate_series(1, 100000) AS i;
    `);

    const countRes = await client.query('SELECT count(*) FROM benchmark_places_100k');
    console.log(`✅ Đã sinh thành công ${countRes.rows[0].count} POIs vào database.`);

    // 2. Tạo GiST Spatial Index trên 100.000 records
    console.log('🌳 2. Xây dựng GiST Spatial Index (R-Tree) trên 100.000 points...');
    const indexStart = Date.now();
    await client.query(`CREATE INDEX idx_100k_geom ON benchmark_places_100k USING gist(geom);`);
    await client.query(`CREATE INDEX idx_100k_geog ON benchmark_places_100k USING gist((geom::geography));`);
    await client.query(`VACUUM ANALYZE benchmark_places_100k;`);
    console.log(`⏱️ Thời gian xây dựng Index GiST: ${Date.now() - indexStart}ms`);

    const benchmarkReports = [];

    // Test 1: Spatial Radius Search 3km trên 100k POIs
    console.log('\n--- Test 1: Spatial Radius 3km (100k POIs, GiST Index) ---');
    const radiusSql = `
      EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
      SELECT id, name, category,
             ST_Distance(geom::geography, ST_SetSRID(ST_MakePoint(106.7009, 10.7769), 4326)::geography) AS distance_m
      FROM benchmark_places_100k
      WHERE status = 'ACTIVE'
        AND ST_DWithin(geom::geography, ST_SetSRID(ST_MakePoint(106.7009, 10.7769), 4326)::geography, 3000)
      ORDER BY distance_m ASC
      LIMIT 20;
    `;
    const radiusPlan = await client.query(radiusSql);
    const radiusExecTime = radiusPlan.rows[0]['QUERY PLAN'][0]['Execution Time'];
    const radiusPlanningTime = radiusPlan.rows[0]['QUERY PLAN'][0]['Planning Time'];
    console.log(`⏱️ Planning Time: ${radiusPlanningTime}ms | Execution Time: ${radiusExecTime}ms`);
    benchmarkReports.push({
      dataset: '100,000 POIs',
      query: 'Spatial Radius 3km (ST_DWithin + ST_Distance)',
      planningTimeMs: radiusPlanningTime,
      executionTimeMs: radiusExecTime,
      qpsPerCore: Math.round(1000 / radiusExecTime),
    });

    // Test 2: Bounding Box Viewport Search trên 100k POIs
    console.log('\n--- Test 2: Bounding Box Viewport Search (100k POIs, && Operator) ---');
    const bboxSql = `
      EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
      SELECT id, name, category, lat, lon
      FROM benchmark_places_100k
      WHERE status = 'ACTIVE'
        AND geom && ST_MakeEnvelope(106.6800, 10.7600, 106.7200, 10.8000, 4326)
      LIMIT 100;
    `;
    const bboxPlan = await client.query(bboxSql);
    const bboxExecTime = bboxPlan.rows[0]['QUERY PLAN'][0]['Execution Time'];
    const bboxPlanningTime = bboxPlan.rows[0]['QUERY PLAN'][0]['Planning Time'];
    console.log(`⏱️ Planning Time: ${bboxPlanningTime}ms | Execution Time: ${bboxExecTime}ms`);
    benchmarkReports.push({
      dataset: '100,000 POIs',
      query: 'Bounding Box Viewport (&& Operator)',
      planningTimeMs: bboxPlanningTime,
      executionTimeMs: bboxExecTime,
      qpsPerCore: Math.round(1000 / bboxExecTime),
    });

    // Test 3: Multi-Factor Composite Search Ranking trên 100k POIs
    console.log('\n--- Test 3: Multi-Factor Search Ranking (100k POIs) ---');
    const rankSql = `
      EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
      SELECT id, name, category, rating, verified,
             ST_Distance(geom::geography, ST_SetSRID(ST_MakePoint(106.7009, 10.7769), 4326)::geography) AS distance_m,
             (
               (1.0 / (1.0 + (ST_Distance(geom::geography, ST_SetSRID(ST_MakePoint(106.7009, 10.7769), 4326)::geography) / 1000.0))) * 0.40
               + (COALESCE(rating, 4.0) / 5.0) * 0.25
               + (CASE WHEN verified THEN 1.0 ELSE 0.0 END) * 0.20
               + (COALESCE(confidence_score, 0.5)) * 0.15
             ) AS rank_score
      FROM benchmark_places_100k
      WHERE status = 'ACTIVE'
        AND ST_DWithin(geom::geography, ST_SetSRID(ST_MakePoint(106.7009, 10.7769), 4326)::geography, 5000)
      ORDER BY rank_score DESC
      LIMIT 20;
    `;
    const rankPlan = await client.query(rankSql);
    const rankExecTime = rankPlan.rows[0]['QUERY PLAN'][0]['Execution Time'];
    const rankPlanningTime = rankPlan.rows[0]['QUERY PLAN'][0]['Planning Time'];
    console.log(`⏱️ Planning Time: ${rankPlanningTime}ms | Execution Time: ${rankExecTime}ms`);
    benchmarkReports.push({
      dataset: '100,000 POIs',
      query: 'Multi-Factor Search Ranking Engine',
      planningTimeMs: rankPlanningTime,
      executionTimeMs: rankExecTime,
      qpsPerCore: Math.round(1000 / rankExecTime),
    });

    console.log('\n📊 KẾT QUẢ BENCHMARK SO SÁNH TRÊN 100.000 POIs:');
    console.table(benchmarkReports);

    // Lưu artifact
    const outputDir = path.join(__dirname, '..', 'evidence', 'sprint-06');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    fs.writeFileSync(
      path.join(outputDir, '100k-poi-spatial-benchmark.json'),
      JSON.stringify(benchmarkReports, null, 2)
    );
    console.log('✅ Báo cáo benchmark 100.000 POIs đã được lưu tại: evidence/sprint-06/100k-poi-spatial-benchmark.json');

    // Dọn dẹp bảng tạm
    await client.query('DROP TABLE benchmark_places_100k;');
    console.log('🧹 Đã dọn dẹp bảng benchmark tạm.');
  } finally {
    client.release();
    await pool.end();
  }
}

run100kBenchmark().catch(console.error);
