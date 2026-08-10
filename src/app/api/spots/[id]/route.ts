import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authMiddleware } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Support both ID and slug lookup
    const isCuid = /^[a-z0-9]{20,}$/i.test(id);
    const spot = await prisma.parkingSpot.findFirst({
      where: isCuid ? { id } : { slug: id },
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
    const userRole = authResult.user.role?.toString().toUpperCase();

    // Check ownership
    const spot = await prisma.parkingSpot.findUnique({ where: { id } });
    if (!spot) {
      return NextResponse.json({ error: 'Spot not found' }, { status: 404 });
    }

    if (spot.ownerId !== userId && userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: You do not own this spot' }, { status: 403 });
    }

    // Update media images/videos if passed
    if (Array.isArray(data.images)) {
      await prisma.parkingImage.deleteMany({ where: { parkingSpotId: id } });
      if (data.images.length > 0) {
        await prisma.parkingImage.createMany({
          data: data.images.filter((url: any) => typeof url === 'string' && url.trim().length > 0).map((url: string) => ({
            url: url.trim(),
            parkingSpotId: id,
          })),
        });
      }
      delete data.images;
    }

    const updateData: any = { ...data };
    if (data.latitude !== undefined) updateData.lat = parseFloat(data.latitude);
    if (data.longitude !== undefined) updateData.lng = parseFloat(data.longitude);
    if (data.pricePerHourCar !== undefined) updateData.pricePerHour = parseFloat(data.pricePerHourCar);
    delete updateData.latitude;
    delete updateData.longitude;
    delete updateData.pricePerHourCar;
    delete updateData.pricePerHourBike;

    delete updateData.userId;
    if (userRole !== 'ADMIN') {
      delete updateData.status;
      delete updateData.isPremium;
    }

    const updatedSpot = await prisma.parkingSpot.update({
      where: { id },
      data: updateData,
      include: { images: true }
    });

    return NextResponse.json({
      ...updatedSpot,
      latitude: updatedSpot.lat,
      longitude: updatedSpot.lng,
      images: updatedSpot.images?.map((img: any) => img.url) || [],
    });
  } catch (error: any) {
    console.error('Update spot error:', error);
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
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
