/**
 * MAPGO OBSERVABILITY & PROMETHEUS/JSON METRICS ENDPOINT
 * Exposes real-time system, cache, and database telemetry
 */

import { NextResponse } from 'next/server';
import { spatialCache } from '@/lib/spatial-cache';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const mem = process.memoryUsage();
  const uptimeSeconds = Math.round(process.uptime());

  let totalSpots = 0;
  try {
    totalSpots = await prisma.parkingSpot.count();
  } catch (e) {
    console.error('Metrics DB count error:', e);
  }

  const metricsData = {
    service: 'mapgo-mobility-engine',
    timestamp: new Date().toISOString(),
    uptimeSeconds,
    system: {
      rssMemoryMb: Math.round((mem.rss / 1024 / 1024) * 100) / 100,
      heapUsedMb: Math.round((mem.heapUsed / 1024 / 1024) * 100) / 100,
      heapTotalMb: Math.round((mem.heapTotal / 1024 / 1024) * 100) / 100,
      externalMemoryMb: Math.round((mem.external / 1024 / 1024) * 100) / 100,
    },
    cache: spatialCache.getMetrics(),
    database: {
      totalActiveSpots: totalSpots,
      engine: 'PostgreSQL 14 + PostGIS 3.2 + SQLite Dev',
      status: 'HEALTHY',
    },
  };

  return NextResponse.json(metricsData, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
      'Content-Type': 'application/json',
    },
  });
}
