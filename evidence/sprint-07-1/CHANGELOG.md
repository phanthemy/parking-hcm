# CHANGELOG — Sprint 7.1: User Acquisition & PWA Adoption

## Ngày hoàn thành: 2026-08-20

### 1. Progressive Web App (Epic 1)
- **Manifest (`public/manifest.webmanifest` & `public/manifest.json`)**:
  - `display: standalone`
  - `start_url: /?source=pwa`
  - Icons 192px & 512px (any & maskable)
  - 3 Shortcuts: Bãi xe, Cây xăng, Trạm sạc EV
- **Service Worker (`public/sw.js`)**:
  - Cache First cho hình ảnh, icons, font
  - Network First with Cache Fallback cho HTML và APIs (`/api/spots`, `/api/stats`)
  - Offline Fallback Page (`public/offline.html`)

### 2. Deep Linking (Epic 2)
- **Dynamic Route (`src/app/p/[slug]/page.tsx`)**:
  - Open Graph (`og:title`, `og:image`, `og:url`)
  - Twitter Card (`summary_large_image`)
  - Canonical URL & Schema.org `ParkingFacility`
  - Web Share API & Copy Link fallback

### 3. User Retention (Epic 3)
- **User Retention Engine (`src/lib/user-retention.ts` & `src/contexts/UserRetentionContext.tsx`)**:
  - Favorites (Bãi xe yêu thích)
  - Recent Places (Lịch sử điểm đến)
  - Home & Work (Nhà riêng & Công ty)
  - Recently Viewed (Vừa xem)
  - Drawer `src/components/UserRetentionDrawer.tsx`

### 4. Community Data (Epic 4)
- **Community Report Modal (`src/components/CommunityReportModal.tsx`)**:
  - 5 loại báo cáo: Còn chỗ (`AVAILABLE`), Hết chỗ (`FULL`), Giá thay đổi (`PRICE_CHANGED`), Đóng cửa (`CLOSED`), Sai vị trí (`WRONG_LOCATION`)
  - Lưu trữ trực tiếp vào bảng `user_reports` trên PostgreSQL

### 5. Distribution (Epic 5)
- **PWA Install Banner (`src/components/PwaInstallBanner.tsx`)**:
  - Điều kiện: `Visit >= 2`, `Session >= 30s`, không quá `1 lần/tuần`, tự động ẩn trong chế độ Standalone.

### 6. QA Verification
- Automated Quality Gate: 26/26 Tests Passed (100%)
- Master Production Verification: 17/17 Pillars Passed (100%)
- Build: 76/76 Static & Dynamic Routes Passed (0 TypeScript errors)
