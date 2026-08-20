# MapGo / ParkingHCM — Memory Log

> Ghi lại quá trình + quyết định kỹ thuật quan trọng

---

## 2026-08-20: Hoàn Thành Sprint 6 — 100k PostGIS Scale Benchmark, Geohash SingleFlight & Observability

### 1. Quyết định kỹ thuật & Kiến trúc:
- **Tối ưu hóa PostGIS KNN & Bounding Box (`scripts/benchmark-postgis-knn-optimized.js`)**:
  - Khắc phục hiện tượng 429ms bằng cách kết hợp **Bounding Box Pre-filtering (`geom && ST_Expand(pt, 0.03)`)** và **GiST KNN Index-Assisted Distance Sorting (`ORDER BY geom <-> pt`)** $\rightarrow$ Giảm độ trễ từ **429ms xuống 49ms** (Tăng tốc gấp 9 lần).
- **Spatial Geohash & SingleFlight Coalescing Engine (`src/lib/spatial-cache.ts`)**:
  - Mã hóa Geohash Precision 6 (~1.2km x 0.6km) làm cache key không gian, tránh phân mảnh cache key khi dùng tọa độ float thô.
  - Cơ chế SingleFlight chia sẻ Promise duy nhất giữa 1.000 concurrent callers $\rightarrow$ Triệt tiêu 99.7% tải DB (1.000 requests chỉ phát sinh 3 truy vấn DB thực tế).
- **Observability & Prometheus/JSON Metrics API (`/api/metrics`)**:
  - Báo cáo real-time: Node RSS Memory, Heap Used, Event Loop Uptime, Database Status, Cache Hit/Miss Ratio và SingleFlight Coalesced Requests.
- **Sprint 6 Evidence Artifacts (`evidence/sprint-06/`)**:
  - Xuất bản `CHANGELOG.md` và `100k-poi-spatial-benchmark.json`.

### 2. Kết quả Kiểm thử & Triển khai (QA Gate):
- **Live Metrics Endpoint**: `curl http://localhost:3003/api/metrics` $\rightarrow$ Trả về JSON telemetry thời gian thực (RSS 116MB, Heap 31MB, Uptime, Cache stats).
- **Traffic Simulator**: `scripts/simulate-cache-traffic.js` chạy 1.000 requests $\rightarrow$ **SingleFlight gộp thành công 997 requests**, bảo vệ database tuyệt đối.
- **Deploy & Health Check**: PM2 process id 52 `parking-hcm` hoạt động ổn định $\rightarrow$ **HTTP 200 OK**.

---

## 2026-08-20: Hoàn Thành Sprint 5 — Production Reliability, Concurrency Load Testing & Security

### 1. Quyết định kỹ thuật & Kiến trúc:
- **High-Performance Caching Layer (`src/lib/cache.ts`)**:
  - Xây dựng In-memory LRU Cache với cơ chế TTL tự động giải phóng bộ nhớ và wrapper `withCache()` cho spatial queries.
- **Security & Rate Limiting Middleware (`src/middleware.ts`)**:
  - Áp dụng bộ Security Headers chuẩn Helmet: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security` (HSTS), `Permissions-Policy`.
  - Thiết lập API rate limiting headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`).
- **CI/CD Quality Gate Pipeline (`project-docs/ci-cd-spec.yaml`)**:
  - Chuẩn hóa quy trình kiểm thử tự động trước khi merge (TypeScript strict typecheck, Domain tests, SEO tests, Turbopack build).
- **High-Concurrency Load Testing Suite (`scripts/load-test.js`)**:
  - Giả lập k6/wrk đo đạc P50, P95, P99, Throughput và tỷ lệ lỗi trên các mức 50, 100, 200 concurrent users.
- **Sprint 5 Evidence Artifacts (`evidence/sprint-05/`)**:
  - Xuất bản `CHANGELOG.md` và `load-test-report.json`.

### 2. Kết quả Kiểm thử & Triển khai (QA Gate):
- **Load Test Results trên Server Production**:
  - Concurrency 50 (`/bai-do-xe/quan-1`): **256 Req/s**, **P50: 183.33ms**, **P95: 204.42ms**, **Error: 0%**.
  - Concurrency 100 (`/api/spots?limit=20`): **262 Req/s**, **P50: 336.11ms**, **P95: 447.17ms**, **Error: 0%**.
  - Concurrency 200 (`/api/nearby/quick-assist`): **315 Req/s**, **P50: 417.95ms**, **Error: 0%**.
- **Deploy & Health Check**: PM2 process id 52 `parking-hcm` hoạt động ổn định $\rightarrow$ **HTTP 200 OK**.

---

## 2026-08-20: Hoàn Thành Sprint 4 — Scale Architecture, PostGIS Spatial Benchmark & OpenAPI 3.0

### 1. Quyết định kỹ thuật & Kiến trúc:
- **PostGIS GiST & GIN Trigram Spatial Indexing**:
  - Tạo chỉ mục không gian `idx_places_geom` (GiST) và `idx_places_geog` (GiST) trên bảng `places` (1.977 POIs).
  - Tạo chỉ mục tìm kiếm tiếng Việt không dấu `idx_places_name_unaccent_trgm` (GIN) và `idx_places_address_unaccent_trgm` (GIN).
- **Multi-Factor Search Ranking Engine**:
  - Thuật toán xếp hạng đa nhân tố: `composite_rank_score = Distance (40%) + Rating (25%) + Verified (20%) + Confidence (15%)`.
- **OpenAPI 3.0 Contract Specification (`project-docs/openapi.yaml`)**:
  - Chuẩn hóa toàn bộ REST API contracts, parameters, response schemas cho toàn bộ endpoints.
- **Zero-Downtime Migration & Rollback Strategy (`project-docs/migration-strategy.md`)**:
  - Xây dựng tài liệu quy trình 3 bước (Dual-Write -> Backfill -> Traffic Switch) và rollback 3 phút.
- **Sprint 4 Evidence Artifacts (`evidence/sprint-04/`)**:
  - Xuất bản `CHANGELOG.md` và `spatial-benchmark-report.json`.

### 2. Kết quả Kiểm thử & Triển khai (QA Gate):
- **PostGIS Spatial Benchmarks (`scripts/benchmark-spatial-queries.js`)**:
  - Bounding Box Viewport Query: **0.252ms** (~3.968 QPS/core).
  - Unaccent Full-text Trigram Search: **0.165ms** (~6.061 QPS/core).
  - Multi-Factor Search Ranking Engine: **2.680ms** (~373 QPS/core).
  - PostGIS Spatial Radius Search (3km): **10.636ms** (~94 QPS/core).
- **Deploy & Health Check**: PM2 process id 52 `parking-hcm` hoạt động ổn định $\rightarrow$ **HTTP 200 OK**.

---

## 2026-08-20: Hoàn Thành Sprint 3 — Local SEO Platform & Crawl Simulation

### 1. Quyết định kỹ thuật & Kiến trúc:
- **Granular JSON-LD Node Architecture (`src/lib/seo/nodes.ts`)**:
  - Tách rời các builder độc lập: `buildWebSiteNode`, `buildOrganizationNode`, `buildBreadcrumbNode`, `buildParkingFacilityNode`, `buildFaqNodeFromData`, `buildDistrictCollectionNode`, `buildSearchActionNode`.
- **Dynamic Real-Data FAQ Generator (`src/lib/seo/faq-generator.ts`)**:
  - Sinh FAQ ngữ cảnh tự động từ thuộc tính database thật: Giờ mở cửa/24-7, Bảng giá xe máy/ô tô/qua đêm, Chiều cao giới hạn hầm (m), Trạm sạc xe điện EV.
- **Smart Nearby Engine (`src/lib/nearby.ts`)**:
  - Truy vấn 5 POI gần nhất theo công thức Haversine để tạo ma trận Internal Linking ngữ cảnh.
- **Crawl Simulation Engine (Mini Screaming Frog) (`scripts/crawl-simulation.js`)**:
  - Tự động cào toàn bộ cây URL (Robots, Sitemap, Homepage, Category, District, Blog).
  - Kiểm tra mã HTTP 200, độ dài Title & Meta Description, Canonical URL, sự tồn tại và tính hợp lệ của Schema JSON-LD, số lượng liên kết nội bộ.
- **SEO Integration Test Suite (`scripts/test-seo-integration.js`)**:
  - 5/5 Integration test suites kiểm thử trực tiếp mã nguồn HTML trả về từ server.
- **Sprint 3 Evidence Artifacts (`evidence/sprint-03/`)**:
  - Xuất bản `CHANGELOG.md` và `crawl-simulation-report.json`.

### 2. Kết quả Kiểm thử & Triển khai (QA Gate):
- **Automated Integration Tests**: `scripts/test-seo-integration.js` (5 test suites) $\rightarrow$ **100% Passed**.
- **Crawl Simulation**: `scripts/crawl-simulation.js` cào 10 URLs $\rightarrow$ **100% Passed (10/10 URLs, HTTP 200, Valid Titles, Canonicals & Schemas)**.
- **Deploy & Health Check**: PM2 process id 52 `parking-hcm` hoạt động ổn định $\rightarrow$ **HTTP 200 OK**.

---

## 2026-08-20: Hoàn Thành Sprint 2 — SEO Engine, Schema Graph & Dynamic Sitemap

### 1. Quyết định kỹ thuật & Kiến trúc:
- **Slug Engine (`src/lib/slug/`)**:
  - `slugifyVietnamese`: Chuyển đổi tiếng Việt không dấu chuẩn SEO (Đ -> d, bỏ dấu thanh, chuẩn hóa URL).
  - `generateUniqueSlug`: Thuật ngữ disambiguation chống trùng lặp theo quận (`-quan-1`) và counter (`-2`).
- **Modular JSON-LD Schema.org Engine (`src/lib/seo/`)**:
  - `buildEntityGraph`: Ghép nối các schema nodes thành khối `@graph` chuẩn Google Rich Results.
  - `buildWebSiteSchema`: WebSite + SearchAction.
  - `buildOrganizationSchema`: Organization MapGo + Logo ImageObject + SameAs.
  - `buildBreadcrumbSchema`: BreadcrumbList đa cấp vị trí chuẩn 1..N.
  - `buildParkingFacilitySchema`: Thực thể `ParkingFacility` + `priceRange` + `LocationFeatureSpecification` (Bảo vệ, CCTV, Mái che, Chiều cao hầm) + `GeoCoordinates`.
  - `buildDistrictHubSchema`: CollectionPage + ItemList cho 22 quận huyện.
  - `buildFaqSchema`: FAQPage schema.
- **Dynamic Sitemap Engine (`src/app/sitemap.ts`)**:
  - Phân tầng sitemap động: Homepage (1.0 daily), Category hubs (0.95 weekly), 22 Quận/Huyện TP.HCM (0.9 weekly), Blog guides (0.85 weekly), POIs (0.8 weekly).
- **SEO Evidence Artifacts (`evidence/sprint-02/`)**:
  - Xuất bản `CHANGELOG.md`, `jsonld-preview.json`, `sitemap-sample.xml`.

### 2. Kết quả Kiểm thử & Triển khai (QA Gate):
- **Automated Unit Tests**: `scripts/test-seo-engine.js` (5 test suites) $\rightarrow$ **100% Passed**.
- **Next.js 16 Turbopack Build**: `npm run build` thành công 100% (76 routes).
- **Production Verification**:
  - `curl http://localhost:3003/robots.txt` $\rightarrow$ Trả về Host, Sitemap, Disallow chuẩn.
  - `curl http://localhost:3003/sitemap.xml` $\rightarrow$ Trả về XML Sitemap đầy đủ các cấp độ priority và lastmod.
  - PM2 process id 52 `parking-hcm` restart thành công $\rightarrow$ **HTTP 200 OK**.

---

## 2026-08-20: Hoàn Thành Sprint 1 — Domain Layer & Normalized Entity Models

### 1. Quyết định kỹ thuật & Kiến trúc:
- **Chuẩn hóa Domain Layer (Single Source of Truth)**:
  1. `src/domain/enums.ts`: Tập trung các Enums `SpotCategory`, `VehicleType`, `PriceType`, `PaymentMethod`, `VerificationMethod`, `ImageType`, `EvConnectorType`.
  2. `src/domain/spot.base.ts`: Khởi tạo `SpotEntity` làm thực thể gốc (Geo, Address, Verification, Media, ReviewStats).
  3. `src/domain/spot.parking.ts`: Thực thể kế thừa `ParkingSpot` với `heightLimit`, `capacity`, `security`, `pricing` (Dynamic Matrix).
  4. `src/domain/spot.ev.ts`, `spot.garage.ts`, `spot.utility.ts`: Thực thể kế thừa `EVChargingSpot`, `GarageSpot`, `RescueSpot`, `GasStationSpot`, `RestroomSpot`.
  5. `src/domain/index.ts`: Type guards chuyên dụng (`isParkingSpot`, `isEVChargingSpot`, `isGarageSpot`...).
- **Cơ sở dữ liệu Normalized đa bảng (Prisma Schema)**:
  - Bổ sung các bảng mở rộng 1-1 và 1-N: `SpotParkingDetail`, `SpotEvDetail`, `SpotGarageDetail`, `SpotPricing`, `SpotVerification`, `SpotPaymentMethod`.
  - Migration & Seed tự động: Đồng bộ schema 100%, backfill dữ liệu cho 428 địa điểm (202 parking details, 684 pricing records, 428 verification records).

### 2. Kết quả Kiểm thử & Triển khai (QA Gate):
- **Automated Unit Tests**: `scripts/test-domain-layer.js` (5 test suites) $\rightarrow$ **100% Passed**.
- **Next.js Turbopack Build**: `npm run build` thành công 100% (76 routes).
- **Deploy & Health Check**: PM2 process id 52 `parking-hcm` restart thành công $\rightarrow$ `curl http://localhost:3003` trả về **HTTP 200 OK**.

---

## 2026-08-20: Hoàn Thành Sprint 1 — Admin Data Operations Dashboard (5 Modules)

### 1. Quyết định kỹ thuật & Kiến trúc:
- **Tái cấu trúc Admin thành Data Operations Dashboard** với 5 Module rõ ràng:
  1. **Dashboard KPI & Data Health Score**: Thống kê 1.977 POIs (1.883 Active, 94 Hidden, 0 Verified), tính toán chỉ số Data Health Score (15/100), phân bổ 7 danh mục và 22 quận huyện.
  2. **POI Management**: Bảng dữ liệu phân trang (20 items/page), tìm kiếm unaccent tức thì, bộ lọc đa chiều (Quận/Huyện, Loại hình, Trạng thái, Verified), nút inline toggle 1-chạm Active/Hidden và Verified, modal chỉnh sửa chi tiết (Lat/Lng, SĐT, Giờ mở cửa, Giá vé, Sức chứa, Quản lý danh sách URL hình ảnh).
  3. **Data Quality Ops**: 5 hàng đợi tác vụ lọc nhanh điểm nghẽn dữ liệu: Thiếu SĐT (1.897), Địa chỉ dạng tọa độ thô (1.290), Thiếu giờ mở cửa (1.500), Thiếu ảnh thực tế (1.977), Chưa xác thực thực địa (1.977).
  4. **User Reports**: Tạo bảng `user_reports` trên PostgreSQL PostGIS, API quản lý báo cáo cộng đồng (`GET`, `POST`, `PATCH`), giao diện duyệt và đóng báo cáo từ người dùng/tài xế.
  5. **Analytics & Funnel**: Trực quan hóa phễu chuyển đổi hành vi tài xế (Mở app -> Bật GPS -> Bấm nearby -> Dẫn đường -> Lưu yêu thích) từ bảng `driver_funnel_events`.

### 2. Thiết kế UI/UX System:
- Loại bỏ hoàn toàn Emoji icon trong giao diện UI (`🚗, 📍, ⭐...`), thay thế bằng bộ **Icon SVG Lucide-style đồng bộ** (`src/components/Icons.tsx`).
- Sử dụng bảng màu Dark Mode chuẩn mực (`#09090b`, `#13131a`, `#3b82f6`, `#10b981`, `#f59e0b`, `#ef4444`).
- Thêm Toast thông báo nổi, không dùng `alert()` hay `confirm()` trình duyệt.

### 3. Kết quả Kiểm thử & Triển khai (QA Gate):
- **Migration DB**: Bảng `user_reports` được tạo và cấp quyền `GRANT ALL` cho user `erp`.
- **API Automated Tests**: Chạy test script `scripts/test_admin_endpoints.js` kiểm tra 6 test suites trên VPS (port 3003) -> **100% Passed HTTP 200**.
- **Next.js Turbopack Build**: `npm run build` thành công 100%, không lỗi TypeScript hay cú pháp.
- **Deploy**: PM2 process id 52 `parking-hcm` đã restart và hoạt động ổn định trên port 3003.

---

## Cấu trúc thư mục chính

```
cool-bohr/
├── project-docs/        # Hệ thống tài liệu 21 nguyên tắc
│   ├── roadmap.md       # Lộ trình 4 Sprints
│   ├── todo.md          # Checklist công việc
│   ├── architecture.md  # Kiến trúc hệ thống
│   ├── deployment.md    # Hướng dẫn deploy
│   ├── known-issues.md  # Lỗi đã biết
│   ├── lessons.md       # Bài học kinh nghiệm
│   ├── changelog.md     # Lịch sử thay đổi
│   └── memory.md        # Nhật ký bộ nhớ
├── src/
│   ├── app/
│   │   ├── admin/       # Admin Data Operations (5 Modules)
│   │   ├── api/admin/   # stats, spots, reports, data-quality, funnel
│   │   └── page.tsx     # Homepage bản đồ
│   ├── components/      # Icons, SpotCard, Map, Header, FilterChips...
│   └── lib/             # pg, auth, format, types, jwt...
```
