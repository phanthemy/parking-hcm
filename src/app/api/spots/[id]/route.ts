import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/pg';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Support lookup by integer ID or slug
    const isNumeric = /^\d+$/.test(id);
    const query = isNumeric
      ? `SELECT *, lat as latitude, lon as longitude FROM places WHERE id = $1 AND status = 'ACTIVE' LIMIT 1;`
      : `SELECT *, lat as latitude, lon as longitude FROM places WHERE slug = $1 AND status = 'ACTIVE' LIMIT 1;`;

    const result = await pool.query(query, [isNumeric ? parseInt(id) : id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Spot not found' }, { status: 404 });
    }

    const row = result.rows[0];
    const cat = row.category ? row.category.toUpperCase() : 'PARKING';
    let structuredMeta: any = { ...(row.metadata || {}) };

    if (cat === 'PARKING' || cat === 'PARKING_LOT') {
      structuredMeta = {
        capacity: { car: row.car_slots || 0, bike: row.bike_slots || 0 },
        price: { hour: row.price_info ? parseInt(row.price_info) || 20000 : 20000, currency: 'VND' },
        payment: structuredMeta.payment || ['Tiền mặt', 'Chuyển khoản QR'],
        heightLimit: structuredMeta.height_limit || 2.1,
        overnight: structuredMeta.overnight ?? true
      };
    } else if (cat === 'FUEL') {
      structuredMeta = {
        brand: structuredMeta.brand || (row.name.includes('Petrolimex') ? 'Petrolimex' : row.name.includes('PV') ? 'PV OIL' : 'Khác'),
        fuelTypes: structuredMeta.fuel_types || ['RON95-V', 'E5 RON92', 'DO 0.001S-V']
      };
    } else if (cat === 'EV_CHARGING' || cat === 'EV_CHARGER') {
      structuredMeta = {
        operator: structuredMeta.operator || (row.name.includes('VinFast') ? 'VinFast' : 'Công cộng'),
        powerKW: structuredMeta.power_kw || 120,
        connector: structuredMeta.connector || ['CCS2', 'Type 2'],
        available: true
      };
    } else if (cat === 'CAR_REPAIR' || cat === 'GARAGE') {
      structuredMeta = {
        services: structuredMeta.services || ['Vá vỏ lưu động', 'Cứu hộ 24/7', 'Sửa chữa chung'],
        roadsideAssistance: true
      };
    }

    // Find nearby similar places within 3km
    const nearbyQuery = `
      SELECT id, slug, name, category, address, lat as latitude, lon as longitude,
        ROUND(ST_Distance(geom::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography)::numeric, 1) as distance_meters
      FROM places
      WHERE category = $3 AND id != $4 AND status = 'ACTIVE'
      ORDER BY geom <-> ST_SetSRID(ST_MakePoint($1, $2), 4326)
      LIMIT 4;
    `;
    const nearbyRes = await pool.query(nearbyQuery, [row.lon, row.lat, row.category, row.id]);

    const mapped = {
      id: row.id.toString(),
      slug: row.slug || `spot-${row.id}`,
      name: row.name,
      type: cat === 'PARKING' ? 'PARKING_LOT' : cat,
      address: row.address || 'TP. Hồ Chí Minh',
      latitude: parseFloat(row.latitude),
      longitude: parseFloat(row.longitude),
      phone: row.phone || '',
      openTime: row.open_time || '06:00',
      closeTime: row.close_time || '22:00',
      pricePerHourCar: row.price_info ? parseInt(row.price_info) || 20000 : 20000,
      pricePerHourBike: row.price_info ? Math.round((parseInt(row.price_info) || 20000) / 4) : 5000,
      carSlots: row.car_slots || 0,
      bikeSlots: row.bike_slots || 0,
      rating: row.rating || 5.0,
      reviewCount: row.review_count || 0,
      images: [],
      confidenceScore: row.confidence_score || 0.5,
      confidenceReasons: row.confidence_reasons || [],
      source: row.source || 'OSM',
      verified: row.verified || false,
      isVerified: row.verified || false,
      lastSyncedAt: row.last_synced_at,
      metadata: structuredMeta,
      nearbySpots: nearbyRes.rows.map((n: any) => ({
        id: n.id.toString(),
        slug: n.slug,
        name: n.name,
        type: n.category,
        address: n.address,
        latitude: parseFloat(n.latitude),
        longitude: parseFloat(n.longitude),
        distanceMeters: parseFloat(n.distance_meters)
      }))
    };

    return NextResponse.json(mapped);
  } catch (error: any) {
    console.error('Get spot error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
