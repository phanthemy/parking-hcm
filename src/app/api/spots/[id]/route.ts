import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authMiddleware } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const spot = await prisma.parkingSpot.findUnique({
      where: { id },
      include: {
        images: true,
        reviews: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { id: true, name: true, avatar: true }
            }
          }
        },
        profile: true
      }
    });

    if (!spot) {
      return NextResponse.json({ error: 'Spot not found' }, { status: 404 });
    }

    // Map to frontend format
    const mapped = {
      ...spot,
      latitude: spot.lat,
      longitude: spot.lng,
      pricePerHourCar: spot.pricePerHour,
      pricePerHourBike: spot.pricePerHour > 0 ? Math.round(spot.pricePerHour / 4) : 0,
      isVerified: spot.status === 'ACTIVE',
      images: spot.images?.map((img: any) => img.url) || [],
      rating: 4.2,
      reviewCount: spot.reviews?.length || 0,
    };

    return NextResponse.json(mapped);
  } catch (error: any) {
    console.error('Get spot error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await authMiddleware(req);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { id } = await params;
    const data = await req.json();
    const userId = authResult.user.id;
    const userRole = authResult.user.role;

    // Check ownership
    const spot = await prisma.parkingSpot.findUnique({ where: { id } });
    if (!spot) {
      return NextResponse.json({ error: 'Spot not found' }, { status: 404 });
    }

    if (spot.ownerId !== userId && userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: You do not own this spot' }, { status: 403 });
    }

    // Don't allow updating user ID or certain protected fields here
    delete data.userId;
    if (userRole !== 'ADMIN') {
      delete data.status;
      delete data.isPremium;
    }

    const updatedSpot = await prisma.parkingSpot.update({
      where: { id },
      data
    });

    return NextResponse.json(updatedSpot);
  } catch (error: any) {
    console.error('Update spot error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await authMiddleware(req);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { id } = await params;
    const userId = authResult.user.id;
    const userRole = authResult.user.role;

    // Check ownership
    const spot = await prisma.parkingSpot.findUnique({ where: { id } });
    if (!spot) {
      return NextResponse.json({ error: 'Spot not found' }, { status: 404 });
    }

    if (spot.ownerId !== userId && userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: You do not own this spot' }, { status: 403 });
    }

    await prisma.parkingSpot.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Spot deleted successfully' });
  } catch (error: any) {
    console.error('Delete spot error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
