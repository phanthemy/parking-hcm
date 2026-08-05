import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireRole(req, ['ADMIN']);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get('status'); // filter by status
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where = status ? { status } : {};

    const [spots, total] = await Promise.all([
      prisma.parkingSpot.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          images: true,
          reviews: true
        }
      }),
      prisma.parkingSpot.count({ where })
    ]);

    return NextResponse.json({
      spots,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error('Admin get spots error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
