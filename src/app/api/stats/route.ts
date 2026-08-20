import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/pg';

export async function GET(req: NextRequest) {
  try {
    // 1. Thống kê tổng số bản ghi
    const totalRes = await pool.query(`
      SELECT
        COUNT(*) as total_places,
        COUNT(*) FILTER (WHERE status = 'ACTIVE') as active_places,
        COUNT(*) FILTER (WHERE status = 'DUPLICATE') as duplicate_places,
        MAX(last_synced_at) as last_sync
      FROM places;
    `);

    // 2. Thống kê theo Categories chuẩn
    const catRes = await pool.query(`
      SELECT category, COUNT(*) as count
      FROM places
      WHERE status = 'ACTIVE'
      GROUP BY category
      ORDER BY count DESC;
    `);

    const categories: Record<string, number> = {};
    catRes.rows.forEach((r: any) => {
      categories[r.category] = parseInt(r.count);
    });

    const overview = totalRes.rows[0];

    return NextResponse.json({
      success: true,
      total_places: parseInt(overview.total_places),
      active_places: parseInt(overview.active_places),
      duplicate_places: parseInt(overview.duplicate_places),
      categories,
      last_sync: overview.last_sync || new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Stats API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
