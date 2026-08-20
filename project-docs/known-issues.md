# ParkingHCM / MapGo — Error Log (loi.md)

> Ghi lại tất cả lỗi + nguyên nhân + cách fix

---

## Lỗi 18: `permission denied for table user_reports` trong API `/api/admin/reports`
- **Thời điểm**: 2026-08-20 (Sprint 1)
- **Nguyên nhân**: Bảng `user_reports` được khởi tạo bằng user `postgres`, trong khi ứng dụng Next.js kết nối PostgreSQL bằng user `erp` (`postgresql://erp:erp_dev_2026@localhost:5432/mapgo_spatial`). User `erp` không có quyền SELECT, INSERT, UPDATE trên bảng và sequence `user_reports_id_seq`.
- **Cách fix**:
  1. Chạy lệnh:
     `ALTER TABLE user_reports OWNER TO erp;`
     `GRANT ALL ON TABLE user_reports TO erp;`
     `GRANT ALL ON SEQUENCE user_reports_id_seq TO erp;`
  2. Viết script kiểm thử tự động `scripts/test_admin_endpoints.js` kiểm tra GET, POST, PATCH đều trả về HTTP 200.
- **Bài học**: Luôn cấp quyền và chuyển OWNER cho user `erp` mỗi khi chạy migration tạo bảng/sequence mới trên PostgreSQL VPS.

---

## Lỗi 15: Admin Dashboard hiển thị 0 địa điểm / trống danh sách
- **Thời điểm**: 2026-08-20
- **Nguyên nhân**:
  1. API admin (`/api/admin/spots`, `/api/admin/stats`, `/api/admin/spots/[id]/status`) trước đây truy vấn bảng SQLite cũ thay vì bảng PostgreSQL PostGIS `places` table (`@/lib/pg`) nơi lưu trữ 1.977 POIs thực tế.
  2. Câu lệnh SQL dùng sai tên cột `is_verified` (trong khi schema PostgreSQL đặt tên là `verified`).
- **Cách fix**:
  1. Viết lại toàn bộ admin API routes dùng `pool.query` từ `@/lib/pg`.
  2. Sửa `is_verified` -> `verified`.
  3. Bổ sung Data Operations & Quality Dashboard theo dõi thiếu SĐT, địa chỉ thô, danh mục vào `/api/admin/stats` và trang `/admin`.
- **Kết quả**: Dashboard hiển thị chính xác 1.977 địa điểm, 1.883 đang hoạt động, phân trang và bộ lọc đầy đủ.

---

## Lỗi 17: Tất cả địa điểm (Quán ăn, Café, WC, Sửa xe, Bãi xe...) dùng chung 1 ảnh bãi xe outdoor
- **Thời điểm**: 2026-08-11
- **Nguyên nhân**: Fallback image trong `SpotCard.tsx` và `ImageGallery.tsx` chỉ dùng duy nhất 1 ảnh `parking-default.jpg`.
- **Fix**: Tạo bộ ảnh đại diện riêng cho từng danh mục, mở rộng kho ảnh lên 100+ ảnh, viết hàm `getDefaultImageForSpot(type, spotId)`.
