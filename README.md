# ParkingHCM 🅿️

Ứng dụng tìm bãi xe, quán ăn, WC công cộng và dịch vụ tại TP.HCM — Tối ưu cho Zalo Mini App.

## 🌐 Live Demo

- **Production**: [baidoxe.nextapp.vn](https://baidoxe.nextapp.vn)
- **Alias**: [parking.nextapp.vn](https://parking.nextapp.vn)

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Database | SQLite + Prisma ORM |
| Map | Leaflet + OpenStreetMap |
| Routing | OSRM (Open Source Routing Machine) |
| Auth | JWT (jsonwebtoken) |
| Hosting | VPS Oracle Cloud + Nginx + PM2 |

## 📦 Cài đặt & Chạy Local

```bash
# Clone
git clone <repo-url>
cd cool-bohr

# Install dependencies
npm install

# Setup database
npx prisma generate
npx prisma db push
npx prisma db seed

# Run dev server
npm run dev
```

Mở http://localhost:3000

## 📁 Cấu trúc thư mục

```
├── prisma/
│   ├── schema.prisma       # Database schema
│   ├── seed.ts             # Seed data (157 địa điểm TP.HCM)
│   └── dev.db              # SQLite database
├── src/
│   ├── app/
│   │   ├── page.tsx        # Trang chủ (bản đồ + danh sách)
│   │   ├── globals.css     # Design system
│   │   ├── spot/[id]/      # Chi tiết địa điểm
│   │   ├── admin/          # Quản trị viên
│   │   ├── auth/           # Đăng nhập / Đăng ký
│   │   └── api/            # REST API
│   ├── components/         # UI Components
│   ├── lib/                # Utilities (prisma, api, format, types)
│   ├── contexts/           # React Context (Auth)
│   └── hooks/              # Custom Hooks
└── public/                 # Static assets
```

## 🔑 Biến môi trường

Tạo file `.env` tại root:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="<your-secret-key>"
NEXTAUTH_URL="http://localhost:3000"
```

## 🔌 API Endpoints

| Method | Path | Mô tả |
|--------|------|--------|
| GET | `/api/spots` | Danh sách (search, filter, sort) |
| GET | `/api/spots/[id]` | Chi tiết địa điểm |
| POST | `/api/spots` | Tạo mới (auth required) |
| PUT | `/api/spots/[id]` | Cập nhật |
| DELETE | `/api/spots/[id]` | Xóa |
| GET | `/api/spots/[id]/reviews` | Reviews |
| POST | `/api/auth/login` | Đăng nhập |
| POST | `/api/auth/register` | Đăng ký |
| GET | `/api/admin/stats` | Thống kê admin |

### Search Params

```
GET /api/spots?search=Bình Tân&type=PARKING_LOT&lat=10.77&lng=106.70&radius=5&sort=distance&limit=50
```

- `search`: Tìm theo tên/địa chỉ (hỗ trợ có dấu + không dấu)
- `type`: PARKING_LOT, RESTAURANT, CAFE, RESTROOM, SERVICE
- `lat`, `lng`: Vị trí GPS (để tính khoảng cách)
- `radius`: Bán kính km (mặc định 5, bỏ qua khi có search)
- `sort`: distance, price, rating
- `limit`: Số kết quả (mặc định 50)

## 📄 License

Private — NextApp.vn
