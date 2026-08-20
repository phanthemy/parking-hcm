import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/pg';

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  const searchParams = req.nextUrl.searchParams;

  const lat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : 10.7769;
  const lng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : 106.7009;
  const radius = searchParams.get('radius') ? parseFloat(searchParams.get('radius')!) : 5000; // default 5000m (5km)
  const category = searchParams.get('category') || null;
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

  try {
    const query = `
      SELECT id, osm_id, slug, name, category, address, lat, lon as lng,
             phone, open_time, price_info, car_slots, bike_slots, rating, review_count, metadata,
             ROUND(ST_Distance(geom::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography)::numeric, 1) as distance_meters
      FROM places
      WHERE status = 'ACTIVE'
        AND ($3::text IS NULL OR category = $3)
        AND ST_DWithin(geom::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, $4)
      ORDER BY distance_meters ASC
      LIMIT $5;
    `;

    const result = await pool.query(query, [lng, lat, category, radius, limit]);
    const executionTimeMs = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      query: { lat, lng, radius_meters: radius, category },
      count: result.rows.length,
      execution_time_ms: executionTimeMs,
      data: result.rows
    });
  } catch (error: any) {
    console.error('PostGIS Nearby API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Database spatial query error', details: error.message },
      { status: 500 }
    );
  }
}
