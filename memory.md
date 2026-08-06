# ParkingHCM — Memory Log

> Ghi lại quá trình + quyết định kỹ thuật quan trọng

---

## 2026-08-05: Khởi tạo dự án

### Quyết định kỹ thuật
- **Stack**: Next.js 15 + Prisma + SQLite + Leaflet/OpenStreetMap
- **Hosting**: VPS Oracle Cloud (149.118.62.155), Nginx reverse proxy, PM2
- **Domain**: baidoxe.nextapp.vn, parking.nextapp.vn
- **Theme**: Dark mode, glassmorphism, gradient xanh→tím cho CTA
- **Map**: Leaflet + OpenStreetMap (miễn phí, không cần API key)
- **Routing**: OSRM public API cho chỉ đường in-app

### Workflow Sub-agents ban đầu
1. 🗄️ DB Architect (pro) — Schema Prisma, seed data
2. 🎨 UI/UX Designer (pro) — globals.css, design tokens
3. ⚙️ Backend Dev (pro) — API routes
4. 💻 Frontend Dev (inherit) — Pages + Components

### Tính năng đã triển khai
- [x] Bản đồ fullscreen + sidebar desktop + bottom sheet mobile
- [x] Search có dấu + không dấu (unaccent)
- [x] Filter theo loại (bãi xe, quán ăn, WC, café, dịch vụ)
- [x] Chỉ đường in-app (OSRM) — không redirect Google Maps
- [x] 157 địa điểm phủ tất cả quận TP.HCM
- [x] SpotCard redesign (thumbnail 16:9, overlay badges, 2-col grid)
- [x] Admin panel
- [x] Auth (login/register)

### Quyết định quan trọng
- **Bỏ radius filter khi search**: User ở Q1 tìm "Bình Tân" (10km) bị lọc ra → fix: chỉ filter radius khi browse, bỏ khi search
- **Bỏ `mode: 'insensitive'`**: SQLite không hỗ trợ → dùng `contains` không mode
- **Unaccent search**: Dùng `normalize('NFD')` + regex strip diacritics phía server
- **In-app routing**: User yêu cầu "không nhảy ra khỏi trang" → dùng OSRM polyline trên Leaflet map
- **Default limit tăng 10→50**: Để hiện nhiều kết quả hơn

---

## Cấu trúc thư mục chính

```
cool-bohr/
├── prisma/
│   ├── schema.prisma    # ParkingSpot, User, Review, SpotImage
│   └── seed.ts
├── src/
│   ├── app/
│   │   ├── page.tsx         # Trang chủ (map + sidebar/bottom sheet)
│   │   ├── globals.css      # Design system
│   │   ├── layout.tsx       # Root layout
│   │   ├── spot/[id]/       # Chi tiết địa điểm
│   │   ├── admin/           # Quản trị
│   │   ├── auth/            # Đăng nhập/ký
│   │   └── api/             # API routes
│   ├── components/          # SpotCard, Map, FilterChips, etc.
│   ├── lib/                 # prisma, api, format, types, haversine, jwt
│   ├── contexts/            # AuthContext
│   └── hooks/               # useAuth, useGeolocation
└── public/
```

---

## 2026-08-06: Chỉ đường real-time + Fix UX mobile + Video TikTok

### Tính năng mới
- [x] **GPS Navigation real-time** — Bấm "Đi ngay" → theo dõi GPS liên tục trên map
  - Chấm xanh di chuyển theo vị trí user
  - Map auto-center + zoom 16+
  - Live distance/time remaining cập nhật real-time
  - Auto-detect đến nơi (< 50m) → alert thông báo
  - Thanh nav bar xanh lá hiện khi đang dẫn đường
- [x] **Routing navigation bar** — Hiện tên + khoảng cách + nút Đi ngay / Hủy / Dừng
- [x] **Bottom sheet detail redesign** — Nút ✕ đóng, nút 🚀 Đi ngay + 🧭 Chỉ đường + 📞
- [x] **FAB "Đăng tin" auto-hide** — Ẩn khi bottom sheet detail/full mở, tránh che nút

### Fix UX quan trọng
- [x] **Search sau chỉ đường** — `doSearch()` reset routing state trước khi fetch
- [x] **SpotCard không navigate** — Dùng `onCardClick` prop → div thay Link trong bottom sheet
- [x] **Touch handler chặn click** — Chuyển touch drag từ toàn sheet → chỉ handle bar
- [x] **Leaflet popup trắng** — Xóa `bindPopup` khỏi markers, dùng bottom sheet detail thay thế
- [x] **X đóng detail** — Về `peek` (thu nhỏ) thay vì `full` (mở rộng)
- [x] **Map click đóng detail** — Bấm vào map background → đóng detail panel

### Video TikTok
- [x] Ghép `parking.mp4` (quay màn hình) + `Ghi Am.MP3` (giọng nói)
- [x] Voice delay 5s để khớp video
- [x] Nhạc nền fade in từ giây 40, fade out cuối video
- [x] Output: `ParkingHCM-TikTok-FINAL.mp4` (16.76 MB, 1:51)

### Quyết định kỹ thuật mới
- **Navigation in-app**: User yêu cầu "di chuyển luôn trên web, ko nhảy ra Google Maps" → dùng `watchPosition` GPS + Leaflet setView real-time
- **Touch only on handle**: Touch drag handlers gây conflict với card clicks → chỉ gắn trên handle bar
- **No Leaflet popup**: Popup trắng Leaflet che bottom sheet + gây stuck state → xóa hoàn toàn, dùng bottom sheet detail thay thế
- **Peek on close**: User kỳ vọng X = đóng → `peek` (thu nhỏ), không phải `full` (mở rộng)

### Deploy
- Production: `mapgo.vn` (trước đó: `baidoxe.nextapp.vn` / `parking.nextapp.vn`)
- Method: SCP + SSH + `npm run build` + `pm2 restart parking-hcm`

---

## 2026-08-06: Auto-Sync Google Maps + SEO Optimization

### Tính năng mới — Auto Sync
- [x] **Google Maps Places API scraper** — `scripts/google-places-sync.js`
  - Dùng Places API (New) `searchNearby` endpoint
  - Grid search: chia vùng quét thành lưới (1500m/điểm) để phủ rộng
  - Dedup bằng proximity 50m + cùng type
  - 5 categories: parking, restaurant, cafe, toilet, gas_station
  - Spots mới vào status `PENDING` chờ admin duyệt
  - API key đọc từ `.env` → `GOOGLE_MAPS_API_KEY`
- [x] **Auto-sync orchestrator** — `scripts/auto-sync.js`
  - Chạy Google Maps trước → OSM sau
  - Tự skip Google nếu không có API key
  - Log kết quả vào `scripts/sync-log.json`
  - Hỗ trợ `--dry-run`, `--source=google|osm`
- [x] **Schema update** — Thêm 5 fields vào ParkingSpot:
  - `sourceId`, `source`, `lastSyncedAt`, `googleRating`, `googlePlaceId`
- [x] **Overpass scraper update** — Thêm source='OSM', status='PENDING'
- [x] **Admin panel** — Thêm cột "Nguồn" + Google Rating + stat "Sync mới"

### SEO Optimization
- [x] **Spot Detail SSR** — Chuyển từ `'use client'` → Server Component
  - `generateMetadata()` — Dynamic title, description, OG tags
  - JSON-LD LocalBusiness/ParkingFacility + BreadcrumbList
  - Client component tách ra `SpotDetailClient.tsx`
- [x] **District Landing Pages** — `/quan/[slug]` (22 quận)
  - Server-rendered HTML cho Google bot index
  - JSON-LD ItemList + Breadcrumb
  - SEO footer text
  - Canonical URLs
- [x] **Sitemap** — Thêm 22 district URLs (priority 0.7)
- [x] **Google Search Console** — Meta tag verification

### Quyết định kỹ thuật
- **SSR cho SEO**: Google bot không render JS → phải dùng Server Component
- **District pages**: Tạo trang tĩnh cho mỗi quận → target từ khóa "bãi đỗ xe Quận X"
- **Pending status**: Tất cả data mới từ auto-sync → PENDING → admin duyệt → ACTIVE
- **Grid search**: Google Nearby Search max 20 kết quả → chia grid 1500m để phủ nhiều hơn

### NPM Scripts mới
- `npm run sync:auto` — Chạy cả Google + OSM
- `npm run sync:google` — Chỉ Google Maps
- `npm run sync:dry` — Dry run (không lưu DB)
