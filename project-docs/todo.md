# MapGo — Danh Sách Việc Cần Làm (TODO)

## Sprint 1: Admin Data Operations Dashboard (ĐÃ HOÀN THÀNH ✅)

- [x] Thiết kế & xây dựng **Module 1: Dashboard KPI Tổng Quan & Data Health Score** (Tổng POI: 1.977, Active: 1.883, Hidden: 94, Health Score: 15/100, Phân bổ 7 danh mục, Phân tích phễu tài xế).
- [x] Thiết kế & xây dựng **Module 2: POI Management** (Bảng phân trang, Tìm kiếm unaccent tức thì, Bộ lọc đa chiều: Loại hình, 22 Quận Huyện, Trạng thái, Verified, Inline toggle 1-chạm).
- [x] Thiết kế & xây dựng **Module 3: Data Quality Ops** (Hàng đợi lọc nhanh: Thiếu SĐT, Địa chỉ thô, Thiếu giờ mở cửa, Thiếu ảnh thật, Chưa xác minh; Thao tác sửa nhanh).
- [x] Thiết kế & xây dựng **Module 4: User Reports** (Tạo bảng PostgreSQL `user_reports`, API GET/POST/PATCH, Giao diện quản lý & giải quyết phản hồi từ cộng đồng).
- [x] Thiết kế & xây dựng **Module 5: Analytics & Funnel** (Trực quan hóa phễu hành trình tài xế: Mở app -> Bật GPS -> Bấm nearby -> Dẫn đường -> Lưu yêu thích).
- [x] Modal Chỉnh sửa / Thêm mới POI đầy đủ (Tọa độ Lat/Lng, SĐT, Giờ mở cửa, Giá vé, Sức chứa, Quản lý danh sách URL hình ảnh).
- [x] Đã kiểm thử tự động toàn diện 6 test suites API trên production VPS (`scripts/test_admin_endpoints.js` -> 100% Passed HTTP 200).

---

## Sprint 2: Chuẩn Hóa Chất Lượng Dữ Liệu 1.977 POIs (TIẾP THEO ⏳)
- [ ] Bổ sung số điện thoại cho các bãi xe/dịch vụ trọng điểm (hiện tại thiếu 1.897 điểm).
- [ ] Geocode & chuẩn hóa 1.290 địa chỉ dạng tọa độ thô sang địa chỉ số nhà/tên đường/phường/quận.
- [ ] Chuẩn hóa giờ mở cửa/đóng cửa và bảng giá cho bãi xe 24/7.
- [ ] Cập nhật bộ ảnh thực tế cho từng địa điểm, đối soát và gắn nhãn `Verified` thực địa.
- [ ] Nâng Data Health Score từ 15/100 lên > 85/100.

---

## Sprint 3: Thử Nghiệm Thực Địa Với 10 Tài Xế Thật (KẾ HOẠCH)
- [ ] Phân phối app/PWA cho 10 tài xế ô tô di chuyển thực tế tại TP.HCM.
- [ ] Quan sát hành vi: Mở app → Tìm bãi đỗ → Dẫn đường OSRM → Vào bãi đỗ thành công.
- [ ] Ghi nhận phản hồi, các điểm nghẽn UX và thông tin còn thiếu.

---

## Sprint 4: Tối Ưu Giữ Chân Người Dùng (KẾ HOẠCH)
- [ ] Tối ưu danh mục Yêu thích (Favorite), Lịch sử tìm kiếm (History), Đã xem gần đây (Recently Viewed).
- [ ] Luồng báo cáo sai thông tin nhanh từ người dùng (In-app Quick Report).
- [ ] Đánh giá & Bình luận (Review/Rating) cộng đồng.
