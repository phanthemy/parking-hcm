import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// ============================================================
// DỮ LIỆU THỰC TẾ - TẤT CẢ DANH MỤC TẠI TP.HCM
// ============================================================

const allSpots = [
  // ======================================
  // 🍜 QUÁN ĂN CÓ CHỖ ĐẬU XE
  // ======================================
  {
    name: 'Quán Nhà - Ẩm thực Việt',
    address: '42 Võ Văn Kiệt, P. Nguyễn Thái Bình, Quận 1, TP.HCM',
    description: 'Nhà hàng ẩm thực Việt cao cấp với bãi đậu xe ô tô riêng. Không gian đẹp, phục vụ cơm trưa văn phòng và tiệc.',
    lat: 10.7698, lng: 106.7030,
    type: 'RESTAURANT', carSlots: 15, bikeSlots: 30,
    pricePerHour: 0, openTime: '10:00', closeTime: '22:00',
    phone: '028 3914 4545', isPremium: false, status: 'ACTIVE'
  },
  {
    name: 'Mountain Retreat Restaurant',
    address: '36 Lê Lợi, P. Bến Nghé, Quận 1, TP.HCM',
    description: 'Nhà hàng view đẹp trung tâm Q1, có chỗ để ô tô. Phục vụ món Âu - Việt.',
    lat: 10.7735, lng: 106.6985,
    type: 'RESTAURANT', carSlots: 10, bikeSlots: 20,
    pricePerHour: 0, openTime: '10:00', closeTime: '23:00',
    phone: '028 3822 6789', isPremium: false, status: 'ACTIVE'
  },
  {
    name: 'La Maison Wine Dining',
    address: '201B Nam Kỳ Khởi Nghĩa, P. 7, Quận 3, TP.HCM',
    description: 'Nhà hàng cao cấp Fusion Pháp-Việt trong biệt thự cổ sang trọng. Có bãi đậu xe riêng.',
    lat: 10.7858, lng: 106.6878,
    type: 'RESTAURANT', carSlots: 8, bikeSlots: 15,
    pricePerHour: 0, openTime: '11:00', closeTime: '23:00',
    phone: '028 3526 1888', isPremium: true, status: 'ACTIVE'
  },
  {
    name: 'Hàng Dương Quán - Hải sản',
    address: '132 Đường số 65, P. Tân Phong, Quận 7, TP.HCM',
    description: 'Nhà hàng hải sản nổi tiếng khu Phú Mỹ Hưng. Sân vườn rộng, bãi xe ô tô lớn. Phục vụ tiệc.',
    lat: 10.7310, lng: 106.7195,
    type: 'RESTAURANT', carSlots: 30, bikeSlots: 50,
    pricePerHour: 0, openTime: '10:00', closeTime: '22:30',
    phone: '028 5412 2233', isPremium: true, status: 'ACTIVE'
  },
  {
    name: 'Nhà hàng Hương Lúa 9',
    address: '11-17 Đường số 65, P. Tân Phong, Quận 7, TP.HCM',
    description: 'Nhà hàng sân vườn Phú Mỹ Hưng, khu vực tổ chức tiệc. Bãi xe rộng rãi, thuận tiện.',
    lat: 10.7315, lng: 106.7188,
    type: 'RESTAURANT', carSlots: 25, bikeSlots: 40,
    pricePerHour: 0, openTime: '10:00', closeTime: '22:00',
    phone: '028 5413 5599', isPremium: false, status: 'ACTIVE'
  },
  {
    name: 'Shang Garden - Chinese Restaurant',
    address: '23 Nguyễn Khắc Viện, P. Tân Phú, Quận 7, TP.HCM',
    description: 'Nhà hàng Trung Hoa sang trọng tại Phú Mỹ Hưng. Dimsum, hải sản, có bãi đậu xe.',
    lat: 10.7295, lng: 106.7220,
    type: 'RESTAURANT', carSlots: 20, bikeSlots: 30,
    pricePerHour: 0, openTime: '11:00', closeTime: '22:00',
    phone: '028 5411 8866', isPremium: false, status: 'ACTIVE'
  },
  {
    name: 'Smith\'s Kitchen & Bar - Silverland',
    address: 'Khách sạn Silverland, 14 Lê Lai, P. Bến Thành, Quận 1, TP.HCM',
    description: 'Nhà hàng trong khách sạn Silverland. Bãi xe hầm khách sạn, an ninh tốt.',
    lat: 10.7705, lng: 106.6932,
    type: 'RESTAURANT', carSlots: 20, bikeSlots: 30,
    pricePerHour: 0, openTime: '06:00', closeTime: '23:00',
    phone: '028 3827 3988', isPremium: false, status: 'ACTIVE'
  },
  {
    name: 'Nhà hàng Cục Gạch Quán',
    address: '10 Đặng Tất, P. Tân Định, Quận 1, TP.HCM',
    description: 'Nhà hàng ẩm thực Việt nổi tiếng với không gian hoài cổ. Có bãi giữ xe nhỏ.',
    lat: 10.7902, lng: 106.6945,
    type: 'RESTAURANT', carSlots: 5, bikeSlots: 20,
    pricePerHour: 0, openTime: '09:00', closeTime: '22:30',
    phone: '028 3848 0144', isPremium: false, status: 'ACTIVE'
  },
  {
    name: 'Nhà hàng Ngon 138',
    address: '138 Nam Kỳ Khởi Nghĩa, P. Bến Thành, Quận 1, TP.HCM',
    description: 'Nhà hàng ẩm thực đường phố Việt Nam trong biệt thự. Có chỗ đậu xe ô tô phía trước.',
    lat: 10.7762, lng: 106.6918,
    type: 'RESTAURANT', carSlots: 8, bikeSlots: 25,
    pricePerHour: 0, openTime: '07:00', closeTime: '22:00',
    phone: '028 3827 7131', isPremium: false, status: 'ACTIVE'
  },
  {
    name: 'Wrap & Roll - Hai Bà Trưng',
    address: '62 Hai Bà Trưng, P. Bến Nghé, Quận 1, TP.HCM',
    description: 'Chuỗi nhà hàng Việt hiện đại. Gần bãi giữ xe công cộng, thuận tiện.',
    lat: 10.7780, lng: 106.7005,
    type: 'RESTAURANT', carSlots: 5, bikeSlots: 20,
    pricePerHour: 0, openTime: '10:00', closeTime: '22:00',
    phone: '028 3822 2166', isPremium: false, status: 'ACTIVE'
  },

  // ======================================
  // ☕ CÀ PHÊ CÓ CHỖ ĐẬU XE
  // ======================================
  {
    name: 'Highlands Coffee Drive-Thru',
    address: '249 Hoàng Văn Thụ, P. 2, Tân Bình, TP.HCM',
    description: 'Highlands Coffee mô hình Drive-Thru đầu tiên. Thiết kế cho khách đi ô tô, gọi món không cần xuống xe.',
    lat: 10.8045, lng: 106.6645,
    type: 'CAFE', carSlots: 12, bikeSlots: 20,
    pricePerHour: 0, openTime: '07:00', closeTime: '22:00',
    phone: '028 3811 9999', isPremium: true, status: 'ACTIVE'
  },
  {
    name: 'Highlands Coffee - Viettel Complex',
    address: '285 Cách Mạng Tháng 8, P. 12, Quận 10, TP.HCM',
    description: 'Highlands trong tòa nhà Viettel Complex. Bãi đậu xe hầm rộng, tiện cho khách đi ô tô.',
    lat: 10.7745, lng: 106.6742,
    type: 'CAFE', carSlots: 50, bikeSlots: 100,
    pricePerHour: 0, openTime: '07:00', closeTime: '22:00',
    phone: null, isPremium: false, status: 'ACTIVE'
  },
  {
    name: 'Starbucks - mPlaza Lê Duẩn',
    address: '39 Lê Duẩn, P. Bến Nghé, Quận 1, TP.HCM',
    description: 'Starbucks tại tòa nhà mPlaza. Sử dụng bãi xe hầm Kumho của cao ốc, rộng rãi.',
    lat: 10.7812, lng: 106.6984,
    type: 'CAFE', carSlots: 100, bikeSlots: 200,
    pricePerHour: 0, openTime: '07:00', closeTime: '22:00',
    phone: null, isPremium: false, status: 'ACTIVE'
  },
  {
    name: 'Starbucks - New World Hotel',
    address: '76 Lê Lai, P. Bến Thành, Quận 1, TP.HCM',
    description: 'Starbucks trong khách sạn New World. Hỗ trợ bãi đậu xe hầm khách sạn.',
    lat: 10.7708, lng: 106.6940,
    type: 'CAFE', carSlots: 80, bikeSlots: 50,
    pricePerHour: 0, openTime: '06:30', closeTime: '22:00',
    phone: null, isPremium: false, status: 'ACTIVE'
  },
  {
    name: 'Phúc Long - Saigon Centre Takashimaya',
    address: '65 Lê Lợi, P. Bến Nghé, Quận 1, TP.HCM',
    description: 'Phúc Long trong TTTM Saigon Centre. Sử dụng bãi xe hầm Takashimaya, rất tiện.',
    lat: 10.7730, lng: 106.7005,
    type: 'CAFE', carSlots: 200, bikeSlots: 500,
    pricePerHour: 0, openTime: '09:30', closeTime: '21:30',
    phone: null, isPremium: false, status: 'ACTIVE'
  },
  {
    name: 'The Coffee House - Phạm Ngọc Thạch',
    address: '86-88 Phạm Ngọc Thạch, P. 6, Quận 3, TP.HCM',
    description: 'The Coffee House lớn, 3 tầng, có chỗ đậu xe trước quán. Wifi mạnh, không gian làm việc.',
    lat: 10.7835, lng: 106.6910,
    type: 'CAFE', carSlots: 5, bikeSlots: 30,
    pricePerHour: 0, openTime: '07:00', closeTime: '22:30',
    phone: '028 7300 7788', isPremium: false, status: 'ACTIVE'
  },
  {
    name: 'Starbucks - Emart Gò Vấp',
    address: '366 Phan Văn Trị, P. 5, Gò Vấp, TP.HCM',
    description: 'Starbucks tại Emart. Bãi đậu xe ô tô rộng rãi miễn phí khi mua sắm.',
    lat: 10.8325, lng: 106.6638,
    type: 'CAFE', carSlots: 100, bikeSlots: 300,
    pricePerHour: 0, openTime: '08:00', closeTime: '22:00',
    phone: null, isPremium: false, status: 'ACTIVE'
  },
  {
    name: 'Trung Nguyên Legend Cafe - Phạm Văn Đồng',
    address: '52 Phạm Văn Đồng, P. Hiệp Bình Chánh, TP. Thủ Đức',
    description: 'Quán café Trung Nguyên sân vườn rộng. Bãi đậu xe ô tô riêng, không gian xanh.',
    lat: 10.8380, lng: 106.7180,
    type: 'CAFE', carSlots: 15, bikeSlots: 40,
    pricePerHour: 0, openTime: '06:30', closeTime: '22:00',
    phone: null, isPremium: false, status: 'ACTIVE'
  },

  // ======================================
  // 🚻 NHÀ VỆ SINH CÔNG CỘNG
  // ======================================
  {
    name: 'Nhà vệ sinh công cộng - Công viên Lê Văn Tám',
    address: 'Công viên Lê Văn Tám, Hai Bà Trưng, P. Đa Kao, Quận 1, TP.HCM',
    description: 'Nhà vệ sinh công cộng 5 sao trong công viên Lê Văn Tám. Sạch sẽ, có người dọn dẹp thường xuyên. Miễn phí.',
    lat: 10.7885, lng: 106.6960,
    type: 'RESTROOM', carSlots: 0, bikeSlots: 0,
    pricePerHour: 0, openTime: '05:00', closeTime: '22:00',
    phone: null, isPremium: false, status: 'ACTIVE'
  },
  {
    name: 'Nhà vệ sinh công cộng - Công viên 23/9',
    address: 'Công viên 23/9, Phạm Ngũ Lão, P. Phạm Ngũ Lão, Quận 1, TP.HCM',
    description: 'Nhà vệ sinh công cộng tại Công viên 23 tháng 9, gần chợ Bến Thành. Miễn phí, có camera an ninh.',
    lat: 10.7685, lng: 106.6905,
    type: 'RESTROOM', carSlots: 0, bikeSlots: 0,
    pricePerHour: 0, openTime: '05:00', closeTime: '22:00',
    phone: null, isPremium: false, status: 'ACTIVE'
  },
  {
    name: 'Nhà vệ sinh công cộng - Công viên Tao Đàn',
    address: 'Công viên Tao Đàn, Trương Định, P. Bến Thành, Quận 1, TP.HCM',
    description: 'Nhà vệ sinh trong Công viên Tao Đàn. Tiêu chuẩn 5 sao, sạch sẽ, miễn phí.',
    lat: 10.7756, lng: 106.6918,
    type: 'RESTROOM', carSlots: 0, bikeSlots: 0,
    pricePerHour: 0, openTime: '05:00', closeTime: '22:00',
    phone: null, isPremium: false, status: 'ACTIVE'
  },
  {
    name: 'Nhà vệ sinh - Phố đi bộ Nguyễn Huệ',
    address: 'Đường Nguyễn Huệ (gần tượng Bác Hồ), P. Bến Nghé, Quận 1, TP.HCM',
    description: 'Nhà vệ sinh công cộng trên phố đi bộ Nguyễn Huệ. Hiện đại, sạch sẽ.',
    lat: 10.7738, lng: 106.7038,
    type: 'RESTROOM', carSlots: 0, bikeSlots: 0,
    pricePerHour: 0, openTime: '06:00', closeTime: '23:00',
    phone: null, isPremium: false, status: 'ACTIVE'
  },
  {
    name: 'Nhà vệ sinh - Đường Lê Duẩn',
    address: 'Đường Lê Duẩn (gần Nhà thờ Đức Bà), P. Bến Nghé, Quận 1, TP.HCM',
    description: 'Nhà vệ sinh công cộng gần Nhà thờ Đức Bà và Bưu điện TP. Miễn phí.',
    lat: 10.7798, lng: 106.6990,
    type: 'RESTROOM', carSlots: 0, bikeSlots: 0,
    pricePerHour: 0, openTime: '06:00', closeTime: '22:00',
    phone: null, isPremium: false, status: 'ACTIVE'
  },
  {
    name: 'Nhà vệ sinh - Vincom Center Đồng Khởi',
    address: 'Tầng hầm, 72 Lê Thánh Tôn, P. Bến Nghé, Quận 1, TP.HCM',
    description: 'Nhà vệ sinh sạch sẽ trong TTTM Vincom. Tiêu chuẩn cao, miễn phí cho khách.',
    lat: 10.7784, lng: 106.7013,
    type: 'RESTROOM', carSlots: 0, bikeSlots: 0,
    pricePerHour: 0, openTime: '09:30', closeTime: '22:00',
    phone: null, isPremium: false, status: 'ACTIVE'
  },
  {
    name: 'Nhà vệ sinh - Crescent Mall Q7',
    address: 'TTTM Crescent Mall, 101 Tôn Dật Tiên, P. Tân Phú, Quận 7, TP.HCM',
    description: 'Nhà vệ sinh sạch trong TTTM Crescent Mall Phú Mỹ Hưng. Nhiều tầng đều có.',
    lat: 10.7294, lng: 106.7190,
    type: 'RESTROOM', carSlots: 0, bikeSlots: 0,
    pricePerHour: 0, openTime: '09:30', closeTime: '22:00',
    phone: null, isPremium: false, status: 'ACTIVE'
  },
  {
    name: 'Nhà vệ sinh - Chợ Bến Thành',
    address: 'Chợ Bến Thành, Lê Lợi, P. Bến Thành, Quận 1, TP.HCM',
    description: 'Nhà vệ sinh trong khu vực chợ Bến Thành. Phí 3.000đ/lượt.',
    lat: 10.7725, lng: 106.6980,
    type: 'RESTROOM', carSlots: 0, bikeSlots: 0,
    pricePerHour: 0, openTime: '06:00', closeTime: '20:00',
    phone: null, isPremium: false, status: 'ACTIVE'
  },
  {
    name: 'Nhà vệ sinh - Công viên Gia Định',
    address: 'Công viên Gia Định, Hoàng Minh Giám, P. 9, Phú Nhuận, TP.HCM',
    description: 'Nhà vệ sinh công cộng trong Công viên Gia Định. Miễn phí, sạch sẽ.',
    lat: 10.8070, lng: 106.6735,
    type: 'RESTROOM', carSlots: 0, bikeSlots: 0,
    pricePerHour: 0, openTime: '05:00', closeTime: '22:00',
    phone: null, isPremium: false, status: 'ACTIVE'
  },
  {
    name: 'Nhà vệ sinh - Vạn Hạnh Mall Q10',
    address: 'TTTM Vạn Hạnh Mall, 11 Sư Vạn Hạnh, P. 12, Quận 10, TP.HCM',
    description: 'Nhà vệ sinh TTTM Vạn Hạnh Mall. Sạch sẽ, có phòng cho người khuyết tật.',
    lat: 10.7717, lng: 106.6692,
    type: 'RESTROOM', carSlots: 0, bikeSlots: 0,
    pricePerHour: 0, openTime: '09:30', closeTime: '22:00',
    phone: null, isPremium: false, status: 'ACTIVE'
  },

  // ======================================
  // 🛒 DỊCH VỤ (Rửa xe, Sửa xe, Trạm xăng)
  // ======================================
  {
    name: 'VietWash - Rửa xe Hai Bà Trưng',
    address: '136 Hai Bà Trưng, P. Đa Kao, Quận 1, TP.HCM',
    description: 'Dịch vụ rửa xe ô tô tại trạm xăng Petrolimex. Rửa ngoài, hút bụi, lau nội thất.',
    lat: 10.7888, lng: 106.6972,
    type: 'SERVICE', carSlots: 5, bikeSlots: 10,
    pricePerHour: 0, openTime: '07:00', closeTime: '19:00',
    phone: '028 3820 1136', isPremium: false, status: 'ACTIVE'
  },
  {
    name: 'Rửa xe 210 Nguyễn Trãi',
    address: '210 Nguyễn Trãi, P. Phạm Ngũ Lão, Quận 1, TP.HCM',
    description: 'Tiệm rửa xe ô tô gần trung tâm Q1. Rửa máy, hút bụi, đánh bóng.',
    lat: 10.7620, lng: 106.6870,
    type: 'SERVICE', carSlots: 4, bikeSlots: 10,
    pricePerHour: 0, openTime: '07:00', closeTime: '18:00',
    phone: null, isPremium: false, status: 'ACTIVE'
  },
  {
    name: 'PowerSteam - Rửa xe hơi nước',
    address: '68 Nguyễn Huệ, P. Bến Nghé, Quận 1, TP.HCM',
    description: 'Dịch vụ rửa xe bằng hơi nước nóng, thân thiện môi trường. Ngay phố đi bộ.',
    lat: 10.7735, lng: 106.7035,
    type: 'SERVICE', carSlots: 3, bikeSlots: 5,
    pricePerHour: 0, openTime: '08:00', closeTime: '18:00',
    phone: null, isPremium: false, status: 'ACTIVE'
  },
  {
    name: 'VietWash - Lotte Mart Q7',
    address: '469 Nguyễn Hữu Thọ, P. Tân Hưng, Quận 7, TP.HCM',
    description: 'Dịch vụ rửa xe ô tô tại Lotte Mart Q7. Giá hợp lý, có chỗ ngồi chờ.',
    lat: 10.7380, lng: 106.7125,
    type: 'SERVICE', carSlots: 8, bikeSlots: 15,
    pricePerHour: 0, openTime: '08:00', closeTime: '20:00',
    phone: null, isPremium: false, status: 'ACTIVE'
  },
  {
    name: 'Garage Ô tô Toàn Tâm',
    address: '300A Ung Văn Khiêm, P. 25, Bình Thạnh, TP.HCM',
    description: 'Garage sửa chữa ô tô uy tín. Chuyên động cơ, điện lạnh, bảo dưỡng. Cứu hộ 24/7.',
    lat: 10.8025, lng: 106.7085,
    type: 'SERVICE', carSlots: 10, bikeSlots: 5,
    pricePerHour: 0, openTime: '07:00', closeTime: '18:00',
    phone: '028 3512 5678', isPremium: false, status: 'ACTIVE'
  },
  {
    name: 'Garage Tấn Phát',
    address: '422A Võ Văn Kiệt, P. Cô Giang, Quận 1, TP.HCM',
    description: 'Garage sửa chữa ô tô trung tâm Q1. Kinh nghiệm lâu năm, giá hợp lý.',
    lat: 10.7610, lng: 106.6925,
    type: 'SERVICE', carSlots: 6, bikeSlots: 5,
    pricePerHour: 0, openTime: '07:30', closeTime: '17:30',
    phone: '028 3836 4567', isPremium: false, status: 'ACTIVE'
  },
  {
    name: 'Minh Huy Car Care & Cafe',
    address: '432 Nguyễn Xí, P. 13, Bình Thạnh, TP.HCM',
    description: 'Kết hợp chăm sóc xe và quán café. Rửa xe, đánh bóng trong khi bạn uống cà phê.',
    lat: 10.8085, lng: 106.6960,
    type: 'SERVICE', carSlots: 8, bikeSlots: 15,
    pricePerHour: 0, openTime: '07:00', closeTime: '19:00',
    phone: null, isPremium: false, status: 'ACTIVE'
  },
  {
    name: 'Vietnam Car Care - Q7',
    address: '1A Phú Thuận, P. Phú Thuận, Quận 7, TP.HCM',
    description: 'Trung tâm chăm sóc xe cao cấp. Rửa xe, phủ ceramic, dán phim cách nhiệt.',
    lat: 10.7340, lng: 106.7240,
    type: 'SERVICE', carSlots: 10, bikeSlots: 10,
    pricePerHour: 0, openTime: '08:00', closeTime: '18:00',
    phone: '028 5410 1234', isPremium: false, status: 'ACTIVE'
  },
  {
    name: 'Trạm xăng Petrolimex - Nguyễn Thị Minh Khai',
    address: '15A Nguyễn Thị Minh Khai, P. Bến Nghé, Quận 1, TP.HCM',
    description: 'Trạm xăng Petrolimex trung tâm Q1. Có chỗ dừng đỗ ô tô nhanh.',
    lat: 10.7830, lng: 106.6925,
    type: 'SERVICE', carSlots: 3, bikeSlots: 5,
    pricePerHour: 0, openTime: '05:30', closeTime: '22:00',
    phone: null, isPremium: false, status: 'ACTIVE'
  },
  {
    name: 'Trạm xăng Petrolimex - Xô Viết Nghệ Tĩnh',
    address: '160 Xô Viết Nghệ Tĩnh, P. 21, Bình Thạnh, TP.HCM',
    description: 'Trạm xăng Petrolimex Bình Thạnh. Có cửa hàng tiện lợi và chỗ dừng xe.',
    lat: 10.8010, lng: 106.6930,
    type: 'SERVICE', carSlots: 4, bikeSlots: 10,
    pricePerHour: 0, openTime: '05:30', closeTime: '22:00',
    phone: null, isPremium: false, status: 'ACTIVE'
  },
];

async function main() {
  console.log(`\\n🚀 Đang thêm ${allSpots.length} địa điểm thực tế vào database...\\n`);
  
  let added = 0, skipped = 0;
  const stats: Record<string, number> = {};
  
  for (const spot of allSpots) {
    // Count by type
    stats[spot.type] = (stats[spot.type] || 0) + 1;
    
    const existing = await prisma.parkingSpot.findFirst({
      where: { name: spot.name }
    });
    
    if (existing) {
      console.log(`⏩ Đã tồn tại: ${spot.name}`);
      skipped++;
      continue;
    }
    
    await prisma.parkingSpot.create({ data: spot });
    console.log(`✅ Thêm [${spot.type}]: ${spot.name}`);
    added++;
  }
  
  const total = await prisma.parkingSpot.count();
  
  console.log(`\\n${'='.repeat(50)}`);
  console.log(`📊 KẾT QUẢ:`);
  console.log(`   ✅ Đã thêm: ${added} địa điểm`);
  console.log(`   ⏩ Bỏ qua: ${skipped} (đã tồn tại)`);
  console.log(`   📍 Tổng cộng trong DB: ${total}`);
  console.log(`\\n📋 Phân loại trong lần seed này:`);
  for (const [type, count] of Object.entries(stats)) {
    const emoji = type === 'RESTAURANT' ? '🍜' : type === 'CAFE' ? '☕' : type === 'RESTROOM' ? '🚻' : type === 'SERVICE' ? '🛒' : '🅿️';
    console.log(`   ${emoji} ${type}: ${count}`);
  }
  console.log('');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
