import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authMiddleware, requireRole } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { parkingSpotId: id },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, avatar: true }
          }
        }
      }),
      prisma.review.count({ where: { parkingSpotId: id } })
    ]);

    return NextResponse.json({
      reviews,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error('Get reviews error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await requireRole(req, ['USER', 'BUSINESS', 'ADMIN']); // Usually any logged in user can review
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { id } = await params;
    const userId = authResult.user.id;
    const { rating, comment } = await req.json();

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    // Create review
    const newReview = await prisma.review.create({
      data: {
        rating,
        comment,
        parkingSpotId: id,
        userId
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true }
        }
      }
    });

    return NextResponse.json(newReview, { status: 201 });
  } catch (error: any) {
    console.error('Create review error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
