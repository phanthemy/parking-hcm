# MapGo — Quản Lý Nợ Kỹ Thuật (technical-debt.md)

Danh sách các hạng mục nợ kỹ thuật và rủi ro còn lại cần xử lý trong các Sprint tiếp theo:

---

## 1. Nợ Chất Lượng Dữ Liệu (Data Quality Debt - Sprint 2)
- **1.896 POIs thiếu số điện thoại**: Cần bổ sung và xác minh qua nguồn chính thống / thực địa.
- **1.290 POIs có địa chỉ dạng tọa độ thô**: Cần geocoding chuẩn sang định dạng Số nhà, Tên đường, Phường, Quận.
- **1.500 POIs thiếu cấu hình giờ mở/đóng cửa chi tiết**: Cần chuẩn hóa các bãi 24/7 và giờ hoạt động ban ngày.
- **1.977 POIs chưa có ảnh thực tế độc lập**: Đang dùng cơ chế fallback hash image, cần bổ sung ảnh thực địa.

---

## 2. Nợ Hệ Thống & Bảo Mật (Infrastructure Debt)
- **Rate Limit trên API Route Handlers**: Cần áp dụng Redis hoặc memory rate limiter cho `/api/spots`, `/api/nearby` và `/api/admin/reports` để chống DDoS.
- **CSRF Protection**: Nâng cấp CSRF token cho các form mutations quan trọng.
