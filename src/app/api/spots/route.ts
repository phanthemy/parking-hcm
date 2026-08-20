import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/pg';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const lat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : null;
    const lng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : null;
    const type = searchParams.get('type') || null;
    const search = searchParams.get('search')?.trim() || '';
    const hasCarParking = searchParams.get('hasCarParking') === '1';
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
    const limit = Math.min(parseInt(searchParams.get('limit') || '500'), 2000);
    const offset = (page - 1) * limit;

    let whereConditions = ["status = 'ACTIVE'"];
    let whereParams: any[] = [];

    // Type filter mapping (hỗ trợ cả uppercase, lowercase và các alias cũ)
    if (type && type !== 'all') {
      const typeUpper = type.toUpperCase();
      const typeMap: Record<string, string[]> = {
        'PARKING_LOT': ['PARKING', 'PARKING_LOT'],
        'PARKING': ['PARKING', 'PARKING_LOT'],
        'FUEL': ['FUEL'],
        'EV_CHARGING': ['EV_CHARGING', 'EV_CHARGER'],
        'EV_CHARGER': ['EV_CHARGING', 'EV_CHARGER'],
        'CAR_REPAIR': ['CAR_REPAIR', 'GARAGE'],
        'GARAGE': ['CAR_REPAIR', 'GARAGE'],
        'CAR_WASH': ['CAR_WASH', 'CARWASH'],
        'CARWASH': ['CAR_WASH', 'CARWASH'],
        'INSPECTION': ['INSPECTION'],
        'RESTROOM': ['RESTROOM'],
        'RESTAURANT': ['RESTAURANT'],
        'CAFE': ['CAFE'],
        'SERVICE': ['SERVICE']
      };

      const matchedCats = typeMap[typeUpper] || [typeUpper];
      whereParams.push(matchedCats);
      whereConditions.push(`UPPER(category) = ANY($${whereParams.length})`);
    }

    if (hasCarParking) {
      whereConditions.push(`car_slots > 0`);
    }

    if (search) {
      whereParams.push(search);
      const searchIdx = whereParams.length;
      whereConditions.push(`(
        name ILIKE '%' || $${searchIdx} || '%'
        OR f_unaccent(name) ILIKE '%' || f_unaccent($${searchIdx}) || '%'
        OR address ILIKE '%' || $${searchIdx} || '%'
      )`);
    }

    const whereClause = whereConditions.join(' AND ');

    // 1. Execute Count Query separately
    const countQuery = `SELECT COUNT(*) FROM places WHERE ${whereClause};`;
    const countRes = await pool.query(countQuery, whereParams);
    const totalCount = parseInt(countRes.rows[0].count);

    // 2. Build Data Query
    let selectClause = `
      id, osm_id, slug, name, category, sub_category, address,
      lat as latitude, lon as longitude, phone, open_time, close_time,
      price_info, car_slots, bike_slots, rating, review_count, metadata,
      confidence_score, confidence_reasons, verified, source,
      last_synced_at, last_verified_at, verification_source
    `;

    let dataParams = [...whereParams];

    if (lat !== null && lng !== null) {
      dataParams.push(lng, lat);
      const lngIdx = dataParams.length - 1;
      const latIdx = dataParams.length;
      selectClause += `,
        ROUND(ST_Distance(geom::geography, ST_SetSRID(ST_MakePoint($${lngIdx}, $${latIdx}), 4326)::geography)::numeric, 1) as distance_meters
      `;
    }

    const orderClause = (lat !== null && lng !== null) ? 'ORDER BY distance_meters ASC' : 'ORDER BY id ASC';

    dataParams.push(limit, offset);
    const limitIdx = dataParams.length - 1;
    const offsetIdx = dataParams.length;

    const dataQuery = `
      SELECT ${selectClause}
      FROM places
      WHERE ${whereClause}
      ${orderClause}
      LIMIT $${limitIdx} OFFSET $${offsetIdx};
    `;

    const result = await pool.query(dataQuery, dataParams);

    // Map to clean structured schema with Category-specific Metadata
    const mappedSpots = result.rows.map((row: any) => {
      const distKm = row.distance_meters ? (parseFloat(row.distance_meters) / 1000).toFixed(2) : null;
      const cat = row.category ? row.category.toUpperCase() : 'SERVICE';

      // Structure category-specific metadata
      let structuredMeta: any = { ...(row.metadata || {}) };

      if (cat === 'PARKING' || cat === 'PARKING_LOT') {
        structuredMeta = {
          capacity: {
            car: row.car_slots || 0,
            bike: row.bike_slots || 0
          },
          price: {
            hour: row.price_info ? parseInt(row.price_info) || 20000 : 20000,
            currency: 'VND'
          },
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

      return {
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
        rating: row.rating || 5.0,
        reviewCount: row.review_count || 0,
        images: [],
        distance: distKm ? `${distKm} km` : null,
        distanceKm: distKm ? parseFloat(distKm) : null,
        confidenceScore: row.confidence_score || 0.5,
        confidenceReasons: row.confidence_reasons || [],
        source: row.source || 'OSM',
        verified: row.verified || false,
        lastSyncedAt: row.last_synced_at,
        lastVerifiedAt: row.last_verified_at,
        metadata: structuredMeta,
        // Backward-compatibility props for UI
        carSlots: row.car_slots || 0,
        bikeSlots: row.bike_slots || 0,
        basePricePerHour: row.price_info ? parseInt(row.price_info) || 20000 : 20000,
        isPremium: false,
        status: 'ACTIVE'
      };
    });

    return NextResponse.json({
      success: true,
      totalCount,
      page,
      pageSize: limit,
      totalPages: Math.ceil(totalCount / limit),
      spots: mappedSpots
    });
  } catch (error: any) {
    console.error('API /api/spots PostGIS Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
