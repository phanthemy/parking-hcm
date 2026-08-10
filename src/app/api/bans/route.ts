import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/bans?swLat=&swLng=&neLat=&neLng=
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const swLat = parseFloat(searchParams.get('swLat') || '0');
  const swLng = parseFloat(searchParams.get('swLng') || '0');
  const neLat = parseFloat(searchParams.get('neLat') || '0');
  const neLng = parseFloat(searchParams.get('neLng') || '0');

  try {
    const bans = await prisma.parkingBan.findMany({
      where: {
        status: 'VERIFIED',
        lat: { gte: swLat, lte: neLat },
        lng: { gte: swLng, lte: neLng },
      },
      orderBy: { reportCount: 'desc' },
      take: 100,
    });
    return NextResponse.json({ bans });
  } catch (e) {
    return NextResponse.json({ bans: [] });
  }
}

// POST /api/bans — Báo cáo biển cấm mới (không cần auth)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { lat, lng, street, district, banTimeRanges, banType, banDays, note, imageUrl } = body;

    if (!lat || !lng || !street || !banTimeRanges) {
      return NextResponse.json(
        { error: 'Thiếu thông tin bắt buộc: lat, lng, street, banTimeRanges' },
        { status: 400 }
      );
    }

    // Kiểm tra trùng vị trí (radius 30m ≈ 0.00027 độ)
    const nearby = await prisma.parkingBan.findFirst({
      where: {
        lat: { gte: lat - 0.0003, lte: lat + 0.0003 },
        lng: { gte: lng - 0.0003, lte: lng + 0.0003 },
        banTimeRanges,
        status: { not: 'REJECTED' },
      },
    });

    if (nearby) {
      // Đã có báo cáo gần đây — tăng reportCount thay vì tạo mới
      const updated = await prisma.parkingBan.update({
        where: { id: nearby.id },
        data: {
          reportCount: nearby.reportCount + 1,
          // Auto-verify nếu đủ 3 xác nhận
          status: nearby.reportCount + 1 >= 3 ? 'VERIFIED' : nearby.status,
        },
      });
      return NextResponse.json({
        ban: { id: updated.id },
        merged: true,
        reportCount: updated.reportCount,
        status: updated.status,
        message: updated.status === 'VERIFIED'
          ? '✅ Đủ xác nhận, biển cấm đã được duyệt tự động!'
          : `👍 Đã xác nhận thêm (${updated.reportCount}/3)`,
      });
    }

    // Tạo mới
    const ban = await prisma.parkingBan.create({
      data: {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        street: street.trim(),
        district: district?.trim() || null,
        banTimeRanges: banTimeRanges.trim(),
        banType: banType || 'NO_PARKING',
        banDays: banDays || 'ALL',
        note: note?.trim() || null,
        imageUrl: imageUrl || null,
        status: 'PENDING',
        reportCount: 1,
      },
    });

    return NextResponse.json({
      ban: { id: ban.id },
      merged: false,
      message: '✅ Báo cáo đã gửi! Admin sẽ xem xét và duyệt sớm.',
    }, { status: 201 });

  } catch (e: any) {
    console.error('POST /api/bans error:', e);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
