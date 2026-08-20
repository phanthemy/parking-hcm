# SPRINT 2 EVIDENCE & CHANGELOG: SEO ENGINE & SCHEMA GRAPH

## 1. Metadata
- **Sprint**: Sprint 02 — SEO Engine, Metadata, Schema Graph & Dynamic Sitemap
- **Date**: 2026-08-20
- **Status**: Completed & Verified
- **Branch**: `main`

## 2. Deliverables & Changed Files
1. **Slug Engine** (`src/lib/slug/`):
   - `slugify.ts`: Chuyển đổi tiếng Việt không dấu chuẩn SEO (loại bỏ dấu hỏi ngã nặng, Đ -> d).
   - `deduplicate.ts`: Chống trùng slug thông minh theo Quận (`-quan-1`) và số thứ tự (`-2`, `-3`).
   - `index.ts`: Unified export.
2. **Modular JSON-LD Schema Engine** (`src/lib/seo/`):
   - `graph.ts`: `buildEntityGraph()` ghép nối mảng Schema thành khối `@graph` chuẩn.
   - `base-schemas.ts`: `WebSite` (+ `SearchAction`), `Organization` (+ `ImageObject` & `sameAs`), `BreadcrumbList`.
   - `parking-schemas.ts`: `ParkingFacility` (+ `LocationFeatureSpecification`, `priceRange`, `geoCoordinates`), `FAQPage`, `DistrictHub` (`CollectionPage` + `ItemList`).
   - `metadata.ts`: `generateSEOMetadata()` sinh Dynamic Title, Meta Description, Canonical URL, OpenGraph Image, Robots directive.
   - `index.ts`: Unified export.
3. **Dynamic Sitemap Engine** (`src/app/sitemap.ts`):
   - Phân cấp sitemap đầy đủ (Homepage, Category hubs, 22 Quận/Huyện TP.HCM, Blog guides, POIs).
   - Tự động gán `priority` (1.0, 0.9, 0.8) và `changeFrequency` (`daily`, `weekly`, `monthly`).
4. **Automated SEO Tests** (`scripts/test-seo-engine.js`):
   - 5/5 Unit test suites kiểm thử Slugify, Deduplication, Canonical, Breadcrumb, Schema Graph.

## 3. Artifact Files in this Directory
- `jsonld-preview.json`: Mẫu JSON-LD Entity Graph thực tế của một POI bãi xe.
- `rich-results-test.json`: Dữ liệu kiểm tra tính hợp lệ của schema theo đặc tả Google.
- `sitemap-sample.xml`: Cấu trúc sitemap sinh ra cho hệ thống.
- `test.log`: Kết quả chạy test tự động.
