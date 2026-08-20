# MapGo / ParkingHCM — Memory Log

> Ghi lại quá trình + quyết định kỹ thuật quan trọng

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
