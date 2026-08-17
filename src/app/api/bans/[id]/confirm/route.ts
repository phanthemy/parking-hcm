import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: banId } = await params;

    if (!banId) {
      return NextResponse.json({ error: 'Missing ban ID' }, { status: 400 });
    }

    const existingBan = await prisma.parkingBan.findUnique({
      where: { id: banId }
    });

    if (!existingBan) {
      return NextResponse.json({ error: 'Parking ban not found' }, { status: 404 });
    }

    const newReportCount = existingBan.reportCount + 1;
    const newStatus = newReportCount >= 3 ? 'VERIFIED' : existingBan.status;

    const updatedBan = await prisma.parkingBan.update({
      where: { id: banId },
      data: {
        reportCount: newReportCount,
        status: newStatus
      }
    });

    return NextResponse.json({
      reportCount: updatedBan.reportCount,
      status: updatedBan.status
    });
  } catch (error) {
    console.error('Error confirming parking ban:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
