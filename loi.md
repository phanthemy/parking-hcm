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
