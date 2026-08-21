# Hướng Dẫn Đăng Tải Ứng Dụng MapGo Lên Google Play Store (CH Play)

Tài liệu hướng dẫn từng bước phát hành gói ứng dụng Android (TWA) **MapGo - Trợ Lý Tài Xế** lên Google Play Console.

---

## 1. Thông Tin Gói Ứng Dụng Đã Đóng Gói (Production Build)

| Thông số | Giá trị |
|---|---|
| **Package ID** | `vn.mapgo.driver` |
| **Tên ứng dụng** | MapGo - Trợ Lý Tài Xế |
| **Tên hiển thị icon** | MapGo |
| **Version Name** | `1.0.0` |
| **Version Code** | `1` |
| **Target Android SDK** | Android 14 (API level 34) |
| **File App Bundle (.aab)** | `c:\Users\editor02\Documents\antigravity\cool-bohr\dist\mapgo-driver-v1.0.0.aab` |
| **File APK cài test trực tiếp** | `c:\Users\editor02\Documents\antigravity\cool-bohr\dist\mapgo-driver-v1.0.0.apk` |
| **File Keystore** | `c:\Users\editor02\Documents\antigravity\cool-bohr\dist\mapgo-release.keystore` |
| **Trang xác thực Digital Asset Links** | `https://mapgo.vn/.well-known/assetlinks.json` *(Đã deploy live)* |
| **SHA-256 Fingerprint** | `1D:EE:56:79:4C:EB:D3:93:2F:AF:D9:F6:BD:ED:6B:8A:49:53:05:8E:5E:54:87:72:C3:8D:6D:37:05:83:47:7D` |

---

## 2. Quy Trình 6 Bước Đưa Lên CH Play

### Bước 1: Đăng nhập Google Play Console
1. Truy cập: [https://play.google.com/console](https://play.google.com/console)
2. Đăng nhập bằng tài khoản Nhà phát triển Google Play (Developer Account).

---

### Bước 2: Tạo Ứng Dụng Mới (Create App)
1. Ở góc phải màn hình, bấm nút **Tạo ứng dụng (Create app)**.
2. Điền thông tin:
   - **Tên ứng dụng**: `MapGo - Trợ Lý Tài Xế TP.HCM`
   - **Ngôn ngữ mặc định**: `Tiếng Việt (vi-VN)`
   - **Loại ứng dụng**: `Ứng dụng (App)`
   - **Miễn phí/Trả phí**: `Miễn phí (Free)`
3. Tích chọn đồng ý với các điều khoản của Google $\rightarrow$ Bấm **Tạo ứng dụng**.

---

### Bước 3: Hoàn thành Thiết lập ứng dụng (Set up your app)
Tại menu bên trái, vào mục **Tổng quan về trang tổng quan (Dashboard)** $\rightarrow$ Hoàn thành từng mục trong danh sách kiểm tra:
1. **Chính sách quyền riêng tư (Privacy policy)**:
   - Nhập URL: `https://mapgo.vn/privacy` (hoặc trang chính sách của website).
2. **Quyền truy cập ứng dụng (App access)**:
   - Chọn *Tất cả chức năng đều dùng được mà không bị hạn chế*.
3. **Quảng cáo (Ads)**:
   - Chọn *Không, ứng dụng của tôi không có quảng cáo* (hoặc có tùy thực tế).
4. **Xếp hạng nội dung (Content rating)**:
   - Bắt đầu khảo sát $\rightarrow$ Chọn loại *Tiện ích / Bản đồ* $\rightarrow$ Trả lời Không cho tất cả câu hỏi bạo lực/nhạy cảm $\rightarrow$ Nhận xếp hạng mọi lứa tuổi (3+).
5. **Đối tượng mục tiêu (Target audience)**:
   - Chọn độ tuổi từ *18 trở lên* (tài xế).
6. **Ứng dụng tin tức / Covid-19 / Tài chính**:
   - Chọn *Không*.
7. **Thu thập dữ liệu an toàn (Data safety)**:
   - Khai báo: Ứng dụng thu thập **Vị trí (Location - Precise location)** phục vụ chức năng tìm bãi đỗ xe và dẫn đường.

---

### Bước 4: Thiết lập Thông tin trang thông tin chính trên Cửa hàng (Main Store Listing)
Vào menu bên trái: **Tăng cường người dùng (Grow)** $\rightarrow$ **Trang thông tin trên cửa hàng (Store presence)** $\rightarrow$ **Trang thông tin chính trên Cửa hàng**:

1. **Thông tin ứng dụng**:
   - **Tên ứng dụng**: `MapGo - Trợ Lý Tài Xế TP.HCM`
   - **Mô tả ngắn (80 ký tự)**:
     `Tìm bãi giữ xe ô tô, xe máy, cây xăng, trạm sạc EV và WC gần nhất TP.HCM.`
   - **Mô tả đầy đủ**:
     ```text
     MapGo là ứng dụng hỗ trợ đắc lực dành cho tài xế xe ô tô và xe máy tại TP.HCM.
     
     TÍNH NĂNG NỔI BẬT:
     - Khám phá hơn 1.900+ bãi giữ xe ô tô, xe máy chính xác tại tất cả các quận huyện TP.HCM.
     - Cập nhật thông tin chi tiết: số chỗ đỗ, giá gửi xe tham khảo, giờ mở cửa/đóng cửa, hotline.
     - Tìm kiếm nhanh cây xăng, trạm sạc xe điện EV, nhà vệ sinh công cộng (WC) và quán ăn có chỗ đậu xe.
     - 1-chạm kích hoạt dẫn đường qua bản đồ vệ tinh GPS thông minh.
     - Báo cáo cộng đồng về tình trạng bãi xe (còn chỗ/hết chỗ/đóng cửa) trực tiếp.
     - Hoạt động mượt mà, dung lượng siêu nhẹ, tiết kiệm pin và dữ liệu 4G.
     ```
2. **Hình ảnh đồ họa (Graphics Assets)**:
   - **Biểu tượng ứng dụng (App icon)**: Tải lên file ảnh `512 x 512 px` (PNG 32-bit trong thư mục `public/icons/icon-512x512.png`).
   - **Đồ họa tính năng (Feature graphic)**: Tải lên banner ảnh kích thước `1024 x 500 px` (JPG hoặc PNG).
   - **Ảnh chụp màn hình điện thoại (Phone screenshots)**: Tải lên từ 2 đến 8 ảnh chụp màn hình ứng dụng MapGo (tỉ lệ 16:9 hoặc 9:16).

---

### Bước 5: Tải lên gói ứng dụng `.aab` và Tạo Bản Phát Hành
1. Vào menu bên trái: **Phát hành (Release)** $\rightarrow$ **Sản xuất (Production)** (hoặc chọn **Thử nghiệm nội bộ (Internal testing)** nếu muốn thử trước).
2. Bấm **Tạo bản phát hành mới (Create new release)**.
3. Ở mục **Gói ứng dụng (App bundles)**:
   - Bấm **Tải lên (Upload)** $\rightarrow$ Chọn file:
     `c:\Users\editor02\Documents\antigravity\cool-bohr\dist\mapgo-driver-v1.0.0.aab`
4. Ở mục **Tên bản phát hành (Release name)**: Nhập `1.0.0`.
5. Ở mục **Ghi chú phát hành (Release notes)**:
   ```text
   - Bản phát hành chính thức đầu tiên của MapGo trên CH Play.
   - Tìm kiếm hơn 1.900 bãi đỗ xe ô tô, cây xăng, trạm sạc EV và tiện ích tài xế TP.HCM.
   - Hỗ trợ dẫn đường GPS 1-chạm và báo cáo cộng đồng trực tiếp.
   ```
6. Bấm **Lưu (Save)** $\rightarrow$ Bấm **Xem lại bản phát hành (Review release)**.

---

### Bước 6: Gửi xét duyệt (Send for Review)
1. Kiểm tra lại toàn bộ cảnh báo (nếu có).
2. Bấm **Bắt đầu phát hành lên kênh Sản xuất (Start rollout to Production)**.
3. Ứng dụng sẽ chuyển sang trạng thái **Đang chờ xem xét (In review)**.
4. Google thường xét duyệt trong vòng **1 đến 3 ngày làm việc**. Sau khi được duyệt, ứng dụng sẽ chính thức xuất hiện trên CH Play!
