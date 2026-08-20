import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/pg';

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  const searchParams = req.nextUrl.searchParams;

  const q = searchParams.get('q')?.trim() || '';
  const category = searchParams.get('category') || null;
  const lat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : null;
  const lng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : null;
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

  if (!q && !category) {
    return NextResponse.json({
      success: true,
      query: { q, category },
      count: 0,
      execution_time_ms: 0,
      data: []
    });
  }

  try {
    let query = '';
    let params: any[] = [];

    if (lat !== null && lng !== null) {
      // Tìm kiếm kết hợp khoảng cách GPS, độ tương đồng văn bản và Confidence Score
      query = `
        SELECT id, osm_id, slug, name, category, address, lat, lon as lng,
               phone, open_time, price_info, car_slots, bike_slots, rating, review_count, confidence_score,
               GREATEST(similarity(name, $1), similarity(f_unaccent(name), f_unaccent($1))) as text_score,
               ROUND(ST_Distance(geom::geography, ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography)::numeric, 1) as distance_meters
        FROM places
        WHERE status = 'ACTIVE'
          AND ($4::text IS NULL OR category = $4)
          AND (
            $1 = ''
            OR name ILIKE '%' || $1 || '%'
            OR f_unaccent(name) ILIKE '%' || f_unaccent($1) || '%'
            OR address ILIKE '%' || $1 || '%'
            OR f_unaccent(address) ILIKE '%' || f_unaccent($1) || '%'
            OR similarity(name, $1) > 0.2
            OR similarity(f_unaccent(name), f_unaccent($1)) > 0.2
          )
        ORDER BY
          (
            (CASE WHEN $1 != '' THEN GREATEST(similarity(name, $1), similarity(f_unaccent(name), f_unaccent($1))) ELSE 0.5 END * 0.5)
            + (COALESCE(confidence_score, 0.5) * 0.2)
            + (1.0 / (1.0 + (ST_Distance(geom::geography, ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography) / 1000.0)) * 0.3)
          ) DESC
        LIMIT $5;
      `;
      params = [q, lng, lat, category, limit];
    } else {
      // Tìm kiếm thuần text kết hợp Text Score + Confidence Score
      query = `
        SELECT id, osm_id, slug, name, category, address, lat, lon as lng,
               phone, open_time, price_info, car_slots, bike_slots, rating, review_count, confidence_score,
               GREATEST(similarity(name, $1), similarity(f_unaccent(name), f_unaccent($1))) as text_score
        FROM places
        WHERE status = 'ACTIVE'
          AND ($2::text IS NULL OR category = $2)
          AND (
            $1 = ''
            OR name ILIKE '%' || $1 || '%'
            OR f_unaccent(name) ILIKE '%' || f_unaccent($1) || '%'
            OR address ILIKE '%' || $1 || '%'
            OR f_unaccent(address) ILIKE '%' || f_unaccent($1) || '%'
            OR similarity(name, $1) > 0.2
            OR similarity(f_unaccent(name), f_unaccent($1)) > 0.2
          )
        ORDER BY
          (
            (CASE WHEN $1 != '' THEN GREATEST(similarity(name, $1), similarity(f_unaccent(name), f_unaccent($1))) ELSE 0.5 END * 0.7)
            + (COALESCE(confidence_score, 0.5) * 0.3)
          ) DESC
        LIMIT $3;
      `;
      params = [q, category, limit];
    }

    const result = await pool.query(query, params);
    const executionTimeMs = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      query: { q, category, lat, lng },
      count: result.rows.length,
      execution_time_ms: executionTimeMs,
      data: result.rows
    });
  } catch (error: any) {
    console.error('Search API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Database search error', details: error.message },
      { status: 500 }
    );
  }
}
