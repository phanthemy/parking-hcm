import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/pg';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const res = await pool.query('SELECT * FROM places WHERE id = $1', [id]);
    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy địa điểm' }, { status: 404 });
    }

    const row = res.rows[0];
    const meta = row.metadata || {};
    const cat = row.category?.toUpperCase();
    const type = cat === 'PARKING' ? 'PARKING_LOT' : cat;

    const spot = {
      id: row.id.toString(),
      slug: row.slug || `spot-${row.id}`,
      name: row.name,
      address: row.address,
      latitude: parseFloat(row.lat),
      longitude: parseFloat(row.lon),
      lat: parseFloat(row.lat),
      lng: parseFloat(row.lon),
      type,
      category: row.category,
      subCategory: row.sub_category,
      carSlots: row.car_slots || meta.capacity?.car || 0,
      bikeSlots: row.bike_slots || meta.capacity?.bike || 0,
      pricePerHour: meta.price?.hour || 0,
      pricePerHourCar: meta.price?.hour || 0,
      priceInfo: row.price_info || meta.price?.text || '',
      openTime: row.open_time || meta.openingHours?.open || '00:00',
      closeTime: row.close_time || meta.openingHours?.close || '24:00',
      phone: row.phone || meta.contact?.phone || '',
      website: row.website || meta.contact?.website || '',
      isVerified: row.verified || false,
      verified: row.verified || false,
      status: (row.status || 'ACTIVE').toLowerCase(),
      images: meta.images || [],
      metadata: meta,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };

    return NextResponse.json({ success: true, spot });
  } catch (error: any) {
    console.error('Admin get spot error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const {
      name,
      category,
      address,
      lat,
      lon,
      latitude,
      longitude,
      phone,
      openTime,
      closeTime,
      priceInfo,
      carSlots,
      bikeSlots,
      status,
      verified,
      images,
      website
    } = body;

    const currentRes = await pool.query('SELECT metadata FROM places WHERE id = $1', [id]);
    const currentMeta = currentRes.rows[0]?.metadata || {};

    const updatedMeta = {
      ...currentMeta,
      images: Array.isArray(images) ? images : currentMeta.images || [],
      contact: { ...currentMeta.contact, phone: phone ?? currentMeta.contact?.phone, website: website ?? currentMeta.contact?.website },
      openingHours: { open: openTime || '06:00', close: closeTime || '22:00' },
      capacity: { car: parseInt(carSlots || 0), bike: parseInt(bikeSlots || 0) },
      price: { ...currentMeta.price, text: priceInfo }
    };

    const finalLat = parseFloat(lat ?? latitude ?? 0);
    const finalLon = parseFloat(lon ?? longitude ?? 0);

    const updateQuery = `
      UPDATE places SET
        name = COALESCE($1, name),
        category = COALESCE($2, category),
        address = COALESCE($3, address),
        lat = CASE WHEN $4 != 0 THEN $4 ELSE lat END,
        lon = CASE WHEN $5 != 0 THEN $5 ELSE lon END,
        phone = $6,
        open_time = $7,
        close_time = $8,
        price_info = $9,
        car_slots = $10,
        bike_slots = $11,
        status = COALESCE($12, status),
        verified = COALESCE($13, verified),
        website = $14,
        metadata = $15,
        updated_at = NOW()
      WHERE id = $16
      RETURNING id, name, category, address, lat, lon, phone, open_time, close_time, price_info, car_slots, bike_slots, status, verified, metadata;
    `;

    const res = await pool.query(updateQuery, [
      name,
      category?.toUpperCase(),
      address,
      finalLat,
      finalLon,
      phone || null,
      openTime || null,
      closeTime || null,
      priceInfo || null,
      parseInt(carSlots || 0),
      parseInt(bikeSlots || 0),
      status ? status.toUpperCase() : null,
      typeof verified === 'boolean' ? verified : null,
      website || null,
      JSON.stringify(updatedMeta),
      id
    ]);

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy địa điểm để cập nhật' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      spot: res.rows[0]
    });
  } catch (error: any) {
    console.error('Admin update spot error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (body.status !== undefined) {
      fields.push(`status = $${idx++}`);
      values.push(body.status.toUpperCase());
    }

    if (body.verified !== undefined) {
      fields.push(`verified = $${idx++}`);
      values.push(body.verified === true);
    }

    if (body.phone !== undefined) {
      fields.push(`phone = $${idx++}`);
      values.push(body.phone);
    }

    if (body.address !== undefined) {
      fields.push(`address = $${idx++}`);
      values.push(body.address);
    }

    if (body.open_time !== undefined || body.openTime !== undefined) {
      fields.push(`open_time = $${idx++}`);
      values.push(body.open_time || body.openTime);
    }

    if (body.close_time !== undefined || body.closeTime !== undefined) {
      fields.push(`close_time = $${idx++}`);
      values.push(body.close_time || body.closeTime);
    }

    if (fields.length === 0) {
      return NextResponse.json({ success: false, error: 'Không có dữ liệu cập nhật' }, { status: 400 });
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const query = `UPDATE places SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id, name, status, verified, phone, address, open_time, close_time`;
    const res = await pool.query(query, values);

    return NextResponse.json({ success: true, spot: res.rows[0] });
  } catch (error: any) {
    console.error('Admin patch spot error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await pool.query("UPDATE places SET status = 'HIDDEN', updated_at = NOW() WHERE id = $1", [id]);
    return NextResponse.json({ success: true, message: 'Đã ẩn địa điểm thành công' });
  } catch (error: any) {
    console.error('Admin delete spot error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal error' }, { status: 500 });
  }
}
