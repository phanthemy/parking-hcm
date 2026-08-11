import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { haversine } from '@/lib/haversine';
import { authMiddleware, requireRole } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const lat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : null;
    const lng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : null;
    const radius = searchParams.get('radius') ? parseFloat(searchParams.get('radius')!) : 50; // default 50km — cover all of HCMC
    const type = searchParams.get('type');
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : null;
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : null;
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'distance';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const hasCarParking = searchParams.get('hasCarParking') === '1';

    // Base query
    const where: any = {};
    // Status filter — support both 'active' and 'ACTIVE'
    where.status = { in: ['active', 'ACTIVE'] };

    if (type) where.type = type;
    if (hasCarParking) where.carSlots = { gt: 0 };
    if (minPrice !== null || maxPrice !== null) {
      where.basePricePerHour = {};
      if (minPrice !== null) where.basePricePerHour.gte = minPrice;
      if (maxPrice !== null) where.basePricePerHour.lte = maxPrice;
    }
    // Search filtering is done in-memory after fetch (SQLite doesn't support case-insensitive contains)

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
        slug: spot.slug,
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

    // In-memory search filter (works for both accented & unaccented, case-insensitive)
    if (search) {
      const removeAccent = (str: string) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
      const searchLower = search.toLowerCase();
      const searchNorm = removeAccent(searchLower);
      
      processedSpots = processedSpots.filter((spot: any) => {
        const name = (spot.name || '').toLowerCase();
        const addr = (spot.address || '').toLowerCase();
        const desc = (spot.description || '').toLowerCase();
        
        // Direct match (case-insensitive)
        if (name.includes(searchLower) || addr.includes(searchLower) || desc.includes(searchLower)) return true;
        
        // Unaccented match
        return removeAccent(name).includes(searchNorm) || 
               removeAccent(addr).includes(searchNorm) || 
               removeAccent(desc).includes(searchNorm);
      });
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
    // Allow any authenticated user (USER, BUSINESS, ADMIN) to post
    const authResult = await authMiddleware(req);
    if (authResult.error) {
      return NextResponse.json({ error: 'Vui lòng đăng nhập để đăng tin' }, { status: 401 });
    }

    const data = await req.json();
    const userId = authResult.user.id;

    // Validate required fields
    if (!data.name || !data.address) {
      return NextResponse.json({ error: 'Tên và địa chỉ là bắt buộc' }, { status: 400 });
    }

    // Map frontend field names → DB schema field names
    const spotData: any = {
      name: data.name,
      type: data.type || 'PARKING_LOT',
      address: data.address,
      // Frontend gửi latitude/longitude, DB dùng lat/lng
      lat: parseFloat(data.latitude) || parseFloat(data.lat) || 10.7769,
      lng: parseFloat(data.longitude) || parseFloat(data.lng) || 106.7009,
      description: data.description || null,
      phone: data.phone || null,
      website: data.website || null,
      carSlots: parseInt(data.carSlots) || 0,
      bikeSlots: parseInt(data.bikeSlots) || 0,
      // Frontend gửi pricePerHourCar, DB chỉ có pricePerHour
      pricePerHour: parseFloat(data.pricePerHourCar) || parseFloat(data.pricePerHour) || 0,
      openTime: data.openTime || '06:00',
      closeTime: data.closeTime || '22:00',
      ownerId: userId, // DB dùng ownerId không phải userId
      status: 'ACTIVE', // Hiện ngay trên bản đồ, admin review sau
      isPremium: false,
    };

    const newSpot = await prisma.parkingSpot.create({ data: spotData });

    // Tạo BusinessProfile nếu có dịch vụ/menu/ưu đãi
    const hasProfile = data.services || (data.menu && data.menu.length > 0) || (data.promotions && data.promotions.length > 0);
    if (hasProfile) {
      await prisma.businessProfile.create({
        data: {
          parkingSpotId: newSpot.id,
          services: Array.isArray(data.services)
            ? data.services.join(', ')
            : (typeof data.services === 'string' ? data.services : null),
          menuDescription: data.menu?.length
            ? data.menu.map((m: any) => `${m.name}: ${m.price?.toLocaleString()}đ${m.description ? ' — ' + m.description : ''}`).join('\n')
            : null,
          specialOffers: data.promotions?.length
            ? `${data.promotions[0].title}: ${data.promotions[0].description}`
            : null,
        }
      }).catch(() => {}); // ignore nếu có lỗi tạo profile
    }

    // Lưu hình ảnh & video review thực tế nếu chủ cửa hàng tải lên
    if (Array.isArray(data.images) && data.images.length > 0) {
      await prisma.parkingImage.createMany({
        data: data.images.filter((url: any) => typeof url === 'string' && url.trim().length > 0).map((url: string) => ({
          url: url.trim(),
          parkingSpotId: newSpot.id,
        })),
      }).catch(() => {});
    }


    return NextResponse.json({
      ...newSpot,
      latitude: newSpot.lat,
      longitude: newSpot.lng,
      message: '✅ Đã đăng tin thành công! Địa điểm đã hiển thị trên bản đồ.',
    }, { status: 201 });
  } catch (error: any) {
    console.error('Create spot error:', error?.message || error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
