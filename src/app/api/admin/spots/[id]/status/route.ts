import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await requireRole(req, ['ADMIN']);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { id } = await params;
    const { status } = await req.json();

    if (!['ACTIVE', 'PENDING', 'HIDDEN', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updatedSpot = await prisma.parkingSpot.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json(updatedSpot);
  } catch (error: any) {
    console.error('Update spot status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
