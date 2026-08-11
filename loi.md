# ParkingHCM — Error Log (loi.md)

> Ghi lại tất cả lỗi + nguyên nhân + cách fix

---

## Lỗi 1: `prisma.spot` không tồn tại
- **Thời điểm**: Build lần đầu
- **Nguyên nhân**: Prisma model tên `ParkingSpot` → client tạo `prisma.parkingSpot` (camelCase), code dùng `prisma.spot`
- **Fix**: Thay `prisma.spot` → `prisma.parkingSpot` toàn bộ API routes
- **Bài học**: Luôn check tên model Prisma match với client accessor

## Lỗi 2: `spotId` không tồn tại trong Review model
- **Nguyên nhân**: Schema dùng `parkingSpotId`, code dùng `spotId`
- **Fix**: Thay `spotId` → `parkingSpotId`

## Lỗi 3: Next.js 16 params phải là Promise
- **Nguyên nhân**: Breaking change Next.js 16, route handler params là `Promise<{ id: string }>`
- **Fix**: Thêm `await params` trong tất cả route `[id]`
- **Bài học**: Đọc AGENTS.md / migration guide trước khi code

## Lỗi 4: JWT signToken type error
- **Nguyên nhân**: TypeScript strict mode, `expiresIn` type conflict
- **Fix**: Cast `as jwt.SignOptions`

## Lỗi 5: SpotType enum undefined → crash frontend
- **Nguyên nhân**: Mock data dùng lowercase ('parking_lot'), code dùng uppercase ('PARKING_LOT')
- **Fix**: Chuẩn hóa tất cả sang uppercase

## Lỗi 6: Search "Trần Hưng Đạo" trả 0 kết quả
- **Nguyên nhân**: `mode: 'insensitive'` không hỗ trợ SQLite
- **Fix**: Bỏ `mode: 'insensitive'`, dùng `contains` thuần

## Lỗi 7: Search "Gò Vấp" trả 0 kết quả (dù API trả 4)
- **Nguyên nhân**: Radius filter 5km áp dụng cả khi search → user ở Q1 tìm Gò Vấp (7km) bị filter ra
- **Fix**: `if (!search)` mới áp dụng radius filter
- **Bài học**: Khi user chủ động search, không giới hạn khoảng cách

## Lỗi 8: Search không dấu ("go vap", "binh tan") trả 0
- **Nguyên nhân**: SQLite LIKE chỉ case-insensitive cho ASCII, Vietnamese diacritics cần xử lý riêng
- **Fix**: Thêm unaccent filter phía server: `normalize('NFD')` + strip diacritical marks
- **Bài học**: SQLite không có collation cho tiếng Việt

## Lỗi 9: Nút "Chỉ đường" trên SpotCard không hoạt động
- **Nguyên nhân**: `page.tsx` render `<SpotCard spot={spot} />` thiếu `onDirections` prop
- **Fix**: Thêm `onDirections={handleDirections}`
- **Bài học**: Sau khi redesign component, check tất cả nơi sử dụng

## Lỗi 10: "Chỉ đường" từ /spot/[id] mở Google Maps tab mới
- **Nguyên nhân**: Trang detail vẫn dùng `<a href="google.com/maps/...">` cũ
- **Fix**: Thay bằng `window.location.href = /?route_to=...` quay về homepage + auto-route

---

## 2026-08-06: Lỗi UX mobile

## Lỗi 11: Tìm kiếm sau chỉ đường không hiện kết quả
- **Thời điểm**: 2026-08-06
- **Nguyên nhân**: State `routingDest`, `selectedSpot`, `isRouting` không reset khi search mới
- **Fix**: Tạo `doSearch()` helper reset tất cả state trước khi `setSearchQuery`
- **Bài học**: Khi có nhiều state liên quan (routing, selection, search), phải reset cross-state khi action mới

## Lỗi 12: SpotCard bấm lần 2 không mở detail
- **Thời điểm**: 2026-08-06
- **Nguyên nhân**: SpotCard bọc trong `<Link href="/spot/[id]">` → bấm card navigate sang trang khác → mất hết state
- **Fix**: Thêm `onCardClick` prop → khi có prop này, dùng `<div>` thay `<Link>` (ở lại trang chủ)
- **Bài học**: Trong bottom sheet list, card click phải inline (không navigate), chỉ dùng Link khi ở trang khác

## Lỗi 13: Touch handler chặn click event trên mobile
- **Thời điểm**: 2026-08-06  
- **Nguyên nhân**: `onTouchStart/Move/End` gắn trên TOÀN BỘ bottom sheet div → intercept touch → không cho click event fire trên SpotCard bên trong
- **Fix**: Chuyển touch handlers chỉ gắn trên `bottom-sheet-handle` div (thanh kéo), không phải toàn sheet
- **Bài học**: Touch handlers trên parent div sẽ ăn click events của children trên mobile. Chỉ gắn touch handlers lên vùng cần drag, không phải toàn container

## Lỗi 14: Leaflet popup trắng che bottom sheet + gây stuck state
- **Thời điểm**: 2026-08-06
- **Nguyên nhân**: `marker.bindPopup(...)` tạo popup trắng Leaflet khi click marker → che bottom sheet detail → user bấm popup thay vì detail → state không update → bấm tiếp không hoạt động
- **Fix**: Xóa `bindPopup()` khỏi spot markers, chỉ dùng bottom sheet detail view
- **Bài học**: Không mix 2 hệ thống hiển thị detail (Leaflet popup + custom bottom sheet) → chọn 1

## Lỗi 15: Nút X mở "popup thật to" thay vì đóng
- **Thời điểm**: 2026-08-06
- **Nguyên nhân**: Nút X set `bottomSheetState = 'full'` → bottom sheet mở rộng 85% → user nghĩ là popup to không đóng được
- **Fix**: X set `bottomSheetState = 'peek'` (thu nhỏ) + `e.stopPropagation()` ngăn event bubble
- **Bài học**: "Đóng" đối với user = thu nhỏ/ẩn, KHÔNG phải mở rộng danh sách

## Lỗi 16: Nút "Đăng tin" (FAB) che nút "Chỉ đường" trên mobile
- **Thời điểm**: 2026-08-06
- **Nguyên nhân**: FAB position `fixed; bottom: 90px` → nằm đúng vùng action buttons của bottom sheet detail
- **Fix**: Chỉ hiện FAB khi `bottomSheetState === 'peek'`, ẩn khi detail/full
- **Bài học**: Floating buttons phải kiểm tra overlap với tất cả trạng thái bottom sheet

---

## 2026-08-11: Lỗi hiển thị ảnh đại diện danh mục

## Lỗi 17: Tất cả địa điểm (Quán ăn, Café, WC, Sửa xe, Bãi xe...) dùng chung 1 ảnh bãi xe outdoor
- **Thời điểm**: 2026-08-11
- **Nguyên nhân**: Fallback image trong `SpotCard.tsx` và `ImageGallery.tsx` chỉ dùng duy nhất 1 ảnh `parking-default.jpg`, dẫn đến nhà vệ sinh, quán cà phê, garage... đều hiện hình bãi đỗ xe ngoài trời gây phản cảm và vô lý.
- **Fix**: 
  1. Tạo bộ ảnh đại diện riêng cho từng danh mục (`PARKING_LOT`, `CAFE`, `RESTAURANT`, `RESTROOM`, `GARAGE`, `CARWASH`, `SERVICE`).
  2. Mở rộng kho ảnh lên 100+ ảnh chất lượng cao độc lập (Unsplash HD CDN + local category images).
  3. Xây dựng hàm `getDefaultImageForSpot(type, spotId)` và script seed DB đảm bảo 408 địa điểm hiển thị hình ảnh phong phú, đa dạng, không bị lặp lại đơn điệu.
- **Bài học**: Tuyệt đối không dùng 1-2 ảnh trùng lặp duy nhất cho hàng trăm địa điểm; phải dùng kho ảnh đa dạng đúng danh mục.
