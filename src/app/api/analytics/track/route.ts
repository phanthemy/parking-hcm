import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/pg';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event_name, session_id, spot_id, category, metadata } = body;

    if (!event_name) {
      return NextResponse.json({ success: false, error: 'event_name is required' }, { status: 400 });
    }

    await pool.query(
      `INSERT INTO driver_funnel_events (event_name, session_id, spot_id, category, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        event_name,
        session_id || 'anon',
        spot_id ? String(spot_id) : null,
        category || null,
        JSON.stringify(metadata || {})
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    // Non-blocking for analytics
    return NextResponse.json({ success: false, error: error.message }, { status: 200 });
  }
}
