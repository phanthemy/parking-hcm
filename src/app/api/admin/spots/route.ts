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
    const limit = parseInt(searchParams.get('limit') || '1000');
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }

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

    const mappedSpots = spots.map((spot: any) => ({
      id: spot.id,
      name: spot.name,
      address: spot.address,
      description: spot.description,
      latitude: spot.lat,
      longitude: spot.lng,
      lat: spot.lat,
      lng: spot.lng,
      type: spot.type,
      carSlots: spot.carSlots,
      bikeSlots: spot.bikeSlots,
      pricePerHour: spot.pricePerHour,
      pricePerHourCar: spot.pricePerHour,
      openTime: spot.openTime,
      closeTime: spot.closeTime,
      phone: spot.phone,
      website: spot.website,
      isPremium: spot.isPremium,
      status: spot.status?.toLowerCase() || 'active',
      ownerId: spot.ownerId,
      createdAt: spot.createdAt,
      images: spot.images?.map((img: any) => img.url) || [],
      reviewCount: spot.reviews?.length || 0,
      rating: 4.5,
    }));

    return NextResponse.json({
      spots: mappedSpots,
      data: mappedSpots,
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
