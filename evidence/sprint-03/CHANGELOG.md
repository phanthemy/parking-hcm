# SPRINT 3 EVIDENCE & CHANGELOG: LOCAL SEO PLATFORM & CRAWL SIMULATION

## 1. Metadata
- **Sprint**: Sprint 03 — Local SEO Platform, Real Data Dynamic FAQs, Nearby Engine, Crawl Simulation
- **Date**: 2026-08-20
- **Status**: Completed & Verified
- **Branch**: `main`

## 2. Deliverables & Implementations
1. **Granular JSON-LD Node Architecture** (`src/lib/seo/nodes.ts`):
   - `buildWebSiteNode`, `buildOrganizationNode`, `buildBreadcrumbNode`, `buildParkingFacilityNode`, `buildFaqNodeFromData`, `buildDistrictCollectionNode`, `buildSearchActionNode`.
2. **Real-Data Dynamic FAQ Generator** (`src/lib/seo/faq-generator.ts`):
   - Tự động sinh FAQ ngữ cảnh theo 4 thuộc tính cơ sở dữ liệu: 24/7 & giờ mở cửa, giá vé xe máy/ô tô/qua đêm, giới hạn chiều cao hầm (m), trạm sạc xe điện EV.
3. **Smart Nearby Engine** (`src/lib/nearby.ts`):
   - Tính toán 5 POI gần nhất theo công thức Haversine để tạo ma trận Internal Linking ngữ cảnh.
4. **Crawl Simulation Engine (Mini Screaming Frog)** (`scripts/crawl-simulation.js`):
   - Tự động cào toàn bộ cây URL (Robots, Sitemap, Homepage, Category, District, Blog).
   - Kiểm tra mã HTTP 200, độ dài Title & Meta Description, Canonical URL, sự tồn tại và tính hợp lệ của Schema JSON-LD, số lượng liên kết nội bộ.
5. **SEO Integration Test Suite** (`scripts/test-seo-integration.js`):
   - 5/5 Integration test suites kiểm thử trực tiếp mã nguồn HTML trả về từ server.

## 3. Artifact Files in this Directory
- `CHANGELOG.md`: Tài liệu ghi chú quyết định kỹ thuật.
- `crawl-simulation-report.json`: Báo cáo cào dữ liệu chi tiết của 10 URLs trọng điểm.
