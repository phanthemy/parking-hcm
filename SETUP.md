# MapGo.vn — Hướng dẫn cài đặt trên Máy Công ty

## Yêu cầu hệ thống
- **Node.js** >= 18 (khuyến nghị v22): https://nodejs.org
- **Git**: https://git-scm.com
- **SSH Key** (để sync DB với VPS): Đã có tại `C:\Users\editor02\.gemini\antigravity\scratch\ORACLE\phanthemy\ssh-key-2026-06-17.key`

---

## 1. Clone project từ GitHub

```powershell
git clone https://github.com/phanthemy/parking-hcm.git
cd parking-hcm
```

## 2. Cài dependencies

```powershell
npm install
```

## 3. Tạo file `.env` (tạo tay, không được commit)

```
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="parking-hcm-secret-key-2026"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## 4. Sync DB từ VPS về máy local

```powershell
# Khai báo SSH Key
$env:SSH_KEY = "C:\Users\editor02\.gemini\antigravity\scratch\ORACLE\phanthemy\ssh-key-2026-06-17.key"

# Sync DB từ VPS
node sync-db.js pull

# Hoặc xem thống kê DB
node sync-db.js status
```

## 5. Chạy app local

```powershell
npm run dev
# Truy cập: http://localhost:3000
```

---

## Các lệnh cào dữ liệu mới (Scraping)

### Cào tất cả loại địa điểm trong bán kính 5km quanh trung tâm Q1

```powershell
npm run scrape:all
```

### Cào từng loại riêng biệt

```powershell
# Bãi đỗ xe
npm run scrape:parking

# Quán ăn / Nhà hàng
npm run scrape:restaurant

# Quán cafe
npm run scrape:cafe

# Nhà vệ sinh công cộng
npm run scrape:toilet
```

### Cào khu vực tùy chỉnh (lat, lng, radius)

```powershell
# Cú pháp: node scrape-overpass.js [loại] [lat] [lng] [bán_kính_km]

# Ví dụ: Cào quán ăn trong 3km quanh Quận 7
node scrape-overpass.js restaurant 10.7300 106.7100 3

# Ví dụ: Cào bãi xe trong 2km quanh Thủ Đức
node scrape-overpass.js parking 10.8500 106.7700 2

# Ví dụ: Cào tất cả trong 10km quanh TP.HCM
node scrape-overpass.js all 10.7769 106.7009 10
```

### Làm giàu địa chỉ cho các địa điểm thiếu thông tin

```powershell
npm run enrich
```

### Sửa tên Quận bị sai (Nominatim artifact)

```powershell
npm run fix:districts
```

---

## Quy trình làm việc hằng ngày

```
1. npm run db:pull        — Sync DB mới nhất từ VPS
2. npm run scrape:all     — Cào dữ liệu mới từ OpenStreetMap
3. npm run enrich         — Làm giàu địa chỉ
4. npm run fix:districts  — Chuẩn hóa tên Quận
5. npm run db:push        — Đẩy DB mới về VPS (tự restart PM2)
```

---

## Cấu trúc thư mục Scripts quan trọng

| File | Chức năng |
|------|-----------|
| `scrape-overpass.js` | Cào địa điểm từ OpenStreetMap Overpass API |
| `enrich-full-addresses.js` | Bổ sung địa chỉ đầy đủ bằng Nominatim |
| `clean-district-strings.js` | Sửa tên Quận bị sai |
| `sync-db.js` | Đồng bộ DB giữa VPS ↔ máy local |
| `fix-district-names.js` | Script fix tên Quận theo bounding box GPS |
| `check-mismatches.js` | Kiểm tra địa điểm bị gán sai Quận |
| `inspect-incomplete-addresses.js` | Liệt kê địa chỉ còn thiếu thông tin |

---

## Chú ý khi Cào dữ liệu

- Nominatim API giới hạn **1 request/giây** — script đã tự delay 1.2s
- Overpass API có giới hạn timeout 60 giây — không cào vùng quá rộng
- Sau khi cào xong, luôn chạy `npm run enrich` + `npm run fix:districts`
- Sau khi có dữ liệu tốt, chạy `npm run db:push` để sync lên VPS

---

## Thông tin kết nối VPS

| Thông tin | Giá trị |
|-----------|---------|
| IP | `149.118.62.155` |
| SSH User | `ubuntu` |
| SSH Key | `C:\Users\editor02\.gemini\...\ssh-key-2026-06-17.key` |
| App Dir | `/var/www/parking-hcm` |
| Domain | `https://mapgo.vn` |
