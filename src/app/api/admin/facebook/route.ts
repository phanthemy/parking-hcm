import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: Lấy danh sách bài viết Facebook đã crawl
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'all';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '15');

  const where = status !== 'all' ? { status } : {};

  const [posts, total] = await Promise.all([
    prisma.facebookPost.findMany({
      where,
      include: {
        images: { select: { id: true, url: true, type: true } },
        matchedSpot: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.facebookPost.count({ where })
  ]);

  return NextResponse.json({
    posts,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  });
}

// PATCH: Cập nhật trạng thái bài viết (approve/reject)
export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { id, action, matchedSpotId } = body;

  if (!id || !action) {
    return NextResponse.json({ error: 'Missing id or action' }, { status: 400 });
  }

  if (action === 'approve') {
    const post = await prisma.facebookPost.update({
      where: { id },
      data: {
        status: 'approved',
        matchedSpotId: matchedSpotId || undefined
      },
      include: { images: true }
    });

    // If matched to a spot, add images to that spot
    if (post.matchedSpotId && post.images.length > 0) {
      const imageData = post.images
        .filter(img => img.type === 'image')
        .map(img => ({
          url: img.url,
          parkingSpotId: post.matchedSpotId!
        }));

      if (imageData.length > 0) {
        await prisma.parkingImage.createMany({ data: imageData });
      }
    }

    return NextResponse.json({ success: true, post });
  }

  if (action === 'reject') {
    const post = await prisma.facebookPost.update({
      where: { id },
      data: { status: 'rejected' }
    });
    return NextResponse.json({ success: true, post });
  }

  if (action === 'delete') {
    await prisma.facebookImage.deleteMany({ where: { postId: id } });
    await prisma.facebookPost.delete({ where: { id } });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
