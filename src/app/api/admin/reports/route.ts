import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/pg';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get('status');
    const reportType = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let whereClauses: string[] = [];
    let values: any[] = [];
    let paramIndex = 1;

    if (status && status !== 'all') {
      whereClauses.push(`UPPER(status) = $${paramIndex++}`);
      values.push(status.toUpperCase());
    }

    if (reportType && reportType !== 'all') {
      whereClauses.push(`UPPER(report_type) = $${paramIndex++}`);
      values.push(reportType.toUpperCase());
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const [reportsRes, countRes] = await Promise.all([
      pool.query(
        `SELECT r.*, p.name as current_spot_name, p.address as current_spot_address, p.phone as current_spot_phone, p.status as current_spot_status
         FROM user_reports r
         LEFT JOIN places p ON r.spot_id = p.id
         ${whereSql}
         ORDER BY r.created_at DESC
         LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
        [...values, limit, offset]
      ),
      pool.query(`SELECT COUNT(*) as total FROM user_reports ${whereSql}`, values)
    ]);

    const total = parseInt(countRes.rows[0]?.total || '0');

    return NextResponse.json({
      success: true,
      reports: reportsRes.rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error: any) {
    console.error('Admin reports GET error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { spotId, spotName, reportType, description, reporterContact } = body;

    if (!reportType) {
      return NextResponse.json({ success: false, error: 'Loại báo cáo là bắt buộc' }, { status: 400 });
    }

    const res = await pool.query(
      `INSERT INTO user_reports (spot_id, spot_name, report_type, description, reporter_contact, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, 'PENDING', NOW(), NOW())
       RETURNING *`,
      [spotId ? parseInt(spotId) : null, spotName || '', reportType.toUpperCase(), description || '', reporterContact || '']
    );

    return NextResponse.json({
      success: true,
      report: res.rows[0]
    });
  } catch (error: any) {
    console.error('Admin reports POST error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, adminNote } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'ID và trạng thái mới là bắt buộc' }, { status: 400 });
    }

    const res = await pool.query(
      `UPDATE user_reports 
       SET status = $1, admin_note = COALESCE($2, admin_note), updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [status.toUpperCase(), adminNote, id]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy báo cáo' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      report: res.rows[0]
    });
  } catch (error: any) {
    console.error('Admin reports PATCH error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}
