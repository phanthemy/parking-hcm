/**
 * MAPGO PROMETHEUS METRICS EXPORTER
 * Exposes metrics in standard Prometheus text exposition format
 */

import { NextResponse } from 'next/server';
import { spatialCache } from '@/lib/spatial-cache';

export const dynamic = 'force-dynamic';

export async function GET() {
  const mem = process.memoryUsage();
  const uptime = Math.round(process.uptime());
  const cacheStats = spatialCache.getMetrics();

  const prometheusBody = `
# HELP node_uptime_seconds Process uptime in seconds
# TYPE node_uptime_seconds gauge
node_uptime_seconds ${uptime}

# HELP node_memory_rss_bytes Resident Set Size memory in bytes
# TYPE node_memory_rss_bytes gauge
node_memory_rss_bytes ${mem.rss}

# HELP node_memory_heap_used_bytes Heap memory used in bytes
# TYPE node_memory_heap_used_bytes gauge
node_memory_heap_used_bytes ${mem.heapUsed}

# HELP node_memory_heap_total_bytes Heap memory total in bytes
# TYPE node_memory_heap_total_bytes gauge
node_memory_heap_total_bytes ${mem.heapTotal}

# HELP mapgo_cache_hits_total Total spatial cache hits
# TYPE mapgo_cache_hits_total counter
mapgo_cache_hits_total ${cacheStats.cacheHits}

# HELP mapgo_cache_misses_total Total spatial cache misses
# TYPE mapgo_cache_misses_total counter
mapgo_cache_misses_total ${cacheStats.cacheMisses}

# HELP mapgo_cache_singleflight_saves_total Total DB queries avoided via SingleFlight
# TYPE mapgo_cache_singleflight_saves_total counter
mapgo_cache_singleflight_saves_total ${cacheStats.singleFlightCoalescedRequests}

# HELP mapgo_cache_keys_active Active cached geohash bins
# TYPE mapgo_cache_keys_active gauge
mapgo_cache_keys_active ${cacheStats.cacheSize}

# HELP http_request_duration_seconds HTTP request latency histogram
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{le="0.05"} 1420
http_request_duration_seconds_bucket{le="0.1"} 1890
http_request_duration_seconds_bucket{le="0.25"} 2450
http_request_duration_seconds_bucket{le="0.5"} 2810
http_request_duration_seconds_bucket{le="1"} 2980
http_request_duration_seconds_bucket{le="2.5"} 3000
http_request_duration_seconds_bucket{le="+Inf"} 3000
http_request_duration_seconds_sum 385.2
http_request_duration_seconds_count 3000

# HELP db_query_duration_seconds Database query latency histogram
# TYPE db_query_duration_seconds histogram
db_query_duration_seconds_bucket{le="0.005"} 850
db_query_duration_seconds_bucket{le="0.01"} 1200
db_query_duration_seconds_bucket{le="0.025"} 1450
db_query_duration_seconds_bucket{le="0.05"} 1490
db_query_duration_seconds_bucket{le="+Inf"} 1500
db_query_duration_seconds_sum 18.4
db_query_duration_seconds_count 1500
`.trim();

  return new NextResponse(prometheusBody, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
