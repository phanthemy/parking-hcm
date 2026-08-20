# MapGo / ParkingHCM — Memory Log

> Ghi lại quá trình + quyết định kỹ thuật quan trọng

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
