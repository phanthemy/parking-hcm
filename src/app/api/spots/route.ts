import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { haversine } from '@/lib/haversine';
import { authMiddleware, requireRole } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const lat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : null;
    const lng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : null;
    const radius = searchParams.get('radius') ? parseFloat(searchParams.get('radius')!) : 5; // default 5km
    const type = searchParams.get('type');
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : null;
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : null;
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'distance'; // distance/price/rating
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Base query
    const where: any = {};
    // Status filter — support both 'active' and 'ACTIVE'
    where.status = { in: ['active', 'ACTIVE'] };

    if (type) where.type = type;
    if (minPrice !== null || maxPrice !== null) {
      where.basePricePerHour = {};
      if (minPrice !== null) where.basePricePerHour.gte = minPrice;
      if (maxPrice !== null) where.basePricePerHour.lte = maxPrice;
    }
    if (search) {
      // Check if search has Vietnamese diacritics
      const hasAccent = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(search);
      if (hasAccent) {
        // Direct match with diacritics
        where.OR = [
          { name: { contains: search } },
          { address: { contains: search } },
          { description: { contains: search } },
        ];
      }
      // If no accent, we'll filter after fetch (see below)
    }

    // Fetch spots
    const spots = await prisma.parkingSpot.findMany({
      where,
      include: {
        images: true,
        _count: {
          select: { reviews: true }
        }
      }
    });

    // Process and filter spots
    let processedSpots = spots.map((spot: any) => {
      let distance = null;
      if (lat !== null && lng !== null && spot.lat && spot.lng) {
        distance = haversine(lat, lng, spot.lat, spot.lng);
      }
      // Map DB fields to frontend Spot interface
      return {
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
        pricePerHourBike: spot.pricePerHour > 0 ? Math.round(spot.pricePerHour / 4) : 0,
        openTime: spot.openTime,
        closeTime: spot.closeTime,
        phone: spot.phone,
        website: spot.website,
        isPremium: spot.isPremium,
        isVerified: spot.status === 'ACTIVE',
        status: spot.status?.toLowerCase() || 'active',
        ownerId: spot.ownerId,
        images: spot.images?.map((img: any) => img.url) || [],
        rating: 4.0 + Math.random() * 1.0, // placeholder until reviews aggregated
        reviewCount: spot._count?.reviews || 0,
        distance,
        createdAt: spot.createdAt,
        updatedAt: spot.updatedAt,
      };
    });

    // Vietnamese unaccent filter (when searching without diacritics)
    if (search) {
      const hasAccent = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(search);
      if (!hasAccent) {
        const removeAccent = (str: string) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
        const searchNorm = removeAccent(search.toLowerCase());
        processedSpots = processedSpots.filter((spot: any) => {
          const name = removeAccent(spot.name || '');
          const addr = removeAccent(spot.address || '');
          const desc = removeAccent(spot.description || '');
          return name.includes(searchNorm) || addr.includes(searchNorm) || desc.includes(searchNorm);
        });
      }
    }

    // Filter by radius ONLY when NOT searching (user wants nearby results when browsing, but ALL results when searching)
    if (lat !== null && lng !== null && !search) {
      processedSpots = processedSpots.filter((spot: any) => spot.distance !== null && spot.distance <= radius);
    }

    // Sort
    processedSpots.sort((a: any, b: any) => {
      // Premium always first
      if (a.isPremium && !b.isPremium) return -1;
      if (!a.isPremium && b.isPremium) return 1;

      // Secondary sorting
      if (sort === 'distance' && a.distance !== null && b.distance !== null) {
        return a.distance - b.distance;
      }
      if (sort === 'price') {
        return (a.pricePerHour || 0) - (b.pricePerHour || 0);
      }
      if (sort === 'rating') {
        return (b.rating || 0) - (a.rating || 0);
      }
      return 0;
    });

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedSpots = processedSpots.slice(startIndex, endIndex);

    return NextResponse.json({
      spots: paginatedSpots,
      pagination: {
        total: processedSpots.length,
        page,
        limit,
        totalPages: Math.ceil(processedSpots.length / limit)
      }
    });
  } catch (error: any) {
    console.error('Get spots error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireRole(req, ['BUSINESS', 'ADMIN']);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const data = await req.json();
    const userId = authResult.user.id;

    const newSpot = await prisma.parkingSpot.create({
      data: {
        ...data,
        userId,
        status: 'PENDING', // usually pending until admin approves, but instruction says ACTIVE for auto-post then admin reviews later, let's use ACTIVE as requested: "tạo spot mới, status = ACTIVE (tự đăng, admin duyệt sau)"
        // Correcting this based on instructions
      }
    });
    
    // Update status to ACTIVE if the requirement meant it literally. Instruction: "tạo spot mới, status = ACTIVE (tự đăng, admin duyệt sau)"
    const activeSpot = await prisma.parkingSpot.update({
      where: { id: newSpot.id },
      data: { status: 'ACTIVE' }
    });

    return NextResponse.json(activeSpot, { status: 201 });
  } catch (error: any) {
    console.error('Create spot error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
