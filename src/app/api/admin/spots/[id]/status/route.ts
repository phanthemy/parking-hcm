import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/pg';
import { requireRole } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await requireRole(req, ['ADMIN']);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { id } = await params;
    const { status } = await req.json();

    const normalizedStatus = (status || '').toUpperCase();
    if (!['ACTIVE', 'PENDING', 'HIDDEN', 'REJECTED', 'DUPLICATE'].includes(normalizedStatus)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const res = await pool.query(
      `UPDATE places 
       SET status = $1, updated_at = NOW() 
       WHERE id = $2 
       RETURNING id, name, status`,
      [normalizedStatus, id]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Spot not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      spot: res.rows[0]
    });
  } catch (error: any) {
    console.error('Update spot status error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  return PUT(req, ctx);
}
