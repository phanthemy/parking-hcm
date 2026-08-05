import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireRole(req, ['ADMIN']);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const [totalSpots, totalUsers, totalReviews, pendingSpots] = await Promise.all([
      prisma.parkingSpot.count(),
      prisma.user.count(),
      prisma.review.count(),
      prisma.parkingSpot.count({ where: { status: 'PENDING' } })
    ]);

    return NextResponse.json({
      totalSpots,
      totalUsers,
      totalReviews,
      pendingSpots
    });
  } catch (error: any) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
