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
