# MapGo — Kiến Trúc Hệ Thống (architecture.md)

## 1. Stack Công Nghệ
- **Frontend**: Next.js 15 (App Router), React, Tailwind CSS, Lucide React, Leaflet (OpenStreetMap).
- **Backend API**: Next.js Route Handlers (`src/app/api/...`), Node.js.
- **Database**: PostgreSQL 16 + PostGIS extension (`places`, `spatial_ref_sys`, `driver_funnel_events`, `user_reports`).
- **Connection Pool**: `pg` pool (`src/lib/pg.ts`) kết nối trực tiếp VPS PostgreSQL.
- **Routing Engine**: OSRM (Open Source Routing Machine) API cho dẫn đường in-app.
- **Hosting / Infra**: Oracle Cloud VPS (149.118.62.155), Nginx Reverse Proxy, PM2 Process Manager, SSL Let's Encrypt / Caddy.

## 2. Mô Hình Dữ Liệu POI (`places` table)
- `id` (VARCHAR): ID định danh duy nhất (UUID hoặc slug).
- `name` (TEXT): Tên địa điểm.
- `address` (TEXT): Địa chỉ chi tiết.
- `district` (VARCHAR): Quận / Huyện (chuẩn hóa 22 quận huyện TP.HCM).
- `category` (VARCHAR): PARKING_LOT, CAFE, RESTAURANT, RESTROOM, GARAGE, CARWASH, SERVICE.
- `geom` (GEOMETRY(Point, 4326)): Tọa độ không gian PostGIS.
- `phone` (VARCHAR): Số điện thoại liên hệ.
- `opening_hours` (VARCHAR): Khung giờ hoạt động.
- `price_info` (TEXT / JSONB): Giá vé ô tô / xe máy / gửi qua đêm.
- `status` (VARCHAR): ACTIVE / HIDDEN / PENDING.
- `verified` (BOOLEAN): Trạng thái xác thực thực địa.
- `images` (JSONB / Array): Danh sách URL ảnh thực tế.
