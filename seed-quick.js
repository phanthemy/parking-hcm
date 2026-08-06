const { PrismaClient } = require('./node_modules/.prisma/client');
const p = new PrismaClient();

(async () => {
  // Get owner ID
  const users = await p.user.findMany({ take: 1 });
  const ownerId = users[0].id;
  console.log('Owner:', ownerId);

  const spots = [
    // === NHÀ VỆ SINH CÔNG CỘNG (RESTROOM) ===
    { name: 'Nhà vệ sinh công viên Tao Đàn', address: 'Công viên Tao Đàn, Quận 1, TP.HCM', lat: 10.7735, lng: 106.6922, type: 'RESTROOM', openTime: '06:00', closeTime: '22:00', description: 'Nhà vệ sinh công cộng trong công viên Tao Đàn, sạch sẽ' },
    { name: 'Nhà vệ sinh công viên Lê Văn Tám', address: 'Công viên Lê Văn Tám, Quận 1, TP.HCM', lat: 10.7875, lng: 106.6942, type: 'RESTROOM', openTime: '06:00', closeTime: '22:00', description: 'Nhà vệ sinh trong công viên Lê Văn Tám' },
    { name: 'Nhà vệ sinh công viên 23/9', address: 'Công viên 23/9, Quận 1, TP.HCM', lat: 10.7695, lng: 106.6935, type: 'RESTROOM', openTime: '06:00', closeTime: '22:00', description: 'Nhà vệ sinh công cộng tại công viên 23 tháng 9' },
    { name: 'WC Chợ Bến Thành', address: 'Chợ Bến Thành, Quận 1, TP.HCM', lat: 10.7725, lng: 106.6980, type: 'RESTROOM', openTime: '06:00', closeTime: '18:00', description: 'Nhà vệ sinh bên trong chợ Bến Thành', pricePerHour: 5000 },
    { name: 'WC Chợ Tân Định', address: 'Chợ Tân Định, Quận 1, TP.HCM', lat: 10.7898, lng: 106.6906, type: 'RESTROOM', openTime: '06:00', closeTime: '18:00', description: 'Nhà vệ sinh trong khu vực chợ Tân Định' },
    { name: 'WC Công viên Gia Định', address: 'Công viên Gia Định, Quận Phú Nhuận, TP.HCM', lat: 10.8055, lng: 106.6738, type: 'RESTROOM', openTime: '05:30', closeTime: '21:30', description: 'Nhà vệ sinh công viên Gia Định' },
    { name: 'Nhà vệ sinh Vincom Đồng Khởi', address: '72 Lê Thánh Tôn, Quận 1, TP.HCM', lat: 10.7780, lng: 106.7010, type: 'RESTROOM', openTime: '09:30', closeTime: '22:00', description: 'Nhà vệ sinh sạch sẽ tầng B1 Vincom Center' },
    { name: 'WC Saigon Centre Takashimaya', address: '65 Lê Lợi, Quận 1, TP.HCM', lat: 10.7735, lng: 106.7000, type: 'RESTROOM', openTime: '09:30', closeTime: '22:00', description: 'Nhà vệ sinh các tầng Takashimaya, rất sạch' },
    { name: 'WC AEON Mall Tân Phú', address: '30 Bờ Bao Tân Thắng, Quận Tân Phú, TP.HCM', lat: 10.8015, lng: 106.6180, type: 'RESTROOM', openTime: '09:00', closeTime: '22:00', description: 'Nhà vệ sinh AEON Mall Tân Phú' },
    { name: 'WC AEON Mall Bình Tân', address: '1 Số 17A, Quận Bình Tân, TP.HCM', lat: 10.7395, lng: 106.6070, type: 'RESTROOM', openTime: '09:00', closeTime: '22:00', description: 'Nhà vệ sinh AEON Mall Bình Tân' },
    { name: 'WC Crescent Mall Quận 7', address: '101 Tôn Dật Tiên, Quận 7, TP.HCM', lat: 10.7295, lng: 106.7185, type: 'RESTROOM', openTime: '09:30', closeTime: '22:00', description: 'Nhà vệ sinh Crescent Mall, sạch sẽ' },
    { name: 'Nhà vệ sinh Trạm xăng Petrolimex Q3', address: '2 Võ Văn Tần, Quận 3, TP.HCM', lat: 10.7765, lng: 106.6895, type: 'RESTROOM', openTime: '00:00', closeTime: '23:59', description: 'Nhà vệ sinh tại trạm xăng Petrolimex, mở 24/7' },
    { name: 'WC Công viên Hoàng Văn Thụ', address: 'Công viên Hoàng Văn Thụ, Tân Bình, TP.HCM', lat: 10.8005, lng: 106.6615, type: 'RESTROOM', openTime: '05:30', closeTime: '21:30', description: 'Nhà vệ sinh trong công viên Hoàng Văn Thụ' },
    { name: 'WC Chợ Bà Chiểu', address: 'Chợ Bà Chiểu, Quận Bình Thạnh, TP.HCM', lat: 10.7985, lng: 106.6945, type: 'RESTROOM', openTime: '06:00', closeTime: '18:00', description: 'Nhà vệ sinh khu vực chợ Bà Chiểu' },
    { name: 'WC Gigamall Thủ Đức', address: '242 Phạm Văn Đồng, Thủ Đức, TP.HCM', lat: 10.8385, lng: 106.6995, type: 'RESTROOM', openTime: '09:00', closeTime: '22:00', description: 'Nhà vệ sinh Gigamall Thủ Đức' },
    { name: 'Nhà vệ sinh Bến xe Miền Đông', address: '292 Đinh Bộ Lĩnh, Bình Thạnh, TP.HCM', lat: 10.8150, lng: 106.7115, type: 'RESTROOM', openTime: '04:00', closeTime: '23:00', description: 'Nhà vệ sinh bến xe Miền Đông' },
    { name: 'WC Ga Sài Gòn', address: '1 Nguyễn Thông, Quận 3, TP.HCM', lat: 10.7830, lng: 106.6760, type: 'RESTROOM', openTime: '05:00', closeTime: '22:00', description: 'Nhà vệ sinh ga xe lửa Sài Gòn' },
    { name: 'WC Pandora City Quận Tân Phú', address: '1/1 Trường Chinh, Tân Phú, TP.HCM', lat: 10.7985, lng: 106.6295, type: 'RESTROOM', openTime: '09:00', closeTime: '22:00', description: 'Nhà vệ sinh TTTM Pandora City' },
    { name: 'WC Lotte Mart Quận 7', address: '469 Nguyễn Hữu Thọ, Quận 7, TP.HCM', lat: 10.7385, lng: 106.7125, type: 'RESTROOM', openTime: '08:00', closeTime: '22:00', description: 'Nhà vệ sinh Lotte Mart Nam Sài Gòn' },
    { name: 'WC Công viên Đầm Sen', address: '3 Hòa Bình, Quận 11, TP.HCM', lat: 10.7695, lng: 106.6395, type: 'RESTROOM', openTime: '07:00', closeTime: '21:00', description: 'Nhà vệ sinh trong khu vui chơi Đầm Sen' },

    // === DỊCH VỤ (SERVICE) ===
    { name: 'Trạm xăng Petrolimex Nguyễn Thị Minh Khai', address: '373 Nguyễn Thị Minh Khai, Quận 3, TP.HCM', lat: 10.7710, lng: 106.6820, type: 'SERVICE', openTime: '00:00', closeTime: '23:59', description: 'Trạm xăng Petrolimex hoạt động 24/7', phone: '02838335566' },
    { name: 'Trạm xăng PV Oil Điện Biên Phủ', address: '187 Điện Biên Phủ, Quận 3, TP.HCM', lat: 10.7835, lng: 106.6910, type: 'SERVICE', openTime: '00:00', closeTime: '23:59', description: 'Trạm xăng PV Oil 24/7' },
    { name: 'Trạm xăng Petrolimex Cách Mạng Tháng 8', address: '279 CMT8, Quận 10, TP.HCM', lat: 10.7775, lng: 106.6695, type: 'SERVICE', openTime: '00:00', closeTime: '23:59', description: 'Trạm xăng Petrolimex, có rửa xe' },
    { name: 'Circle K Bùi Viện', address: '196 Bùi Viện, Quận 1, TP.HCM', lat: 10.7680, lng: 106.6940, type: 'SERVICE', openTime: '00:00', closeTime: '23:59', description: 'Cửa hàng tiện lợi Circle K 24/7' },
    { name: 'FamilyMart Nguyễn Huệ', address: '88 Nguyễn Huệ, Quận 1, TP.HCM', lat: 10.7740, lng: 106.7035, type: 'SERVICE', openTime: '00:00', closeTime: '23:59', description: 'Cửa hàng tiện lợi FamilyMart' },
    { name: 'GS25 Lê Lai', address: '76 Lê Lai, Quận 1, TP.HCM', lat: 10.7710, lng: 106.6930, type: 'SERVICE', openTime: '00:00', closeTime: '23:59', description: 'Cửa hàng tiện lợi GS25' },
    { name: 'Tiệm sửa xe Thành Phát Q1', address: '45 Nguyễn Cư Trinh, Quận 1, TP.HCM', lat: 10.7680, lng: 106.6910, type: 'SERVICE', openTime: '07:00', closeTime: '20:00', description: 'Tiệm sửa xe máy, vá xe nhanh', phone: '0909123456' },
    { name: 'ATM Vietcombank Đồng Khởi', address: '29 Đồng Khởi, Quận 1, TP.HCM', lat: 10.7760, lng: 106.7030, type: 'SERVICE', openTime: '00:00', closeTime: '23:59', description: 'Cây ATM Vietcombank, rút tiền 24/7' },
    { name: 'ATM Techcombank Hai Bà Trưng', address: '191 Hai Bà Trưng, Quận 1, TP.HCM', lat: 10.7850, lng: 106.6930, type: 'SERVICE', openTime: '00:00', closeTime: '23:59', description: 'Cây ATM Techcombank' },
    { name: 'Bách Hóa Xanh Lê Hồng Phong', address: '112 Lê Hồng Phong, Quận 10, TP.HCM', lat: 10.7695, lng: 106.6645, type: 'SERVICE', openTime: '06:00', closeTime: '22:30', description: 'Siêu thị Bách Hóa Xanh, thực phẩm tươi sống' },
    { name: 'VinMart+ Pasteur', address: '133 Pasteur, Quận 3, TP.HCM', lat: 10.7815, lng: 106.6920, type: 'SERVICE', openTime: '07:00', closeTime: '22:00', description: 'Cửa hàng tiện lợi VinMart+' },
    { name: 'Trạm xăng Shell Nguyễn Văn Trỗi', address: '78 Nguyễn Văn Trỗi, Phú Nhuận, TP.HCM', lat: 10.7975, lng: 106.6705, type: 'SERVICE', openTime: '00:00', closeTime: '23:59', description: 'Trạm xăng Shell hoạt động 24/7' },

    // === BÃI XE BỔ SUNG (PARKING_LOT) - các quận chưa có ===
    { name: 'Bãi xe Lotte Mart Quận 7', address: '469 Nguyễn Hữu Thọ, Quận 7, TP.HCM', lat: 10.7390, lng: 106.7130, type: 'PARKING_LOT', carSlots: 300, bikeSlots: 800, pricePerHour: 10000, openTime: '08:00', closeTime: '22:00', description: 'Bãi xe rộng rãi tại Lotte Mart Q7' },
    { name: 'Bãi xe AEON Mall Tân Phú', address: '30 Bờ Bao Tân Thắng, Tân Phú, TP.HCM', lat: 10.8020, lng: 106.6185, type: 'PARKING_LOT', carSlots: 500, bikeSlots: 2000, pricePerHour: 5000, openTime: '08:00', closeTime: '22:00', description: 'Bãi xe lớn nhất khu vực Tân Phú, miễn phí khi mua hàng', isPremium: true },
    { name: 'Bãi xe Bệnh viện Chợ Rẫy', address: '201B Nguyễn Chí Thanh, Quận 5, TP.HCM', lat: 10.7555, lng: 106.6595, type: 'PARKING_LOT', carSlots: 100, bikeSlots: 500, pricePerHour: 5000, openTime: '00:00', closeTime: '23:59', description: 'Bãi xe bệnh viện Chợ Rẫy, mở 24/7', phone: '02838554138' },
    { name: 'Bãi xe Gigamall Thủ Đức', address: '242 Phạm Văn Đồng, Thủ Đức, TP.HCM', lat: 10.8390, lng: 106.7000, type: 'PARKING_LOT', carSlots: 400, bikeSlots: 1500, pricePerHour: 5000, openTime: '08:00', closeTime: '22:00', description: 'Bãi xe Gigamall, miễn phí 2h đầu' },
    { name: 'Bãi xe Sân bay Tân Sơn Nhất', address: 'Sân bay Tân Sơn Nhất, Tân Bình, TP.HCM', lat: 10.8185, lng: 106.6590, type: 'PARKING_LOT', carSlots: 2000, bikeSlots: 3000, pricePerHour: 20000, openTime: '00:00', closeTime: '23:59', description: 'Bãi đỗ xe sân bay TSN, có xe buýt đưa đón', isPremium: true, phone: '02838445599' },
    { name: 'Bãi xe Chợ Lớn Quận 5', address: '461 Hải Thượng Lãn Ông, Quận 5, TP.HCM', lat: 10.7530, lng: 106.6545, type: 'PARKING_LOT', carSlots: 50, bikeSlots: 300, pricePerHour: 5000, openTime: '06:00', closeTime: '18:00', description: 'Bãi xe khu vực Chợ Lớn' },
    { name: 'Bãi xe Emart Gò Vấp', address: '366 Phan Văn Trị, Gò Vấp, TP.HCM', lat: 10.8285, lng: 106.6685, type: 'PARKING_LOT', carSlots: 200, bikeSlots: 600, pricePerHour: 5000, openTime: '08:00', closeTime: '22:00', description: 'Bãi xe siêu thị Emart Gò Vấp' },
    { name: 'Bãi xe Bình Thạnh - Hàng Xanh', address: '502 Xô Viết Nghệ Tĩnh, Bình Thạnh, TP.HCM', lat: 10.8045, lng: 106.7100, type: 'PARKING_LOT', carSlots: 80, bikeSlots: 400, pricePerHour: 8000, openTime: '06:00', closeTime: '22:00', description: 'Bãi xe ngã tư Hàng Xanh' },
    { name: 'Bãi xe Đại học Bách Khoa', address: '268 Lý Thường Kiệt, Quận 10, TP.HCM', lat: 10.7730, lng: 106.6595, type: 'PARKING_LOT', carSlots: 100, bikeSlots: 2000, pricePerHour: 3000, openTime: '06:00', closeTime: '21:00', description: 'Bãi giữ xe sinh viên Bách Khoa' },

    // === QUÁN ĂN BỔ SUNG (RESTAURANT) ===
    { name: 'Phở Hòa Pasteur', address: '260C Pasteur, Quận 3, TP.HCM', lat: 10.7830, lng: 106.6890, type: 'RESTAURANT', openTime: '06:00', closeTime: '00:00', description: 'Phở nổi tiếng Sài Gòn từ 1968', phone: '02838297943', isPremium: true },
    { name: 'Cơm Tấm Ba Ghiền', address: '84 Đặng Văn Ngữ, Phú Nhuận, TP.HCM', lat: 10.7945, lng: 106.6810, type: 'RESTAURANT', openTime: '06:00', closeTime: '22:00', description: 'Cơm tấm sườn bì chả nổi tiếng', phone: '02838442599' },
    { name: 'Bún bò Huế Đông Ba', address: '110A Nguyễn Du, Quận 1, TP.HCM', lat: 10.7780, lng: 106.6950, type: 'RESTAURANT', openTime: '06:30', closeTime: '21:00', description: 'Bún bò Huế chuẩn vị miền Trung' },
    { name: 'Bánh Mì Huynh Hoa', address: '26 Lê Thị Riêng, Quận 1, TP.HCM', lat: 10.7715, lng: 106.6925, type: 'RESTAURANT', openTime: '15:30', closeTime: '23:00', description: 'Bánh mì nổi tiếng nhất Sài Gòn, xếp hàng dài', isPremium: true },
    { name: 'Hủ Tiếu Nam Vang Liến Húa', address: '62 Ngô Quyền, Quận 5, TP.HCM', lat: 10.7540, lng: 106.6610, type: 'RESTAURANT', openTime: '06:00', closeTime: '14:00', description: 'Hủ tiếu Nam Vang truyền thống Chợ Lớn' },
    { name: 'Quán Bún Chả 145 Bùi Viện', address: '145 Bùi Viện, Quận 1, TP.HCM', lat: 10.7685, lng: 106.6935, type: 'RESTAURANT', openTime: '10:00', closeTime: '22:00', description: 'Bún chả Hà Nội tại phố Tây' },
    { name: 'Lẩu Dê Tuấn Anh Quận 1', address: '31 Tôn Thất Thiệp, Quận 1, TP.HCM', lat: 10.7735, lng: 106.7010, type: 'RESTAURANT', openTime: '16:00', closeTime: '23:00', description: 'Lẩu dê nổi tiếng quận 1, có bãi giữ xe' },
    { name: 'Nhà hàng Ngọc Sương Quận 3', address: '34 Nguyễn Thị Diệu, Quận 3, TP.HCM', lat: 10.7860, lng: 106.6875, type: 'RESTAURANT', openTime: '10:00', closeTime: '22:00', description: 'Nhà hàng hải sản cao cấp', phone: '02838208032', isPremium: true },

    // === CAFE BỔ SUNG ===
    { name: 'Phúc Long Nguyễn Huệ', address: '42 Nguyễn Huệ, Quận 1, TP.HCM', lat: 10.7750, lng: 106.7030, type: 'CAFE', openTime: '07:00', closeTime: '22:30', description: 'Trà sữa và cà phê Phúc Long' },
    { name: 'Highlands Coffee Bitexco', address: 'Bitexco Tower, 2 Hải Triều, Quận 1, TP.HCM', lat: 10.7715, lng: 106.7045, type: 'CAFE', openTime: '07:00', closeTime: '22:00', description: 'Highlands Coffee view đẹp tầng cao Bitexco' },
    { name: 'Cà phê sữa đá Cheo Leo', address: '44 Nguyễn Thiện Thuật, Quận 3, TP.HCM', lat: 10.7775, lng: 106.6855, type: 'CAFE', openTime: '06:00', closeTime: '23:00', description: 'Quán cà phê vỉa hè lâu đời nhất Sài Gòn, từ 1938', isPremium: true },
    { name: 'Starbucks Hàn Thuyên', address: 'Hàn Thuyên, Quận 1, TP.HCM', lat: 10.7800, lng: 106.6990, type: 'CAFE', openTime: '07:00', closeTime: '22:00', description: 'Starbucks store đầu tiên tại Việt Nam' },
    { name: 'The Workshop Coffee', address: '27 Ngô Đức Kế, Quận 1, TP.HCM', lat: 10.7740, lng: 106.7045, type: 'CAFE', openTime: '08:00', closeTime: '21:00', description: 'Specialty coffee shop nổi tiếng Sài Gòn' },
  ];

  let created = 0;
  for (const s of spots) {
    // Check duplicate
    const exists = await p.parkingSpot.findFirst({ where: { name: s.name } });
    if (exists) {
      console.log(`SKIP (exists): ${s.name}`);
      continue;
    }

    const spot = await p.parkingSpot.create({
      data: {
        name: s.name,
        address: s.address,
        description: s.description || '',
        lat: s.lat,
        lng: s.lng,
        type: s.type,
        carSlots: s.carSlots || 0,
        bikeSlots: s.bikeSlots || 0,
        pricePerHour: s.pricePerHour || 0,
        openTime: s.openTime || '00:00',
        closeTime: s.closeTime || '23:59',
        phone: s.phone || null,
        isPremium: s.isPremium || false,
        status: 'active',
        ownerId: ownerId,
      }
    });
    created++;
    console.log(`✅ [${created}] ${s.type} | ${s.name}`);
  }

  // Count by type
  const counts = await p.parkingSpot.groupBy({ by: ['type'], _count: true });
  console.log('\n=== TỔNG KẾT ===');
  counts.forEach(c => console.log(`  ${c.type}: ${c._count}`));
  const total = await p.parkingSpot.count();
  console.log(`  TOTAL: ${total}`);

  await p.$disconnect();
})();
