import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
  // Try several candidate paths for the APK
  const candidatePaths = [
    path.join(process.cwd(), 'dist/mapgo-driver-v1.0.0.apk'),
    path.join(process.cwd(), 'public/downloads/mapgo-driver-v1.0.0.apk'),
    '/home/ubuntu/android-build/dist/mapgo-driver-v1.0.0.apk',
    path.join(process.cwd(), 'public/mapgo-driver-v1.0.0.apk'),
  ];

  let apkPath = '';
  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      apkPath = p;
      break;
    }
  }

  if (!apkPath) {
    return new NextResponse('APK file not found on server', { status: 404 });
  }

  const fileBuffer = fs.readFileSync(apkPath);
  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.android.package-archive',
      'Content-Disposition': 'attachment; filename="mapgo-driver-v1.0.0.apk"',
      'Content-Length': fileBuffer.length.toString(),
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
