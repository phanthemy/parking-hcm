# SPRINT 6 EVIDENCE & CHANGELOG: 100K SPATIAL BENCHMARK, SINGLEFLIGHT & OBSERVABILITY

## 1. Metadata
- **Sprint**: Sprint 06 — 100k PostGIS Scaling Benchmark, Geohash SingleFlight Cache & Observability
- **Date**: 2026-08-20
- **Status**: Completed & Verified
- **Branch**: `main`

## 2. Deliverables & Implementations
1. **100,000 POI Synthetic PostGIS Benchmark** (`scripts/benchmark-100k-synthetic.js`):
   - Sinh 100.000 records không gian với index GiST R-Tree trên PostgreSQL.
   - Bounding Box Viewport Search (`&&` GiST): **0.684ms** (~1.462 QPS/core).
   - Multi-Factor Search Ranking: **83.94ms** (~12 QPS/core).
2. **Spatial Geohash & SingleFlight Coalescing Engine** (`src/lib/spatial-cache.ts`):
   - Mã hóa Geohash Precision 6 (~1.2km x 0.6km) làm cache key không gian, tránh phân mảnh cache key khi dùng tọa độ float thô.
   - Cơ chế SingleFlight chia sẻ Promise duy nhất giữa 200 concurrent callers, triệt tiêu 100% hiện tượng Cache Stampede / Thundering Herd.
3. **Observability & Prometheus/JSON Metrics API** (`/api/metrics`):
   - Báo cáo real-time: Node RSS Memory, Heap Used, Event Loop Uptime, Database Status, Cache Hit/Miss Ratio và SingleFlight Coalesced Requests.

## 3. Artifact Files in this Directory
- `CHANGELOG.md`: Tài liệu ghi chú kỹ thuật.
- `100k-poi-spatial-benchmark.json`: Báo cáo chi tiết EXPLAIN ANALYZE trên 100.000 POIs từ máy chủ PostgreSQL.
