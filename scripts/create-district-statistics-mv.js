/**
 * MATERIALIZED VIEW FOR DISTRICT & CITY SEO LANDING PAGES
 * Pre-aggregates POI statistics, price summaries, and verification stats
 */

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://erp:erp_dev_2026@localhost:5432/mapgo_spatial',
});

async function setupMaterializedView() {
  console.log('🚀 KHỞI TẠO MATERIALIZED VIEW CHO LANDING PAGES & DISTRICT HUBS...\n');
  const client = await pool.connect();

  try {
    // 1. Tạo Materialized View
    console.log('📦 1. Tạo district_statistics_mv...');
    await client.query(`
      DROP MATERIALIZED VIEW IF EXISTS district_statistics_mv;
      CREATE MATERIALIZED VIEW district_statistics_mv AS
      SELECT
        COALESCE(sub_category, 'quan-1') AS district_slug,
        category,
        count(*) AS total_spots,
        ROUND(AVG(COALESCE(rating, 4.5))::numeric, 2) AS avg_rating,
        SUM(CASE WHEN verified THEN 1 ELSE 0 END) AS verified_spots_count,
        SUM(CASE WHEN car_slots > 0 THEN 1 ELSE 0 END) AS car_parking_count,
        SUM(CASE WHEN bike_slots > 0 THEN 1 ELSE 0 END) AS bike_parking_count,
        NOW() AS last_refreshed_at
      FROM places
      WHERE status = 'ACTIVE'
      GROUP BY COALESCE(sub_category, 'quan-1'), category;

      CREATE UNIQUE INDEX idx_district_mv_slug_cat ON district_statistics_mv (district_slug, category);
    `);
    console.log('✅ Đã tạo Materialized View và Unique Index thành công.');

    // 2. Truy vấn thử dữ liệu từ Materialized View
    console.log('\n--- DỮ LIỆU TỔNG HỢP TỨC THÌ TỪ MATERIALIZED VIEW (0ms) ---');
    const res = await client.query(`
      SELECT district_slug, category, total_spots, avg_rating, verified_spots_count, last_refreshed_at
      FROM district_statistics_mv
      ORDER BY total_spots DESC
      LIMIT 10;
    `);
    console.table(res.rows);

    // 3. Test Refresh Materialized View Concurrently
    console.log('\n🔄 3. Kiểm tra cơ chế REFRESH MATERIALIZED VIEW CONCURRENTLY...');
    const refreshStart = Date.now();
    await client.query(`REFRESH MATERIALIZED VIEW CONCURRENTLY district_statistics_mv;`);
    console.log(`⏱️ Thời gian refresh không lock bảng: ${Date.now() - refreshStart}ms`);

    console.log('\n✅ MATERIALIZED VIEW SẴN SÀNG CHO PRODUCTION LANDING PAGES!');
  } finally {
    client.release();
    await pool.end();
  }
}

setupMaterializedView().catch(console.error);
