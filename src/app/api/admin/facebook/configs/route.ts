import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: Crawl config list
export async function GET() {
  const configs = await prisma.crawlConfig.findMany({
    orderBy: { lastCrawl: 'desc' }
  });
  return NextResponse.json({ configs });
}

// POST: Add new group
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { groupUrl, groupName } = body;
  if (!groupUrl) return NextResponse.json({ error: 'Missing groupUrl' }, { status: 400 });
  
  const config = await prisma.crawlConfig.create({
    data: {
      groupUrl,
      groupName: groupName || 'Nhóm Facebook',
      isActive: true
    }
  });
  return NextResponse.json({ config });
}

// PATCH: Toggle active/inactive
export async function PATCH(request: NextRequest) {
  const { id, isActive } = await request.json();
  const config = await prisma.crawlConfig.update({
    where: { id },
    data: { isActive }
  });
  return NextResponse.json({ config });
}

// DELETE: Remove group
export async function DELETE(request: NextRequest) {
  const { id } = await request.json();
  await prisma.crawlConfig.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
