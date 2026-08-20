import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/pg';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const lat = parseFloat(searchParams.get('lat') || '10.7769'); // Default: Ben Thanh Market
    const lng = parseFloat(searchParams.get('lng') || '106.7009');

    // Query nearest 1 place for driver categories via spatial KNN
    const query = `
      WITH nearest_parking AS (
        SELECT id, name, category, address, phone, price_info, lat, lon, metadata,
               ROUND(ST_Distance(geom::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography)::numeric, 0) as distance_meters
        FROM places
        WHERE category = 'PARKING' AND status = 'ACTIVE'
        ORDER BY geom <-> ST_SetSRID(ST_MakePoint($1, $2), 4326)
        LIMIT 1
      ),
      nearest_fuel AS (
        SELECT id, name, category, address, phone, price_info, lat, lon, metadata,
               ROUND(ST_Distance(geom::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography)::numeric, 0) as distance_meters
        FROM places
        WHERE category = 'FUEL' AND status = 'ACTIVE'
        ORDER BY geom <-> ST_SetSRID(ST_MakePoint($1, $2), 4326)
        LIMIT 1
      ),
      nearest_ev AS (
        SELECT id, name, category, address, phone, price_info, lat, lon, metadata,
               ROUND(ST_Distance(geom::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography)::numeric, 0) as distance_meters
        FROM places
        WHERE category = 'EV_CHARGING' AND status = 'ACTIVE'
        ORDER BY geom <-> ST_SetSRID(ST_MakePoint($1, $2), 4326)
        LIMIT 1
      ),
      nearest_repair AS (
        SELECT id, name, category, address, phone, price_info, lat, lon, metadata,
               ROUND(ST_Distance(geom::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography)::numeric, 0) as distance_meters
        FROM places
        WHERE category = 'CAR_REPAIR' AND status = 'ACTIVE'
        ORDER BY geom <-> ST_SetSRID(ST_MakePoint($1, $2), 4326)
        LIMIT 1
      ),
      nearest_restaurant AS (
        SELECT id, name, category, address, phone, price_info, lat, lon, metadata,
               ROUND(ST_Distance(geom::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography)::numeric, 0) as distance_meters
        FROM places
        WHERE category = 'RESTAURANT' AND status = 'ACTIVE'
        ORDER BY geom <-> ST_SetSRID(ST_MakePoint($1, $2), 4326)
        LIMIT 1
      ),
      nearest_restroom AS (
        SELECT id, name, category, address, phone, price_info, lat, lon, metadata,
               ROUND(ST_Distance(geom::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography)::numeric, 0) as distance_meters
        FROM places
        WHERE category = 'RESTROOM' AND status = 'ACTIVE'
        ORDER BY geom <-> ST_SetSRID(ST_MakePoint($1, $2), 4326)
        LIMIT 1
      ),
      nearest_cafe AS (
        SELECT id, name, category, address, phone, price_info, lat, lon, metadata,
               ROUND(ST_Distance(geom::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography)::numeric, 0) as distance_meters
        FROM places
        WHERE category = 'CAFE' AND status = 'ACTIVE'
        ORDER BY geom <-> ST_SetSRID(ST_MakePoint($1, $2), 4326)
        LIMIT 1
      )
      SELECT * FROM nearest_parking
      UNION ALL
      SELECT * FROM nearest_fuel
      UNION ALL
      SELECT * FROM nearest_ev
      UNION ALL
      SELECT * FROM nearest_repair
      UNION ALL
      SELECT * FROM nearest_restaurant
      UNION ALL
      SELECT * FROM nearest_restroom
      UNION ALL
      SELECT * FROM nearest_cafe;
    `;

    const result = await pool.query(query, [lng, lat]);

    const formatDist = (meters: number) => {
      if (meters < 1000) return `${meters}m`;
      return `${(meters / 1000).toFixed(1)}km`;
    };

    const response: Record<string, any> = {};

    result.rows.forEach((row: any) => {
      const dist = parseInt(row.distance_meters);
      const cat = row.category.toLowerCase();
      response[cat] = {
        id: row.id.toString(),
        name: row.name,
        category: row.category,
        address: row.address,
        phone: row.phone || '',
        latitude: parseFloat(row.lat),
        longitude: parseFloat(row.lon),
        distanceMeters: dist,
        distanceText: formatDist(dist),
        metadata: row.metadata || {}
      };
    });

    return NextResponse.json({
      success: true,
      origin: { lat, lng },
      services: response
    });
  } catch (error: any) {
    console.error('Quick Assist API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
