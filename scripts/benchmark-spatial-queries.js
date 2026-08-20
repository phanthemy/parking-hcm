/**
 * POSTGIS & SPATIAL PERFORMANCE BENCHMARK SUITE
 * Measures query execution times, EXPLAIN ANALYZE plans, and throughput
 */

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://erp:erp_dev_2026@localhost:5432/mapgo_spatial',
});

async function runBenchmarks() {
  console.log('🏁 BẮT ĐẦU BENCHMARK TRUY VẤN SPATIAL POSTGIS & FULL-TEXT TRÊN 1.977 POIs...\n');

  const client = await pool.connect();
  const benchmarkResults = [];

  try {
    // 1. Benchmark Radius Search 3km với ST_DWithin (GiST Spatial Index)
    console.log('--- 1. SPATIAL RADIUS SEARCH (3km, GiST Index) ---');
    const radiusSql = `
      EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
      SELECT id, name, category,
             ST_Distance(geom::geography, ST_SetSRID(ST_MakePoint(106.6983, 10.7816), 4326)::geography) AS distance_m
      FROM places
      WHERE status = 'ACTIVE'
        AND ST_DWithin(geom::geography, ST_SetSRID(ST_MakePoint(106.6983, 10.7816), 4326)::geography, 3000)
      ORDER BY distance_m ASC
      LIMIT 20;
    `;
    const radiusPlan = await client.query(radiusSql);
    const radiusExecTime = radiusPlan.rows[0]['QUERY PLAN'][0]['Execution Time'];
    const radiusPlanningTime = radiusPlan.rows[0]['QUERY PLAN'][0]['Planning Time'];
    console.log(`⏱️ Planning Time: ${radiusPlanningTime}ms | Execution Time: ${radiusExecTime}ms`);
    benchmarkResults.push({
      name: 'PostGIS Spatial Radius (3km)',
      type: 'GiST Index Scan',
      planningTimeMs: radiusPlanningTime,
      executionTimeMs: radiusExecTime,
      targetThroughput: `${Math.round(1000 / radiusExecTime)} QPS/core`,
    });

    // 2. Benchmark Bounding Box Search (Map Viewport Pan/Zoom)
    console.log('\n--- 2. BOUNDING BOX VIEWPORT SEARCH (&& Operator) ---');
    const bboxSql = `
      EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
      SELECT id, name, category, lat, lon
      FROM places
      WHERE status = 'ACTIVE'
        AND geom && ST_MakeEnvelope(106.6800, 10.7600, 106.7200, 10.8000, 4326)
      LIMIT 100;
    `;
    const bboxPlan = await client.query(bboxSql);
    const bboxExecTime = bboxPlan.rows[0]['QUERY PLAN'][0]['Execution Time'];
    const bboxPlanningTime = bboxPlan.rows[0]['QUERY PLAN'][0]['Planning Time'];
    console.log(`⏱️ Planning Time: ${bboxPlanningTime}ms | Execution Time: ${bboxExecTime}ms`);
    benchmarkResults.push({
      name: 'Bounding Box Viewport Query',
      type: 'GiST Envelope Scan',
      planningTimeMs: bboxPlanningTime,
      executionTimeMs: bboxExecTime,
      targetThroughput: `${Math.round(1000 / bboxExecTime)} QPS/core`,
    });

    // 3. Benchmark Unaccent Full-Text Trigram Search (GIN Index)
    console.log('\n--- 3. UNACCENT FULL-TEXT SEARCH (GIN Trigram Index) ---');
    const searchSql = `
      EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
      SELECT id, name, address, category, rating
      FROM places
      WHERE status = 'ACTIVE'
        AND f_unaccent(name) ILIKE f_unaccent('%diamond%')
      LIMIT 20;
    `;
    const searchPlan = await client.query(searchSql);
    const searchExecTime = searchPlan.rows[0]['QUERY PLAN'][0]['Execution Time'];
    const searchPlanningTime = searchPlan.rows[0]['QUERY PLAN'][0]['Planning Time'];
    console.log(`⏱️ Planning Time: ${searchPlanningTime}ms | Execution Time: ${searchExecTime}ms`);
    benchmarkResults.push({
      name: 'Unaccent Trigram Full-Text Search',
      type: 'GIN Trigram Scan',
      planningTimeMs: searchPlanningTime,
      executionTimeMs: searchExecTime,
      targetThroughput: `${Math.round(1000 / searchExecTime)} QPS/core`,
    });

    // 4. Benchmark Multi-Factor Search Ranking Engine
    console.log('\n--- 4. MULTI-FACTOR RANKING ENGINE (Distance + Rating + Verified + Confidence) ---');
    const rankingSql = `
      EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
      SELECT id, name, category, rating, verified, confidence_score,
             ST_Distance(geom::geography, ST_SetSRID(ST_MakePoint(106.6983, 10.7816), 4326)::geography) AS distance_m,
             (
               (1.0 / (1.0 + (ST_Distance(geom::geography, ST_SetSRID(ST_MakePoint(106.6983, 10.7816), 4326)::geography) / 1000.0))) * 0.40
               + (COALESCE(rating, 4.0) / 5.0) * 0.25
               + (CASE WHEN verified THEN 1.0 ELSE 0.0 END) * 0.20
               + (COALESCE(confidence_score, 0.5)) * 0.15
             ) AS composite_rank_score
      FROM places
      WHERE status = 'ACTIVE'
        AND ST_DWithin(geom::geography, ST_SetSRID(ST_MakePoint(106.6983, 10.7816), 4326)::geography, 5000)
      ORDER BY composite_rank_score DESC
      LIMIT 20;
    `;
    const rankingPlan = await client.query(rankingSql);
    const rankingExecTime = rankingPlan.rows[0]['QUERY PLAN'][0]['Execution Time'];
    const rankingPlanningTime = rankingPlan.rows[0]['QUERY PLAN'][0]['Planning Time'];
    console.log(`⏱️ Planning Time: ${rankingPlanningTime}ms | Execution Time: ${rankingExecTime}ms`);
    benchmarkResults.push({
      name: 'Multi-Factor Ranking Engine',
      type: 'PostGIS + Dynamic Score Calculation',
      planningTimeMs: rankingPlanningTime,
      executionTimeMs: rankingExecTime,
      targetThroughput: `${Math.round(1000 / rankingExecTime)} QPS/core`,
    });

    console.log('\n📊 TỔNG HỢP KẾT QUẢ BENCHMARK:');
    console.table(benchmarkResults);

    // Lưu kết quả vào file artifact
    const fs = require('fs');
    const path = require('path');
    const outputDir = path.join(__dirname, '..', 'evidence', 'sprint-04');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    fs.writeFileSync(
      path.join(outputDir, 'spatial-benchmark-report.json'),
      JSON.stringify(benchmarkResults, null, 2)
    );
    console.log('✅ Báo cáo benchmark đã được lưu tại: evidence/sprint-04/spatial-benchmark-report.json');
  } finally {
    client.release();
    await pool.end();
  }
}

runBenchmarks().catch(console.error);
