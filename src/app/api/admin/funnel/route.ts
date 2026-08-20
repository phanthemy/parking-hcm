import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/pg';

export async function GET(req: NextRequest) {
  try {
    const query = `
      SELECT 
        event_name,
        COUNT(*) as total_events,
        COUNT(DISTINCT session_id) as unique_sessions,
        MAX(created_at) as last_event_at
      FROM driver_funnel_events
      GROUP BY event_name
      ORDER BY unique_sessions DESC;
    `;

    const result = await pool.query(query);

    return NextResponse.json({
      success: true,
      funnel: result.rows
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
