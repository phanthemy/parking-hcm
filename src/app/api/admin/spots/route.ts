import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/pg';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const district = searchParams.get('district');
    const verified = searchParams.get('verified');
    const qualityIssue = searchParams.get('quality_issue');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'id_desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let whereClauses: string[] = [];
    let values: any[] = [];
    let paramIndex = 1;

    // Filter by Status
    if (status && status !== 'all') {
      if (status === 'hidden') {
        whereClauses.push(`UPPER(status) IN ('HIDDEN', 'DUPLICATE')`);
      } else {
        whereClauses.push(`UPPER(status) = $${paramIndex++}`);
        values.push(status.toUpperCase());
      }
    }

    // Filter by Category
    if (category && category !== 'all') {
      whereClauses.push(`UPPER(category) = $${paramIndex++}`);
      values.push(category.toUpperCase());
    }

    // Filter by District
    if (district && district !== 'all') {
      whereClauses.push(`address ILIKE $${paramIndex++}`);
      values.push(`%${district}%`);
    }

    // Filter by Verified
    if (verified && verified !== 'all') {
      whereClauses.push(`verified = $${paramIndex++}`);
      values.push(verified === 'true');
    }

    // Filter by Data Quality Issue
    if (qualityIssue && qualityIssue !== 'all') {
      if (qualityIssue === 'missing_phone') {
        whereClauses.push(`(phone IS NULL OR TRIM(phone) = '')`);
      } else if (qualityIssue === 'missing_hours') {
        whereClauses.push(`((open_time IS NULL OR TRIM(open_time) = '') AND (close_time IS NULL OR TRIM(close_time) = ''))`);
      } else if (qualityIssue === 'raw_address') {
        whereClauses.push(`(address ILIKE 'Tọa độ%' OR address ILIKE 'Khu vực tọa độ%' OR address ~ '^[0-9\\.\\,\\s-]+$')`);
      } else if (qualityIssue === 'missing_images') {
        whereClauses.push(`(metadata->'images' IS NULL OR jsonb_array_length(metadata->'images') = 0)`);
      } else if (qualityIssue === 'unverified') {
        whereClauses.push(`(verified = false OR verified IS NULL)`);
      } else if (qualityIssue === 'low_confidence') {
        whereClauses.push(`confidence_score < 0.85`);
      }
    }

    // Filter by Search Query (name, address, phone)
    if (search && search.trim()) {
      whereClauses.push(`(
        name ILIKE $${paramIndex} OR 
        address ILIKE $${paramIndex} OR 
        phone ILIKE $${paramIndex} OR
        f_unaccent(name) ILIKE f_unaccent($${paramIndex}) OR
        f_unaccent(address) ILIKE f_unaccent($${paramIndex})
      )`);
      values.push(`%${search.trim()}%`);
      paramIndex++;
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Sort order
    let orderSql = 'ORDER BY id DESC';
    if (sort === 'id_asc') orderSql = 'ORDER BY id ASC';
    else if (sort === 'name_asc') orderSql = 'ORDER BY name ASC';
    else if (sort === 'updated_desc') orderSql = 'ORDER BY updated_at DESC';

    // Query spots and total count in parallel
    const [spotsRes, countRes] = await Promise.all([
      pool.query(
        `SELECT id, osm_id, slug, name, category, sub_category, address, 
                phone, open_time, close_time, price_info, car_slots, bike_slots, 
                lat, lon, status, verified, confidence_score, 
                metadata, source, created_at, updated_at
         FROM places
         ${whereSql}
         ${orderSql}
         LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
        [...values, limit, offset]
      ),
      pool.query(`SELECT COUNT(*) as total FROM places ${whereSql}`, values)
    ]);

    const total = parseInt(countRes.rows[0]?.total || '0');

    const mappedSpots = spotsRes.rows.map((row: any) => {
      const meta = row.metadata || {};
      const cat = row.category?.toUpperCase();
      const type = cat === 'PARKING' ? 'PARKING_LOT' : cat;

      return {
        id: row.id.toString(),
        slug: row.slug || `spot-${row.id}`,
        name: row.name || 'Địa điểm chưa đặt tên',
        address: row.address || 'TP. Hồ Chí Minh',
        description: meta.description || '',
        latitude: parseFloat(row.lat),
        longitude: parseFloat(row.lon),
        lat: parseFloat(row.lat),
        lng: parseFloat(row.lon),
        type: type,
        category: row.category,
        subCategory: row.sub_category,
        carSlots: row.car_slots || meta.capacity?.car || 0,
        bikeSlots: row.bike_slots || meta.capacity?.bike || 0,
        basePricePerHour: meta.price?.hour || 0,
        pricePerHour: meta.price?.hour || 0,
        pricePerHourCar: meta.price?.hour || 0,
        priceInfo: row.price_info || meta.price?.text || '',
        openTime: row.open_time || meta.openingHours?.open || '00:00',
        closeTime: row.close_time || meta.openingHours?.close || '24:00',
        phone: row.phone || meta.contact?.phone || '',
        website: row.website || meta.contact?.website || '',
        isPremium: false,
        isVerified: row.verified || false,
        verified: row.verified || false,
        status: (row.status || 'ACTIVE').toLowerCase(),
        source: row.source || 'osm',
        confidenceScore: row.confidence_score || 0.85,
        metadata: meta,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        images: meta.images || [],
        rating: 5.0,
        reviewCount: 0
      };
    });

    return NextResponse.json({
      success: true,
      spots: mappedSpots,
      data: mappedSpots,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error: any) {
    console.error('Admin spots query error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      category = 'PARKING',
      address = '',
      lat,
      lon,
      phone = '',
      openTime = '06:00',
      closeTime = '22:00',
      priceInfo = '',
      carSlots = 0,
      bikeSlots = 0,
      status = 'ACTIVE',
      verified = false,
      images = []
    } = body;

    if (!name || !lat || !lon) {
      return NextResponse.json(
        { success: false, error: 'Tên và tọa độ (lat, lon) là bắt buộc' },
        { status: 400 }
      );
    }

    const metadata = {
      images: Array.isArray(images) ? images : [],
      contact: { phone },
      openingHours: { open: openTime, close: closeTime },
      capacity: { car: carSlots, bike: bikeSlots }
    };

    const insertQuery = `
      INSERT INTO places (
        name, category, address, lat, lon, phone, 
        open_time, close_time, price_info, car_slots, bike_slots, 
        status, verified, metadata, source, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'admin', NOW(), NOW()
      ) RETURNING id, name, category, address, lat, lon, status, verified;
    `;

    const res = await pool.query(insertQuery, [
      name,
      category.toUpperCase(),
      address,
      parseFloat(lat),
      parseFloat(lon),
      phone,
      openTime,
      closeTime,
      priceInfo,
      parseInt(carSlots || 0),
      parseInt(bikeSlots || 0),
      status.toUpperCase(),
      verified === true,
      JSON.stringify(metadata)
    ]);

    return NextResponse.json({
      success: true,
      spot: res.rows[0]
    });
  } catch (error: any) {
    console.error('Admin create spot error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}
