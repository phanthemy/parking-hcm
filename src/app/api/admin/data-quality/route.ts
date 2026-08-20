import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/pg';

export async function GET(req: NextRequest) {
  try {
    // 1. Phân bố theo Category
    const categoryStats = await pool.query(`
      SELECT category,
             COUNT(*) FILTER (WHERE status = 'ACTIVE') as active_count,
             COUNT(*) FILTER (WHERE status = 'DUPLICATE') as duplicate_count,
             ROUND(AVG(confidence_score)::numeric, 2) as avg_confidence
      FROM places
      GROUP BY category
      ORDER BY active_count DESC;
    `);

    // 2. Phân bố theo Nguồn Dữ Liệu (Source)
    const sourceStats = await pool.query(`
      SELECT COALESCE(source, 'unknown') as source,
             COUNT(*) as count,
             ROUND(AVG(confidence_score)::numeric, 2) as avg_confidence
      FROM places
      WHERE status = 'ACTIVE'
      GROUP BY source
      ORDER BY count DESC;
    `);

    // 3. Tổng quan hệ thống
    const overview = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'ACTIVE') as total_active,
        COUNT(*) FILTER (WHERE status = 'DUPLICATE') as total_duplicates,
        ROUND(AVG(confidence_score)::numeric, 2) as overall_avg_confidence,
        COUNT(*) FILTER (WHERE phone IS NOT NULL AND phone != '') as with_phone_count,
        COUNT(*) FILTER (WHERE open_time IS NOT NULL AND open_time != '') as with_hours_count
      FROM places;
    `);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      overview: overview.rows[0],
      by_category: categoryStats.rows,
      by_source: sourceStats.rows,
    });
  } catch (error: any) {
    console.error('Data Quality API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
